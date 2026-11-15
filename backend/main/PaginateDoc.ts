import { Model, QueryFilter, SortOrder } from "mongoose"

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
