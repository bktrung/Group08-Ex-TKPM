import Program from '../program.model';

export const findProgramByName = async (name: string) => {
	return await Program.findOne({ name });
};

export const updateProgram = async (id: string, name: string) => {
	return await Program.findOneAndUpdate(
		{ _id: id },
		{ name },
		{ new: true }
	);
};

export const addProgram = async (name: string) => {
	return await Program.create({ name });
};

export const getPrograms = async () => {
	return await Program.find({}, { createdAt: 0, updatedAt: 0, __v: 0 });
};