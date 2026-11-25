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

interface PaginationMessagesOptions {
  cursor?: string // _id
  limit?: number
}

export interface PaginatedMessagesResult<T> {
  data: T[]
  meta: {
    nextCursor: string | null
    hasOlderMessages: boolean
  }
}

export async function paginateMessages<T extends { _id: Types.ObjectId }>(model: Model<T>, baseFilter: QueryFilter<T>, options: PaginationMessagesOptions = {}): Promise<PaginatedMessagesResult<T>> {
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

interface PaginationRoomsOptions {
  cursor?: string
  limit?: number
  excludeIds?: string[]
}

export interface PaginatedRoomsResult<T> {
  data: T[]
  meta: {
    nextCursor: string | null
    hasOlderRooms: boolean
  }
}

function parseRoomCursor(cursor: string): { updatedAt: Date; _id: Types.ObjectId; snapshotAt: Date } {
  const parts = cursor.split("_")
  if (parts.length !== 3) {
    throw new Error("Invalid cursor format")
  }

  const [updatedAtMsStr, idStr, snapshotMsStr] = parts
  const updatedAtMs = Number(updatedAtMsStr)
  const snapshotMs = Number(snapshotMsStr)

  if (!Number.isFinite(updatedAtMs) || !Number.isFinite(snapshotMs) || !Types.ObjectId.isValid(idStr)) {
    throw new Error("Invalid cursor format")
  }

  return {
    updatedAt: new Date(updatedAtMs),
    _id: new Types.ObjectId(idStr),
    snapshotAt: new Date(snapshotMs)
  }
}

export async function paginateRooms<T extends { _id: Types.ObjectId; updatedAt: Date }>(model: Model<T>, baseFilter: QueryFilter<T>, options: PaginationRoomsOptions = {}): Promise<PaginatedRoomsResult<T>> {
  const limit = Math.min(100, Math.max(1, Math.floor(options.limit || 20)))
  const currentSnapshotAt = new Date()

  let olderQuery: QueryFilter<T> = { ...baseFilter }

  // eslint-disable-next-line no-useless-assignment
  let updatedDocs: T[] = []

  if (options.cursor) {
    const { updatedAt: cursorUpdatedAt, _id: cursorId, snapshotAt } = parseRoomCursor(options.cursor)
    const hasBaseFilter = Object.keys(baseFilter).length > 0

    const cursorCondition: QueryFilter<T> = {
      $or: [{ updatedAt: { $lt: cursorUpdatedAt } }, { updatedAt: cursorUpdatedAt, _id: { $lt: cursorId } }]
    }
    olderQuery = hasBaseFilter ? { $and: [baseFilter, cursorCondition] } : cursorCondition

    const updatedCondition: QueryFilter<T> = {
      updatedAt: { $gte: snapshotAt }
    }
    if (options.excludeIds?.length) {
      const validExcludeIds = options.excludeIds.filter((id) => Types.ObjectId.isValid(id)).map((id) => new Types.ObjectId(id))
      if (validExcludeIds.length > 0) {
        updatedCondition._id = { $nin: validExcludeIds }
      }
    }
    const updatedQuery: QueryFilter<T> = hasBaseFilter ? { $and: [baseFilter, updatedCondition] } : updatedCondition

    const [fetchedOlderDocs, fetchedUpdatedDocs] = await Promise.all([
      model
        .find(olderQuery)
        .sort({ updatedAt: -1, _id: -1 })
        .limit(limit + 1)
        .lean<T[]>()
        .exec(),
      model.find(updatedQuery).sort({ updatedAt: -1, _id: -1 }).lean<T[]>().exec()
    ])

    updatedDocs = fetchedUpdatedDocs
    const hasOlderRooms = fetchedOlderDocs.length > limit

    if (hasOlderRooms) {
      fetchedOlderDocs.pop()
    }

    const oldestDocInBatch = fetchedOlderDocs[fetchedOlderDocs.length - 1]
    const nextCursor = hasOlderRooms && oldestDocInBatch ? `${new Date(oldestDocInBatch.updatedAt).getTime()}_${oldestDocInBatch._id.toString()}_${currentSnapshotAt.getTime()}` : null

    const seenIds = new Set(updatedDocs.map((d) => d._id.toString()))
    const filteredOlderDocs = fetchedOlderDocs.filter((d) => !seenIds.has(d._id.toString()))

    return {
      data: [...updatedDocs, ...filteredOlderDocs],
      meta: { nextCursor, hasOlderRooms }
    }
  }

  const docs = await model
    .find(olderQuery)
    .sort({ updatedAt: -1, _id: -1 })
    .limit(limit + 1)
    .lean<T[]>()
    .exec()

  const hasOlderRooms = docs.length > limit

  if (hasOlderRooms) {
    docs.pop()
  }

  const oldestDocInBatch = docs[docs.length - 1]
  const nextCursor = hasOlderRooms && oldestDocInBatch ? `${new Date(oldestDocInBatch.updatedAt).getTime()}_${oldestDocInBatch._id.toString()}_${currentSnapshotAt.getTime()}` : null

  return {
    data: docs,
    meta: { nextCursor, hasOlderRooms }
  }
}
