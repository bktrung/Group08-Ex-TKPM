import StudentService from "../../../src/services/student.service";
import {
    findStudent,
    addStudent,
    findStudentStatusById,
} from "../../../src/models/repositories/student.repo";
import { findDepartmentById } from "../../../src/models/repositories/department.repo";
import { findProgramById } from "../../../src/models/repositories/program.repo";
import { CreateStudentDto } from "../../../src/dto/student";
import mongoose from 'mongoose';
import { Gender, IdentityDocumentType } from '../../../src/models/interfaces/student.interface';


// Mock toàn bộ các hàm repository
jest.mock("../../../src/models/repositories/student.repo", () => ({
    findStudent: jest.fn(),
    addStudent: jest.fn(),
    findStudentStatusById: jest.fn(),
}));
jest.mock("../../../src/models/repositories/department.repo", () => ({
    findDepartmentById: jest.fn(),
}));
jest.mock("../../../src/models/repositories/program.repo", () => ({
    findProgramById: jest.fn(),
}));

describe("StudentService.addStudent", () => {

    const mockStudentId = "SV001";
    const mockDepartmentId = new mongoose.Types.ObjectId().toString();
    const mockProgramId = new mongoose.Types.ObjectId().toString();
    const mockStatusId = new mongoose.Types.ObjectId().toString();
   
    const baseStudent: CreateStudentDto = {
        studentId: mockStudentId,
        fullName: 'John Doe',
        dateOfBirth: new Date('2000-01-01'),
        gender: Gender.MALE,
        department: mockDepartmentId,
        schoolYear: 2020,
        program: mockProgramId,
        mailingAddress: {
            houseNumberStreet: '123 Main St',
            wardCommune: 'Ward 1',
            districtCounty: 'District 1',
            provinceCity: 'City 1',
            country: 'Country 1'
        },
        email: 'john.doe@example.com',
        phoneNumber: '1234567890',
        status: mockStatusId,
        identityDocument: {
            type: IdentityDocumentType.CCCD,
            number: 'ID12345',
            issueDate: new Date('2019-01-01'),
            issuedBy: 'Authority 1',
            expiryDate: new Date('2029-01-01'),
            hasChip: true
        },
        nationality: 'Vietnam'
    };

    afterEach(() => {
        jest.clearAllMocks();
    });

    it("should throw if student with same studentId exists", async () => {
        (findStudent as jest.Mock).mockResolvedValue({ studentId: "SV001" });

        await expect(StudentService.addStudent(baseStudent)).rejects.toThrow(
            "Mã số sinh viên đã tồn tại"
        );
    });

    it("should throw if email is duplicated", async () => {
        (findStudent as jest.Mock).mockResolvedValue({ email: baseStudent.email, studentId: "another_id" });

        await expect(StudentService.addStudent(baseStudent)).rejects.toThrow(
            "Email đã được sử dụng bởi sinh viên khác"
        );
    });

    it("should throw if phone number is duplicated", async () => {
        (findStudent as jest.Mock).mockResolvedValue({ phoneNumber: baseStudent.phoneNumber, studentId: "diff" });

        await expect(StudentService.addStudent(baseStudent)).rejects.toThrow(
            "Số điện thoại đã được sử dụng bởi sinh viên khác"
        );
    });

    it("should throw if identity document number is duplicated", async () => {
        (findStudent as jest.Mock).mockResolvedValue({
            identityDocument: { number: baseStudent.identityDocument.number },
            studentId: "diff",
        });

        await expect(StudentService.addStudent(baseStudent)).rejects.toThrow(
            "Số CMND/CCCD/Passport đã được sử dụng bởi sinh viên khác"
        );
    });

    it("should throw if student status not found", async () => {
        (findStudent as jest.Mock).mockResolvedValue(null);
        (findStudentStatusById as jest.Mock).mockResolvedValue(null);

        await expect(StudentService.addStudent(baseStudent)).rejects.toThrow(
            "Trạng thái sinh viên không tồn tại"
        );
    });

    it("should throw if department not found", async () => {
        (findStudent as jest.Mock).mockResolvedValue(null);
        (findStudentStatusById as jest.Mock).mockResolvedValue({ _id: "status_id" });
        (findDepartmentById as jest.Mock).mockResolvedValue(null);

        await expect(StudentService.addStudent(baseStudent)).rejects.toThrow(
            "Khoa không tồn tại"
        );
    });

    it("should throw if program not found", async () => {
        (findStudent as jest.Mock).mockResolvedValue(null);
        (findStudentStatusById as jest.Mock).mockResolvedValue({ _id: "status_id" });
        (findDepartmentById as jest.Mock).mockResolvedValue({ _id: "dept_id" });
        (findProgramById as jest.Mock).mockResolvedValue(null);

        await expect(StudentService.addStudent(baseStudent)).rejects.toThrow(
            "Chương trình học không tồn tại"
        );
    });

    it("should create student successfully", async () => {
        (findStudent as jest.Mock).mockResolvedValue(null);
        (findStudentStatusById as jest.Mock).mockResolvedValue({ _id: "status_id" });
        (findDepartmentById as jest.Mock).mockResolvedValue({ _id: "dept_id" });
        (findProgramById as jest.Mock).mockResolvedValue({ _id: "prog_id" });
        (addStudent as jest.Mock).mockResolvedValue({ ...baseStudent, _id: "generated_id" });

        const result = await StudentService.addStudent(baseStudent);

        expect(result).toBeDefined();
        expect(result._id).toBe("generated_id");
        expect(addStudent).toHaveBeenCalledWith(baseStudent);
    });
});
