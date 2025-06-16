# Coding Standards

This document defines the coding standards and conventions used in the Student Management System. Following these standards ensures code consistency, maintainability, and team collaboration.

## TypeScript Coding Conventions

### 1. General TypeScript Rules

#### Strict Mode Configuration
Always use strict TypeScript settings as defined in `tsconfig.json`:

```json
{
  "compilerOptions": {
    "strict": true,
    "target": "es2016",
    "module": "commonjs",
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true,
    "esModuleInterop": true,
    "forceConsistentCasingInFileNames": true
  }
}
```

#### Type Annotations
- **Explicit return types** for public methods and functions
- **Interface-based typing** for objects and parameters
- **Avoid `any` type** - use specific types or generics

```typescript
// Good: Explicit return type and parameter typing
async createStudent(studentData: CreateStudentDTO): Promise<Student> {
  return await this.studentRepository.create(studentData);
}

// Avoid: Implicit typing and any
async createStudent(studentData: any) {
  return await this.studentRepository.create(studentData);
}
```

### 2. Class and Interface Conventions

#### Class Naming
- **PascalCase** for class names
- **Descriptive and specific** names
- **Consistent suffixes** by layer

```typescript
// Good: Clear naming with appropriate suffix
export class StudentController { }
export class StudentService { }
export class StudentRepository { }

// Avoid: Generic or unclear naming
export class Student { }  // Should be StudentModel
export class Logic { }    // Too generic
```

#### Interface Naming
- **PascalCase** with `I` prefix for interfaces
- **Descriptive contracts**

```typescript
// Good: Clear interface contracts
export interface IStudentService {
  createStudent(data: CreateStudentDTO): Promise<Student>;
  getStudentById(id: string): Promise<Student | null>;
}

export interface IStudentRepository {
  create(data: CreateStudentDTO): Promise<Student>;
  findById(id: string): Promise<Student | null>;
}

// Avoid: Generic interfaces
export interface IService { }
export interface IData { }
```

#### Property and Method Naming
- **camelCase** for properties and methods
- **Descriptive names** that indicate purpose

```typescript
// Good: Clear method and property names
export class StudentController {
  private readonly studentService: IStudentService;
  
  async getAllStudents(req: Request, res: Response): Promise<void> {
    const { page = "1", limit = "10" } = req.query;
    // Implementation...
  }
}

// Avoid: Unclear naming
export class StudentController {
  private svc: any;
  
  async get(req: any, res: any) {
    // Implementation...
  }
}
```

### 3. Dependency Injection Decorators

#### Injectable Classes
All classes participating in DI must use the `@injectable()` decorator:

```typescript
import { injectable, inject } from "inversify";
import { TYPES } from '../configs/di.types';

@injectable()
export class StudentService implements IStudentService {
  constructor(
    @inject(TYPES.StudentRepository) private readonly studentRepository: IStudentRepository,
    @inject(TYPES.DepartmentRepository) private readonly departmentRepository: IDepartmentRepository
  ) {}
}
```

#### Constructor Injection Pattern
- Use **readonly** for injected dependencies
- **Interface-based injection**
- **Clear parameter naming**

```typescript
// Good: Readonly, interface-based injection
constructor(
  @inject(TYPES.StudentRepository) private readonly studentRepository: IStudentRepository
) {}

// Avoid: Mutable dependencies
constructor(
  @inject(TYPES.StudentRepository) private studentRepository: any
) {}
```

## File Naming Conventions

### 1. General Rules

- **kebab-case** for all file names
- **Descriptive names** indicating purpose
- **Consistent suffixes** by file type

### 2. Layer-Specific Naming

#### Controllers
```
{entity}.controller.ts
Examples:
- student.controller.ts
- department.controller.ts
- enrollment.controller.ts
```

#### Services
```
{entity}.service.ts
Examples:
- student.service.ts
- department.service.ts
- enrollment.service.ts
```

#### Repositories
```
{entity}.repository.ts
Examples:
- student.repository.ts
- department.repository.ts
- enrollment.repository.ts
```

#### Models
```
{entity}.model.ts
Examples:
- student.model.ts
- department.model.ts
- enrollment.model.ts
```

#### Interfaces
```
{entity}.{layer}.interface.ts
Examples:
- student.service.interface.ts
- student.repository.interface.ts
- department.service.interface.ts
```

#### Validators
```
{entity}.validator.ts
Examples:
- student.validator.ts
- department.validator.ts
- enrollment.validator.ts
```

#### DTOs
```
{entity}.dto.ts
Examples:
- student.dto.ts
- department.dto.ts
- enrollment.dto.ts
```

#### Tests
```
{entity}.{layer}.test.ts
Examples:
- student.service.test.ts
- student.repository.test.ts
- student.controller.test.ts
```

### 3. Configuration Files

- **Configuration**: `{purpose}.config.ts` (e.g., `di.config.ts`, `database.config.ts`)
- **Types**: `{purpose}.types.ts` (e.g., `di.types.ts`, `common.types.ts`)
- **Routes**: `{entity}.routes.ts` or `index.ts` for main router

## Import/Export Patterns

### 1. Import Organization

Order imports in the following sequence:

1. **Node.js built-in modules**
2. **Third-party libraries**
3. **Internal interfaces and types**
4. **Internal modules** (relative imports)

```typescript
// Good: Organized imports
import { Request, Response, NextFunction } from 'express';
import { injectable, inject } from 'inversify';
import Joi from 'joi';

import { IStudentService } from '../interfaces/services/student.service.interface';
import { CreateStudentDTO } from '../dto/student.dto';
import { TYPES } from '../configs/di.types';
import { OK, CREATED } from '../responses/success.responses';
import { BadRequestError } from '../responses/error.responses';

// Avoid: Mixed import order
import { TYPES } from '../configs/di.types';
import { Request, Response } from 'express';
import { IStudentService } from '../interfaces/services/student.service.interface';
import { injectable } from 'inversify';
```

### 2. Export Patterns

#### Named Exports for Classes and Interfaces
```typescript
// Good: Named exports
export class StudentController { }
export interface IStudentService { }
export { StudentModel } from './student.model';

// Import
import { StudentController, IStudentService } from './student.controller';
```

#### Default Exports for Single-Purpose Modules
```typescript
// Good: Default export for routers
const router = express.Router();
// ... route definitions
export default router;

// Import
import studentRoutes from './student.routes';
```

### 3. Relative Import Rules

- Use **relative imports** for internal modules
- **Consistent path patterns**

```typescript
// Good: Relative imports for internal modules
import { IStudentService } from '../interfaces/services/student.service.interface';
import { TYPES } from '../configs/di.types';
import { StudentModel } from '../models/student.model';

// Avoid: Absolute paths for internal modules
import { IStudentService } from 'src/interfaces/services/student.service.interface';
```

## Error Handling Patterns

### 1. Custom Error Classes

Use standardized error classes that extend `ErrorResponse`:

```typescript
// Standard error class usage
import { BadRequestError, NotFoundError, ConflictRequestError } from '../responses/error.responses';

// In service methods
if (!department) {
  throw new NotFoundError('Department not found');
}

if (existingStudent) {
  throw new ConflictRequestError('Student with this ID already exists');
}

if (!validationResult.isValid) {
  throw new BadRequestError('Invalid student data provided');
}
```

### 2. Error Response Structure

All error responses follow this structure:

```typescript
{
  "status": "error",
  "code": 400,
  "message": "Descriptive error message",
  "stack": "Stack trace (development only)"
}
```

### 3. Async Error Handling

- Always use **try-catch** for async operations
- **Propagate errors** to middleware
- **Log errors** appropriately

```typescript
// Good: Proper async error handling
async createStudent(studentData: CreateStudentDTO): Promise<Student> {
  try {
    // Validate department exists
    const department = await this.departmentRepository.findById(studentData.department);
    if (!department) {
      throw new NotFoundError('Department not found');
    }

    return await this.studentRepository.create(studentData);
  } catch (error) {
    // Log error for debugging
    console.error('Error creating student:', error);
    throw error; // Re-throw to be handled by middleware
  }
}

// Avoid: Silent error handling
async createStudent(studentData: any) {
  try {
    return await this.studentRepository.create(studentData);
  } catch (error) {
    return null; // Silent failure
  }
}
```

## API Response Format Standards

### 1. Success Response Structure

All successful API responses follow this format:

```typescript
{
  "status": "success",
  "code": 200,
  "message": "Operation completed successfully",
  "metadata": {
    // Response data
  }
}
```

### 2. Standard Response Classes

Use consistent response classes:

```typescript
import { OK, CREATED, ACCEPTED, NO_CONTENT } from '../responses/success.responses';

// GET requests
return new OK({
  message: 'Students retrieved successfully',
  metadata: { students, pagination }
}).send(res);

// POST requests
return new CREATED({
  message: 'Student created successfully',
  metadata: { newStudent }
}).send(res);

// PUT requests
return new OK({
  message: 'Student updated successfully',
  metadata: { updatedStudent }
}).send(res);

// DELETE requests
return new OK({
  message: 'Student deleted successfully',
  metadata: { deletedStudent }
}).send(res);
```

### 3. Pagination Response Format

For paginated results, include pagination metadata:

```typescript
return new OK({
  message: 'Students retrieved successfully',
  metadata: {
    students: studentList,
    pagination: {
      page: 1,
      limit: 10,
      total: 50,
      totalPages: 5
    }
  }
}).send(res);
```

### 4. Response Message Standards

- **Descriptive messages** explaining the operation
- **Consistent terminology**
- **Past tense** for completed operations

```typescript
// Good: Clear, consistent messages
'Student created successfully'
'Students retrieved successfully'
'Student updated successfully'
'Student deleted successfully'
'Department not found'

// Avoid: Generic or unclear messages
'Success'
'Done'
'Error occurred'
'Failed'
```

## Comment and Documentation Standards

### 1. JSDoc Comments

Use JSDoc for public methods and complex functions:

```typescript
/**
 * Creates a new student with the provided data
 * @param studentData - Student information for creation
 * @returns Promise resolving to the created student
 * @throws {BadRequestError} When student data is invalid
 * @throws {ConflictRequestError} When student ID already exists
 * @throws {NotFoundError} When referenced department doesn't exist
 */
async createStudent(studentData: CreateStudentDTO): Promise<Student> {
  // Implementation...
}
```

### 2. Inline Comments

- **Explain complex business logic**
- **Clarify non-obvious operations**
- **Document assumptions**

```typescript
// Good: Explains business logic
// Students can only be enrolled in their department's programs
if (student.department.toString() !== program.department.toString()) {
  throw new BadRequestError('Student can only enroll in programs from their department');
}

// Check if enrollment period is still open
const currentDate = new Date();
if (currentDate > semester.enrollmentDeadline) {
  throw new BadRequestError('Enrollment period has ended for this semester');
}

// Avoid: Obvious comments
// Create a new student
const student = new StudentModel(studentData);
```

### 3. TODO Comments

Format TODO comments consistently:

```typescript
// TODO: Add input validation for email format
// TODO: Implement caching for frequently accessed departments
// FIXME: Handle edge case when semester has no classes
// HACK: Temporary workaround for MongoDB connection issue
```

### 4. Interface Documentation

Document interfaces with clear descriptions:

```typescript
/**
 * Service interface for student management operations
 * Handles all business logic related to student entities
 */
export interface IStudentService {
  /**
   * Creates a new student record
   * @param studentData Student information
   * @returns Created student entity
   */
  createStudent(studentData: CreateStudentDTO): Promise<Student>;
  
  /**
   * Retrieves a student by their unique identifier
   * @param id Student's MongoDB ObjectId
   * @returns Student entity or null if not found
   */
  getStudentById(id: string): Promise<Student | null>;
}
```

## Code Formatting Standards

### 1. Prettier Configuration

Use these Prettier settings (create `.prettierrc`):

```json
{
  "semi": true,
  "trailingComma": "all",
  "singleQuote": true,
  "printWidth": 100,
  "tabWidth": 2,
  "useTabs": false,
  "quoteProps": "as-needed",
  "bracketSpacing": true,
  "arrowParens": "avoid"
}
```

### 2. ESLint Configuration

Recommended ESLint setup (create `.eslintrc.js`):

```javascript
module.exports = {
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: 'tsconfig.json',
    sourceType: 'module',
  },
  plugins: ['@typescript-eslint/eslint-plugin'],
  extends: [
    '@typescript-eslint/recommended',
    'prettier',
  ],
  root: true,
  env: {
    node: true,
    jest: true,
  },
  rules: {
    '@typescript-eslint/interface-name-prefix': 'off',
    '@typescript-eslint/explicit-function-return-type': 'warn',
    '@typescript-eslint/explicit-module-boundary-types': 'warn',
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/no-unused-vars': 'error',
    '@typescript-eslint/prefer-readonly': 'warn',
  },
};
```

### 3. Indentation and Spacing

- **2 spaces** for indentation (no tabs)
- **Consistent spacing** around operators
- **Line length** maximum 100 characters

```typescript
// Good: Consistent spacing and indentation
export class StudentService implements IStudentService {
  constructor(
    @inject(TYPES.StudentRepository) private readonly studentRepository: IStudentRepository,
    @inject(TYPES.DepartmentRepository) private readonly departmentRepository: IDepartmentRepository
  ) {}

  async createStudent(studentData: CreateStudentDTO): Promise<Student> {
    const existingStudent = await this.studentRepository.findByStudentId(studentData.studentId);
    
    if (existingStudent) {
      throw new ConflictRequestError('Student with this ID already exists');
    }
    
    return await this.studentRepository.create(studentData);
  }
}
```

## Git Commit Message Conventions

### 1. Commit Message Format

Use the conventional commit format:

```
<type>(<scope>): <subject>

<body>

<footer>
```

### 2. Commit Types

- **feat**: New feature
- **fix**: Bug fix
- **docs**: Documentation changes
- **style**: Code style changes (formatting, etc.)
- **refactor**: Code refactoring
- **test**: Adding or updating tests
- **chore**: Maintenance tasks

### 3. Scope Examples

- **student**: Student-related changes
- **course**: Course-related changes
- **enrollment**: Enrollment-related changes
- **api**: API-related changes
- **db**: Database-related changes
- **config**: Configuration changes

### 4. Commit Message Examples

```bash
# Good commit messages
feat(student): add student enrollment validation
fix(api): resolve pagination issue in student search
docs(readme): update installation instructions
refactor(service): extract common validation logic
test(student): add unit tests for student service
chore(deps): update mongoose to latest version

# Subject line examples
feat(student): implement student status transition system
fix(enrollment): handle duplicate enrollment attempts
docs(api): add Swagger documentation for grade endpoints
style(format): apply prettier formatting to all files
refactor(di): simplify dependency injection configuration
test(integration): add end-to-end tests for student API
```

### 5. Commit Message Body

Include detailed information when necessary:

```bash
feat(student): implement student search functionality

- Add text search across student names and IDs
- Include department filtering in search results
- Implement pagination for search results
- Add sorting options by name, ID, and creation date

Resolves: #123
Breaking change: Updates student API response format
```

## Code Quality Guidelines

### 1. Function and Method Length

- **Maximum 50 lines** per method
- **Single responsibility** principle
- **Extract complex logic** into private methods

```typescript
// Good: Short, focused method
async createStudent(studentData: CreateStudentDTO): Promise<Student> {
  await this.validateStudentData(studentData);
  await this.checkDepartmentExists(studentData.department);
  await this.checkStudentIdUnique(studentData.studentId);
  
  return await this.studentRepository.create(studentData);
}

private async validateStudentData(studentData: CreateStudentDTO): Promise<void> {
  // Validation logic...
}

private async checkDepartmentExists(departmentId: string): Promise<void> {
  // Department validation logic...
}
```

### 2. Complexity Guidelines

- **Cyclomatic complexity** maximum 10
- **Nested if statements** maximum 3 levels
- **Use early returns** to reduce nesting

```typescript
// Good: Early returns reduce nesting
async enrollStudent(studentId: string, classId: string): Promise<Enrollment> {
  const student = await this.studentRepository.findById(studentId);
  if (!student) {
    throw new NotFoundError('Student not found');
  }

  const classEntity = await this.classRepository.findById(classId);
  if (!classEntity) {
    throw new NotFoundError('Class not found');
  }

  if (classEntity.currentEnrollment >= classEntity.maxCapacity) {
    throw new BadRequestError('Class is at maximum capacity');
  }

  return await this.enrollmentRepository.create({ student: studentId, class: classId });
}
```

### 3. Variable Naming

- **Descriptive names** over short names
- **Avoid abbreviations** unless commonly understood
- **Boolean variables** should be questions (is, has, can, should)

```typescript
// Good: Descriptive naming
const isEnrollmentPeriodOpen = currentDate <= semester.enrollmentDeadline;
const hasPrerequisites = course.prerequisites.length > 0;
const canEnrollInClass = student.credits >= course.creditRequirement;

// Avoid: Unclear abbreviations
const isEPO = currentDate <= semester.enrollmentDeadline;
const hasPrereqs = course.prerequisites.length > 0;
const canEnroll = student.credits >= course.creditRequirement;
```

## Related Documentation

- [Source Code Organization](../02-architecture/source-organization.md) - File structure and organization
- [Dependency Injection](../02-architecture/dependency-injection.md) - DI patterns and usage
- [Adding New Entities](./adding-entities.md) - Step-by-step development guide
- [Data Validation](./validation.md) - Request validation patterns
- [Unit Testing](../05-testing/unit-testing.md) - Testing standards and practices 