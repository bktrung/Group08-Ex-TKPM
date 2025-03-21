import { Gender, IdentityDocumentType, IdentityDocument, IAddress } from "../../models/interfaces/student.interface";
import { Types } from "mongoose";

export interface CreateStudentDto {
	studentId: string;
	fullName: string;
	dateOfBirth: Date;
	gender: Gender;
	department: string | Types.ObjectId;
	schoolYear: number;
	program: string | Types.ObjectId;
	permanentAddress?: IAddress;
	temporaryAddress?: IAddress;
	mailingAddress: IAddress;
	email: string;
	phoneNumber: string;
	status: string | Types.ObjectId;
	identityDocument: IdentityDocument;
	nationality: string;
}

export interface UpdateStudentDto {
	fullName?: string;
	dateOfBirth?: Date;
	gender?: Gender;
	department?: string | Types.ObjectId;
	schoolYear?: number;
	program?: string | Types.ObjectId;
	permanentAddress?: IAddress;
	temporaryAddress?: IAddress;
	mailingAddress?: IAddress;
	email?: string;
	phoneNumber?: string;
	status?: string | Types.ObjectId;
	identityDocument?: Partial<IdentityDocument>;
	nationality?: string;
}

// Additional DTOs for specific identity document types
export interface BaseDtoIdentityDocument {
	type: IdentityDocumentType;
	number: string;
	issueDate: Date;
	issuedBy: string;
	expiryDate: Date;
}

export interface CMNDDto extends BaseDtoIdentityDocument {
	type: IdentityDocumentType.CMND;
}

export interface CCCDDto extends BaseDtoIdentityDocument {
	type: IdentityDocumentType.CCCD;
	hasChip: boolean;
}

export interface PassportDto extends BaseDtoIdentityDocument {
	type: IdentityDocumentType.PASSPORT;
	issuedCountry: string;
	notes?: string;
}

export type IdentityDocumentDto = CMNDDto | CCCDDto | PassportDto;