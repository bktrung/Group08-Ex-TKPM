import mongoose, { Types } from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import * as StudentRepo from '../../../src/models/repositories/student.repo';
import StudentStatus from '../../../src/models/studentStatus.model';
import StudentStatusTransition from '../../../src/models/studentStatusTransition.model';
import Student from '../../../src/models/student.model';
import { Gender, IdentityDocumentType } from '../../../src/models/interfaces/student.interface';
import { IStudentStatus } from '../../../src/models/interfaces/student.interface';
import StudentService from '../../../src/services/student.service';
import { BadRequestError, NotFoundError } from '../../../src/responses/error.responses';

// Mock the dependencies that the service would use but we don't want to test
jest.mock('../../../src/models/repositories/department.repo', () => ({
  findDepartmentById: jest.fn().mockResolvedValue({ _id: 'department-id', name: 'Test Department' }),
}));

jest.mock('../../../src/models/repositories/program.repo', () => ({
  findProgramById: jest.fn().mockResolvedValue({ _id: 'program-id', name: 'Test Program' }),
}));

let mongoServer: MongoMemoryServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);
});

afterEach(async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe('Student Status Tests', () => {
  /**
   * Test 1: Creating a new student status
   * 
   * This test verifies that a new student status can be created successfully
   * and that the data is stored correctly in the database.
   */
  test('should create a new student status', async () => {
    // Arrange
    const statusType = 'Active';
    
    // Act
    const newStatus = await StudentRepo.addStudentStatus(statusType);
    
    // Assert
    expect(newStatus).toBeDefined();
    expect(newStatus.type).toBe(statusType);
    
    // Verify in database
    const storedStatus = await StudentStatus.findById(newStatus._id);
    expect(storedStatus).not.toBeNull();
    expect(storedStatus?.type).toBe(statusType);
  });

  /**
   * Test 2: Preventing duplicate student status types
   * 
   * This test verifies that the service layer prevents the creation
   * of duplicate student status types, which would violate uniqueness
   * constraints.
   */
  test('should prevent duplicate student status types', async () => {
    // Arrange
    const statusType = 'Enrolled';
    await StudentStatus.create({ type: statusType });
    
    // Act & Assert
    await expect(StudentService.addStudentStatus(statusType))
      .rejects
      .toThrow(BadRequestError);
  });

  /**
   * Test 4: Status transition validation in student updates
   * 
   * This test verifies that the system enforces status transition rules
   * when updating a student's status.
   */
  test('should validate status transitions when updating a student', async () => {
    // Arrange
    const activeStatus = await StudentStatus.create({ type: 'Active' });
    const graduatedStatus = await StudentStatus.create({ type: 'Graduated' });
    const suspendedStatus = await StudentStatus.create({ type: 'Suspended' });
    
    // Create a valid transition from Active to Graduated
    await StudentStatusTransition.create({
      fromStatus: activeStatus._id,
      toStatus: graduatedStatus._id
    });
    
    // Create a mock student with active status
    const mockDepartmentId = new mongoose.Types.ObjectId();
    const mockProgramId = new mongoose.Types.ObjectId();
    
    const student = await Student.create({
      studentId: 'ST12345',
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
      status: activeStatus._id,
      identityDocument: {
        type: IdentityDocumentType.CCCD,
        number: 'ID12345',
        issueDate: new Date('2019-01-01'),
        issuedBy: 'Authority 1',
        expiryDate: new Date('2029-01-01'),
        hasChip: true
      },
      nationality: 'Vietnam'
    });    
    });
});