import { Model, Document, FilterQuery, SortOrder } from 'mongoose';

export interface SearchOptions {
	query: string;
	page?: number;
	limit?: number;
	sort?: string;
}

/// get all documents with pagination
interface QueryOptions<T> {
	limit: number;
	sort: string;
	page: number;
	filter: FilterQuery<T>;
	select?: string | string[] | Record<string, number | boolean | string | object>;
}

export interface PaginationResult<T extends Document> {
	pagination: {
		total: number;
		page: number;
		limit: number;
		totalPages: number;
	};
	[key: string]: T[] | any;
}

export const getAllDocuments = async <T extends Document>(
	model: Model<T>,
	{ limit, sort, page, filter, select }: QueryOptions<T>
): Promise<PaginationResult<T>> => {
	const skip = (page - 1) * limit;

	// _id is better than createdAt in single-criteria sorting in MongoDB
	const sortBy = sort === "ctime" ? { _id: -1 as SortOrder } : { _id: 1 as SortOrder };

	// Add total count for pagination
	const [documents, totalCount] = await Promise.all([
		model
			.find(filter)
			.sort(sortBy)
			.limit(limit)
			.skip(skip)
			.select(select || {})
			.lean(),
		model.countDocuments(filter),
	]);

	const modelName = model.modelName.toLowerCase() + 's';

	return {
		pagination: {
			total: totalCount,
			page,
			limit,
			totalPages: Math.ceil(totalCount / limit),
		},
		[modelName]: documents,
	};
};
/// end get all documents with pagination