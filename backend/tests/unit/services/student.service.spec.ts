import { Gender, IdentityDocumentType } from '../../../src/models/interfaces/student.interface';
import type { IStudent, IStudentStatus, IStudentStatusTransition } from '../../../src/models/interfaces/student.interface';
import { BadRequestError, NotFoundError } from '../../../src/responses/error.responses';
import StudentService from '../../../src/services/student.service';
import * as studentRepo from '../../../src/models/repositories/student.repo';
import * as departmentRepo from '../../../src/models/repositories/department.repo';
import * as programRepo from '../../../src/models/repositories/program.repo';
import { CreateStudentDto, UpdateStudentDto } from '../../../src/dto/student';
import mongoose from 'mongoose';

// Mock repositories
jest.mock('../../../src/models/repositories/student.repo');
jest.mock('../../../src/models/repositories/department.repo');
jest.mock('../../../src/models/repositories/program.repo');

describe('StudentService', () => {
  // Common mock data
  const mockDepartmentId = new mongoose.Types.ObjectId().toString();
  const mockProgramId = new mongoose.Types.ObjectId().toString();
  const mockStatusId = new mongoose.Types.ObjectId().toString();
  const mockStudentId = 'SV001';

  // Mock student data for testing
  const mockStudentData: CreateStudentDto = {
    studentId: mockStudentId,
    fullName: 'Nguyen Van A',
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
      country: 'Vietnam'
    },
    email: 'nguyenvana@example.com',
    phoneNumber: '0123456789',
    status: mockStatusId,
    identityDocument: {
      type: IdentityDocumentType.CCCD,
      number: '123456789012',
      issueDate: new Date('2018-01-01'),
      issuedBy: 'CA TP. HCM',
      expiryDate: new Date('2028-01-01'),
      hasChip: true
    },
    nationality: 'Vietnam'
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('addStudent', () => {
    it('should add a student successfully', async () => {
      // Mock implementations
      (studentRepo.findStudent as jest.Mock).mockResolvedValue(null);
      (studentRepo.findStudentStatusById as jest.Mock).mockResolvedValue({ _id: mockStatusId, type: 'Active' });
      (departmentRepo.findDepartmentById as jest.Mock).mockResolvedValue({ _id: mockDepartmentId, name: 'Computer Science' });
      (programRepo.findProgramById as jest.Mock).mockResolvedValue({ _id: mockProgramId, name: 'Software Engineering' });
      (studentRepo.addStudent as jest.Mock).mockResolvedValue({ 
        ...mockStudentData, 
        _id: new mongoose.Types.ObjectId() 
      });

      // Execute
      const result = await StudentService.addStudent(mockStudentData);

      // Verify
      expect(studentRepo.findStudent).toHaveBeenCalledWith({
        $or: [
          { studentId: mockStudentData.studentId },
          { email: mockStudentData.email },
          { phoneNumber: mockStudentData.phoneNumber },
          { 'identityDocument.number': mockStudentData.identityDocument.number }
        ]
      });
      expect(studentRepo.findStudentStatusById).toHaveBeenCalledWith(mockStatusId);
      expect(departmentRepo.findDepartmentById).toHaveBeenCalledWith(mockDepartmentId);
      expect(programRepo.findProgramById).toHaveBeenCalledWith(mockProgramId);
      expect(studentRepo.addStudent).toHaveBeenCalledWith(mockStudentData);
      expect(result).toBeDefined();
      expect(result.studentId).toBe(mockStudentData.studentId);
    });

    it('should throw BadRequestError when student ID already exists', async () => {
      // Mock student with same ID already exists
      (studentRepo.findStudent as jest.Mock).mockResolvedValue({
        studentId: mockStudentData.studentId,
        email: 'different@example.com',
        phoneNumber: '9876543210',
        identityDocument: { number: '098765432109' }
      });

      // Execute and assert
      await expect(StudentService.addStudent(mockStudentData))
        .rejects
        .toThrow(BadRequestError);
      
      expect(studentRepo.addStudent).not.toHaveBeenCalled();
    });

    it('should throw BadRequestError when email already exists', async () => {
      // Mock student with same email already exists
      (studentRepo.findStudent as jest.Mock).mockResolvedValue({
        studentId: 'different-id',
        email: mockStudentData.email,
        phoneNumber: '9876543210',
        identityDocument: { number: '098765432109' }
      });

      // Execute and assert
      await expect(StudentService.addStudent(mockStudentData))
        .rejects
        .toThrow(BadRequestError);
      
      expect(studentRepo.addStudent).not.toHaveBeenCalled();
    });

    it('should throw BadRequestError when phone number already exists', async () => {
      // Mock student with same phone number already exists
      (studentRepo.findStudent as jest.Mock).mockResolvedValue({
        studentId: 'different-id',
        email: 'different@example.com',
        phoneNumber: mockStudentData.phoneNumber,
        identityDocument: { number: '098765432109' }
      });

      // Execute and assert
      await expect(StudentService.addStudent(mockStudentData))
        .rejects
        .toThrow(BadRequestError);
      
      expect(studentRepo.addStudent).not.toHaveBeenCalled();
    });

    it('should throw BadRequestError when identity document number already exists', async () => {
      // Mock student with same identity document number already exists
      (studentRepo.findStudent as jest.Mock).mockResolvedValue({
        studentId: 'different-id',
        email: 'different@example.com',
        phoneNumber: '9876543210',
        identityDocument: { number: mockStudentData.identityDocument.number }
      });

      // Execute and assert
      await expect(StudentService.addStudent(mockStudentData))
        .rejects
        .toThrow(BadRequestError);
      
      expect(studentRepo.addStudent).not.toHaveBeenCalled();
    });

    it('should throw BadRequestError when status does not exist', async () => {
      // Mock student doesn't exist
      (studentRepo.findStudent as jest.Mock).mockResolvedValue(null);
      // Mock status doesn't exist
      (studentRepo.findStudentStatusById as jest.Mock).mockResolvedValue(null);

      // Execute and assert
      await expect(StudentService.addStudent(mockStudentData))
        .rejects
        .toThrow(BadRequestError);
      
      expect(studentRepo.addStudent).not.toHaveBeenCalled();
    });

    it('should throw BadRequestError when department does not exist', async () => {
      // Mock student doesn't exist
      (studentRepo.findStudent as jest.Mock).mockResolvedValue(null);
      // Mock status exists
      (studentRepo.findStudentStatusById as jest.Mock).mockResolvedValue({ _id: mockStatusId, type: 'Active' });
      // Mock department doesn't exist
      (departmentRepo.findDepartmentById as jest.Mock).mockResolvedValue(null);

      // Execute and assert
      await expect(StudentService.addStudent(mockStudentData))
        .rejects
        .toThrow(BadRequestError);
      
      expect(studentRepo.addStudent).not.toHaveBeenCalled();
    });

    it('should throw BadRequestError when program does not exist', async () => {
      // Mock student doesn't exist
      (studentRepo.findStudent as jest.Mock).mockResolvedValue(null);
      // Mock status exists
      (studentRepo.findStudentStatusById as jest.Mock).mockResolvedValue({ _id: mockStatusId, type: 'Active' });
      // Mock department exists
      (departmentRepo.findDepartmentById as jest.Mock).mockResolvedValue({ _id: mockDepartmentId, name: 'Computer Science' });
      // Mock program doesn't exist
      (programRepo.findProgramById as jest.Mock).mockResolvedValue(null);

      // Execute and assert
      await expect(StudentService.addStudent(mockStudentData))
        .rejects
        .toThrow(BadRequestError);
      
      expect(studentRepo.addStudent).not.toHaveBeenCalled();
    });
  });

  describe('updateStudent', () => {
    const updateData: UpdateStudentDto = {
      fullName: 'Nguyen Van B',
      email: 'nguyenvanb@example.com'
    };

    it('should update a student successfully', async () => {
      // Mock implementations
      (studentRepo.findStudent as jest.Mock).mockResolvedValue({ 
        studentId: mockStudentId,
        status: mockStatusId,
        email: 'old@example.com' 
      });
      (studentRepo.updateStudent as jest.Mock).mockResolvedValue({ 
        studentId: mockStudentId,
        ...updateData 
      });

      // Execute
      const result = await StudentService.updateStudent(mockStudentId, updateData);

      // Verify
      expect(studentRepo.findStudent).toHaveBeenCalledWith({ studentId: mockStudentId });
      expect(studentRepo.updateStudent).toHaveBeenCalledWith(mockStudentId, updateData);
      expect(result).toBeDefined();
      expect(result.fullName).toBe(updateData.fullName);
      expect(result.email).toBe(updateData.email);
    });

    it('should throw NotFoundError when student does not exist', async () => {
      // Mock student doesn't exist
      (studentRepo.findStudent as jest.Mock).mockResolvedValue(null);

      // Execute and assert
      await expect(StudentService.updateStudent(mockStudentId, updateData))
        .rejects
        .toThrow(NotFoundError);
      
      expect(studentRepo.updateStudent).not.toHaveBeenCalled();
    });

    it('should throw BadRequestError when trying to change status without proper transition', async () => {
      const statusUpdateData: UpdateStudentDto = {
        status: new mongoose.Types.ObjectId().toString()
      };

      // Mock student exists
      (studentRepo.findStudent as jest.Mock).mockResolvedValue({ 
        studentId: mockStudentId,
        status: mockStatusId 
      });
      // Mock no valid status transition exists
      (studentRepo.findStudentStatusTransition as jest.Mock).mockResolvedValue(null);

      // Execute and assert
      await expect(StudentService.updateStudent(mockStudentId, statusUpdateData))
        .rejects
        .toThrow(BadRequestError);
      
      expect(studentRepo.updateStudent).not.toHaveBeenCalled();
    });

    it('should throw BadRequestError when updated email already exists', async () => {
      const emailUpdateData: UpdateStudentDto = {
        email: 'existing@example.com'
      };

      // Mock student exists
      (studentRepo.findStudent as jest.Mock)
        .mockResolvedValueOnce({ studentId: mockStudentId })
        .mockResolvedValueOnce({ studentId: 'different-id', email: emailUpdateData.email });

      // Execute and assert
      await expect(StudentService.updateStudent(mockStudentId, emailUpdateData))
        .rejects
        .toThrow(BadRequestError);
      
      expect(studentRepo.updateStudent).not.toHaveBeenCalled();
    });

    it('should throw BadRequestError when updated phone number already exists', async () => {
      const phoneUpdateData: UpdateStudentDto = {
        phoneNumber: '0987654321'
      };

      // Mock student exists
      (studentRepo.findStudent as jest.Mock)
        .mockResolvedValueOnce({ studentId: mockStudentId })
        .mockResolvedValueOnce({ studentId: 'different-id', phoneNumber: phoneUpdateData.phoneNumber });

      // Execute and assert
      await expect(StudentService.updateStudent(mockStudentId, phoneUpdateData))
        .rejects
        .toThrow(BadRequestError);
      
      expect(studentRepo.updateStudent).not.toHaveBeenCalled();
    });


    it('should throw BadRequestError when updated status does not exist', async () => {
      const statusUpdateData: UpdateStudentDto = {
        status: new mongoose.Types.ObjectId().toString()
      };

      // Mock student exists
      (studentRepo.findStudent as jest.Mock).mockResolvedValue({ 
        studentId: mockStudentId,
        status: mockStatusId 
      });
      // Mock valid status transition exists
      (studentRepo.findStudentStatusTransition as jest.Mock).mockResolvedValue({});
      // Mock status doesn't exist
      (studentRepo.findStudentStatusById as jest.Mock).mockResolvedValue(null);

      // Execute and assert
      await expect(StudentService.updateStudent(mockStudentId, statusUpdateData))
        .rejects
        .toThrow(BadRequestError);
      
      expect(studentRepo.updateStudent).not.toHaveBeenCalled();
    });

    it('should throw BadRequestError when updated department does not exist', async () => {
      const departmentUpdateData: UpdateStudentDto = {
        department: new mongoose.Types.ObjectId().toString()
      };

      // Mock student exists
      (studentRepo.findStudent as jest.Mock).mockResolvedValue({ studentId: mockStudentId });
      // Mock department doesn't exist
      (departmentRepo.findDepartmentById as jest.Mock).mockResolvedValue(null);

      // Execute and assert
      await expect(StudentService.updateStudent(mockStudentId, departmentUpdateData))
        .rejects
        .toThrow(BadRequestError);
      
      expect(studentRepo.updateStudent).not.toHaveBeenCalled();
    });

    it('should throw BadRequestError when updated program does not exist', async () => {
      const programUpdateData: UpdateStudentDto = {
        program: new mongoose.Types.ObjectId().toString()
      };

      // Mock student exists
      (studentRepo.findStudent as jest.Mock).mockResolvedValue({ studentId: mockStudentId });
      // Mock program doesn't exist
      (programRepo.findProgramById as jest.Mock).mockResolvedValue(null);

      // Execute and assert
      await expect(StudentService.updateStudent(mockStudentId, programUpdateData))
        .rejects
        .toThrow(BadRequestError);
      
      expect(studentRepo.updateStudent).not.toHaveBeenCalled();
    });

    it('should throw NotFoundError when update operation fails', async () => {
      // Mock student exists
      (studentRepo.findStudent as jest.Mock).mockResolvedValue({ studentId: mockStudentId });
      // Mock update returns null (failed)
      (studentRepo.updateStudent as jest.Mock).mockResolvedValue(null);

      // Execute and assert
      await expect(StudentService.updateStudent(mockStudentId, updateData))
        .rejects
        .toThrow(NotFoundError);
    });
  });

  describe('deleteStudent', () => {
    it('should delete a student successfully', async () => {
      // Mock implementations
      (studentRepo.deleteStudent as jest.Mock).mockResolvedValue({ 
        studentId: mockStudentId, 
        fullName: 'Nguyen Van A' 
      });

      // Execute
      const result = await StudentService.deleteStudent(mockStudentId);

      // Verify
      expect(studentRepo.deleteStudent).toHaveBeenCalledWith(mockStudentId);
      expect(result).toBeDefined();
      expect(result.studentId).toBe(mockStudentId);
    });

    it('should throw NotFoundError when student to delete does not exist', async () => {
      // Mock student doesn't exist
      (studentRepo.deleteStudent as jest.Mock).mockResolvedValue(null);

      // Execute and assert
      await expect(StudentService.deleteStudent('nonexistent'))
        .rejects
        .toThrow(NotFoundError);
    });
  });

  describe('searchStudents', () => {
    it('should search students successfully', async () => {
      const searchQuery = 'Nguyen';
      const mockSearchResult = {
        students: [{ studentId: mockStudentId, fullName: 'Nguyen Van A' }],
        pagination: {
          total: 1,
          page: 1,
          limit: 10,
          totalPages: 1
        }
      };

      // Mock implementation
      (studentRepo.searchStudents as jest.Mock).mockResolvedValue(mockSearchResult);

      // Execute
      const result = await StudentService.searchStudents({ 
        query: searchQuery, 
        page: 1, 
        limit: 10 
      });

      // Verify
      expect(studentRepo.searchStudents).toHaveBeenCalledWith({
        filter: {},
        query: searchQuery,
        page: 1,
        limit: 10,
        sort: 'ctime'
      });
      expect(result).toEqual(mockSearchResult);
    });

    it('should throw BadRequestError for empty search query', async () => {
      // Execute and assert
      await expect(StudentService.searchStudents({ 
        query: '', 
        page: 1, 
        limit: 10 
      }))
        .rejects
        .toThrow(BadRequestError);
      
      expect(studentRepo.searchStudents).not.toHaveBeenCalled();
    });
  });

  describe('getAllStudents', () => {
    it('should get all students with pagination', async () => {
      const mockStudentsResult = {
        students: [{ studentId: mockStudentId, fullName: 'Nguyen Van A' }],
        pagination: {
          total: 1,
          page: 1,
          limit: 10,
          totalPages: 1
        }
      };

      // Mock implementation
      (studentRepo.getAllStudents as jest.Mock).mockResolvedValue(mockStudentsResult);

      // Execute
      const result = await StudentService.getAllStudents(1, 10);

      // Verify
      expect(studentRepo.getAllStudents).toHaveBeenCalledWith(1, 10);
      expect(result).toEqual(mockStudentsResult);
    });
  });

  describe('student status management', () => {
    describe('addStudentStatus', () => {
      it('should add a student status successfully', async () => {
        const statusType = 'Graduated';
        
        // Mock implementations
        (studentRepo.findStudentStatus as jest.Mock).mockResolvedValue(null);
        (studentRepo.addStudentStatus as jest.Mock).mockResolvedValue({ 
          _id: new mongoose.Types.ObjectId(),
          type: statusType 
        });

        // Execute
        const result = await StudentService.addStudentStatus(statusType);

        // Verify
        expect(studentRepo.findStudentStatus).toHaveBeenCalledWith(statusType);
        expect(studentRepo.addStudentStatus).toHaveBeenCalledWith(statusType);
        expect(result).toBeDefined();
        expect(result.type).toBe(statusType);
      });

      it('should throw BadRequestError when status already exists', async () => {
        const statusType = 'Active';
        
        // Mock status already exists
        (studentRepo.findStudentStatus as jest.Mock).mockResolvedValue({ type: statusType });

        // Execute and assert
        await expect(StudentService.addStudentStatus(statusType))
          .rejects
          .toThrow(BadRequestError);
        
        expect(studentRepo.addStudentStatus).not.toHaveBeenCalled();
      });
    });

    describe('modifyStudentStatus', () => {
      it('should modify a student status successfully', async () => {
        const statusId = new mongoose.Types.ObjectId().toString();
        const newStatusType = 'Modified Status';
        
        // Mock implementations
        (studentRepo.findStudentStatus as jest.Mock).mockResolvedValue(null);
        (studentRepo.updateStudentStatus as jest.Mock).mockResolvedValue({ 
          _id: statusId, 
          type: newStatusType 
        });

        // Execute
        const result = await StudentService.modifyStudentStatus(statusId, newStatusType);

        // Verify
        expect(studentRepo.findStudentStatus).toHaveBeenCalledWith(newStatusType);
        expect(studentRepo.updateStudentStatus).toHaveBeenCalledWith(statusId, newStatusType);
        expect(result).toBeDefined();
        expect(result.type).toBe(newStatusType);
      });

      it('should throw BadRequestError when new status type already exists', async () => {
        const statusId = new mongoose.Types.ObjectId().toString();
        const existingStatusType = 'Active';
        
        // Mock status already exists
        (studentRepo.findStudentStatus as jest.Mock).mockResolvedValue({ type: existingStatusType });

        // Execute and assert
        await expect(StudentService.modifyStudentStatus(statusId, existingStatusType))
          .rejects
          .toThrow(BadRequestError);
        
        expect(studentRepo.updateStudentStatus).not.toHaveBeenCalled();
      });

      it('should throw NotFoundError when status to modify does not exist', async () => {
        const statusId = new mongoose.Types.ObjectId().toString();
        const newStatusType = 'New Status';
        
        // Mock new status type doesn't exist
        (studentRepo.findStudentStatus as jest.Mock).mockResolvedValue(null);
        // Mock status update returns null (failed)
        (studentRepo.updateStudentStatus as jest.Mock).mockResolvedValue(null);

        // Execute and assert
        await expect(StudentService.modifyStudentStatus(statusId, newStatusType))
          .rejects
          .toThrow(NotFoundError);
      });
    });

    describe('getStudentStatus', () => {
      it('should get all student statuses', async () => {
        const mockStatuses = [
          { _id: new mongoose.Types.ObjectId(), type: 'Active' },
          { _id: new mongoose.Types.ObjectId(), type: 'Inactive' }
        ];
        
        // Mock implementation
        (studentRepo.getStudentStatus as jest.Mock).mockResolvedValue(mockStatuses);

        // Execute
        const result = await StudentService.getStudentStatus();

        // Verify
        expect(studentRepo.getStudentStatus).toHaveBeenCalled();
        expect(result).toEqual(mockStatuses);
      });
    });
  });

  describe('student status transition management', () => {
    describe('addStudentStatusTransition', () => {
      it('should add a status transition successfully', async () => {
        const fromStatusId = new mongoose.Types.ObjectId().toString();
        const toStatusId = new mongoose.Types.ObjectId().toString();
        
        // Mock implementations
        (studentRepo.findStudentStatusById as jest.Mock)
          .mockResolvedValueOnce({ _id: fromStatusId, type: 'Active' })
          .mockResolvedValueOnce({ _id: toStatusId, type: 'Graduated' });
        (studentRepo.findStudentStatusTransition as jest.Mock).mockResolvedValue(null);
        (studentRepo.addStudentStatusTransition as jest.Mock).mockResolvedValue({ 
          fromStatus: fromStatusId, 
          toStatus: toStatusId 
        });

        // Execute
        const result = await StudentService.addStudentStatusTransition(fromStatusId, toStatusId);

        // Verify
        expect(studentRepo.findStudentStatusById).toHaveBeenCalledWith(fromStatusId);
        expect(studentRepo.findStudentStatusById).toHaveBeenCalledWith(toStatusId);
        expect(studentRepo.findStudentStatusTransition).toHaveBeenCalledWith(fromStatusId, toStatusId);
        expect(studentRepo.addStudentStatusTransition).toHaveBeenCalledWith(fromStatusId, toStatusId);
        expect(result).toBeDefined();
      });

      it('should throw BadRequestError when from status does not exist', async () => {
        const fromStatusId = new mongoose.Types.ObjectId().toString();
        const toStatusId = new mongoose.Types.ObjectId().toString();
        
        // Mock from status doesn't exist
        (studentRepo.findStudentStatusById as jest.Mock).mockResolvedValueOnce(null);

        // Execute and assert
        await expect(StudentService.addStudentStatusTransition(fromStatusId, toStatusId))
          .rejects
          .toThrow(BadRequestError);
        
        expect(studentRepo.addStudentStatusTransition).not.toHaveBeenCalled();
      });

      it('should throw BadRequestError when to status does not exist', async () => {
        const fromStatusId = new mongoose.Types.ObjectId().toString();
        const toStatusId = new mongoose.Types.ObjectId().toString();
        
        // Mock from status exists but to status doesn't
        (studentRepo.findStudentStatusById as jest.Mock)
          .mockResolvedValueOnce({ _id: fromStatusId, type: 'Active' })
          .mockResolvedValueOnce(null);

        // Execute and assert
        await expect(StudentService.addStudentStatusTransition(fromStatusId, toStatusId))
          .rejects
          .toThrow(BadRequestError);
        
        expect(studentRepo.addStudentStatusTransition).not.toHaveBeenCalled();
      });

      it('should throw BadRequestError when from and to statuses are the same', async () => {
        const sameStatusId = new mongoose.Types.ObjectId().toString();
        
        // Mock both statuses exist but are the same
        (studentRepo.findStudentStatusById as jest.Mock)
          .mockResolvedValueOnce({ _id: sameStatusId, type: 'Active' })
          .mockResolvedValueOnce({ _id: sameStatusId, type: 'Active' });

        // Execute and assert
        await expect(StudentService.addStudentStatusTransition(sameStatusId, sameStatusId))
          .rejects
          .toThrow(BadRequestError);
        
        expect(studentRepo.addStudentStatusTransition).not.toHaveBeenCalled();
      });

      it('should throw BadRequestError when transition rule already exists', async () => {
        const fromStatusId = new mongoose.Types.ObjectId().toString();
        const toStatusId = new mongoose.Types.ObjectId().toString();
        
        // Mock both statuses exist
        (studentRepo.findStudentStatusById as jest.Mock)
          .mockResolvedValueOnce({ _id: fromStatusId, type: 'Active' })
          .mockResolvedValueOnce({ _id: toStatusId, type: 'Graduated' });
        // Mock transition already exists
        (studentRepo.findStudentStatusTransition as jest.Mock).mockResolvedValue({});

        // Execute and assert
        await expect(StudentService.addStudentStatusTransition(fromStatusId, toStatusId))
          .rejects
          .toThrow(BadRequestError);
        
        expect(studentRepo.addStudentStatusTransition).not.toHaveBeenCalled();
      });
    });

    describe('getStudentStatusTransition', () => {
      it('should get all status transition rules', async () => {
        const mockTransitions = [
          { 
            fromStatus: 'Active',
            fromStatusId: new mongoose.Types.ObjectId(),
            toStatus: [
              { type: 'Graduated', _id: new mongoose.Types.ObjectId() }
            ]
          }
        ];
        
        // Mock implementation
        (studentRepo.getTransitionRules as jest.Mock).mockResolvedValue(mockTransitions);

        // Execute
        const result = await StudentService.getStudentStatusTransition();

        // Verify
        expect(studentRepo.getTransitionRules).toHaveBeenCalled();
        expect(result).toEqual(mockTransitions);
      });
    });

    describe('deleteStudentStatusTransition', () => {
      it('should delete a status transition successfully', async () => {
        const fromStatusId = new mongoose.Types.ObjectId().toString();
        const toStatusId = new mongoose.Types.ObjectId().toString();
        
        // Mock implementation
        (studentRepo.deleteStudentStatusTransition as jest.Mock).mockResolvedValue({
          fromStatus: fromStatusId,
          toStatus: toStatusId
        });

        // Execute
        const result = await StudentService.deleteStudentStatusTransition(fromStatusId, toStatusId);

        // Verify
        expect(studentRepo.deleteStudentStatusTransition).toHaveBeenCalledWith(fromStatusId, toStatusId);
        expect(result).toBeDefined();
      });

      it('should throw NotFoundError when transition rule does not exist', async () => {
        const fromStatusId = new mongoose.Types.ObjectId().toString();
        const toStatusId = new mongoose.Types.ObjectId().toString();
        
        // Mock deletion returns null (failed)
        (studentRepo.deleteStudentStatusTransition as jest.Mock).mockResolvedValue(null);

        // Execute and assert
        await expect(StudentService.deleteStudentStatusTransition(fromStatusId, toStatusId))
          .rejects
          .toThrow(NotFoundError);
      });
    });
  });

  describe('getStudentByDepartment', () => {
    it('should get students by department successfully', async () => {
      const departmentId = new mongoose.Types.ObjectId().toString();
      const mockStudentsResult = {
        students: [{ studentId: mockStudentId, fullName: 'Nguyen Van A', department: departmentId }],
        pagination: {
          total: 1,
          page: 1,
          limit: 10,
          totalPages: 1
        }
      };

      // Mock implementation
      (studentRepo.getAllStudents as jest.Mock).mockResolvedValue(mockStudentsResult);

      // Execute
      const result = await StudentService.getStudentByDepartment(departmentId, 1, 10);

      // Verify
      expect(studentRepo.getAllStudents).toHaveBeenCalledWith(1, 10, { department: departmentId });
      expect(result).toEqual(mockStudentsResult);
    });
  });
  
  describe('getStudentById', () => {
    it('should get student by ID successfully', async () => {
      // Mock implementation
      (studentRepo.findStudent as jest.Mock).mockResolvedValue({
        studentId: mockStudentId,
        fullName: 'Nguyen Van A'
      });

      // Execute
      const result = await StudentService.getStudentById(mockStudentId);

      // Verify
      expect(studentRepo.findStudent).toHaveBeenCalledWith({ studentId: mockStudentId });
      expect(result).toBeDefined();
      expect(result.studentId).toBe(mockStudentId);
    });

    it('should throw NotFoundError when student does not exist', async () => {
      // Mock student doesn't exist
      (studentRepo.findStudent as jest.Mock).mockResolvedValue(null);

      // Execute and assert
      await expect(StudentService.getStudentById('nonexistent'))
        .rejects
        .toThrow(NotFoundError);
    });
  });
});
      