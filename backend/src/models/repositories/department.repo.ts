import { Types } from "mongoose";
import Deparment from "../department.model";

export const findDepartmentByName = async (name: string) => {
	return await Deparment.findOne({ name });
};

export const findDepartmentById = async (id: string | Types.ObjectId) => {
	return await Deparment.findById(id);
};

export const addDepartment = async (name: string) => {
	return await Deparment.create({ name });
};

export const updateDepartment = async (id: string, name: string) => {
	return await Deparment.findOneAndUpdate(
		{ _id: id },
		{ name },
		{ new: true }
	);
};

export const getDepartments = async () => {
	return await Deparment.find({}, { createdAt: 0, updatedAt: 0, __v: 0 });
};