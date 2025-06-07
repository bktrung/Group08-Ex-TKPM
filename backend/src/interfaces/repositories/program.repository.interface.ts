import { IProgram } from "../../models/interfaces/program.interface";
import { Types } from "mongoose";

export interface IProgramRepository {
	findProgramById(id: string | Types.ObjectId): Promise<IProgram | null>;
	findProgramByName(name: string): Promise<IProgram | null>;
	addProgram(name: string): Promise<IProgram>;
	updateProgram(id: string, name: string): Promise<IProgram | null>;
	getPrograms(): Promise<IProgram[]>;
} 