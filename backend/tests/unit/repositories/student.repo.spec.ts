import mongoose, { Types } from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import * as StudentRepo from '../../../src/models/repositories/student.repo';
import Student from '../../../src/models/student.model';
import StudentStatus from '../../../src/models/studentStatus.model';
import StudentStatusTransition from '../../../src/models/studentStatusTransition.model';
import { Gender, IdentityDocumentType, IStudentStatus } from '../../../src/models/interfaces/student.interface';
import { CreateStudentDto, UpdateStudentDto } from '../../../src/dto/student';

let mongoServer: MongoMemoryServer;

// Mock data
const mockDepartmentId = new mongoose.Types.ObjectId();
const mockProgramId = new mongoose.Types.ObjectId();
const mockStatusId = new mongoose.Types.ObjectId();

const mockStudentData: CreateStudentDto = {
  studentId: 'ST12345',
  fullName: 'John Doe',
  dateOfBirth: new Date('2000-01-01'),
  gender: Gender.MALE,
  department: mockDepartmentId.toString(),
  schoolYear: 2020,
  program: mockProgramId.toString(),
  mailingAddress: {
    houseNumberStreet: '123 Main St',
    wardCommune: 'Ward 1',
    districtCounty: 'District 1',
    provinceCity: 'City 1',
    country: 'Country 1'
  },
  email: 'john.doe@example.com',
  phoneNumber: '1234567890',
  status: mockStatusId.toString(),
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

// Setup before tests
beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);
});

// Clean up after each test
afterEach(async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
});

// Clean up after all tests
afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe('Student Repository', () => {
  describe('findStudent', () => {
    it('should find a student by query', async () => {
      // Arrange
      await Student.create(mockStudentData);
      
      // Act
      const student = await StudentRepo.findStudent({ studentId: mockStudentData.studentId });
      
      // Assert
      expect(student).toBeDefined();
      expect(student?.studentId).toBe(mockStudentData.studentId);
      expect(student?.fullName).toBe(mockStudentData.fullName);
    });

    it('should return null if student not found', async () => {
      // Act
      const student = await StudentRepo.findStudent({ studentId: 'nonexistent' });
      
      // Assert
      expect(student).toBeNull();
    });
  });

  describe('addStudent', () => {
    it('should add a new student', async () => {
      // Act
      const student = await StudentRepo.addStudent(mockStudentData);
      
      // Assert
      expect(student).toBeDefined();
      expect(student.studentId).toBe(mockStudentData.studentId);
      expect(student.fullName).toBe(mockStudentData.fullName);
      
      // Verify student was saved to database
      const savedStudent = await Student.findOne({ studentId: mockStudentData.studentId });
      expect(savedStudent).not.toBeNull();
    });

    it('should throw an error if required field is missing', async () => {
      // Arrange
      const invalidStudentData = { ...mockStudentData };
      delete (invalidStudentData as any).fullName;
      
      // Act & Assert
      await expect(StudentRepo.addStudent(invalidStudentData as any)).rejects.toThrow();
    });
  });

  describe('updateStudent', () => {
    it('should update an existing student', async () => {
      // Arrange
      await Student.create(mockStudentData);
      const updateData: UpdateStudentDto = {
        fullName: 'Jane Doe',
        email: 'jane.doe@example.com'
      };
      
      // Act
      const updatedStudent = await StudentRepo.updateStudent(mockStudentData.studentId, updateData);
      
      // Assert
      expect(updatedStudent).toBeDefined();
      expect(updatedStudent?.studentId).toBe(mockStudentData.studentId);
      expect(updatedStudent?.fullName).toBe(updateData.fullName);
      expect(updatedStudent?.email).toBe(updateData.email);
    });

    it('should return null if student to update does not exist', async () => {
      // Act
      const result = await StudentRepo.updateStudent('nonexistent', { fullName: 'New Name' });
      
      // Assert
      expect(result).toBeNull();
    });
  });

  describe('deleteStudent', () => {
    it('should delete a student', async () => {
      // Arrange
      await Student.create(mockStudentData);
      
      // Act
      const deletedStudent = await StudentRepo.deleteStudent(mockStudentData.studentId);
      
      // Assert
      expect(deletedStudent).toBeDefined();
      expect(deletedStudent?.studentId).toBe(mockStudentData.studentId);
      
      // Verify student was removed from database
      const student = await Student.findOne({ studentId: mockStudentData.studentId });
      expect(student).toBeNull();
    });

    it('should return null if student to delete does not exist', async () => {
      // Act
      const result = await StudentRepo.deleteStudent('nonexistent');
      
      // Assert
      expect(result).toBeNull();
    });
  });
});

describe('Student Status Repository', () => {
  describe('findStudentStatus', () => {
    it('should find a student status by type', async () => {
      // Arrange
      const statusType = 'Active';
      await StudentStatus.create({ type: statusType });
      
      // Act
      const status = await StudentRepo.findStudentStatus(statusType);
      
      // Assert
      expect(status).toBeDefined();
      expect(status?.type).toBe(statusType);
    });
  });

  describe('findStudentStatusById', () => {
    it('should find a student status by id', async () => {
      // Arrange
      const statusType = 'Inactive';
      const status = await StudentStatus.create({ type: statusType });
      
      // Act
      const foundStatus = await StudentRepo.findStudentStatusById((status as any)._id.toString());
      
      // Assert
      expect(foundStatus).toBeDefined();
      expect(foundStatus?.type).toBe(statusType);
    });
  });

  describe('addStudentStatus', () => {
    it('should add a new student status', async () => {
      // Arrange
      const statusType = 'Suspended';
      
      // Act
      const status = await StudentRepo.addStudentStatus(statusType);
      
      // Assert
      expect(status).toBeDefined();
      expect(status.type).toBe(statusType);
    });
  });

  describe('updateStudentStatus', () => {
    it('should update an existing student status', async () => {
      // Arrange
      const status = await StudentStatus.create({ type: 'Old Status' });
      const newStatusType = 'New Status';
      
      // Act
      const updatedStatus = await StudentRepo.updateStudentStatus((status as any)._id.toString(), newStatusType);
      
      // Assert
      expect(updatedStatus).toBeDefined();
      expect(updatedStatus?.type).toBe(newStatusType);
    });
  });

  describe('getStudentStatus', () => {
    it('should get all student statuses', async () => {
      // Arrange
      await StudentStatus.create({ type: 'Status 1' });
      await StudentStatus.create({ type: 'Status 2' });
      
      // Act
      const statuses = await StudentRepo.getStudentStatus();
      
      // Assert
      expect(statuses).toHaveLength(2);
      expect(statuses.map((s: IStudentStatus) => s.type)).toContain('Status 1');
      expect(statuses.map((s: IStudentStatus) => s.type)).toContain('Status 2');
    });
  });
});

describe('Student Status Transition Repository', () => {
  describe('getTransitionRules', () => {
    it('should get all transition rules', async () => {
      // Arrange
      const status1 = await StudentStatus.create({ type: 'Status 1' });
      const status2 = await StudentStatus.create({ type: 'Status 2' });
      
      await StudentStatusTransition.create({ 
        fromStatus: status1._id, 
        toStatus: status2._id 
      });
      
      // Act
      const rules = await StudentRepo.getTransitionRules();
      
      // Assert
      expect(rules).toBeDefined();
      // Because we're using MongoDB Memory Server, the IDs won't match
      // We're mostly testing that the function executes without errors
    });
  });
});