import { Model, QueryFilter, SortOrder, Types } from "mongoose"

interface PaginationOptions {
  page?: number
  limit?: number
  sort?: Record<string, SortOrder>
}

export interface PaginatedResult<T> {
  data: T[]
  meta: {
    totalDocs: number
    totalPages: number
    currentPage: number
    limit: number
    hasNextPage: boolean
    hasPrevPage: boolean
  }
}

export async function paginateQuery<T>(model: Model<T>, filter: QueryFilter<T> = {}, options: PaginationOptions = {}): Promise<PaginatedResult<T>> {
  const page = Math.max(1, Math.floor(options.page || 1))
  const limit = Math.min(100, Math.max(1, Math.floor(options.limit || 10)))
  const skip = (page - 1) * limit

  const sort: Record<string, SortOrder> = options.sort ? { ...options.sort, _id: -1 } : { createdAt: -1, _id: -1 }

  const [data, totalDocs] = await Promise.all([model.find(filter).sort(sort).skip(skip).limit(limit).lean<T[]>().exec(), model.countDocuments(filter).exec()])

  const totalPages = Math.ceil(totalDocs / limit)

  return {
    data,
    meta: {
      totalDocs,
      totalPages,
      currentPage: page,
      limit,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1 && totalPages > 0
    }
  }
}

interface HistoryPaginationOptions {
  cursor?: string // _id
  limit?: number
}

export interface HistoryPaginatedResult<T> {
  data: T[]
  meta: {
    nextCursor: string | null
    hasOlderMessages: boolean
  }
}

export async function paginateHistory<T extends { _id: Types.ObjectId }>(model: Model<T>, baseFilter: QueryFilter<T>, options: HistoryPaginationOptions = {}): Promise<HistoryPaginatedResult<T>> {
  const limit = Math.min(100, Math.max(1, Math.floor(options.limit || 20)))
  const query: QueryFilter<T> = { ...baseFilter }

  if (options.cursor) {
    if (!Types.ObjectId.isValid(options.cursor)) {
      throw new Error("Invalid cursor format")
    }
    query._id = { $lt: new Types.ObjectId(options.cursor) }
  }

  const docs = await model
    .find(query)
    .sort({ _id: -1 })
    .limit(limit + 1)
    .lean<T[]>()
    .exec()

  const hasOlderMessages = docs.length > limit

  if (hasOlderMessages) {
    docs.pop()
  }

  const oldestDocInBatch = docs[docs.length - 1]
  const nextCursor = hasOlderMessages && oldestDocInBatch ? oldestDocInBatch._id.toString() : null

  const messages = docs.reverse()

  return {
    data: messages,
    meta: { nextCursor, hasOlderMessages }
  }
}
