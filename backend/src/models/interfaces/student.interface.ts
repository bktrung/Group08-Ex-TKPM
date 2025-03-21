import { Document, Types } from "mongoose";

export enum Gender {
	MALE = 'Nam',
	FEMALE = 'Nữ'
}

export enum IdentityDocumentType {
	CMND = 'CMND',
	CCCD = 'CCCD',
	PASSPORT = 'PASSPORT'
}

export interface IBaseIdentityDocument {
	type: IdentityDocumentType;
	number: string;
	issueDate: Date;
	issuedBy: string;
	expiryDate: Date;
}

export interface ICMND extends IBaseIdentityDocument {
	type: IdentityDocumentType.CMND;
}

export interface ICCCD extends IBaseIdentityDocument {
	type: IdentityDocumentType.CCCD;
	hasChip: boolean;
}

export interface IPassport extends IBaseIdentityDocument {
	type: IdentityDocumentType.PASSPORT;
	issuedCountry: string;
	notes?: string;
}

export type IdentityDocument = ICMND | ICCCD | IPassport;

export interface IAddress {
	houseNumberStreet: string;
	wardCommune: string;
	districtCounty: string;
	provinceCity: string;
	country: string;
}

export interface IStudent extends Document {
	studentId: string;
	fullName: string;
	dateOfBirth: Date;
	gender: Gender;
	department: Types.ObjectId | string;
	schoolYear: number;
	program: Types.ObjectId | string;
	permanentAddress?: IAddress;
	temporaryAddress?: IAddress;
	mailingAddress: IAddress;
	email: string;
	phoneNumber: string;
	status: Types.ObjectId | string;
	identityDocument: IdentityDocument;
	nationality: string;
}

export interface IStudentStatus extends Document {
	type: string;
}