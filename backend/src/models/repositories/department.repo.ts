import { Types } from "mongoose";
import Deparment from "../department.model";

export const findDepartmentByName = async (name: string) => {
	return await Deparment.findOne({ name }).lean();
};

export const findDepartmentById = async (id: string | Types.ObjectId) => {
	return await Deparment.findById(id).lean();
};

export const addDepartment = async (name: string) => {
	return await Deparment.create({ name });
};

export const updateDepartment = async (id: string, name: string) => {
	return await Deparment.findOneAndUpdate(
		{ _id: id },
		{ name },
		{ new: true }
	).lean();
};

export const getDepartments = async () => {
	return await Deparment.find({}, { createdAt: 0, updatedAt: 0, __v: 0 }).lean();
};