import { Document } from 'mongoose';

export interface IDepartment extends Document {
	name: string;
}