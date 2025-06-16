# API Routing Best Practices

This document outlines the API routing patterns, conventions, and best practices used in the Student Management System. The application follows RESTful principles with Express.js routing and middleware patterns.

## Routing Architecture

### Route Organization Structure
```
src/routes/
├── index.ts                    # Main router configuration
├── {entity}/
│   └── index.ts               # Entity-specific routes
├── {feature}/
│   └── index.ts               # Feature-specific routes
└── common/
    └── middleware.ts          # Shared route middleware
```

### Route Registration Flow
```
Main Router (index.ts) → Entity Routes → Controller → Service → Repository
```

## Main Router Configuration

### Central Route Registration

```typescript
// src/routes/index.ts
import { Router } from "express";
import student from "./student";
import department from "./department";
import program from "./program";
import course from "./course";
import enrollment from "./enrollment";

const router = Router();

// API versioning with consistent prefix
router.use("/v1/api/students", student);
router.use("/v1/api/departments", department);
router.use("/v1/api/programs", program);
router.use("/v1/api/courses", course);
router.use("/v1/api/enrollment", enrollment);

export default router;
```

### API Versioning Strategy

```typescript
// Version 1 routes
router.use("/v1/api/students", studentV1Routes);

// Future version 2 routes (when needed)
router.use("/v2/api/students", studentV2Routes);

// Backward compatibility
router.use("/api/students", studentV1Routes); // Default to latest stable
```

## Entity Route Patterns

### Standard REST Route Structure

```typescript
// src/routes/student/index.ts
import { Router } from 'express';
import { asyncHandler } from "../../helpers/asyncHandler";
import { addStudentValidator } from "../../validators/student/add-student.validator";
import { updateStudentValidator } from "../../validators/student/update-student.validator";
import { container } from '../../configs/di.config';
import { TYPES } from '../../configs/di.types';
import { StudentController } from '../../controllers/student.controller';

const router = Router();

// Lazy resolution of controller for better performance
const getStudentController = () => container.get<StudentController>(TYPES.StudentController);

// CREATE - POST /v1/api/students
router.post('', 
  addStudentValidator, 
  asyncHandler((req, res, next) => 
    getStudentController().addStudent(req, res, next)
  )
);

// READ - GET /v1/api/students (with query parameters)
router.get('', 
  asyncHandler((req, res, next) => 
    getStudentController().getAllStudents(req, res, next)
  )
);

// READ - GET /v1/api/students/:studentId
router.get('/:studentId', 
  validateStudentParams,
  asyncHandler((req, res, next) => 
    getStudentController().getStudentById(req, res, next)
  )
);

// UPDATE - PATCH /v1/api/students/:studentId
router.patch('/:studentId', 
  validateStudentParams,
  updateStudentValidator, 
  asyncHandler((req, res, next) => 
    getStudentController().updateStudent(req, res, next)
  )
);

// DELETE - DELETE /v1/api/students/:studentId
router.delete('/:studentId', 
  validateStudentParams,
  asyncHandler((req, res, next) => 
    getStudentController().deleteStudent(req, res, next)
  )
);

export default router;
```

### Advanced Route Patterns

```typescript
// Nested resource routes
router.get('/department/:departmentId', 
  validateDepartmentParams,
  asyncHandler((req, res, next) => 
    getStudentController().getStudentByDepartment(req, res, next)
  )
);

// Search endpoints
router.get('/search', 
  validateSearchQuery,
  asyncHandler((req, res, next) => 
    getStudentController().searchStudents(req, res, next)
  )
);

// Bulk operations
router.post('/bulk', 
  validateBulkData,
  asyncHandler((req, res, next) => 
    getStudentController().bulkCreateStudents(req, res, next)
  )
);

// Status management (sub-resources)
router.post('/status-transitions', 
  validateStatusTransition,
  asyncHandler((req, res, next) => 
    getStudentController().addStudentStatusTransition(req, res, next)
  )
);

router.get('/status-transitions', 
  asyncHandler((req, res, next) => 
    getStudentController().getStudentStatusTransition(req, res, next)
  )
);

router.delete('/status-transitions', 
  validateStatusDeletion,
  asyncHandler((req, res, next) => 
    getStudentController().deleteStudentStatusTransition(req, res, next)
  )
);

// Administrative routes
router.get('/status-types', 
  asyncHandler((req, res, next) => 
    getStudentController().getStudentStatusType(req, res, next)
  )
);

router.post('/status-types', 
  validateStatusType,
  asyncHandler((req, res, next) => 
    getStudentController().addStudentStatusType(req, res, next)
  )
);

router.put('/status-types/:statusId', 
  validateStatusParams,
  validateStatusTypeUpdate,
  asyncHandler((req, res, next) => 
    getStudentController().modifyStudentStatusType(req, res, next)
  )
);
```

## Middleware Integration

### Async Handler Pattern

```typescript
// src/helpers/asyncHandler.ts
import { Request, Response, NextFunction, RequestHandler } from 'express';

type AsyncFunction = (req: Request, res: Response, next: NextFunction) => Promise<any>;

export const asyncHandler = (fn: AsyncFunction): RequestHandler => {
  return (req: Request, res: Response, next: NextFunction): Promise<void> => {
    return Promise.resolve(fn(req, res, next)).catch(next);
  };
};
```

### Validation Middleware Stacking

```typescript
// Multiple validation layers
router.post('/:studentId/enroll', 
  validateStudentParams,        // Validate path parameters
  validateEnrollmentBody,       // Validate request body
  checkEnrollmentPeriod,        // Business logic validation
  asyncHandler((req, res, next) => 
    getEnrollmentController().enrollStudent(req, res, next)
  )
);
```

### Custom Middleware Examples

```typescript
// Parameter validation middleware
const validateStudentParams = (req: Request, res: Response, next: NextFunction) => {
  const { studentId } = req.params;
  
  if (!studentId || !mongoose.Types.ObjectId.isValid(studentId)) {
    return next(new BadRequestError('Invalid student ID format'));
  }
  
  next();
};

// Query validation middleware
const validatePaginationQuery = (req: Request, res: Response, next: NextFunction) => {
  const { page = "1", limit = "10" } = req.query;
  
  const pageNum = parseInt(page as string);
  const limitNum = parseInt(limit as string);
  
  if (isNaN(pageNum) || pageNum < 1) {
    return next(new BadRequestError('Page must be a positive integer'));
  }
  
  if (isNaN(limitNum) || limitNum < 1 || limitNum > 100) {
    return next(new BadRequestError('Limit must be between 1 and 100'));
  }
  
  // Attach validated values to request
  req.pagination = { page: pageNum, limit: limitNum };
  next();
};

// Business logic middleware
const checkEnrollmentPeriod = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const semesterService = container.get<ISemesterService>(TYPES.SemesterService);
    const currentSemester = await semesterService.getCurrentSemester();
    
    if (!currentSemester.isEnrollmentOpen) {
      return next(new BadRequestError('Enrollment period is closed'));
    }
    
    req.currentSemester = currentSemester;
    next();
  } catch (error) {
    next(error);
  }
};
```

## RESTful API Design Principles

### HTTP Methods and Their Usage

| Method | Usage | Example Endpoint | Description |
|--------|-------|------------------|-------------|
| GET | Retrieve resources | `GET /api/students` | Get all students |
| GET | Retrieve single resource | `GET /api/students/:id` | Get specific student |
| POST | Create new resource | `POST /api/students` | Create new student |
| PUT | Complete resource update | `PUT /api/students/:id` | Replace entire student |
| PATCH | Partial resource update | `PATCH /api/students/:id` | Update student fields |
| DELETE | Remove resource | `DELETE /api/students/:id` | Delete student |

### URL Structure Conventions

```typescript
// Good: Descriptive, hierarchical URLs
GET  /v1/api/students                          // Get all students
GET  /v1/api/students/:studentId               // Get specific student
GET  /v1/api/students/:studentId/enrollments   // Get student's enrollments
POST /v1/api/students/:studentId/enrollments   // Enroll student in course

// Avoid: Unclear or action-based URLs
GET  /v1/api/getStudents
POST /v1/api/enrollStudentInCourse
GET  /v1/api/student-enrollments
```

### Query Parameter Conventions

```typescript
// Filtering
GET /v1/api/students?department=507f1f77bcf86cd799439011
GET /v1/api/students?status=active&schoolYear=2024

// Searching
GET /v1/api/students?search=nguyen
GET /v1/api/students?q=computer+science

// Pagination
GET /v1/api/students?page=2&limit=20

// Sorting
GET /v1/api/students?sortBy=fullName&sortOrder=asc
GET /v1/api/students?sort=fullName,-createdAt  // Alternative format

// Field selection
GET /v1/api/students?fields=fullName,studentId,department

// Combined example
GET /v1/api/students?department=507f1f77bcf86cd799439011&search=nguyen&page=1&limit=10&sortBy=fullName&sortOrder=asc
```

## Controller Integration

### Lazy Controller Resolution

```typescript
// Avoid instantiating controllers at module load
// Instead, use lazy resolution from DI container

// Good: Lazy resolution
const getStudentController = () => container.get<StudentController>(TYPES.StudentController);

router.get('/', asyncHandler((req, res, next) => 
  getStudentController().getAllStudents(req, res, next)
));

// Avoid: Direct instantiation
const studentController = new StudentController(...dependencies);
router.get('/', (req, res, next) => studentController.getAllStudents(req, res, next));
```

### Controller Method Binding

```typescript
// Pattern used in routes
asyncHandler((req, res, next) => 
  getStudentController().getAllStudents(req, res, next)
)

// Equivalent to:
asyncHandler(async (req, res, next) => {
  const controller = getStudentController();
  return await controller.getAllStudents(req, res, next);
})
```

## Route Organization Strategies

### By Entity (Recommended)

```typescript
// Benefits: Clear separation, easy to find entity-related routes
src/routes/
├── student/index.ts
├── course/index.ts
├── department/index.ts
└── enrollment/index.ts
```

### By Feature

```typescript
// For complex features spanning multiple entities
src/routes/
├── enrollment/
│   ├── index.ts          // Main enrollment routes
│   ├── bulk.ts           // Bulk enrollment operations
│   └── reports.ts        // Enrollment reporting
├── import/
│   └── index.ts          // Data import features
└── export/
    └── index.ts          // Data export features
```

### Mixed Approach (Current Implementation)

```typescript
// Combines both strategies based on functionality
src/routes/
├── student/index.ts      // Entity-based
├── course/index.ts       // Entity-based
├── enrollment/index.ts   // Feature-based
├── import/index.ts       // Feature-based
├── export/index.ts       // Feature-based
└── transcript/index.ts   // Feature-based
```

## Error Handling in Routes

### Standard Error Flow

```typescript
// 1. Validation errors (handled by middleware)
router.post('/', 
  validateStudentData,     // Throws BadRequestError if invalid
  asyncHandler(controller.create)
);

// 2. Business logic errors (handled by service)
async createStudent(req, res, next) {
  // Service throws appropriate error (NotFoundError, ConflictError, etc.)
  const student = await studentService.create(req.body);
  return new CREATED({ message: 'Student created', metadata: { student } }).send(res);
}

// 3. Unexpected errors (caught by asyncHandler and global error handler)
```

### Route-Specific Error Handling

```typescript
// Custom error handling for specific routes
router.delete('/:studentId', 
  validateStudentParams,
  asyncHandler(async (req, res, next) => {
    try {
      const result = await getStudentController().deleteStudent(req, res, next);
      return result;
    } catch (error) {
      if (error instanceof ReferencedEntityError) {
        return next(new BadRequestError('Cannot delete student with active enrollments'));
      }
      next(error);
    }
  })
);
```

## Performance Optimization

### Route Performance Best Practices

```typescript
// 1. Use lazy controller resolution
const getController = () => container.get<Controller>(TYPES.Controller);

// 2. Minimize middleware overhead
router.get('/simple-endpoint', 
  asyncHandler(getController().simpleMethod)  // No unnecessary validation
);

router.get('/complex-endpoint', 
  validateParams,
  validateQuery,
  checkPermissions,
  asyncHandler(getController().complexMethod)
);

// 3. Cache frequently accessed routes
const cache = new Map();
router.get('/static-data', 
  (req, res, next) => {
    const cached = cache.get('static-data');
    if (cached) {
      return res.json(cached);
    }
    next();
  },
  asyncHandler(getController().getStaticData)
);
```

### Middleware Optimization

```typescript
// Compile validation schemas once
const compiledSchema = Joi.compile(studentSchema);

const validateStudent = (req, res, next) => {
  const { error } = compiledSchema.validate(req.body);
  if (error) {
    return next(new BadRequestError(error.details[0].message));
  }
  next();
};
```

## API Documentation Integration

### Swagger/OpenAPI Integration

```typescript
/**
 * @swagger
 * /v1/api/students:
 *   post:
 *     summary: Create a new student
 *     tags: [Students]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateStudentRequest'
 *     responses:
 *       201:
 *         description: Student created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/StudentResponse'
 *       400:
 *         description: Invalid input data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/', 
  addStudentValidator,
  asyncHandler((req, res, next) => 
    getStudentController().addStudent(req, res, next)
  )
);
```

## Testing Route Handlers

### Integration Testing

```typescript
// Test routes with supertest
import request from 'supertest';
import app from '../src/index';

describe('Student Routes', () => {
  describe('POST /v1/api/students', () => {
    it('should create a student with valid data', async () => {
      const studentData = {
        studentId: '12345678',
        fullName: 'Test Student',
        // ... other required fields
      };

      const response = await request(app)
        .post('/v1/api/students')
        .send(studentData)
        .expect(201);

      expect(response.body.status).toBe('success');
      expect(response.body.metadata.student).toBeDefined();
    });

    it('should return 400 for invalid data', async () => {
      const invalidData = {
        studentId: '123',  // Too short
        fullName: ''       // Empty
      };

      const response = await request(app)
        .post('/v1/api/students')
        .send(invalidData)
        .expect(400);

      expect(response.body.status).toBe('error');
    });
  });

  describe('GET /v1/api/students', () => {
    it('should return paginated students', async () => {
      const response = await request(app)
        .get('/v1/api/students')
        .query({ page: 1, limit: 10 })
        .expect(200);

      expect(response.body.metadata.students).toBeInstanceOf(Array);
      expect(response.body.metadata.pagination).toBeDefined();
    });
  });
});
```

### Middleware Testing

```typescript
describe('Validation Middleware', () => {
  it('should validate student parameters', () => {
    const req = {
      params: { studentId: 'invalid-id' }
    } as any;
    const res = {} as any;
    const next = jest.fn();

    validateStudentParams(req, res, next);

    expect(next).toHaveBeenCalledWith(
      expect.objectContaining({
        message: expect.stringContaining('Invalid student ID')
      })
    );
  });
});
```

## Common Routing Patterns

### Resource Nesting

```typescript
// Shallow nesting (preferred)
GET /v1/api/students/:studentId/enrollments
POST /v1/api/students/:studentId/enrollments

// Deep nesting (avoid)
GET /v1/api/departments/:deptId/programs/:progId/students/:studentId/enrollments
```

### Batch Operations

```typescript
// Bulk creation
POST /v1/api/students/bulk
{
  "students": [
    { "studentId": "12345678", "fullName": "Student 1" },
    { "studentId": "87654321", "fullName": "Student 2" }
  ]
}

// Bulk update
PATCH /v1/api/students/bulk
{
  "updates": [
    { "id": "507f...", "data": { "status": "active" } },
    { "id": "507g...", "data": { "status": "inactive" } }
  ]
}

// Bulk delete
DELETE /v1/api/students/bulk
{
  "ids": ["507f...", "507g..."]
}
```

### Action-Based Endpoints

```typescript
// When RESTful patterns don't fit
POST /v1/api/students/:studentId/graduate
POST /v1/api/students/:studentId/suspend
POST /v1/api/students/:studentId/transfer
POST /v1/api/enrollment/:enrollmentId/drop
```

## Related Documentation

- [Coding Standards](./coding-standards.md) - Code organization and naming conventions
- [Data Validation](./validation.md) - Request validation patterns
- [Adding New Entities](./adding-entities.md) - Complete development guide
- [Architecture Overview](../02-architecture/overview.md) - System architecture and patterns 