# Dependency Injection

The Student Management System uses **Inversify** as its dependency injection (DI) container to manage dependencies between layers and enable loose coupling, easier testing, and better maintainability.

## Overview

Our DI implementation follows these principles:
- **Interface-based injection**: Dependencies are injected via interfaces, not concrete implementations
- **Symbol-based tokens**: Using symbols to identify injection types
- **Lazy loading**: Avoiding circular dependencies through deferred imports
- **Single container**: Centralized dependency management

## Configuration Structure

### DI Types (`src/configs/di.types.ts`)

All injection tokens are defined using symbols:

```typescript
export const TYPES = {
  // Repositories
  StudentRepository: Symbol.for("StudentRepository"),
  DepartmentRepository: Symbol.for("DepartmentRepository"),
  CourseRepository: Symbol.for("CourseRepository"),
  // ... more repositories

  // Services
  StudentService: Symbol.for("StudentService"),
  DepartmentService: Symbol.for("DepartmentService"),
  CourseService: Symbol.for("CourseService"),
  // ... more services

  // Controllers
  StudentController: Symbol.for("StudentController"),
  DepartmentController: Symbol.for("DepartmentController"),
  CourseController: Symbol.for("CourseController"),
  // ... more controllers
};
```

### Container Configuration (`src/configs/di.config.ts`)

The DI container is configured with a deferred binding pattern to avoid circular dependencies:

```typescript
import "reflect-metadata";
import { Container } from "inversify";
import { TYPES } from "./di.types";

const container = new Container();

export const configureDI = () => {
  // Import implementations dynamically to avoid circular dependencies
  const { StudentRepository } = require("../repositories/student.repository");
  const { StudentService } = require("../services/student.service");
  const { StudentController } = require("../controllers/student.controller");

  // Bind repositories
  container.bind(TYPES.StudentRepository).to(StudentRepository);
  
  // Bind services
  container.bind(TYPES.StudentService).to(StudentService);
  
  // Bind controllers
  container.bind(TYPES.StudentController).to(StudentController);
};

export { container };
```

## Usage Patterns

### Injectable Classes

All classes participating in DI must be decorated with `@injectable()`:

```typescript
import { injectable, inject } from "inversify";
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

### Dependency Injection Hierarchy

Our application follows this DI hierarchy:

```
Controllers
    ↓ inject
  Services
    ↓ inject
Repositories
```

#### Controller Example

```typescript
@injectable()
export class StudentController {
  constructor(
    @inject(TYPES.StudentService) private studentService: IStudentService
  ) {}

  addStudent = async (req: Request, res: Response) => {
    const newStudent = await this.studentService.addStudent(req.body);
    return new CREATED({
      message: 'Student added successfully',
      metadata: { newStudent }
    }).send(res);
  };
}
```

#### Service Example

```typescript
@injectable()
export class StudentService implements IStudentService {
  constructor(
    @inject(TYPES.StudentRepository) private studentRepository: IStudentRepository,
    @inject(TYPES.DepartmentRepository) private departmentRepository: IDepartmentRepository
  ) {}

  async addStudent(studentData: CreateStudentDTO): Promise<Student> {
    // Validate department exists
    await this.departmentRepository.findById(studentData.department);
    
    // Create student
    return await this.studentRepository.create(studentData);
  }
}
```

#### Repository Example

```typescript
@injectable()
export class StudentRepository implements IStudentRepository {
  async create(studentData: CreateStudentDTO): Promise<Student> {
    const student = new StudentModel(studentData);
    return await student.save();
  }

  async findById(id: string): Promise<Student | null> {
    return await StudentModel.findById(id).populate('department program');
  }
}
```

## Interface-Based Injection

### Service Interfaces

All services implement interfaces to enable proper abstraction:

```typescript
// src/interfaces/services/student.service.interface.ts
export interface IStudentService {
  addStudent(studentData: CreateStudentDTO): Promise<Student>;
  updateStudent(id: string, data: UpdateStudentDTO): Promise<Student>;
  deleteStudent(id: string): Promise<Student>;
  getAllStudents(page: number, limit: number): Promise<PaginatedResult<Student>>;
  // ... more methods
}
```

### Repository Interfaces

```typescript
// src/interfaces/repositories/student.repository.interface.ts
export interface IStudentRepository {
  create(data: CreateStudentDTO): Promise<Student>;
  findById(id: string): Promise<Student | null>;
  findByStudentId(studentId: string): Promise<Student | null>;
  update(id: string, data: UpdateStudentDTO): Promise<Student>;
  delete(id: string): Promise<Student>;
  // ... more methods
}
```

## Container Resolution

### Manual Resolution

You can manually resolve dependencies from the container:

```typescript
import { container } from '../configs/di.config';
import { TYPES } from '../configs/di.types';
import { IStudentService } from '../interfaces/services/student.service.interface';

// Resolve a service
const studentService = container.get<IStudentService>(TYPES.StudentService);
```

### Route Integration

Controllers are resolved from the container in route handlers:

```typescript
// src/routes/student.routes.ts
import { container } from '../configs/di.config';
import { TYPES } from '../configs/di.types';
import { StudentController } from '../controllers/student.controller';

const router = express.Router();
const studentController = container.get<StudentController>(TYPES.StudentController);

router.post('/students', studentController.addStudent);
router.get('/students', studentController.getAllStudents);
```

## Scope Management

### Default Scope (Transient)

By default, Inversify creates new instances for each resolution:

```typescript
// Each call creates a new instance
container.bind(TYPES.StudentService).to(StudentService);
```

### Singleton Scope

For services that should be shared across the application:

```typescript
// Single instance shared across application
container.bind(TYPES.ConfigService).to(ConfigService).inSingletonScope();
```

## Testing with DI

### Mock Dependencies

DI makes unit testing easy by allowing dependency mocking:

```typescript
// student.service.test.ts
import { Container } from 'inversify';
import { TYPES } from '../configs/di.types';
import { StudentService } from '../services/student.service';
import { IStudentRepository } from '../interfaces/repositories/student.repository.interface';

describe('StudentService', () => {
  let container: Container;
  let studentService: StudentService;
  let mockRepository: jest.Mocked<IStudentRepository>;

  beforeEach(() => {
    container = new Container();
    
    // Create mock
    mockRepository = {
      create: jest.fn(),
      findById: jest.fn(),
      // ... mock all methods
    } as jest.Mocked<IStudentRepository>;

    // Bind mock to container
    container.bind<IStudentRepository>(TYPES.StudentRepository).toConstantValue(mockRepository);
    container.bind<StudentService>(TYPES.StudentService).to(StudentService);

    studentService = container.get<StudentService>(TYPES.StudentService);
  });

  it('should create student', async () => {
    const studentData = { /* test data */ };
    const expectedStudent = { /* expected result */ };
    
    mockRepository.create.mockResolvedValue(expectedStudent);
    
    const result = await studentService.addStudent(studentData);
    
    expect(mockRepository.create).toHaveBeenCalledWith(studentData);
    expect(result).toEqual(expectedStudent);
  });
});
```

## Best Practices

### 1. Interface Segregation

Create focused interfaces rather than large ones:

```typescript
// Good: Focused interface
export interface IStudentSearchService {
  searchStudents(query: SearchOptions): Promise<PaginatedResult<Student>>;
}

// Avoid: Large interface with many responsibilities
export interface IStudentEverythingService {
  // 20+ methods covering everything
}
```

### 2. Circular Dependency Prevention

Use the deferred import pattern in `configureDI()`:

```typescript
export const configureDI = () => {
  // Import here, not at module level
  const { StudentService } = require("../services/student.service");
  container.bind(TYPES.StudentService).to(StudentService);
};
```

### 3. Type Safety

Always use interfaces for injection:

```typescript
// Good: Interface-based injection
constructor(
  @inject(TYPES.StudentService) private studentService: IStudentService
) {}

// Avoid: Concrete class injection
constructor(
  @inject(TYPES.StudentService) private studentService: StudentService
) {}
```

### 4. Symbol Naming

Use descriptive symbol names that match the class:

```typescript
// Good: Clear naming
StudentRepository: Symbol.for("StudentRepository"),

// Avoid: Generic naming
Repository1: Symbol.for("Repo1"),
```

## Common Patterns

### Multiple Interface Implementation

A single class can implement multiple interfaces:

```typescript
@injectable()
export class StudentService implements IStudentService, IStudentSearchService {
  // Implement both interfaces
}

// Bind to multiple interfaces
container.bind<IStudentService>(TYPES.StudentService).to(StudentService);
container.bind<IStudentSearchService>(TYPES.StudentSearchService).to(StudentService);
```

### Factory Pattern

For complex object creation:

```typescript
container.bind<StudentFactory>(TYPES.StudentFactory).toFactory<Student>((context) => {
  return (type: string) => {
    if (type === 'undergraduate') {
      return context.container.get(TYPES.UndergraduateStudent);
    }
    return context.container.get(TYPES.GraduateStudent);
  };
});
```

## Troubleshooting

### Common Issues

1. **Missing @injectable() decorator**: Ensure all classes have the decorator
2. **Circular dependencies**: Use deferred imports in `configureDI()`
3. **Missing bindings**: Check that all dependencies are bound in the container
4. **Symbol mismatches**: Verify TYPES symbols match between binding and injection

### Debugging Tips

```typescript
// Check if binding exists
console.log(container.isBound(TYPES.StudentService));

// List all bindings
console.log(container.getBindings());

// Get binding metadata
console.log(container.getServiceIdentifiers());
```

## Related Documentation

- [Architecture Overview](./overview.md) - System architecture context
- [Source Organization](./source-organization.md) - File structure and organization
- [Unit Testing](../05-testing/unit-testing.md) - Testing with DI
- [Adding New Entities](../03-development/adding-entities.md) - DI setup for new entities 