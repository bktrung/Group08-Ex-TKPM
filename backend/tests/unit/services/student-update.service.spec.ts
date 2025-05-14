import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import StudentService from '../../../src/services/student.service';
import * as StudentRepo from '../../../src/models/repositories/student.repo';
import * as DepartmentRepo from '../../../src/models/repositories/department.repo';
import * as ProgramRepo from '../../../src/models/repositories/program.repo';
import { BadRequestError, NotFoundError } from '../../../src/responses/error.responses';
import { Gender, IdentityDocumentType } from '../../../src/models/interfaces/student.interface';
import { UpdateStudentDto } from '../../../src/dto/student';

// Mock repositories
jest.mock('../../../src/models/repositories/student.repo');
jest.mock('../../../src/models/repositories/department.repo');
jest.mock('../../../src/models/repositories/program.repo');

describe('Student Update Service', () => {
  const mockStudentId = 'ST12345';
  const mockDepartmentId = new mongoose.Types.ObjectId().toString();
  const mockProgramId = new mongoose.Types.ObjectId().toString();
  const mockStatusId = new mongoose.Types.ObjectId().toString();
  const mockNewStatusId = new mongoose.Types.ObjectId().toString();

  // Mock existing student data
  const mockExistingStudent = {
    _id: new mongoose.Types.ObjectId(),
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

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Test 1: Successfully update a student with valid data
  it('should successfully update a student with valid data', async () => {
    // Arrange
    const updateData: UpdateStudentDto = {
      fullName: 'John Smith',
      email: 'john.smith@example.com'
    };
    
    const updatedStudent = {
      ...mockExistingStudent,
      ...updateData
    };
    
    (StudentRepo.findStudent as jest.Mock).mockResolvedValue(mockExistingStudent);
    (StudentRepo.updateStudent as jest.Mock).mockResolvedValue(updatedStudent);
    
    // Act
    const result = await StudentService.updateStudent(mockStudentId, updateData);
    
    // Assert
    expect(StudentRepo.findStudent).toHaveBeenCalledWith({ studentId: mockStudentId });
    expect(StudentRepo.updateStudent).toHaveBeenCalledWith(mockStudentId, updateData);
    expect(result).toEqual(updatedStudent);
  });

  // Test 2: Throw error when updating a non-existent student
  it('should throw an error when updating a non-existent student', async () => {
    // Arrange
    const updateData: UpdateStudentDto = {
      fullName: 'John Smith'
    };
    
    (StudentRepo.findStudent as jest.Mock).mockResolvedValue(null);
    
    // Act & Assert
    await expect(StudentService.updateStudent('NONEXISTENT', updateData))
      .rejects
      .toThrow(NotFoundError);
      
    expect(StudentRepo.findStudent).toHaveBeenCalledWith({ studentId: 'NONEXISTENT' });
    expect(StudentRepo.updateStudent).not.toHaveBeenCalled();
  });

  // Test 3: Validate status transition - Valid transition
  it('should allow valid status transitions', async () => {
    // Arrange
    const updateData: UpdateStudentDto = {
      status: mockNewStatusId
    };
    
    (StudentRepo.findStudent as jest.Mock).mockResolvedValue(mockExistingStudent);
    (StudentRepo.findStudentStatusTransition as jest.Mock).mockResolvedValue({
      fromStatus: mockStatusId,
      toStatus: mockNewStatusId
    });
    (StudentRepo.findStudentStatusById as jest.Mock).mockResolvedValue({
      _id: mockNewStatusId,
      type: 'Graduated'
    });
    (StudentRepo.updateStudent as jest.Mock).mockResolvedValue({
      ...mockExistingStudent,
      status: mockNewStatusId
    });
    
    // Act
    const result = await StudentService.updateStudent(mockStudentId, updateData);
    
    // Assert
    expect(StudentRepo.findStudentStatusTransition).toHaveBeenCalledWith(
      mockStatusId,
      mockNewStatusId
    );
    expect(result.status).toBe(mockNewStatusId);
  });

  // Test 4: Validate status transition - Invalid transition
  it('should throw an error for invalid status transitions', async () => {
    // Arrange
    const updateData: UpdateStudentDto = {
      status: mockNewStatusId
    };
    
    (StudentRepo.findStudent as jest.Mock).mockResolvedValue(mockExistingStudent);
    (StudentRepo.findStudentStatusTransition as jest.Mock).mockResolvedValue(null);
    
    // Act & Assert
    await expect(StudentService.updateStudent(mockStudentId, updateData))
      .rejects
      .toThrow(BadRequestError);
      
    expect(StudentRepo.findStudentStatusTransition).toHaveBeenCalledWith(
      mockStatusId,
      mockNewStatusId
    );
    expect(StudentRepo.updateStudent).not.toHaveBeenCalled();
  });

  // Test 5: Email uniqueness validation - Throw error when email is already used
  it('should throw an error when email is already used by another student', async () => {
    // Arrange
    const updateData: UpdateStudentDto = {
      email: 'existing@example.com'
    };
    
    (StudentRepo.findStudent as jest.Mock)
      .mockImplementation((query) => {
        if (query.studentId === mockStudentId) {
          return Promise.resolve(mockExistingStudent);
        } else if (query.email === 'existing@example.com') {
          return Promise.resolve({
            ...mockExistingStudent,
            studentId: 'OTHER123',
            _id: new mongoose.Types.ObjectId(),
            email: 'existing@example.com'
          });
        }
        return Promise.resolve(null);
      });
    
    // Act & Assert
    await expect(StudentService.updateStudent(mockStudentId, updateData))
      .rejects
      .toThrow(BadRequestError);
      
    expect(StudentRepo.updateStudent).not.toHaveBeenCalled();
  });

  // Test 6: Email uniqueness validation - Allow updating to same email (no change)
  it('should allow updating to the same email (no change)', async () => {
    // Arrange
    const updateData: UpdateStudentDto = {
      email: mockExistingStudent.email
    };
    
    (StudentRepo.findStudent as jest.Mock)
      .mockImplementation((query) => {
        if (query.studentId === mockStudentId || query.email === mockExistingStudent.email) {
          return Promise.resolve(mockExistingStudent);
        }
        return Promise.resolve(null);
      });
    
    (StudentRepo.updateStudent as jest.Mock).mockResolvedValue(mockExistingStudent);
    
    // Act
    const result = await StudentService.updateStudent(mockStudentId, updateData);
    
    // Assert
    expect(StudentRepo.updateStudent).toHaveBeenCalledWith(mockStudentId, updateData);
    expect(result).toEqual(mockExistingStudent);
  });

  // Test 7: Phone number uniqueness validation
  it('should throw an error when phone number is already used by another student', async () => {
    // Arrange
    const updateData: UpdateStudentDto = {
      phoneNumber: '9876543210'
    };
    
    (StudentRepo.findStudent as jest.Mock)
      .mockImplementation((query) => {
        if (query.studentId === mockStudentId) {
          return Promise.resolve(mockExistingStudent);
        } else if (query.phoneNumber === '9876543210') {
          return Promise.resolve({
            ...mockExistingStudent,
            studentId: 'OTHER123',
            _id: new mongoose.Types.ObjectId(),
            phoneNumber: '9876543210'
          });
        }
        return Promise.resolve(null);
      });
    
    // Act & Assert
    await expect(StudentService.updateStudent(mockStudentId, updateData))
      .rejects
      .toThrow(BadRequestError);
      
    expect(StudentRepo.updateStudent).not.toHaveBeenCalled();
  });

  // Test 8: Identity document uniqueness validation
  it('should throw an error when identity document number is already used by another student', async () => {
    // Arrange
    const updateData: UpdateStudentDto = {
      identityDocument: {
        type: IdentityDocumentType.CCCD,
        number: 'OTHER789'
      }
    };
    
    (StudentRepo.findStudent as jest.Mock)
      .mockImplementation((query) => {
        if (query.studentId === mockStudentId) {
          return Promise.resolve(mockExistingStudent);
        } else if (query['identityDocument.number'] === 'OTHER789') {
          return Promise.resolve({
            ...mockExistingStudent,
            studentId: 'OTHER123',
            _id: new mongoose.Types.ObjectId(),
            identityDocument: {
              ...mockExistingStudent.identityDocument,
              number: 'OTHER789'
            }
          });
        }
        return Promise.resolve(null);
      });
    
    // Act & Assert
    await expect(StudentService.updateStudent(mockStudentId, updateData))
      .rejects
      .toThrow(BadRequestError);
      
    expect(StudentRepo.updateStudent).not.toHaveBeenCalled();
  });

  // Test 9: Status reference validation
  it('should throw an error when referenced status does not exist', async () => {
    // Arrange
    const updateData: UpdateStudentDto = {
      status: mockNewStatusId
    };
    
    (StudentRepo.findStudent as jest.Mock).mockResolvedValue(mockExistingStudent);
    (StudentRepo.findStudentStatusTransition as jest.Mock).mockResolvedValue({
      fromStatus: mockStatusId,
      toStatus: mockNewStatusId
    });
    (StudentRepo.findStudentStatusById as jest.Mock).mockResolvedValue(null);
    
    // Act & Assert
    await expect(StudentService.updateStudent(mockStudentId, updateData))
      .rejects
      .toThrow(BadRequestError);
      
    expect(StudentRepo.findStudentStatusById).toHaveBeenCalledWith(mockNewStatusId);
    expect(StudentRepo.updateStudent).not.toHaveBeenCalled();
  });

  // Test 10: Department reference validation
  it('should throw an error when referenced department does not exist', async () => {
    // Arrange
    const newDepartmentId = new mongoose.Types.ObjectId().toString();
    const updateData: UpdateStudentDto = {
      department: newDepartmentId
    };
    
    (StudentRepo.findStudent as jest.Mock).mockResolvedValue(mockExistingStudent);
    (DepartmentRepo.findDepartmentById as jest.Mock).mockResolvedValue(null);
    
    // Act & Assert
    await expect(StudentService.updateStudent(mockStudentId, updateData))
      .rejects
      .toThrow(BadRequestError);
      
    expect(DepartmentRepo.findDepartmentById).toHaveBeenCalledWith(newDepartmentId);
    expect(StudentRepo.updateStudent).not.toHaveBeenCalled();
  });

  // Test 11: Program reference validation
  it('should throw an error when referenced program does not exist', async () => {
    // Arrange
    const newProgramId = new mongoose.Types.ObjectId().toString();
    const updateData: UpdateStudentDto = {
      program: newProgramId
    };
    
    (StudentRepo.findStudent as jest.Mock).mockResolvedValue(mockExistingStudent);
    (ProgramRepo.findProgramById as jest.Mock).mockResolvedValue(null);
    
    // Act & Assert
    await expect(StudentService.updateStudent(mockStudentId, updateData))
      .rejects
      .toThrow(BadRequestError);
      
    expect(ProgramRepo.findProgramById).toHaveBeenCalledWith(newProgramId);
    expect(StudentRepo.updateStudent).not.toHaveBeenCalled();
  });

  // Test 12: Update multiple fields successfully
  it('should update multiple fields successfully', async () => {
    // Arrange
    const updateData: UpdateStudentDto = {
      fullName: 'Jane Smith',
      gender: Gender.FEMALE,
      mailingAddress: {
        houseNumberStreet: '456 New St',
        wardCommune: 'Ward 2',
        districtCounty: 'District 2',
        provinceCity: 'City 2',
        country: 'Country 2'
      }
    };
    
    const updatedStudent = {
      ...mockExistingStudent,
      ...updateData
    };
    
    (StudentRepo.findStudent as jest.Mock).mockResolvedValue(mockExistingStudent);
    (StudentRepo.updateStudent as jest.Mock).mockResolvedValue(updatedStudent);
    
    // Act
    const result = await StudentService.updateStudent(mockStudentId, updateData);
    
    // Assert
    expect(StudentRepo.updateStudent).toHaveBeenCalledWith(mockStudentId, updateData);
    expect(result.fullName).toBe('Jane Smith');
    expect(result.gender).toBe(Gender.FEMALE);
    expect(result.mailingAddress.houseNumberStreet).toBe('456 New St');
  });

  // Test 13: Update identity document fields
  it('should update identity document fields correctly', async () => {
    // Arrange
    const updateData: UpdateStudentDto = {
      identityDocument: {
        type: IdentityDocumentType.PASSPORT,
        number: 'P1234567',
        issueDate: new Date('2020-01-01'),
        issuedBy: 'Immigration Office',
        expiryDate: new Date('2030-01-01'),
        issuedCountry: 'Vietnam'
      }
    };
    
    const updatedStudent = {
      ...mockExistingStudent,
      identityDocument: updateData.identityDocument
    };
    
    (StudentRepo.findStudent as jest.Mock).mockResolvedValue(mockExistingStudent);
    (StudentRepo.findStudent as jest.Mock)
      .mockImplementation((query) => {
        if (query.studentId === mockStudentId) {
          return Promise.resolve(mockExistingStudent);
        } else if (query['identityDocument.number'] === 'P1234567') {
          return Promise.resolve(null); // No other student has this document number
        }
        return Promise.resolve(null);
      });
    (StudentRepo.updateStudent as jest.Mock).mockResolvedValue(updatedStudent);
    
    // Act
    const result = await StudentService.updateStudent(mockStudentId, updateData);
    
    // Assert
    expect(StudentRepo.updateStudent).toHaveBeenCalledWith(mockStudentId, updateData);
    expect(result.identityDocument.type).toBe(IdentityDocumentType.PASSPORT);
    expect(result.identityDocument.number).toBe('P1234567');
  });

  // Test 14: Handle error from updateStudent repository method
  it('should handle errors from the student repository', async () => {
    // Arrange
    const updateData: UpdateStudentDto = {
      fullName: 'John Smith'
    };
    
    (StudentRepo.findStudent as jest.Mock).mockResolvedValue(mockExistingStudent);
    (StudentRepo.updateStudent as jest.Mock).mockRejectedValue(new Error('Database error'));
    
    // Act & Assert
    await expect(StudentService.updateStudent(mockStudentId, updateData))
      .rejects
      .toThrow('Database error');
  });

  // Test 15: Validate partial identity document update
  it('should correctly handle partial identity document updates', async () => {
    // Arrange
    const updateData: UpdateStudentDto = {
      identityDocument: {
        expiryDate: new Date('2035-01-01') // Only update expiry date
      }
    };
    
    // Expected data to be merged with existing document
    const expectedUpdateData = {
      identityDocument: {
        expiryDate: new Date('2035-01-01')
      }
    };
    
    const updatedStudent = {
      ...mockExistingStudent,
      identityDocument: {
        ...mockExistingStudent.identityDocument,
        expiryDate: new Date('2035-01-01')
      }
    };
    
    (StudentRepo.findStudent as jest.Mock).mockResolvedValue(mockExistingStudent);
    (StudentRepo.updateStudent as jest.Mock).mockResolvedValue(updatedStudent);
    
    // Act
    const result = await StudentService.updateStudent(mockStudentId, updateData);
    
    // Assert
    expect(StudentRepo.updateStudent).toHaveBeenCalledWith(mockStudentId, expectedUpdateData);
    expect(result.identityDocument.expiryDate).toEqual(new Date('2035-01-01'));
    // Original fields should be preserved
    expect(result.identityDocument.type).toBe(IdentityDocumentType.CCCD);
    expect(result.identityDocument.number).toBe('ID12345');
  });
});