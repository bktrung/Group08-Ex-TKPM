# Adding New Entities

This guide provides a step-by-step process for adding new entities to the Student Management System. Following this guide ensures consistency with the existing architecture and coding standards.

## Overview

Adding a new entity involves creating files across multiple layers:
- **Model Layer**: Entity definition and interface
- **Repository Layer**: Data access logic
- **Service Layer**: Business logic
- **Controller Layer**: HTTP request handling
- **Route Layer**: API endpoints
- **Validation Layer**: Request validation
- **DTO Layer**: Data transfer objects
- **Configuration**: Dependency injection setup

## Prerequisites

Before adding a new entity, ensure you:
1. Understand the [Architecture Overview](../02-architecture/overview.md)
2. Review [Coding Standards](./coding-standards.md)
3. Have the development environment set up

## Step-by-Step Guide

### Step 1: Define the Entity Model

Create the Mongoose model and TypeScript interface.

#### 1.1 Create the Interface

Create `src/models/interfaces/{entity}.interface.ts`:

```typescript
// Example: src/models/interfaces/course.interface.ts
import { Document, Types } from 'mongoose';

export interface ICourse extends Document {
  _id: Types.ObjectId;
  courseCode: string;
  courseName: string;
  credits: number;
  department: Types.ObjectId;
  description?: string;
  prerequisites: Types.ObjectId[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Enums if needed
export enum CourseType {
  MANDATORY = 'mandatory',
  ELECTIVE = 'elective',
  GENERAL = 'general'
}
```

#### 1.2 Create the Mongoose Model

Create `src/models/{entity}.model.ts`:

```typescript
// Example: src/models/course.model.ts
import mongoose, { Schema } from 'mongoose';
import { ICourse, CourseType } from './interfaces/course.interface';

const courseSchema = new Schema<ICourse>({
  courseCode: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    maxlength: 10
  },
  courseName: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  credits: {
    type: Number,
    required: true,
    min: 1,
    max: 10
  },
  department: {
    type: Schema.Types.ObjectId,
    ref: 'Department',
    required: true
  },
  description: {
    type: String,
    maxlength: 1000
  },
  prerequisites: [{
    type: Schema.Types.ObjectId,
    ref: 'Course'
  }],
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true,
  collection: 'courses'
});

// Indexes for performance
courseSchema.index({ courseCode: 1 });
courseSchema.index({ department: 1 });
courseSchema.index({ isActive: 1 });

// Virtual fields if needed
courseSchema.virtual('fullCode').get(function() {
  return `${this.courseCode} - ${this.courseName}`;
});

export const CourseModel = mongoose.model<ICourse>('Course', courseSchema);
```

### Step 2: Create Data Transfer Objects (DTOs)

Create `src/dto/{entity}/index.ts`:

```typescript
// Example: src/dto/course/index.ts
import { Types } from 'mongoose';
import { CourseType } from '../../models/interfaces/course.interface';

export interface CreateCourseDto {
  courseCode: string;
  courseName: string;
  credits: number;
  department: string | Types.ObjectId;
  description?: string;
  prerequisites: string[] | Types.ObjectId[];
  type: CourseType;
}

export interface UpdateCourseDto {
  courseName?: string;
  credits?: number;
  department?: string | Types.ObjectId;
  description?: string;
  prerequisites?: string[] | Types.ObjectId[];
  type?: CourseType;
  isActive?: boolean;
}

export interface CourseQueryDto {
  department?: string;
  credits?: number;
  type?: CourseType;
  isActive?: boolean;
  search?: string;
  page?: number;
  limit?: number;
}
```

### Step 3: Create Repository Layer

#### 3.1 Create Repository Interface

Create `src/interfaces/repositories/{entity}.repository.interface.ts`:

```typescript
// Example: src/interfaces/repositories/course.repository.interface.ts
import { ICourse } from '../../models/interfaces/course.interface';
import { CreateCourseDto, UpdateCourseDto, CourseQueryDto } from '../../dto/course';

export interface ICourseRepository {
  create(courseData: CreateCourseDto): Promise<ICourse>;
  findById(id: string): Promise<ICourse | null>;
  findByCourseCode(courseCode: string): Promise<ICourse | null>;
  findAll(query: CourseQueryDto): Promise<{
    courses: ICourse[];
    total: number;
    page: number;
    totalPages: number;
  }>;
  update(id: string, updateData: UpdateCourseDto): Promise<ICourse | null>;
  delete(id: string): Promise<boolean>;
  findByDepartment(departmentId: string): Promise<ICourse[]>;
  findPrerequisites(courseId: string): Promise<ICourse[]>;
}
```

#### 3.2 Implement Repository

Create `src/repositories/{entity}.repository.ts`:

```typescript
// Example: src/repositories/course.repository.ts
import { injectable } from 'inversify';
import { CourseModel } from '../models/course.model';
import { ICourse } from '../models/interfaces/course.interface';
import { ICourseRepository } from '../interfaces/repositories/course.repository.interface';
import { CreateCourseDto, UpdateCourseDto, CourseQueryDto } from '../dto/course';

@injectable()
export class CourseRepository implements ICourseRepository {
  async create(courseData: CreateCourseDto): Promise<ICourse> {
    const course = new CourseModel(courseData);
    return await course.save();
  }

  async findById(id: string): Promise<ICourse | null> {
    return await CourseModel.findById(id)
      .populate('department', 'name code')
      .populate('prerequisites', 'courseCode courseName credits')
      .exec();
  }

  async findByCourseCode(courseCode: string): Promise<ICourse | null> {
    return await CourseModel.findOne({ courseCode })
      .populate('department', 'name code')
      .exec();
  }

  async findAll(query: CourseQueryDto): Promise<{
    courses: ICourse[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const {
      department,
      credits,
      type,
      isActive = true,
      search,
      page = 1,
      limit = 10
    } = query;

    // Build filter object
    const filter: any = { isActive };

    if (department) filter.department = department;
    if (credits) filter.credits = credits;
    if (type) filter.type = type;
    if (search) {
      filter.$or = [
        { courseCode: { $regex: search, $options: 'i' } },
        { courseName: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (page - 1) * limit;

    const [courses, total] = await Promise.all([
      CourseModel.find(filter)
        .populate('department', 'name code')
        .sort({ courseCode: 1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      CourseModel.countDocuments(filter)
    ]);

    return {
      courses,
      total,
      page,
      totalPages: Math.ceil(total / limit)
    };
  }

  async update(id: string, updateData: UpdateCourseDto): Promise<ICourse | null> {
    return await CourseModel.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    )
      .populate('department', 'name code')
      .populate('prerequisites', 'courseCode courseName credits')
      .exec();
  }

  async delete(id: string): Promise<boolean> {
    const result = await CourseModel.findByIdAndDelete(id);
    return result !== null;
  }

  async findByDepartment(departmentId: string): Promise<ICourse[]> {
    return await CourseModel.find({ 
      department: departmentId, 
      isActive: true 
    })
      .sort({ courseCode: 1 })
      .exec();
  }

  async findPrerequisites(courseId: string): Promise<ICourse[]> {
    const course = await CourseModel.findById(courseId)
      .populate('prerequisites')
      .exec();
    
    return course ? course.prerequisites as ICourse[] : [];
  }
}
```

### Step 4: Create Service Layer

#### 4.1 Create Service Interface

Create `src/interfaces/services/{entity}.service.interface.ts`:

```typescript
// Example: src/interfaces/services/course.service.interface.ts
import { ICourse } from '../../models/interfaces/course.interface';
import { CreateCourseDto, UpdateCourseDto, CourseQueryDto } from '../../dto/course';

export interface ICourseService {
  createCourse(courseData: CreateCourseDto): Promise<ICourse>;
  getCourseById(id: string): Promise<ICourse>;
  getAllCourses(query: CourseQueryDto): Promise<{
    courses: ICourse[];
    total: number;
    page: number;
    totalPages: number;
  }>;
  updateCourse(id: string, updateData: UpdateCourseDto): Promise<ICourse>;
  deleteCourse(id: string): Promise<ICourse>;
  getCoursesByDepartment(departmentId: string): Promise<ICourse[]>;
  validatePrerequisites(courseId: string, prerequisites: string[]): Promise<boolean>;
}
```

#### 4.2 Implement Service

Create `src/services/{entity}.service.ts`:

```typescript
// Example: src/services/course.service.ts
import { injectable, inject } from 'inversify';
import { TYPES } from '../configs/di.types';
import { ICourseService } from '../interfaces/services/course.service.interface';
import { ICourseRepository } from '../interfaces/repositories/course.repository.interface';
import { IDepartmentRepository } from '../interfaces/repositories/department.repository.interface';
import { ICourse } from '../models/interfaces/course.interface';
import { CreateCourseDto, UpdateCourseDto, CourseQueryDto } from '../dto/course';
import { BadRequestError, NotFoundError, ConflictRequestError } from '../responses/error.responses';

@injectable()
export class CourseService implements ICourseService {
  constructor(
    @inject(TYPES.CourseRepository) private readonly courseRepository: ICourseRepository,
    @inject(TYPES.DepartmentRepository) private readonly departmentRepository: IDepartmentRepository
  ) {}

  async createCourse(courseData: CreateCourseDto): Promise<ICourse> {
    // Validate department exists
    const department = await this.departmentRepository.findById(courseData.department.toString());
    if (!department) {
      throw new NotFoundError('Department not found');
    }

    // Check if course code already exists
    const existingCourse = await this.courseRepository.findByCourseCode(courseData.courseCode);
    if (existingCourse) {
      throw new ConflictRequestError('Course with this code already exists');
    }

    // Validate prerequisites exist
    if (courseData.prerequisites && courseData.prerequisites.length > 0) {
      await this.validatePrerequisites('', courseData.prerequisites.map(p => p.toString()));
    }

    return await this.courseRepository.create(courseData);
  }

  async getCourseById(id: string): Promise<ICourse> {
    const course = await this.courseRepository.findById(id);
    if (!course) {
      throw new NotFoundError('Course not found');
    }
    return course;
  }

  async getAllCourses(query: CourseQueryDto): Promise<{
    courses: ICourse[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    return await this.courseRepository.findAll(query);
  }

  async updateCourse(id: string, updateData: UpdateCourseDto): Promise<ICourse> {
    // Check if course exists
    const existingCourse = await this.courseRepository.findById(id);
    if (!existingCourse) {
      throw new NotFoundError('Course not found');
    }

    // Validate department if being updated
    if (updateData.department) {
      const department = await this.departmentRepository.findById(updateData.department.toString());
      if (!department) {
        throw new NotFoundError('Department not found');
      }
    }

    // Validate prerequisites if being updated
    if (updateData.prerequisites && updateData.prerequisites.length > 0) {
      await this.validatePrerequisites(id, updateData.prerequisites.map(p => p.toString()));
    }

    const updatedCourse = await this.courseRepository.update(id, updateData);
    if (!updatedCourse) {
      throw new NotFoundError('Course not found');
    }

    return updatedCourse;
  }

  async deleteCourse(id: string): Promise<ICourse> {
    const course = await this.courseRepository.findById(id);
    if (!course) {
      throw new NotFoundError('Course not found');
    }

    // Check if course is being used as a prerequisite
    // This would require additional repository method to check references

    const deleted = await this.courseRepository.delete(id);
    if (!deleted) {
      throw new BadRequestError('Failed to delete course');
    }

    return course;
  }

  async getCoursesByDepartment(departmentId: string): Promise<ICourse[]> {
    // Validate department exists
    const department = await this.departmentRepository.findById(departmentId);
    if (!department) {
      throw new NotFoundError('Department not found');
    }

    return await this.courseRepository.findByDepartment(departmentId);
  }

  async validatePrerequisites(courseId: string, prerequisites: string[]): Promise<boolean> {
    for (const prereqId of prerequisites) {
      const prerequisite = await this.courseRepository.findById(prereqId);
      if (!prerequisite) {
        throw new NotFoundError(`Prerequisite course not found: ${prereqId}`);
      }

      // Prevent circular dependencies
      if (prereqId === courseId) {
        throw new BadRequestError('Course cannot be its own prerequisite');
      }
    }

    return true;
  }
}
```

### Step 5: Create Validation Layer

Create `src/validators/{entity}/create-{entity}.validator.ts`:

```typescript
// Example: src/validators/course/create-course.validator.ts
import Joi from 'joi';
import { CourseType } from '../../models/interfaces/course.interface';
import { validateRequest } from '../../middlewares/validation.middleware';

export const createCourseSchema = Joi.object({
  courseCode: Joi.string()
    .pattern(/^[A-Z]{2,4}[0-9]{3,4}$/)
    .required()
    .messages({
      'string.empty': 'Course code cannot be empty',
      'string.pattern.base': 'Course code must be 2-4 uppercase letters followed by 3-4 digits',
      'any.required': 'Course code is required'
    }),
  courseName: Joi.string()
    .min(2)
    .max(200)
    .required()
    .messages({
      'string.empty': 'Course name cannot be empty',
      'string.min': 'Course name must be at least 2 characters',
      'string.max': 'Course name cannot exceed 200 characters',
      'any.required': 'Course name is required'
    }),
  credits: Joi.number()
    .integer()
    .min(1)
    .max(10)
    .required()
    .messages({
      'number.base': 'Credits must be a number',
      'number.integer': 'Credits must be an integer',
      'number.min': 'Credits must be at least 1',
      'number.max': 'Credits cannot exceed 10',
      'any.required': 'Credits is required'
    }),
  department: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .required()
    .messages({
      'string.empty': 'Department ID cannot be empty',
      'string.pattern.base': 'Department ID is invalid (must be MongoDB ObjectId)',
      'any.required': 'Department is required'
    }),
  description: Joi.string()
    .max(1000)
    .optional()
    .allow('')
    .messages({
      'string.max': 'Description cannot exceed 1000 characters'
    }),
  prerequisites: Joi.array()
    .items(
      Joi.string()
        .pattern(/^[0-9a-fA-F]{24}$/)
        .messages({
          'string.pattern.base': 'Prerequisite ID is invalid (must be MongoDB ObjectId)'
        })
    )
    .optional()
    .messages({
      'array.base': 'Prerequisites must be an array'
    }),
  type: Joi.string()
    .valid(...Object.values(CourseType))
    .required()
    .messages({
      'any.only': `Course type must be one of: ${Object.values(CourseType).join(', ')}`,
      'any.required': 'Course type is required'
    })
});

export const createCourseValidator = validateRequest(createCourseSchema);
```

### Step 6: Create Controller Layer

Create `src/controllers/{entity}.controller.ts`:

```typescript
// Example: src/controllers/course.controller.ts
import { Request, Response, NextFunction } from 'express';
import { injectable, inject } from 'inversify';
import { TYPES } from '../configs/di.types';
import { ICourseService } from '../interfaces/services/course.service.interface';
import { CreateCourseDto, UpdateCourseDto, CourseQueryDto } from '../dto/course';
import { OK, CREATED } from '../responses/success.responses';

@injectable()
export class CourseController {
  constructor(
    @inject(TYPES.CourseService) private readonly courseService: ICourseService
  ) {}

  async createCourse(req: Request, res: Response, next: NextFunction): Promise<void> {
    const courseData: CreateCourseDto = req.body;
    const newCourse = await this.courseService.createCourse(courseData);
    
    return new CREATED({
      message: 'Course created successfully',
      metadata: { course: newCourse }
    }).send(res);
  }

  async getAllCourses(req: Request, res: Response, next: NextFunction): Promise<void> {
    const query: CourseQueryDto = req.query;
    const result = await this.courseService.getAllCourses(query);
    
    return new OK({
      message: 'Courses retrieved successfully',
      metadata: result
    }).send(res);
  }

  async getCourseById(req: Request, res: Response, next: NextFunction): Promise<void> {
    const { id } = req.params;
    const course = await this.courseService.getCourseById(id);
    
    return new OK({
      message: 'Course retrieved successfully',
      metadata: { course }
    }).send(res);
  }

  async updateCourse(req: Request, res: Response, next: NextFunction): Promise<void> {
    const { id } = req.params;
    const updateData: UpdateCourseDto = req.body;
    const updatedCourse = await this.courseService.updateCourse(id, updateData);
    
    return new OK({
      message: 'Course updated successfully',
      metadata: { course: updatedCourse }
    }).send(res);
  }

  async deleteCourse(req: Request, res: Response, next: NextFunction): Promise<void> {
    const { id } = req.params;
    const deletedCourse = await this.courseService.deleteCourse(id);
    
    return new OK({
      message: 'Course deleted successfully',
      metadata: { course: deletedCourse }
    }).send(res);
  }

  async getCoursesByDepartment(req: Request, res: Response, next: NextFunction): Promise<void> {
    const { departmentId } = req.params;
    const courses = await this.courseService.getCoursesByDepartment(departmentId);
    
    return new OK({
      message: 'Department courses retrieved successfully',
      metadata: { courses }
    }).send(res);
  }
}
```

### Step 7: Create Route Layer

Create `src/routes/{entity}/index.ts`:

```typescript
// Example: src/routes/course/index.ts
import { Router } from 'express';
import { asyncHandler } from '../../helpers/asyncHandler';
import { createCourseValidator } from '../../validators/course/create-course.validator';
import { updateCourseValidator } from '../../validators/course/update-course.validator';
import { container } from '../../configs/di.config';
import { TYPES } from '../../configs/di.types';
import { CourseController } from '../../controllers/course.controller';

const router = Router();

// Lazy resolution of controller
const getCourseController = () => container.get<CourseController>(TYPES.CourseController);

// Routes
router.post('', createCourseValidator, asyncHandler((req, res, next) => 
  getCourseController().createCourse(req, res, next)
));

router.get('', asyncHandler((req, res, next) => 
  getCourseController().getAllCourses(req, res, next)
));

router.get('/:id', asyncHandler((req, res, next) => 
  getCourseController().getCourseById(req, res, next)
));

router.patch('/:id', updateCourseValidator, asyncHandler((req, res, next) => 
  getCourseController().updateCourse(req, res, next)
));

router.delete('/:id', asyncHandler((req, res, next) => 
  getCourseController().deleteCourse(req, res, next)
));

router.get('/department/:departmentId', asyncHandler((req, res, next) => 
  getCourseController().getCoursesByDepartment(req, res, next)
));

export default router;
```

### Step 8: Update Dependency Injection Configuration

#### 8.1 Add Types

In `src/configs/di.types.ts`, add the new types:

```typescript
export const TYPES = {
  // ... existing types
  CourseRepository: Symbol.for('CourseRepository'),
  CourseService: Symbol.for('CourseService'),
  CourseController: Symbol.for('CourseController'),
};
```

#### 8.2 Configure Bindings

In `src/configs/di.config.ts`, add the bindings:

```typescript
// Add imports
import { CourseRepository } from '../repositories/course.repository';
import { CourseService } from '../services/course.service';
import { CourseController } from '../controllers/course.controller';
import { ICourseRepository } from '../interfaces/repositories/course.repository.interface';
import { ICourseService } from '../interfaces/services/course.service.interface';

// Add bindings in the configuration function
container.bind<ICourseRepository>(TYPES.CourseRepository).to(CourseRepository);
container.bind<ICourseService>(TYPES.CourseService).to(CourseService);
container.bind<CourseController>(TYPES.CourseController).to(CourseController);
```

### Step 9: Register Routes

In `src/routes/index.ts`, add the new route:

```typescript
import course from "./course";

// Add route registration
router.use("/v1/api/courses", course);
```

### Step 10: Add Tests

Create test files following the pattern `src/tests/{entity}.{layer}.test.ts`:

```typescript
// Example: src/tests/course.service.test.ts
import { CourseService } from '../services/course.service';
import { CourseRepository } from '../repositories/course.repository';
import { DepartmentRepository } from '../repositories/department.repository';

describe('CourseService', () => {
  let courseService: CourseService;
  let mockCourseRepository: jest.Mocked<CourseRepository>;
  let mockDepartmentRepository: jest.Mocked<DepartmentRepository>;

  beforeEach(() => {
    mockCourseRepository = {
      create: jest.fn(),
      findById: jest.fn(),
      findByCourseCode: jest.fn(),
      // ... other methods
    } as any;

    mockDepartmentRepository = {
      findById: jest.fn(),
      // ... other methods
    } as any;

    courseService = new CourseService(mockCourseRepository, mockDepartmentRepository);
  });

  describe('createCourse', () => {
    it('should create a course successfully', async () => {
      // Test implementation
    });

    it('should throw error if department not found', async () => {
      // Test implementation
    });
  });
});
```

## Checklist

Before considering the entity complete, verify:

- [ ] Model interface and Mongoose schema created
- [ ] DTOs defined for create, update, and query operations
- [ ] Repository interface and implementation created
- [ ] Service interface and implementation created
- [ ] Controller created with all CRUD operations
- [ ] Validation schemas created for all input operations
- [ ] Routes defined and registered
- [ ] Dependency injection configured
- [ ] Unit tests written for service layer
- [ ] Integration tests written for API endpoints
- [ ] Swagger documentation updated
- [ ] Error handling implemented properly
- [ ] Logging added where appropriate

## Common Patterns

### Error Handling
Always use the standard error classes:
- `NotFoundError` - Entity not found
- `BadRequestError` - Invalid input data
- `ConflictRequestError` - Duplicate or conflicting data

### Repository Patterns
- Always use proper TypeScript typing
- Include population for related entities
- Implement proper filtering and pagination
- Use transactions for complex operations

### Service Patterns
- Validate all external dependencies
- Implement proper business logic validation
- Use consistent error messaging
- Log operations for debugging

### Controller Patterns
- Keep controllers thin - delegate to services
- Use standard response classes
- Implement proper HTTP status codes
- Handle async operations properly

## Related Documentation

- [Architecture Overview](../02-architecture/overview.md)
- [Source Code Organization](../02-architecture/source-organization.md)
- [Dependency Injection](../02-architecture/dependency-injection.md)
- [Coding Standards](./coding-standards.md)
- [Data Validation](./validation.md)
- [Unit Testing](../05-testing/unit-testing.md) 