# Unit Testing Guidelines

*This document provides comprehensive guidelines for unit testing in the Student Management System using Jest, TypeScript, and Inversify dependency injection.*

## Table of Contents

1. [Jest Configuration Overview](#jest-configuration-overview)
2. [Testing Strategy](#testing-strategy)
3. [Mocking Dependencies with Inversify](#mocking-dependencies-with-inversify)
4. [Database Testing with MongoDB Memory Server](#database-testing-with-mongodb-memory-server)
5. [Writing Test Suites for Repositories](#writing-test-suites-for-repositories)
6. [Writing Test Suites for Services](#writing-test-suites-for-services)
7. [Writing Test Suites for Controllers](#writing-test-suites-for-controllers)
8. [Code Coverage Requirements](#code-coverage-requirements)
9. [Test Organization and Naming Conventions](#test-organization-and-naming-conventions)
10. [Practical Examples](#practical-examples)

## Jest Configuration Overview

Our Jest configuration is defined in `jest.config.js`:

```javascript
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src/', '<rootDir>/tests/'],
  testMatch: ['**/*.test.ts', '**/*.spec.ts'],
  transform: {
    '^.+\\.tsx?$': 'ts-jest',
  },
  collectCoverage: true,
  coverageThreshold: {
    global: {
      lines: 80, // Minimum 80% line coverage required
    },
  },
};
```

### Key Configuration Features:

- **TypeScript Support**: Uses `ts-jest` for TypeScript compilation
- **Test Environment**: Node.js environment for backend testing
- **Test Discovery**: Automatically finds `*.test.ts` and `*.spec.ts` files
- **Coverage Collection**: Enabled with 80% minimum threshold
- **Multiple Root Directories**: Supports both `src/` and `tests/` directories

## Testing Strategy

### Three-Layer Testing Approach

Our testing strategy follows a three-layer architecture:

1. **Repository Layer**: Database operations and data access logic
2. **Service Layer**: Business logic and validation rules
3. **Controller Layer**: API endpoints and request/response handling

### Testing Pyramid

- **Unit Tests (70%)**: Fast, isolated tests for individual components
- **Integration Tests (20%)**: Test interactions between components
- **End-to-End Tests (10%)**: Full application workflow testing

### Test Types by Layer

| Layer | Test Focus | Dependencies |
|-------|------------|--------------|
| Repository | Database operations | MongoDB Memory Server |
| Service | Business logic | Mocked repositories |
| Controller | HTTP handling | Mocked services |

## Mocking Dependencies with Inversify

### Understanding Dependency Injection Types

Our DI container uses symbols defined in `src/configs/di.types.ts`:

```typescript
export const TYPES = {
  // Repositories
  StudentRepository: Symbol.for("StudentRepository"),
  DepartmentRepository: Symbol.for("DepartmentRepository"),
  ProgramRepository: Symbol.for("ProgramRepository"),
  
  // Services
  StudentService: Symbol.for("StudentService"),
  DepartmentService: Symbol.for("DepartmentService"),
  
  // Controllers
  StudentController: Symbol.for("StudentController"),
};
```

### Creating Mock Containers

For service layer testing, create a mock container:

```typescript
import { Container } from 'inversify';
import { TYPES } from '../../src/configs/di.types';

// Create test container
const container = new Container();

// Bind mock implementations
const mockStudentRepository = {
  findStudent: jest.fn(),
  addStudent: jest.fn(),
  updateStudent: jest.fn(),
  deleteStudent: jest.fn(),
  // ... other methods
};

container.bind(TYPES.StudentRepository).toConstantValue(mockStudentRepository);
```

### Mock Best Practices

1. **Create type-safe mocks**: Use interface types for better IntelliSense
2. **Reset mocks between tests**: Use `jest.clearAllMocks()` in `beforeEach`
3. **Mock only what you need**: Don't over-mock dependencies
4. **Verify mock calls**: Assert on mock function calls and arguments

## Database Testing with MongoDB Memory Server

### Setup MongoDB Memory Server

Install the required package:

```bash
npm install --save-dev mongodb-memory-server
```

### Test Database Configuration

Create a test database utility:

```typescript
// tests/utils/test-database.ts
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';

let mongoServer: MongoMemoryServer;

export const setupTestDatabase = async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);
};

export const teardownTestDatabase = async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
  await mongoServer.stop();
};

export const clearDatabase = async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
};
```

### Database Test Setup

```typescript
import { setupTestDatabase, teardownTestDatabase, clearDatabase } from '../utils/test-database';

describe('StudentRepository', () => {
  beforeAll(async () => {
    await setupTestDatabase();
  });

  afterAll(async () => {
    await teardownTestDatabase();
  });

  beforeEach(async () => {
    await clearDatabase();
  });

  // Tests go here
});
```

## Writing Test Suites for Repositories

### Repository Test Structure

Repository tests should verify database operations:

```typescript
// tests/unit/repositories/student.repository.test.ts
import { StudentRepository } from '../../../src/repositories/student.repository';
import { setupTestDatabase, teardownTestDatabase, clearDatabase } from '../../utils/test-database';

describe('StudentRepository', () => {
  let repository: StudentRepository;

  beforeAll(async () => {
    await setupTestDatabase();
    repository = new StudentRepository();
  });

  afterAll(async () => {
    await teardownTestDatabase();
  });

  beforeEach(async () => {
    await clearDatabase();
  });

  describe('findStudent', () => {
    it('should find student by studentId', async () => {
      // Arrange
      const studentData = {
        studentId: 'STU001',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        // ... other required fields
      };
      
      await repository.addStudent(studentData);

      // Act
      const result = await repository.findStudent({ studentId: 'STU001' });

      // Assert
      expect(result).toBeTruthy();
      expect(result?.studentId).toBe('STU001');
      expect(result?.email).toBe('john.doe@example.com');
    });

    it('should return null when student not found', async () => {
      // Act
      const result = await repository.findStudent({ studentId: 'NONEXISTENT' });

      // Assert
      expect(result).toBeNull();
    });
  });
});
```

### Repository Test Categories

1. **CRUD Operations**: Create, Read, Update, Delete
2. **Query Operations**: Search, filter, pagination
3. **Validation**: Data integrity, constraints
4. **Error Handling**: Database errors, connection issues

## Writing Test Suites for Services

### Service Test Structure with Mocking

```typescript
// tests/unit/services/student.service.test.ts
import { Container } from 'inversify';
import { StudentService } from '../../../src/services/student.service';
import { TYPES } from '../../../src/configs/di.types';
import { BadRequestError, NotFoundError } from '../../../src/responses/error.responses';

describe('StudentService', () => {
  let container: Container;
  let studentService: StudentService;
  let mockStudentRepository: any;
  let mockDepartmentRepository: any;
  let mockProgramRepository: any;

  beforeEach(() => {
    container = new Container();
    
    // Create mocks
    mockStudentRepository = {
      findStudent: jest.fn(),
      addStudent: jest.fn(),
      updateStudent: jest.fn(),
      deleteStudent: jest.fn(),
      findStudentStatusById: jest.fn(),
      searchStudents: jest.fn(),
      getAllStudents: jest.fn(),
    };
    
    mockDepartmentRepository = {
      findDepartmentById: jest.fn(),
    };
    
    mockProgramRepository = {
      findProgramById: jest.fn(),
    };

    // Bind mocks to container
    container.bind(TYPES.StudentRepository).toConstantValue(mockStudentRepository);
    container.bind(TYPES.DepartmentRepository).toConstantValue(mockDepartmentRepository);
    container.bind(TYPES.ProgramRepository).toConstantValue(mockProgramRepository);
    container.bind(TYPES.StudentService).to(StudentService);

    // Get service instance
    studentService = container.get<StudentService>(TYPES.StudentService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('addStudent', () => {
    const validStudentData = {
      studentId: 'STU001',
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      phoneNumber: '+1234567890',
      identityDocument: { number: 'ID123456' },
      status: 'status-id',
      department: 'dept-id',
      program: 'prog-id',
    };

    it('should successfully add a new student', async () => {
      // Arrange
      mockStudentRepository.findStudent.mockResolvedValue(null);
      mockStudentRepository.findStudentStatusById.mockResolvedValue({ _id: 'status-id' });
      mockDepartmentRepository.findDepartmentById.mockResolvedValue({ _id: 'dept-id' });
      mockProgramRepository.findProgramById.mockResolvedValue({ _id: 'prog-id' });
      mockStudentRepository.addStudent.mockResolvedValue(validStudentData);

      // Act
      const result = await studentService.addStudent(validStudentData);

      // Assert
      expect(result).toEqual(validStudentData);
      expect(mockStudentRepository.findStudent).toHaveBeenCalledWith({
        $or: [
          { studentId: 'STU001' },
          { email: 'john.doe@example.com' },
          { phoneNumber: '+1234567890' },
          { 'identityDocument.number': 'ID123456' }
        ]
      });
      expect(mockStudentRepository.addStudent).toHaveBeenCalledWith(validStudentData);
    });

    it('should throw BadRequestError when student ID already exists', async () => {
      // Arrange
      mockStudentRepository.findStudent.mockResolvedValue({
        studentId: 'STU001',
        email: 'different@example.com'
      });

      // Act & Assert
      await expect(studentService.addStudent(validStudentData))
        .rejects.toThrow(new BadRequestError('Student ID already exists'));
    });

    it('should throw BadRequestError when email already exists', async () => {
      // Arrange
      mockStudentRepository.findStudent.mockResolvedValue({
        studentId: 'STU002',
        email: 'john.doe@example.com'
      });

      // Act & Assert
      await expect(studentService.addStudent(validStudentData))
        .rejects.toThrow(new BadRequestError('Email already used by another student'));
    });

    it('should throw BadRequestError when department does not exist', async () => {
      // Arrange
      mockStudentRepository.findStudent.mockResolvedValue(null);
      mockStudentRepository.findStudentStatusById.mockResolvedValue({ _id: 'status-id' });
      mockDepartmentRepository.findDepartmentById.mockResolvedValue(null);

      // Act & Assert
      await expect(studentService.addStudent(validStudentData))
        .rejects.toThrow(new BadRequestError('Department does not exist'));
    });
  });

  describe('getStudentById', () => {
    it('should return student when found', async () => {
      // Arrange
      const mockStudent = { studentId: 'STU001', firstName: 'John' };
      mockStudentRepository.findStudent.mockResolvedValue(mockStudent);

      // Act
      const result = await studentService.getStudentById('STU001');

      // Assert
      expect(result).toEqual(mockStudent);
      expect(mockStudentRepository.findStudent).toHaveBeenCalledWith({ studentId: 'STU001' });
    });

    it('should throw NotFoundError when student not found', async () => {
      // Arrange
      mockStudentRepository.findStudent.mockResolvedValue(null);

      // Act & Assert
      await expect(studentService.getStudentById('NONEXISTENT'))
        .rejects.toThrow(new NotFoundError('Student not found'));
    });
  });
});
```

### Service Test Categories

1. **Business Logic**: Validation rules, calculations
2. **Error Scenarios**: Invalid data, missing resources
3. **Dependency Interactions**: Repository method calls
4. **State Changes**: Data transformation, status updates

## Writing Test Suites for Controllers

### Controller Test Structure

```typescript
// tests/unit/controllers/student.controller.test.ts
import { Container } from 'inversify';
import { Request, Response, NextFunction } from 'express';
import { StudentController } from '../../../src/controllers/student.controller';
import { TYPES } from '../../../src/configs/di.types';

describe('StudentController', () => {
  let container: Container;
  let studentController: StudentController;
  let mockStudentService: any;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    container = new Container();
    
    mockStudentService = {
      addStudent: jest.fn(),
      updateStudent: jest.fn(),
      deleteStudent: jest.fn(),
      getStudentById: jest.fn(),
      getAllStudents: jest.fn(),
      searchStudents: jest.fn(),
    };

    container.bind(TYPES.StudentService).toConstantValue(mockStudentService);
    container.bind(TYPES.StudentController).to(StudentController);

    studentController = container.get<StudentController>(TYPES.StudentController);

    mockRequest = {
      body: {},
      params: {},
      query: {},
    };

    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };

    mockNext = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('addStudent', () => {
    it('should successfully add student and return CREATED response', async () => {
      // Arrange
      const studentData = { firstName: 'John', lastName: 'Doe' };
      const newStudent = { _id: '123', ...studentData };
      
      mockRequest.body = studentData;
      mockStudentService.addStudent.mockResolvedValue(newStudent);

      // Act
      await studentController.addStudent(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      // Assert
      expect(mockStudentService.addStudent).toHaveBeenCalledWith(studentData);
      // Note: Actual response assertion depends on your response implementation
    });
  });

  describe('getAllStudents', () => {
    it('should return paginated students', async () => {
      // Arrange
      const mockResult = {
        data: [{ studentId: 'STU001' }],
        pagination: { page: 1, limit: 10, total: 1 }
      };
      
      mockRequest.query = { page: '1', limit: '10' };
      mockStudentService.getAllStudents.mockResolvedValue(mockResult);

      // Act
      await studentController.getAllStudents(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      // Assert
      expect(mockStudentService.getAllStudents).toHaveBeenCalledWith(1, 10);
    });
  });

  describe('searchStudents', () => {
    it('should throw BadRequestError when query is missing', async () => {
      // Arrange
      mockRequest.query = {}; // No 'q' parameter

      // Act & Assert
      await expect(
        studentController.searchStudents(
          mockRequest as Request,
          mockResponse as Response,
          mockNext
        )
      ).rejects.toThrow('Search query is required');
    });
  });
});
```

### Controller Test Categories

1. **Request Validation**: Parameter validation, body validation
2. **Response Format**: Correct response structure, status codes
3. **Error Handling**: Invalid requests, service errors
4. **Service Integration**: Correct service method calls

## Code Coverage Requirements

### Coverage Threshold: 80%

Our Jest configuration enforces a minimum of 80% line coverage:

```javascript
coverageThreshold: {
  global: {
    lines: 80,
  },
}
```

### Coverage Reports

Generate coverage reports:

```bash
# Run tests with coverage
npm test -- --coverage

# Generate HTML coverage report
npm test -- --coverage --coverageReporters=html
```

### Coverage Best Practices

1. **Focus on Critical Paths**: Prioritize business logic coverage
2. **Test Edge Cases**: Cover error scenarios and boundary conditions
3. **Avoid Coverage Gaming**: Don't write tests just to increase coverage
4. **Review Coverage Reports**: Identify uncovered critical code

### Coverage Exclusions

Exclude files that don't need testing:

```javascript
// In jest.config.js
coveragePathIgnorePatterns: [
  '/node_modules/',
  '/dist/',
  '/tests/',
  'index.ts', // Entry files
  '.d.ts'     // Type definitions
]
```

## Test Organization and Naming Conventions

### Directory Structure

```
tests/
├── unit/
│   ├── controllers/
│   │   └── student.controller.test.ts
│   ├── services/
│   │   └── student.service.test.ts
│   └── repositories/
│       └── student.repository.test.ts
├── integration/
│   └── api/
│       └── student.api.test.ts
└── utils/
    ├── test-database.ts
    └── test-helpers.ts
```

### Naming Conventions

#### File Names
- **Unit Tests**: `{component}.test.ts` or `{component}.spec.ts`
- **Integration Tests**: `{feature}.integration.test.ts`
- **Test Utilities**: `test-{purpose}.ts`

#### Test Suites and Cases
```typescript
describe('ComponentName', () => {
  describe('methodName', () => {
    it('should do something when condition is met', () => {
      // Test implementation
    });

    it('should throw error when invalid input provided', () => {
      // Test implementation
    });
  });
});
```

#### Test Data
```typescript
// Use descriptive variable names
const validStudentData = { /* ... */ };
const invalidStudentData = { /* ... */ };
const existingStudent = { /* ... */ };
const mockStudentRepository = { /* ... */ };
```

### Test Organization Patterns

#### Arrange-Act-Assert (AAA)
```typescript
it('should calculate total grade correctly', () => {
  // Arrange
  const grades = [85, 90, 78];
  const calculator = new GradeCalculator();

  // Act
  const result = calculator.calculateAverage(grades);

  // Assert
  expect(result).toBe(84.33);
});
```

#### Given-When-Then (BDD Style)
```typescript
it('should reject student enrollment when program is full', () => {
  // Given
  const fullProgram = createFullProgram();
  const newStudent = createStudent();

  // When
  const enrollmentAttempt = () => enrollmentService.enroll(newStudent, fullProgram);

  // Then
  expect(enrollmentAttempt).toThrow('Program is full');
});
```

## Practical Examples

### Complete StudentService Test Example

This example demonstrates testing the StudentService with proper mocking:

```typescript
// tests/unit/services/student.service.test.ts
import { Container } from 'inversify';
import { StudentService } from '../../../src/services/student.service';
import { TYPES } from '../../../src/configs/di.types';
import { BadRequestError, NotFoundError } from '../../../src/responses/error.responses';
import { CreateStudentDto, UpdateStudentDto } from '../../../src/dto/student';

describe('StudentService', () => {
  let container: Container;
  let studentService: StudentService;
  let mockStudentRepository: any;
  let mockDepartmentRepository: any;
  let mockProgramRepository: any;

  beforeEach(() => {
    // Setup container and mocks
    container = new Container();
    
    mockStudentRepository = {
      findStudent: jest.fn(),
      addStudent: jest.fn(),
      updateStudent: jest.fn(),
      deleteStudent: jest.fn(),
      findStudentStatusById: jest.fn(),
      findStudentStatusTransition: jest.fn(),
      searchStudents: jest.fn(),
      getAllStudents: jest.fn(),
    };
    
    mockDepartmentRepository = {
      findDepartmentById: jest.fn(),
    };
    
    mockProgramRepository = {
      findProgramById: jest.fn(),
    };

    // Bind dependencies
    container.bind(TYPES.StudentRepository).toConstantValue(mockStudentRepository);
    container.bind(TYPES.DepartmentRepository).toConstantValue(mockDepartmentRepository);
    container.bind(TYPES.ProgramRepository).toConstantValue(mockProgramRepository);
    container.bind(TYPES.StudentService).to(StudentService);

    studentService = container.get<StudentService>(TYPES.StudentService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('addStudent', () => {
    const validStudentData: CreateStudentDto = {
      studentId: 'STU001',
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      phoneNumber: '+1234567890',
      identityDocument: {
        type: 'ID',
        number: 'ID123456'
      },
      status: 'status-id-123',
      department: 'dept-id-123',
      program: 'prog-id-123',
      dateOfBirth: new Date('1995-01-01'),
      address: {
        street: '123 Main St',
        city: 'Anytown',
        country: 'Country'
      }
    };

    beforeEach(() => {
      // Setup default successful mocks
      mockStudentRepository.findStudent.mockResolvedValue(null);
      mockStudentRepository.findStudentStatusById.mockResolvedValue({ _id: 'status-id-123' });
      mockDepartmentRepository.findDepartmentById.mockResolvedValue({ _id: 'dept-id-123' });
      mockProgramRepository.findProgramById.mockResolvedValue({ _id: 'prog-id-123' });
    });

    it('should successfully add a new student with valid data', async () => {
      // Arrange
      const expectedStudent = { _id: 'new-id', ...validStudentData };
      mockStudentRepository.addStudent.mockResolvedValue(expectedStudent);

      // Act
      const result = await studentService.addStudent(validStudentData);

      // Assert
      expect(result).toEqual(expectedStudent);
      expect(mockStudentRepository.findStudent).toHaveBeenCalledWith({
        $or: [
          { studentId: 'STU001' },
          { email: 'john.doe@example.com' },
          { phoneNumber: '+1234567890' },
          { 'identityDocument.number': 'ID123456' }
        ]
      });
      expect(mockStudentRepository.addStudent).toHaveBeenCalledWith(validStudentData);
    });

    it('should throw BadRequestError when student ID already exists', async () => {
      // Arrange
      mockStudentRepository.findStudent.mockResolvedValue({
        studentId: 'STU001',
        email: 'different@example.com',
        phoneNumber: '+0987654321',
        identityDocument: { number: 'DIFFERENT123' }
      });

      // Act & Assert
      await expect(studentService.addStudent(validStudentData))
        .rejects.toThrow(new BadRequestError('Student ID already exists'));
      
      expect(mockStudentRepository.addStudent).not.toHaveBeenCalled();
    });

    it('should throw BadRequestError when email is already used', async () => {
      // Arrange
      mockStudentRepository.findStudent.mockResolvedValue({
        studentId: 'STU002',
        email: 'john.doe@example.com',
        phoneNumber: '+0987654321',
        identityDocument: { number: 'DIFFERENT123' }
      });

      // Act & Assert
      await expect(studentService.addStudent(validStudentData))
        .rejects.toThrow(new BadRequestError('Email already used by another student'));
    });

    it('should throw BadRequestError when status does not exist', async () => {
      // Arrange
      mockStudentRepository.findStudentStatusById.mockResolvedValue(null);

      // Act & Assert
      await expect(studentService.addStudent(validStudentData))
        .rejects.toThrow(new BadRequestError('Student status does not exist'));
    });

    it('should throw BadRequestError when department does not exist', async () => {
      // Arrange
      mockDepartmentRepository.findDepartmentById.mockResolvedValue(null);

      // Act & Assert
      await expect(studentService.addStudent(validStudentData))
        .rejects.toThrow(new BadRequestError('Department does not exist'));
    });

    it('should throw BadRequestError when program does not exist', async () => {
      // Arrange
      mockProgramRepository.findProgramById.mockResolvedValue(null);

      // Act & Assert
      await expect(studentService.addStudent(validStudentData))
        .rejects.toThrow(new BadRequestError('Program does not exist'));
    });
  });

  describe('updateStudent', () => {
    const studentId = 'STU001';
    const updateData: UpdateStudentDto = {
      firstName: 'Jane',
      email: 'jane.doe@example.com',
      status: 'new-status-id'
    };

    it('should successfully update student with valid data', async () => {
      // Arrange
      const existingStudent = {
        studentId: 'STU001',
        firstName: 'John',
        email: 'john.doe@example.com',
        status: 'old-status-id'
      };
      const updatedStudent = { ...existingStudent, ...updateData };

      mockStudentRepository.findStudent
        .mockResolvedValueOnce(existingStudent) // First call for existence check
        .mockResolvedValueOnce(null); // Second call for email uniqueness check
      
      mockStudentRepository.findStudentStatusTransition.mockResolvedValue({ _id: 'transition-id' });
      mockStudentRepository.findStudentStatusById.mockResolvedValue({ _id: 'new-status-id' });
      mockStudentRepository.updateStudent.mockResolvedValue(updatedStudent);

      // Act
      const result = await studentService.updateStudent(studentId, updateData);

      // Assert
      expect(result).toEqual(updatedStudent);
      expect(mockStudentRepository.updateStudent).toHaveBeenCalledWith(studentId, updateData);
    });

    it('should throw NotFoundError when student does not exist', async () => {
      // Arrange
      mockStudentRepository.findStudent.mockResolvedValue(null);

      // Act & Assert
      await expect(studentService.updateStudent(studentId, updateData))
        .rejects.toThrow(new NotFoundError('Student not found'));
    });

    it('should throw BadRequestError when status transition is not allowed', async () => {
      // Arrange
      const existingStudent = {
        studentId: 'STU001',
        status: 'old-status-id'
      };

      mockStudentRepository.findStudent.mockResolvedValue(existingStudent);
      mockStudentRepository.findStudentStatusTransition.mockResolvedValue(null);

      // Act & Assert
      await expect(studentService.updateStudent(studentId, updateData))
        .rejects.toThrow(new BadRequestError('Cannot transition from current status to desired status'));
    });

    it('should throw BadRequestError when email is already used by another student', async () => {
      // Arrange
      const existingStudent = { studentId: 'STU001', status: 'old-status-id' };
      const anotherStudent = { studentId: 'STU002', email: 'jane.doe@example.com' };

      mockStudentRepository.findStudent
        .mockResolvedValueOnce(existingStudent)
        .mockResolvedValueOnce(anotherStudent);

      mockStudentRepository.findStudentStatusTransition.mockResolvedValue({ _id: 'transition-id' });

      // Act & Assert
      await expect(studentService.updateStudent(studentId, updateData))
        .rejects.toThrow(new BadRequestError('Email already used by another student'));
    });
  });

  describe('deleteStudent', () => {
    it('should successfully delete existing student', async () => {
      // Arrange
      const deletedStudent = { studentId: 'STU001', firstName: 'John' };
      mockStudentRepository.deleteStudent.mockResolvedValue(deletedStudent);

      // Act
      const result = await studentService.deleteStudent('STU001');

      // Assert
      expect(result).toEqual(deletedStudent);
      expect(mockStudentRepository.deleteStudent).toHaveBeenCalledWith('STU001');
    });

    it('should throw NotFoundError when student does not exist', async () => {
      // Arrange
      mockStudentRepository.deleteStudent.mockResolvedValue(null);

      // Act & Assert
      await expect(studentService.deleteStudent('NONEXISTENT'))
        .rejects.toThrow(new NotFoundError('Student not found'));
    });
  });

  describe('searchStudents', () => {
    it('should return search results with valid query', async () => {
      // Arrange
      const searchOptions = {
        query: 'John',
        page: 1,
        limit: 10,
        sort: 'ctime'
      };
      
      const expectedResult = {
        data: [{ studentId: 'STU001', firstName: 'John' }],
        pagination: { page: 1, limit: 10, total: 1 }
      };

      mockStudentRepository.searchStudents.mockResolvedValue(expectedResult);

      // Act
      const result = await studentService.searchStudents(searchOptions);

      // Assert
      expect(result).toEqual(expectedResult);
      expect(mockStudentRepository.searchStudents).toHaveBeenCalledWith({
        filter: {},
        query: 'John',
        page: 1,
        limit: 10,
        sort: 'ctime'
      });
    });

    it('should throw BadRequestError when query is empty', async () => {
      // Arrange
      const searchOptions = {
        query: '',
        page: 1,
        limit: 10
      };

      // Act & Assert
      await expect(studentService.searchStudents(searchOptions))
        .rejects.toThrow(new BadRequestError('Search query cannot be empty'));
    });

    it('should use default values for optional parameters', async () => {
      // Arrange
      const searchOptions = {
        query: 'John'
      };

      const expectedResult = {
        data: [],
        pagination: { page: 1, limit: 10, total: 0 }
      };

      mockStudentRepository.searchStudents.mockResolvedValue(expectedResult);

      // Act
      await studentService.searchStudents(searchOptions);

      // Assert
      expect(mockStudentRepository.searchStudents).toHaveBeenCalledWith({
        filter: {},
        query: 'John',
        page: 1,
        limit: 10,
        sort: 'ctime'
      });
    });
  });

  describe('getStudentById', () => {
    it('should return student when found', async () => {
      // Arrange
      const mockStudent = {
        studentId: 'STU001',
        firstName: 'John',
        lastName: 'Doe'
      };
      
      mockStudentRepository.findStudent.mockResolvedValue(mockStudent);

      // Act
      const result = await studentService.getStudentById('STU001');

      // Assert
      expect(result).toEqual(mockStudent);
      expect(mockStudentRepository.findStudent).toHaveBeenCalledWith({ studentId: 'STU001' });
    });

    it('should throw NotFoundError when student not found', async () => {
      // Arrange
      mockStudentRepository.findStudent.mockResolvedValue(null);

      // Act & Assert
      await expect(studentService.getStudentById('NONEXISTENT'))
        .rejects.toThrow(new NotFoundError('Student not found'));
    });
  });
});
```

This comprehensive example demonstrates:

1. **Proper DI Container Setup**: Using Inversify container for dependency injection
2. **Complete Mocking**: All dependencies are properly mocked
3. **Test Organization**: Logical grouping by method with descriptive test names
4. **Edge Case Coverage**: Testing both success and error scenarios
5. **Mock Verification**: Asserting on mock calls and arguments
6. **Error Testing**: Verifying specific error types and messages
7. **Data Setup**: Using realistic test data structures

## Running Tests

### Development Commands

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run specific test file
npm test -- student.service.test.ts

# Run tests matching pattern
npm test -- --testNamePattern="addStudent"
```

### CI/CD Integration

Ensure tests run in your continuous integration pipeline:

```yaml
# Example GitHub Actions workflow
- name: Run Tests
  run: npm test -- --coverage --watchAll=false

- name: Check Coverage
  run: npm run test:coverage
```

---

*This document provides comprehensive guidelines for unit testing in the Student Management System. Follow these patterns and practices to maintain high code quality and test coverage.* 