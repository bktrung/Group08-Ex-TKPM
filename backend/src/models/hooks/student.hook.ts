import { Schema } from 'mongoose';
import { IStudent, IStudentStatus } from '../interfaces/student.interface';
import Logger from '../../services/logger.service';

export const registerStudentLoggerHooks = (schema: Schema<IStudent>): void => {
	// Pre-save hook
	schema.pre('save', function (next) {
		// Store operation type to log after save completes
		this.$locals.operation = this.isNew ? 'CREATE' : 'UPDATE';
		next();
	});

	// Post-save hook
	schema.post('save', function (doc) {
		const operation = this.$locals.operation;
		Logger.info(`[DATABASE][${operation}][Student] Student ${operation === 'CREATE' ? 'created' : 'updated'}`, {
			id: doc._id?.toString(),
			studentId: doc.studentId
		});
	});

	// findOneAndUpdate hook
	schema.post('findOneAndUpdate', function (doc) {
		if (doc) {
			Logger.info(`[DATABASE][UPDATE][Student] Student updated`, {
				id: doc._id.toString(),
				studentId: doc.studentId
			});
		}
	});

	// Delete hook
	schema.post('findOneAndDelete', function (doc) {
		if (doc) {
			Logger.info(`[DATABASE][DELETE][Student] Student deleted`, {
				id: doc._id.toString(),
				studentId: doc.studentId
			});
		}
	});
};

export const registerStudentStatusLoggerHooks = (schema: Schema<IStudentStatus>): void => {
	// Pre-save hook
	schema.pre('save', function (next) {
		// Store operation type to log after save completes
		this.$locals.operation = this.isNew ? 'CREATE' : 'UPDATE';
		next();
	});

	// Post-save hook
	schema.post('save', function (doc) {
		const operation = this.$locals.operation;
		Logger.info(`[DATABASE][${operation}][StudentStatus] Student status ${operation === 'CREATE' ? 'created' : 'updated'}`, {
			id: doc._id?.toString(),
			type: doc.type
		});
	});

	// findOneAndUpdate hook
	schema.post('findOneAndUpdate', function (doc) {
		if (doc) {
			Logger.info(`[DATABASE][UPDATE][StudentStatus] Student status updated`, {
				id: doc._id.toString(),
				type: doc.type
			});
		}
	});

	// Delete hook
	schema.post('findOneAndDelete', function (doc) {
		if (doc) {
			Logger.info(`[DATABASE][DELETE][StudentStatus] Student status deleted`, {
				id: doc._id.toString(),
				type: doc.type
			});
		}
	});
};