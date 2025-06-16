# Source Code Organization

This document details the project structure and file organization patterns used in the Student Management System. Understanding this organization is crucial for effective development and maintenance.

## Project Root Structure

```
backend/
├── src/                        # Source code
├── dist/                       # Compiled JavaScript (generated)
├── docs/                       # Documentation
├── logs/                       # Application logs
├── node_modules/               # Dependencies (generated)
├── .env                        # Environment variables
├── .gitignore                  # Git ignore rules
├── jest.config.js              # Jest testing configuration
├── package.json                # Node.js dependencies and scripts
├── package-lock.json           # Dependency lock file
├── tsconfig.json               # TypeScript configuration
└── README.md                   # Project readme
```

## Source Directory Structure (`src/`)

```
src/
├── index.ts                    # Application entry point
├── configs/                    # Configuration files
│   ├── di.config.ts           # Dependency injection setup
│   ├── di.types.ts            # DI type definitions
│   └── database.config.ts     # Database configuration
├── controllers/                # HTTP request handlers
│   ├── student.controller.ts
│   ├── course.controller.ts
│   ├── department.controller.ts
│   ├── grade.controller.ts
│   ├── enrollment.controller.ts
│   ├── class.controller.ts
│   ├── semester.controller.ts
│   ├── program.controller.ts
│   ├── transcript.controller.ts
│   ├── address.controller.ts
│   ├── import.controller.ts
│   └── export.controller.ts
├── services/                   # Business logic layer
│   ├── student.service.ts
│   ├── course.service.ts
│   ├── department.service.ts
│   ├── grade.service.ts
│   ├── enrollment.service.ts
│   ├── class.service.ts
│   ├── semester.service.ts
│   ├── program.service.ts
│   ├── transcript.service.ts
│   └── address.service.ts
├── repositories/               # Data access layer
│   ├── student.repository.ts
│   ├── course.repository.ts
│   ├── department.repository.ts
│   ├── grade.repository.ts
│   ├── enrollment.repository.ts
│   ├── class.repository.ts
│   ├── semester.repository.ts
│   └── program.repository.ts
├── models/                     # Database schemas
│   ├── student.model.ts
│   ├── course.model.ts
│   ├── department.model.ts
│   ├── grade.model.ts
│   ├── enrollment.model.ts
│   ├── class.model.ts
│   ├── semester.model.ts
│   └── program.model.ts
├── interfaces/                 # TypeScript interfaces
│   ├── services/              # Service interfaces
│   │   ├── student.service.interface.ts
│   │   ├── course.service.interface.ts
│   │   └── ...
│   └── repositories/          # Repository interfaces
│       ├── student.repository.interface.ts
│       ├── course.repository.interface.ts
│       └── ...
├── routes/                     # Express route definitions
│   ├── index.ts               # Main router
│   ├── student.routes.ts
│   ├── course.routes.ts
│   ├── department.routes.ts
│   └── ...
├── middlewares/                # Express middleware
│   ├── auth.middleware.ts
│   ├── validation.middleware.ts
│   ├── error.middleware.ts
│   └── logging.middleware.ts
├── validators/                 # Request validation schemas
│   ├── student.validator.ts
│   ├── course.validator.ts
│   ├── department.validator.ts
│   └── ...
├── dto/                        # Data Transfer Objects
│   ├── student.dto.ts
│   ├── course.dto.ts
│   ├── department.dto.ts
│   └── ...
├── types/                      # TypeScript type definitions
│   ├── common.types.ts
│   ├── api.types.ts
│   └── database.types.ts
├── responses/                  # API response formatting
│   ├── success.responses.ts
│   └── error.responses.ts
├── helpers/                    # Utility functions
│   └── common.helpers.ts
├── utils/                      # Utility modules
│   └── database.utils.ts
├── locales/                    # Internationalization
│   ├── en.json
│   └── vi.json
└── dbs/                        # Database utilities
    └── connection.ts
```

## File Naming Conventions

### General Rules

1. **Lowercase with dots**: Use lowercase letters with dots to separate concerns
2. **Descriptive names**: File names should clearly indicate their purpose
3. **Consistent suffixes**: Use consistent suffixes for file types

### Naming Patterns

#### Controllers
```
{entity}.controller.ts
Examples:
- student.controller.ts
- course.controller.ts
- department.controller.ts
```

#### Services
```
{entity}.service.ts
Examples:
- student.service.ts
- course.service.ts
- department.service.ts
```

#### Repositories
```
{entity}.repository.ts
Examples:
- student.repository.ts
- course.repository.ts
- department.repository.ts
```

#### Models
```
{entity}.model.ts
Examples:
- student.model.ts
- course.model.ts
- department.model.ts
```

#### Interfaces
```
{entity}.{layer}.interface.ts
Examples:
- student.service.interface.ts
- student.repository.interface.ts
- course.service.interface.ts
```

#### Routes
```
{entity}.routes.ts
Examples:
- student.routes.ts
- course.routes.ts
- department.routes.ts
```

#### Validators
```
{entity}.validator.ts
Examples:
- student.validator.ts
- course.validator.ts
- department.validator.ts
```

#### DTOs
```
{entity}.dto.ts
Examples:
- student.dto.ts
- course.dto.ts
- department.dto.ts
```

## Layer Organization

### Controllers (`src/controllers/`)

**Purpose**: Handle HTTP requests and responses

**Structure**:
```typescript
// student.controller.ts
import { injectable, inject } from "inversify";
import { Request, Response, NextFunction } from 'express';
import { IStudentService } from '../interfaces/services/student.service.interface';
import { TYPES } from '../configs/di.types';

@injectable()
export class StudentController {
  constructor(
    @inject(TYPES.StudentService) private studentService: IStudentService
  ) {}

  // Controller methods...
}
```

**Responsibilities**:
- HTTP request/response handling
- Input validation coordination
- Response formatting
- Error handling delegation

### Services (`src/services/`)

**Purpose**: Business logic implementation

**Structure**:
```typescript
// student.service.ts
import { injectable, inject } from "inversify";
import { IStudentService } from '../interfaces/services/student.service.interface';
import { IStudentRepository } from '../interfaces/repositories/student.repository.interface';
import { TYPES } from '../configs/di.types';

@injectable()
export class StudentService implements IStudentService {
  constructor(
    @inject(TYPES.StudentRepository) private studentRepository: IStudentRepository
  ) {}

  // Business logic methods...
}
```

**Responsibilities**:
- Business rule implementation
- Data validation
- Multi-repository coordination
- Complex operations

### Repositories (`src/repositories/`)

**Purpose**: Data access abstraction

**Structure**:
```typescript
// student.repository.ts
import { injectable } from "inversify";
import { IStudentRepository } from '../interfaces/repositories/student.repository.interface';
import { StudentModel } from '../models/student.model';

@injectable()
export class StudentRepository implements IStudentRepository {
  // Data access methods...
}
```

**Responsibilities**:
- Database CRUD operations
- Query construction
- Data mapping
- Connection management

### Models (`src/models/`)

**Purpose**: Database schema definition

**Structure**:
```typescript
// student.model.ts
import { Schema, model } from 'mongoose';
import { IStudent } from '../interfaces/student.interface';

const studentSchema = new Schema<IStudent>({
  // Schema definition...
});

export const StudentModel = model<IStudent>('Student', studentSchema);
```

**Responsibilities**:
- Schema definition
- Validation rules
- Relationships
- Indexes

## Interface Organization

### Service Interfaces (`src/interfaces/services/`)

Define contracts for service layer:

```typescript
// student.service.interface.ts
export interface IStudentService {
  addStudent(data: CreateStudentDTO): Promise<Student>;
  getAllStudents(page: number, limit: number): Promise<PaginatedResult<Student>>;
  // ... other methods
}
```

### Repository Interfaces (`src/interfaces/repositories/`)

Define contracts for data access layer:

```typescript
// student.repository.interface.ts
export interface IStudentRepository {
  create(data: CreateStudentDTO): Promise<Student>;
  findById(id: string): Promise<Student | null>;
  // ... other methods
}
```

## Configuration Organization

### Dependency Injection (`src/configs/`)

- **`di.config.ts`**: Container configuration and binding setup
- **`di.types.ts`**: Symbol definitions for injection tokens
- **`database.config.ts`**: Database connection configuration

### Environment Configuration

Environment-specific settings are managed through:
- **`.env`**: Local environment variables
- **`src/configs/`**: Configuration modules that read environment variables

## Route Organization

### Main Router (`src/routes/index.ts`)

Central route aggregation:

```typescript
// index.ts
import express from 'express';
import studentRoutes from './student.routes';
import courseRoutes from './course.routes';

const router = express.Router();

router.use('/students', studentRoutes);
router.use('/courses', courseRoutes);

export default router;
```

### Entity Routes (`src/routes/{entity}.routes.ts`)

Entity-specific route definitions:

```typescript
// student.routes.ts
import express from 'express';
import { container } from '../configs/di.config';
import { TYPES } from '../configs/di.types';
import { StudentController } from '../controllers/student.controller';

const router = express.Router();
const studentController = container.get<StudentController>(TYPES.StudentController);

router.post('/', studentController.addStudent);
router.get('/', studentController.getAllStudents);

export default router;
```

## Validation Organization

### Joi Schemas (`src/validators/`)

Request validation using Joi:

```typescript
// student.validator.ts
import Joi from 'joi';

export const createStudentSchema = Joi.object({
  fullName: Joi.string().required(),
  email: Joi.string().email().required(),
  // ... validation rules
});

export const updateStudentSchema = Joi.object({
  fullName: Joi.string().optional(),
  email: Joi.string().email().optional(),
  // ... validation rules
});
```

## Response Organization

### Standardized Responses (`src/responses/`)

Consistent API response formatting:

```typescript
// success.responses.ts
export class OK {
  constructor(public data: any) {}
  send(res: Response) {
    return res.status(200).json({
      status: 'success',
      code: 200,
      ...this.data
    });
  }
}

// error.responses.ts
export class BadRequestError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'BadRequestError';
  }
}
```

## Best Practices

### 1. Single Responsibility

Each file should have a single, well-defined responsibility:

```typescript
// Good: Focused on student operations
// student.service.ts - Only student business logic

// Avoid: Mixed responsibilities
// student-and-course.service.ts - Multiple entities
```

### 2. Consistent Naming

Follow established patterns consistently:

```typescript
// Good: Follows pattern
student.controller.ts
student.service.ts
student.repository.ts

// Avoid: Inconsistent naming
StudentController.ts
studentSvc.ts
student_repo.ts
```

### 3. Proper Imports

Use relative imports for internal modules:

```typescript
// Good: Relative imports for internal modules
import { IStudentService } from '../interfaces/services/student.service.interface';
import { TYPES } from '../configs/di.types';

// Avoid: Absolute paths for internal modules
import { IStudentService } from 'src/interfaces/services/student.service.interface';
```

### 4. Barrel Exports

Use index files for clean imports:

```typescript
// src/controllers/index.ts
export { StudentController } from './student.controller';
export { CourseController } from './course.controller';

// Usage
import { StudentController, CourseController } from '../controllers';
```

## Import/Export Patterns

### Default vs Named Exports

**Use named exports for classes and interfaces**:
```typescript
// Good: Named export
export class StudentService { }

// Import
import { StudentService } from './student.service';
```

**Use default exports for single-purpose modules**:
```typescript
// Good: Default export for router
export default router;

// Import
import studentRoutes from './student.routes';
```

### Interface Exports

Always use named exports for interfaces:

```typescript
// student.service.interface.ts
export interface IStudentService {
  // interface definition
}
```

## Module Dependencies

### Dependency Direction

Follow the dependency hierarchy:

```
Controllers → Services → Repositories → Models
```

**Good**: Controller depends on Service
```typescript
// student.controller.ts
import { IStudentService } from '../interfaces/services/student.service.interface';
```

**Avoid**: Service depends on Controller
```typescript
// Don't do this
import { StudentController } from '../controllers/student.controller';
```

### Circular Dependencies

Prevent circular dependencies using:

1. **Interface-based dependencies**
2. **Deferred imports in DI configuration**
3. **Clear layer separation**

## Testing Organization

### Test File Placement

Tests are co-located with source files:

```
src/
├── services/
│   ├── student.service.ts
│   └── student.service.test.ts
├── repositories/
│   ├── student.repository.ts
│   └── student.repository.test.ts
```

### Test Naming

Follow the pattern `{module}.test.ts`:

```
student.service.test.ts
student.repository.test.ts
student.controller.test.ts
```

## Related Documentation

- [Architecture Overview](./overview.md) - System architecture context
- [Dependency Injection](./dependency-injection.md) - DI patterns and setup
- [Coding Standards](../03-development/coding-standards.md) - Code formatting and style
- [Adding New Entities](../03-development/adding-entities.md) - Step-by-step entity creation

---

*This document will be completed in the next iteration of the developer guide.* 