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
	populate?: Array<{
		path: string;
		select?: string;
	}>;
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
	{ limit, sort, page, filter, select, populate }: QueryOptions<T>
): Promise<PaginationResult<T>> => {
	const skip = (page - 1) * limit;

	// _id is better than createdAt in single-criteria sorting in MongoDB
	const sortBy = sort === "ctime" ? { _id: -1 as SortOrder } : { _id: 1 as SortOrder };

	// Create base query
	let query = model.find(filter)
		.sort(sortBy)
		.limit(limit)
		.skip(skip)
		.select(select || {});

	// Apply population if specified
	if (populate && populate.length > 0) {
		populate.forEach(populateOption => {
			query = query.populate(populateOption);
		});
	}

	// Add total count for pagination
	const [documents, totalCount] = await Promise.all([
		query.lean(),
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