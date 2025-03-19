import { Types } from 'mongoose';
import Program from '../program.model';

export const findProgramByName = async (name: string) => {
	return await Program.findOne({ name }).lean();
};

export const updateProgram = async (id: string, name: string) => {
	return await Program.findOneAndUpdate(
		{ _id: id },
		{ name },
		{ new: true }
	).lean();
};

export const addProgram = async (name: string) => {
	return await Program.create({ name });
};

export const getPrograms = async () => {
	return await Program.find({}, { createdAt: 0, updatedAt: 0, __v: 0 }).lean();
};

export const findProgramById = async (id: string | Types.ObjectId) => {
	return await Program.findById(id).lean();
};