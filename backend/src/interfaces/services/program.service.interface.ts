import { IProgram } from "../../models/interfaces/program.interface";

export interface IProgramService {
	addProgram(programName: string): Promise<IProgram>;
	updateProgram(programId: string, programName: string): Promise<IProgram>;
	getPrograms(): Promise<IProgram[]>;
} 