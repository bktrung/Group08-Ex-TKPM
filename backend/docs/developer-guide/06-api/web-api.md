# Web API Documentation

*This document provides comprehensive guidelines for the Student Management System Web API, covering design principles, conventions, and usage patterns.*

## Table of Contents

1. [API Overview](#api-overview)
2. [API Design Principles](#api-design-principles)
3. [RESTful Patterns and Conventions](#restful-patterns-and-conventions)
4. [Response Format Standardization](#response-format-standardization)
5. [Error Handling and HTTP Status Codes](#error-handling-and-http-status-codes)
6. [API Versioning Strategy](#api-versioning-strategy)
7. [Request/Response Examples](#requestresponse-examples)
8. [Authentication and Authorization](#authentication-and-authorization)
9. [How to Extend the API](#how-to-extend-the-api)
10. [Performance and Security Considerations](#performance-and-security-considerations)

## API Overview

The Student Management System API is a RESTful web service that provides comprehensive functionality for managing academic institutions. It supports operations for students, courses, classes, enrollments, grades, and administrative data.

### Base Information

- **Base URL**: `http://localhost:3456` (Development) / `https://api.yourdomain.com` (Production)
- **API Version**: v1
- **API Prefix**: `/v1/api/`
- **Content Type**: `application/json`
- **Documentation**: Available via Swagger UI at `/api-docs`

### Core Entities

The API manages the following primary entities:

| Entity | Endpoint | Description |
|--------|----------|-------------|
| **Students** | `/v1/api/students` | Student records and management |
| **Departments** | `/v1/api/departments` | Academic departments |
| **Programs** | `/v1/api/programs` | Academic programs and degrees |
| **Courses** | `/v1/api/courses` | Course catalog and definitions |
| **Classes** | `/v1/api/classes` | Class instances and schedules |
| **Enrollment** | `/v1/api/enrollment` | Student course enrollments |
| **Grades** | `/v1/api/grades` | Grade management and records |
| **Semesters** | `/v1/api/semesters` | Academic term management |
| **Address** | `/v1/api/address` | Geographic and address data |

## API Design Principles

### 1. RESTful Architecture

Our API follows REST (Representational State Transfer) principles:

- **Resource-Based URLs**: Each endpoint represents a specific resource
- **HTTP Methods**: Use appropriate HTTP verbs for different operations
- **Stateless**: Each request contains all necessary information
- **Cacheable**: Responses include appropriate caching headers
- **Uniform Interface**: Consistent patterns across all endpoints

### 2. Resource Naming Conventions

```
# Good examples
GET /v1/api/students              # Collection of students
GET /v1/api/students/{id}         # Specific student
POST /v1/api/students             # Create new student
PUT /v1/api/students/{id}         # Update student
DELETE /v1/api/students/{id}      # Delete student

# Nested resources
GET /v1/api/students/{id}/enrollments    # Student's enrollments
GET /v1/api/classes/{id}/students        # Students in a class

# Action-based endpoints (when REST isn't sufficient)
POST /v1/api/enrollment/drop            # Drop enrollment
GET /v1/api/students/search             # Search students
```

### 3. HTTP Method Usage

| Method | Usage | Idempotent | Safe |
|--------|-------|------------|------|
| `GET` | Retrieve resources | ✅ | ✅ |
| `POST` | Create new resources | ❌ | ❌ |
| `PUT` | Update/replace entire resource | ✅ | ❌ |
| `PATCH` | Partial update of resource | ❌ | ❌ |
| `DELETE` | Remove resource | ✅ | ❌ |

### 4. Response Consistency

All API responses follow a standardized format with consistent field names and structures across all endpoints.

## RESTful Patterns and Conventions

### Standard CRUD Operations

#### Collection Operations

```http
# Get all resources with pagination
GET /v1/api/students?page=1&limit=10

# Create new resource
POST /v1/api/students
Content-Type: application/json

{
  "studentId": "22000001",
  "fullName": "Nguyễn Văn A",
  "email": "nguyenvana@student.hcmus.edu.vn",
  ...
}
```

#### Individual Resource Operations

```http
# Get specific resource
GET /v1/api/students/22000001

# Update resource
PUT /v1/api/students/22000001
Content-Type: application/json

{
  "fullName": "Nguyễn Văn A Updated",
  "email": "updated.email@student.hcmus.edu.vn",
  ...
}

# Delete resource
DELETE /v1/api/students/22000001
```

### Search and Filtering

```http
# Text search
GET /v1/api/students/search?q=Nguyen&page=1&limit=10

# Filter by attributes
GET /v1/api/students?department=507f1f77bcf86cd799439011&status=active

# Advanced filtering with sorting
GET /v1/api/students?page=1&limit=20&sort=ctime&departmentId=507f1f77bcf86cd799439011
```

### Nested Resource Access

```http
# Get students by department
GET /v1/api/students/department/507f1f77bcf86cd799439011

# Get enrollment history for student
GET /v1/api/enrollment/drop-history/22000001
```

## Response Format Standardization

### Standard Response Structure

All API responses follow a consistent structure:

```typescript
interface ApiResponse<T = any> {
  status: "success" | "error";
  code: number;
  message: string;
  metadata?: T;
  stack?: string; // Only in development for errors
}
```

### Success Response Format

```json
{
  "status": "success",
  "code": 200,
  "message": "Operation completed successfully",
  "metadata": {
    // Response data here
  }
}
```

### Paginated Response Format

```json
{
  "status": "success",
  "code": 200,
  "message": "Students retrieved successfully",
  "metadata": {
    "students": [
      {
        "studentId": "22000001",
        "fullName": "Nguyễn Văn A",
        "email": "nguyenvana@student.hcmus.edu.vn",
        ...
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 50,
      "totalPages": 5
    }
  }
}
```

### Error Response Format

```json
{
  "status": "error",
  "code": 400,
  "message": "Validation failed: Email already exists",
  "stack": "Error: Validation failed..." // Development only
}
```

## Error Handling and HTTP Status Codes

### Standard HTTP Status Codes

| Code | Status | Usage |
|------|--------|-------|
| `200` | OK | Successful GET, PUT, PATCH |
| `201` | Created | Successful POST (resource created) |
| `204` | No Content | Successful DELETE |
| `400` | Bad Request | Invalid request data or parameters |
| `401` | Unauthorized | Authentication required |
| `403` | Forbidden | Insufficient permissions |
| `404` | Not Found | Resource doesn't exist |
| `409` | Conflict | Resource conflict (e.g., duplicate email) |
| `422` | Unprocessable Entity | Validation errors |
| `500` | Internal Server Error | Server-side errors |

### Error Response Examples

#### Validation Error (422)

```json
{
  "status": "error",
  "code": 422,
  "message": "Validation failed: Required fields missing"
}
```

#### Resource Not Found (404)

```json
{
  "status": "error",
  "code": 404,
  "message": "Student not found"
}
```

#### Business Logic Error (400)

```json
{
  "status": "error",
  "code": 400,
  "message": "Email already used by another student"
}
```

#### Server Error (500)

```json
{
  "status": "error",
  "code": 500,
  "message": "Internal Server Error"
}
```

### Error Handling Best Practices

1. **Descriptive Messages**: Provide clear, actionable error messages
2. **Consistent Format**: All errors follow the same response structure
3. **Internationalization**: Support multiple languages for error messages
4. **Security**: Don't expose sensitive information in error messages
5. **Stack Traces**: Only include stack traces in development environment

## API Versioning Strategy

### Current Versioning Approach

- **URL Path Versioning**: `/v1/api/` prefix for all endpoints
- **Version**: Currently on v1
- **Backward Compatibility**: Maintained within major versions

### Versioning Rules

1. **Major Version**: Breaking changes require new major version (`/v2/api/`)
2. **Minor Changes**: Additive changes within same major version
3. **Deprecation**: Gradual deprecation with clear timelines
4. **Documentation**: Version-specific documentation maintained

### Migration Strategy

```http
# Current version
GET /v1/api/students

# Future version (when needed)
GET /v2/api/students

# Backward compatibility maintained
# v1 continues to work during transition period
```

### Version Headers

```http
# Optional version specification via headers
GET /api/students
Accept: application/vnd.sms.v1+json
```

## Request/Response Examples

### Students API Examples

#### Create Student

**Request:**
```http
POST /v1/api/students
Content-Type: application/json

{
  "studentId": "22000002",
  "fullName": "Trần Thị B",
  "dateOfBirth": "2000-05-20T00:00:00.000Z",
  "gender": "Nữ",
  "department": "507f1f77bcf86cd799439011",
  "schoolYear": 2022,
  "program": "507f1f77bcf86cd799439013",
  "mailingAddress": {
    "houseNumberStreet": "123 Nguyen Van Cu",
    "wardCommune": "Ward 1",
    "districtCounty": "District 5",
    "provinceCity": "Ho Chi Minh City",
    "country": "Vietnam"
  },
  "email": "tranthib@student.hcmus.edu.vn",
  "phoneNumber": "0987654321",
  "status": "507f1f77bcf86cd799439015",
  "identityDocument": {
    "type": "CCCD",
    "number": "038204012568",
    "issueDate": "2020-01-15T00:00:00.000Z",
    "issuedBy": "Cong An TP HCM",
    "expiryDate": "2035-01-15T00:00:00.000Z",
    "hasChip": true
  },
  "nationality": "Vietnamese"
}
```

**Response:**
```http
HTTP/1.1 201 Created
Content-Type: application/json

{
  "status": "success",
  "code": 201,
  "message": "Student created successfully",
  "metadata": {
    "newStudent": {
      "_id": "507f1f77bcf86cd799439021",
      "studentId": "22000002",
      "fullName": "Trần Thị B",
      "dateOfBirth": "2000-05-20T00:00:00.000Z",
      "email": "tranthib@student.hcmus.edu.vn",
      "department": {
        "_id": "507f1f77bcf86cd799439011",
        "name": "Computer Science"
      },
      "createdAt": "2024-01-15T10:30:00.000Z",
      "updatedAt": "2024-01-15T10:30:00.000Z"
    }
  }
}
```

#### Search Students

**Request:**
```http
GET /v1/api/students/search?q=Nguyen&page=1&limit=5&departmentId=507f1f77bcf86cd799439011
```

**Response:**
```http
HTTP/1.1 200 OK
Content-Type: application/json

{
  "status": "success",
  "code": 200,
  "message": "Search results retrieved successfully",
  "metadata": {
    "students": [
      {
        "studentId": "22000001",
        "fullName": "Nguyễn Văn A",
        "email": "nguyenvana@student.hcmus.edu.vn",
        "department": {
          "_id": "507f1f77bcf86cd799439011",
          "name": "Computer Science"
        },
        "status": {
          "_id": "507f1f77bcf86cd799439015",
          "type": "Đang học"
        }
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 5,
      "total": 1,
      "totalPages": 1
    },
    "query": "Nguyen"
  }
}
```

### Courses API Examples

#### Get All Courses

**Request:**
```http
GET /v1/api/courses?page=1&limit=10
```

**Response:**
```http
HTTP/1.1 200 OK
Content-Type: application/json

{
  "status": "success",
  "code": 200,
  "message": "Courses retrieved successfully",
  "metadata": {
    "courses": [
      {
        "_id": "507f1f77bcf86cd799439031",
        "courseCode": "CS101",
        "courseName": "Introduction to Computer Science",
        "credits": 3,
        "department": {
          "_id": "507f1f77bcf86cd799439011",
          "name": "Computer Science"
        },
        "prerequisites": [],
        "description": "Basic concepts of computer science"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 25,
      "totalPages": 3
    }
  }
}
```

### Enrollment API Examples

#### Create Enrollment

**Request:**
```http
POST /v1/api/enrollment
Content-Type: application/json

{
  "student": "507f1f77bcf86cd799439021",
  "class": "507f1f77bcf86cd799439041"
}
```

**Response:**
```http
HTTP/1.1 201 Created
Content-Type: application/json

{
  "status": "success",
  "code": 201,
  "message": "Enrollment created successfully",
  "metadata": {
    "newEnrollment": {
      "_id": "507f1f77bcf86cd799439051",
      "student": "507f1f77bcf86cd799439021",
      "class": "507f1f77bcf86cd799439041",
      "enrollmentDate": "2024-01-15T10:45:00.000Z",
      "status": "enrolled"
    }
  }
}
```

### Grades API Examples

#### Submit Grade

**Request:**
```http
POST /v1/api/grades
Content-Type: application/json

{
  "enrollment": "507f1f77bcf86cd799439051",
  "gradeType": "midterm",
  "score": 85.5,
  "maxScore": 100,
  "weight": 0.3
}
```

**Response:**
```http
HTTP/1.1 201 Created
Content-Type: application/json

{
  "status": "success",
  "code": 201,
  "message": "Grade submitted successfully",
  "metadata": {
    "grade": {
      "_id": "507f1f77bcf86cd799439061",
      "enrollment": "507f1f77bcf86cd799439051",
      "gradeType": "midterm",
      "score": 85.5,
      "maxScore": 100,
      "weight": 0.3,
      "percentage": 85.5,
      "submittedAt": "2024-01-15T11:00:00.000Z"
    }
  }
}
```

## Authentication and Authorization

### Current Status

**Note**: Authentication is not currently implemented but is planned for future versions.

### Planned Authentication Strategy

#### JWT-Based Authentication

```http
# Login request
POST /v1/api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securepassword"
}

# Response with JWT token
{
  "status": "success",
  "code": 200,
  "message": "Login successful",
  "metadata": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "refresh_token_here",
    "expiresIn": 3600,
    "user": {
      "id": "507f1f77bcf86cd799439071",
      "email": "user@example.com",
      "role": "admin"
    }
  }
}
```

#### Authenticated Requests

```http
# Include Bearer token in Authorization header
GET /v1/api/students
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Planned Authorization Levels

| Role | Permissions |
|------|-------------|
| **Admin** | Full access to all resources |
| **Faculty** | Read/write access to assigned courses and students |
| **Student** | Read access to own records |
| **Staff** | Administrative access to specific modules |

### Security Headers

```http
# Security headers to be implemented
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
X-XSS-Protection: 1; mode=block
Strict-Transport-Security: max-age=31536000; includeSubDomains
```

## How to Extend the API

### Adding New Endpoints

#### 1. Create Controller

```typescript
// src/controllers/new-entity.controller.ts
import { injectable, inject } from "inversify";
import { Request, Response, NextFunction } from 'express';
import { INewEntityService } from '../interfaces/services/new-entity.service.interface';
import { CREATED, OK } from '../responses/success.responses';
import { TYPES } from '../configs/di.types';

@injectable()
export class NewEntityController {
    constructor(
        @inject(TYPES.NewEntityService) private newEntityService: INewEntityService
    ) {}

    createEntity = async (req: Request, res: Response, next: NextFunction) => {
        const entityData = req.body;
        const newEntity = await this.newEntityService.createEntity(entityData);
        
        return new CREATED({
            message: 'Entity created successfully',
            metadata: { newEntity }
        }).send(res);
    }

    getAllEntities = async (req: Request, res: Response, next: NextFunction) => {
        const { page = "1", limit = "10" } = req.query;
        const result = await this.newEntityService.getAllEntities(
            parseInt(page as string), 
            parseInt(limit as string)
        );
        
        return new OK({
            message: 'Entities retrieved successfully',
            metadata: result
        }).send(res);
    }
}
```

#### 2. Create Routes

```typescript
// src/routes/new-entity.ts
import { Router } from "express";
import { container } from "../configs/di.container";
import { NewEntityController } from "../controllers/new-entity.controller";
import { TYPES } from "../configs/di.types";

const router = Router();
const controller = container.get<NewEntityController>(TYPES.NewEntityController);

router.post("/", controller.createEntity);
router.get("/", controller.getAllEntities);
router.get("/:id", controller.getEntityById);
router.put("/:id", controller.updateEntity);
router.delete("/:id", controller.deleteEntity);

export default router;
```

#### 3. Register Routes

```typescript
// src/routes/index.ts
import newEntity from "./new-entity";

// Add to existing routes
router.use("/v1/api/new-entities", newEntity);
```

#### 4. Update Swagger Documentation

```yaml
# swagger/docs/components/paths/new-entities.yaml
/v1/api/new-entities:
  get:
    tags:
      - NewEntities
    summary: Get all entities
    description: Retrieve a paginated list of entities
    operationId: getAllEntities
    parameters:
      - $ref: '../parameters/common.yaml#/Page'
      - $ref: '../parameters/common.yaml#/Limit'
    responses:
      '200':
        description: Entities retrieved successfully
        content:
          application/json:
            schema:
              allOf:
                - $ref: '../schemas/common.yaml#/SuccessResponse'
                - type: object
                  properties:
                    metadata:
                      type: object
                      properties:
                        entities:
                          type: array
                          items:
                            $ref: '../schemas/new-entity.yaml#/NewEntity'
                        pagination:
                          $ref: '../schemas/common.yaml#/PaginationInfo'
```

### Adding New Features

#### 1. Batch Operations

```http
# Batch create students
POST /v1/api/students/batch
Content-Type: application/json

{
  "students": [
    { "studentId": "22000003", "fullName": "Student 1", ... },
    { "studentId": "22000004", "fullName": "Student 2", ... }
  ]
}
```

#### 2. Export/Import Functionality

```http
# Export students as CSV
GET /v1/api/students/export?format=csv&departmentId=507f1f77bcf86cd799439011

# Import students from file
POST /v1/api/students/import
Content-Type: multipart/form-data
file: students.csv
```

#### 3. Advanced Filtering

```http
# Complex filtering
GET /v1/api/students?filter[department]=cs&filter[status]=active&filter[year]=2022&sort=-createdAt
```

### API Extension Best Practices

1. **Maintain Consistency**: Follow existing patterns and conventions
2. **Version Appropriately**: Use versioning for breaking changes
3. **Document Everything**: Update Swagger documentation
4. **Test Thoroughly**: Write comprehensive tests for new endpoints
5. **Validate Input**: Implement proper validation and error handling
6. **Security**: Ensure proper authorization checks
7. **Performance**: Consider pagination and caching for large datasets

## Performance and Security Considerations

### Performance Optimization

#### 1. Pagination

```http
# Always implement pagination for collections
GET /v1/api/students?page=1&limit=20

# Response includes pagination metadata
{
  "metadata": {
    "students": [...],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 1000,
      "totalPages": 50
    }
  }
}
```

#### 2. Field Selection

```http
# Allow clients to specify required fields
GET /v1/api/students?fields=studentId,fullName,email
```

#### 3. Caching Headers

```http
# Implement appropriate caching
Cache-Control: public, max-age=300
ETag: "33a64df551425fcc55e4d42a148795d9f25f89d4"
Last-Modified: Wed, 15 Jan 2024 10:30:00 GMT
```

### Security Considerations

#### 1. Input Validation

- Validate all input data
- Sanitize user inputs
- Use strict type checking
- Implement rate limiting

#### 2. Data Protection

- Never expose sensitive data in responses
- Hash passwords and sensitive information
- Use HTTPS in production
- Implement proper CORS policies

#### 3. Error Handling

```typescript
// Don't expose internal details
// Bad
{
  "error": "Database connection failed: Connection refused at mongodb://localhost:27017"
}

// Good
{
  "status": "error",
  "code": 500,
  "message": "Internal server error"
}
```

#### 4. Rate Limiting

```http
# Implement rate limiting headers
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1642248600
```

---

*This document provides comprehensive guidelines for the Student Management System Web API. Follow these patterns and conventions to maintain consistency and reliability across all API endpoints.* 