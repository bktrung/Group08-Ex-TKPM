import mongoose from "mongoose";
import { Container } from "inversify";
import { StudentService } from "../../../src/services/student.service";
import { IStudent } from "../../../src/models/interfaces/student.interface";
import { IStudentRepository } from "../../../src/interfaces/repositories/student.repository.interface";
import { IDepartmentRepository } from "../../../src/interfaces/repositories/department.repository.interface";
import { IProgramRepository } from "../../../src/interfaces/repositories/program.repository.interface";
import { CreateStudentDto, UpdateStudentDto } from "../../../src/dto/student";
import { TYPES } from "../../../src/configs/di.types";
import { BadRequestError, NotFoundError } from "../../../src/responses/error.responses";
import * as studentRepo from '../../../src/models/repositories/student.repo';
import * as departmentRepo from '../../../src/models/repositories/department.repo';
import * as programRepo from '../../../src/models/repositories/program.repo';
import { Gender, IdentityDocumentType } from '../../../src/models/interfaces/student.interface';
import type { IStudentStatus, IStudentStatusTransition } from '../../../src/models/interfaces/student.interface';

// Mock repositories
jest.mock('../../../src/models/repositories/student.repo');
jest.mock('../../../src/models/repositories/department.repo');
jest.mock('../../../src/models/repositories/program.repo');

describe("Student Service - DI Implementation", () => {
  let container: Container;
  let studentService: StudentService;
  let mockStudentRepository: jest.Mocked<IStudentRepository>;
  let mockDepartmentRepository: jest.Mocked<IDepartmentRepository>;
  let mockProgramRepository: jest.Mocked<IProgramRepository>;

  const mockStudentId = new mongoose.Types.ObjectId();
  const mockDepartmentId = new mongoose.Types.ObjectId();
  const mockProgramId = new mongoose.Types.ObjectId();
  const mockStatusId = new mongoose.Types.ObjectId();

  const mockStudent: Partial<IStudent> = {
    _id: mockStudentId,
    studentId: "STU001",
    fullName: "John Doe",
    dateOfBirth: new Date('1999-01-01'),
    gender: Gender.MALE,
    email: "john.doe@example.com",
    phoneNumber: "0123456789",
    identityDocument: {
      type: IdentityDocumentType.CCCD,
      number: "123456789012",
      issueDate: new Date('2020-01-01'),
      issuedBy: "CA TP.HCM",
      expiryDate: new Date('2030-01-01'),
      hasChip: true
    },
    status: mockStatusId,
    department: mockDepartmentId,
    program: mockProgramId,
    schoolYear: 2023,
    nationality: "Vietnam",
    mailingAddress: {
      houseNumberStreet: "123 Main St",
      wardCommune: "Ward 1",
      districtCounty: "District 1",
      provinceCity: "Ho Chi Minh City",
      country: "Vietnam"
    }
  };

  const mockCreateStudentDto: CreateStudentDto = {
    studentId: "STU001",
    fullName: "John Doe",
    dateOfBirth: new Date('1999-01-01'),
    gender: Gender.MALE,
    email: "john.doe@example.com",
    phoneNumber: "0123456789",
    identityDocument: {
      type: IdentityDocumentType.CCCD,
      number: "123456789012",
      issueDate: new Date('2020-01-01'),
      issuedBy: "CA TP.HCM",
      expiryDate: new Date('2030-01-01'),
      hasChip: true
    },
    status: mockStatusId,
    department: mockDepartmentId,
    program: mockProgramId,
    schoolYear: 2023,
    nationality: "Vietnam",
    mailingAddress: {
      houseNumberStreet: "123 Main St",
      wardCommune: "Ward 1",
      districtCounty: "District 1",
      provinceCity: "Ho Chi Minh City",
      country: "Vietnam"
    }
  };

  beforeEach(() => {
    // Create test container
    container = new Container();
    
    // Create mocked repositories
    mockStudentRepository = {
      findStudent: jest.fn(),
      addStudent: jest.fn(),
      updateStudent: jest.fn(),
      deleteStudent: jest.fn(),
      searchStudents: jest.fn(),
      getAllStudents: jest.fn(),
      getStudentInfo: jest.fn(),
      findStudentStatus: jest.fn(),
      findStudentStatusById: jest.fn(),
      addStudentStatus: jest.fn(),
      updateStudentStatus: jest.fn(),
      getStudentStatus: jest.fn(),
      addStudentStatusTransition: jest.fn(),
      findStudentStatusTransition: jest.fn(),
      getTransitionRules: jest.fn(),
      deleteStudentStatusTransition: jest.fn(),
    } as jest.Mocked<IStudentRepository>;

    mockDepartmentRepository = {
      findDepartmentById: jest.fn(),
      findDepartmentByName: jest.fn(),
      addDepartment: jest.fn(),
      updateDepartment: jest.fn(),
      getDepartments: jest.fn(),
    } as jest.Mocked<IDepartmentRepository>;

    mockProgramRepository = {
      findProgramById: jest.fn(),
      findProgramByName: jest.fn(),
      addProgram: jest.fn(),
      updateProgram: jest.fn(),
      getPrograms: jest.fn(),
    } as jest.Mocked<IProgramRepository>;
    
    // Bind mocked repositories
    container.bind<IStudentRepository>(TYPES.StudentRepository).toConstantValue(mockStudentRepository);
    container.bind<IDepartmentRepository>(TYPES.DepartmentRepository).toConstantValue(mockDepartmentRepository);
    container.bind<IProgramRepository>(TYPES.ProgramRepository).toConstantValue(mockProgramRepository);
    container.bind<StudentService>(TYPES.StudentService).to(StudentService);
    
    // Get service instance
    studentService = container.get<StudentService>(TYPES.StudentService);
  });

  describe('addStudent', () => {
    it('should create student successfully when all validations pass', async () => {
      // Mock repository calls to return valid data
      mockStudentRepository.findStudent.mockResolvedValue(null); // No existing student
      mockStudentRepository.findStudentStatusById.mockResolvedValue({ _id: mockStatusId } as any);
      mockDepartmentRepository.findDepartmentById.mockResolvedValue({ _id: mockDepartmentId, name: 'Computer Science' } as any);
      mockProgramRepository.findProgramById.mockResolvedValue({ _id: mockProgramId, name: 'Software Engineering' } as any);
      mockStudentRepository.addStudent.mockResolvedValue(mockStudent as IStudent);

      const result = await studentService.addStudent(mockCreateStudentDto);
      
      expect(mockStudentRepository.findStudent).toHaveBeenCalledWith({
        $or: [
          { studentId: mockCreateStudentDto.studentId },
          { email: mockCreateStudentDto.email },
          { phoneNumber: mockCreateStudentDto.phoneNumber },
          { 'identityDocument.number': mockCreateStudentDto.identityDocument.number }
        ]
      });
      expect(mockStudentRepository.findStudentStatusById).toHaveBeenCalledWith(mockStatusId);
      expect(mockDepartmentRepository.findDepartmentById).toHaveBeenCalledWith(mockDepartmentId);
      expect(mockProgramRepository.findProgramById).toHaveBeenCalledWith(mockProgramId);
      expect(mockStudentRepository.addStudent).toHaveBeenCalledWith(mockCreateStudentDto);
      expect(result).toEqual(mockStudent);
    });

    it('should throw BadRequestError when student ID already exists', async () => {
      const existingStudent = { ...mockStudent, studentId: mockCreateStudentDto.studentId };
      mockStudentRepository.findStudent.mockResolvedValue(existingStudent as IStudent);

      await expect(studentService.addStudent(mockCreateStudentDto))
        .rejects
        .toThrow(new BadRequestError('Student ID already exists'));
      
      expect(mockStudentRepository.addStudent).not.toHaveBeenCalled();
    });

    it('should throw BadRequestError when status does not exist', async () => {
      mockStudentRepository.findStudent.mockResolvedValue(null);
      mockStudentRepository.findStudentStatusById.mockResolvedValue(null);

      await expect(studentService.addStudent(mockCreateStudentDto))
        .rejects
        .toThrow(new BadRequestError('Student status does not exist'));
      
      expect(mockStudentRepository.addStudent).not.toHaveBeenCalled();
    });
  });

  describe('updateStudent', () => {
    const updateStudentDto: UpdateStudentDto = {
      fullName: "Jane Smith",
      email: "jane.smith@example.com"
    };

    it('should update student successfully', async () => {
      const updatedStudent = { ...mockStudent, ...updateStudentDto };
      mockStudentRepository.findStudent.mockResolvedValueOnce(mockStudent as IStudent);
      mockStudentRepository.findStudent.mockResolvedValueOnce(null); // No email conflict
      mockStudentRepository.updateStudent.mockResolvedValue(updatedStudent as IStudent);

      const result = await studentService.updateStudent("STU001", updateStudentDto);
      
      expect(mockStudentRepository.updateStudent).toHaveBeenCalledWith("STU001", updateStudentDto);
      expect(result).toEqual(updatedStudent);
    });

    it('should throw NotFoundError when student does not exist', async () => {
      mockStudentRepository.findStudent.mockResolvedValue(null);

      await expect(studentService.updateStudent("STU001", updateStudentDto))
        .rejects
        .toThrow(new NotFoundError('Student not found'));
      
      expect(mockStudentRepository.updateStudent).not.toHaveBeenCalled();
    });
  });

  describe('deleteStudent', () => {
    it('should delete student successfully', async () => {
      mockStudentRepository.deleteStudent.mockResolvedValue(mockStudent as IStudent);

      const result = await studentService.deleteStudent("STU001");
      
      expect(mockStudentRepository.deleteStudent).toHaveBeenCalledWith("STU001");
      expect(result).toEqual(mockStudent);
    });

    it('should throw NotFoundError when student does not exist', async () => {
      mockStudentRepository.deleteStudent.mockResolvedValue(null);

      await expect(studentService.deleteStudent("STU001"))
        .rejects
        .toThrow(new NotFoundError('Student not found'));
      
      expect(mockStudentRepository.deleteStudent).toHaveBeenCalledWith("STU001");
    });
  });

  describe('searchStudents', () => {
    const searchOptions = {
      query: "John",
      page: 1,
      limit: 10,
      sort: "ctime"
    };

    it('should search students successfully', async () => {
      const searchResult = {
        pagination: {
          total: 1,
          page: 1,
          limit: 10,
          totalPages: 1
        },
        students: [mockStudent]
      };
      mockStudentRepository.searchStudents.mockResolvedValue(searchResult);

      const result = await studentService.searchStudents(searchOptions);
      
      expect(mockStudentRepository.searchStudents).toHaveBeenCalledWith({
        filter: {},
        query: "John",
        page: 1,
        limit: 10,
        sort: "ctime"
      });
      expect(result).toEqual(searchResult);
    });

    it('should throw BadRequestError when query is empty', async () => {
      const emptyQueryOptions = { ...searchOptions, query: "" };

      await expect(studentService.searchStudents(emptyQueryOptions))
        .rejects
        .toThrow(new BadRequestError('Search query cannot be empty'));
      
      expect(mockStudentRepository.searchStudents).not.toHaveBeenCalled();
    });
  });

  describe('getAllStudents', () => {
    it('should get all students successfully', async () => {
      const studentsResult = {
        pagination: {
          total: 1,
          page: 1,
          limit: 10,
          totalPages: 1
        },
        students: [mockStudent]
      };
      mockStudentRepository.getAllStudents.mockResolvedValue(studentsResult);

      const result = await studentService.getAllStudents(1, 10);
      
      expect(mockStudentRepository.getAllStudents).toHaveBeenCalledWith(1, 10);
      expect(result).toEqual(studentsResult);
    });
  });

  describe('getStudentById', () => {
    it('should get student by ID successfully', async () => {
      mockStudentRepository.findStudent.mockResolvedValue(mockStudent as IStudent);

      const result = await studentService.getStudentById("STU001");
      
      expect(mockStudentRepository.findStudent).toHaveBeenCalledWith({ studentId: "STU001" });
      expect(result).toEqual(mockStudent);
    });

    it('should throw NotFoundError when student does not exist', async () => {
      mockStudentRepository.findStudent.mockResolvedValue(null);

      await expect(studentService.getStudentById("STU001"))
        .rejects
        .toThrow(new NotFoundError('Student not found'));
      
      expect(mockStudentRepository.findStudent).toHaveBeenCalledWith({ studentId: "STU001" });
    });
  });
});
      