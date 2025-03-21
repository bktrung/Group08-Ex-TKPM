import { Document } from 'mongoose';

export interface IProgram extends Document {
	name: string;
}