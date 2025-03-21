import { Schema } from "mongoose";
import { IDepartment } from "../interfaces/department.interface";
import Logger from '../../services/logger.service';

export const registerDepartmentLoggerHooks = (schema: Schema<IDepartment>): void => {
	// Pre-save hook
	schema.pre('save', function (next) {
		// Store operation type to log after save completes
		this.$locals.operation = this.isNew ? 'CREATE' : 'UPDATE';
		next();
	});

	// Post-save hook
	schema.post('save', function (doc) {
		const operation = this.$locals.operation;
		Logger.info(`[DATABASE][${operation}][Department] Department ${operation === 'CREATE' ? 'created' : 'updated'}`, {
			id: doc._id?.toString(),
			name: doc.name
		});
	});

	// findOneAndUpdate hook
	schema.post('findOneAndUpdate', function (doc) {
		if (doc) {
			Logger.info(`[DATABASE][UPDATE][Department] Department updated`, {
				id: doc._id.toString(),
				name: doc.name
			});
		}
	});

	// Delete hook
	schema.post('findOneAndDelete', function (doc) {
		if (doc) {
			Logger.info(`[DATABASE][DELETE][Department] Department deleted`, {
				id: doc._id.toString(),
				name: doc.name
			});
		}
	});
};