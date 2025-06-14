# Swagger API Documentation

## Overview
This directory contains the Swagger/OpenAPI documentation for the Student Management System API. The documentation uses a consolidated YAML structure for reliable loading and display.

## Structure
```
swagger/
├── docs/
│   ├── swagger.yaml              # Main OpenAPI specification (consolidated)
│   ├── swagger-config.json       # Swagger UI configuration
│   └── components/               # Component files (for reference/future modular approach)
│       ├── schemas/              # Data model definitions
│       ├── responses/            # Response templates
│       ├── parameters/           # Reusable parameters
│       └── paths/                # API endpoint definitions
└── README.md                     # This file
```

## Access Points

### Swagger UI
- **URL**: http://localhost:3456/api-docs
- **Description**: Interactive API documentation with testing capabilities
- **Status**: ✅ **WORKING** - Full documentation with schemas and endpoints

### Raw OpenAPI JSON
- **URL**: http://localhost:3456/api-docs.json
- **Description**: Raw OpenAPI specification in JSON format
- **Status**: ✅ **WORKING** - Complete API specification available

## Currently Documented APIs

### Departments API (`/v1/api/departments`)
- ✅ `GET /v1/api/departments` - Get all departments
- ✅ `POST /v1/api/departments` - Create a new department
- ✅ `PATCH /v1/api/departments/{id}` - Update a department
- ✅ `DELETE /v1/api/departments/{id}` - Delete a department

### Programs API (`/v1/api/programs`)
- ✅ `GET /v1/api/programs` - Get all programs
- ✅ `POST /v1/api/programs` - Create a new program
- ✅ `PATCH /v1/api/programs/{id}` - Update a program
- ✅ `DELETE /v1/api/programs/{id}` - Delete a program

### Address API (`/v1/api/address`)
- ✅ `GET /v1/api/address/countries` - Get all countries with geonameIds
- ✅ `GET /v1/api/address/children/{geonameId}` - Get administrative divisions for a location
- ✅ `GET /v1/api/address/nationalities` - Get all nationalities

### Semesters API (`/v1/api/semesters`)
- ✅ `GET /v1/api/semesters` - Get all semesters with filtering and pagination
- ✅ `POST /v1/api/semesters` - Create a new semester
- ✅ `PATCH /v1/api/semesters/{id}` - Update a semester
- ✅ `DELETE /v1/api/semesters/{id}` - Delete a semester
- ✅ `GET /v1/api/semesters/{academicYear}/{semester}` - Get semester by academic year and number

### Courses API (`/v1/api/courses`)
- ✅ `GET /v1/api/courses` - Get all courses with filtering
- ✅ `POST /v1/api/courses` - Create a new course
- ✅ `PATCH /v1/api/courses/{courseCode}` - Update a course by course code
- ✅ `DELETE /v1/api/courses/{courseCode}` - Delete a course by course code

### Students API (`/v1/api/students`)
- ✅ `GET /v1/api/students` - Get all students with pagination
- ✅ `POST /v1/api/students` - Create a new student
- ✅ `PATCH /v1/api/students/{studentId}` - Update student by student ID
- ✅ `DELETE /v1/api/students/{studentId}` - Delete student by student ID
- ✅ `GET /v1/api/students/search` - Search students by name/ID
- ✅ `GET /v1/api/students/department/{departmentId}` - Get students by department
- ✅ `GET /v1/api/students/status-types` - Get all student status types
- ✅ `GET /v1/api/students/status-transitions` - Get status transition rules
- ✅ `PATCH /v1/api/students/{studentId}/status` - Update student status
- ✅ `GET /v1/api/students/{studentId}/status` - Get student status
- ✅ `GET /v1/api/students/{studentId}/status/history` - Get student status history
- ✅ `GET /v1/api/students/{studentId}/classes` - Get student's enrolled classes

### Classes API (`/v1/api/classes`)
- ✅ `GET /v1/api/classes` - Get all classes with filtering and pagination
- ✅ `POST /v1/api/classes` - Create a new class
- ✅ `GET /v1/api/classes/{classCode}` - Get class by class code
- ✅ `PATCH /v1/api/classes/{classCode}` - Update class by class code
- ✅ `DELETE /v1/api/classes/{classCode}` - Delete class by class code

### Enrollment API (`/v1/api/enrollment`)
- ✅ `POST /v1/api/enrollment` - Enroll student in class
- ✅ `POST /v1/api/enrollment/drop` - Drop student from class
- ✅ `GET /v1/api/enrollment/drop-history/{studentId}` - Get student drop history

### Grades API (`/v1/api/grades`)
- ✅ `POST /v1/api/grades` - Create a new grade
- ✅ `GET /v1/api/grades/class/{classCode}` - Get grades by class
- ✅ `GET /v1/api/grades/student/{studentId}/class/{classCode}` - Get grade by student and class
- ✅ `PATCH /v1/api/grades/{id}` - Update a grade
- ✅ `DELETE /v1/api/grades/{id}` - Delete a grade

## APIs Pending Documentation

### Transcripts API (`/v1/api/transcript`)
- ⏳ Transcript management operations

### Import/Export APIs (`/v1/api/import`, `/v1/api/export`)
- ⏳ Data import and export operations

## Features

### Response Format
All APIs follow a consistent response format:
```json
{
  "status": "success|error",
  "code": 200,
  "message": "Operation completed successfully",
  "metadata": {
    // Response data here
  }
}
```

### Error Handling
- Comprehensive error responses with appropriate HTTP status codes
- Internationalization (i18n) support for error messages
- Development mode includes stack traces

### Validation
- Request body validation using Joi schemas
- MongoDB ObjectId validation for path parameters
- Comprehensive input sanitization

### Interactive Testing
- **Try It Out**: All endpoints can be tested directly from the Swagger UI
- **Real Data**: API calls return actual data from the database
- **Request/Response Examples**: Complete examples for all operations

## Configuration

### Swagger UI Customization
The `swagger-config.json` file contains UI customization options:
- Custom CSS for branding
- UI behavior settings
- Feature toggles

### Server Configuration
The main `swagger.yaml` file defines server endpoints:
- Development: `http://localhost:3456`
- Production: `https://api.yourdomain.com` (to be updated)

## Technical Implementation

### Consolidated Structure
The current implementation uses a single `swagger.yaml` file with all schemas, paths, and responses defined inline. This approach ensures:
- ✅ Reliable loading without external reference issues
- ✅ Complete schema resolution
- ✅ Proper Swagger UI rendering
- ✅ All endpoints and models visible

### Schema Definitions
Currently includes complete schemas for:
- **Common**: ErrorResponse, SuccessResponse, ObjectId, Pagination
- **Department**: Department, DepartmentCreateRequest, DepartmentUpdateRequest
- **Program**: Program, ProgramCreateRequest, ProgramUpdateRequest
- **Address**: Country, GeonamesResult, GeonameEntry
- **Semester**: Semester, SemesterCreateRequest, SemesterUpdateRequest
- **Course**: Course, CourseCreateRequest, CourseUpdateRequest
- **Student**: Student, StudentCreateRequest, StudentUpdateRequest, StudentStatus, StudentStatusTransition, StudentStatusTransitionGroup
- **Class**: Class, ClassSchedule, ClassCreateRequest, ClassUpdateRequest
- **Enrollment**: Enrollment, EnrollmentWithDetails, EnrollmentCreateRequest, EnrollmentDropRequest
- **Grade**: Grade, GradeCreateRequest, GradeUpdateRequest

## API Documentation Guide

### How to Add New API Documentation

When documenting a new API module, follow this pattern:

1. **Analyze the Route Structure**
   - Check `src/routes/{module}/index.ts` for endpoint definitions
   - Note HTTP methods, paths, and middleware usage

2. **Examine Controllers**
   - Review `src/controllers/{module}.controller.ts` for request/response patterns
   - Understand the data flow and response structure

3. **Study Data Models**
   - Check `src/models/{module}.model.ts` for schema definitions
   - Note required fields, data types, and relationships

4. **Review Validators**
   - Examine `src/validators/{module}/` for validation rules
   - Understand required fields and validation constraints

5. **Test API Endpoints**
   - Use curl or Postman to test actual API responses
   - Document real response examples

6. **Add to Swagger YAML**
   - Add new tags to the `tags` section
   - Define paths in the `paths` section
   - Create schemas in `components/schemas`
   - Add appropriate response examples

### Documentation Pattern

Each API should include:
- **Tags**: Logical grouping of endpoints
- **Paths**: Complete endpoint definitions with parameters
- **Schemas**: Data models for requests and responses
- **Examples**: Real-world request/response examples
- **Validation**: Parameter and body validation rules
- **Error Responses**: Comprehensive error handling documentation

## Adding New API Documentation

To document a new API module:

1. **Add schemas** to the `components/schemas` section in `swagger.yaml`
2. **Add paths** to the `paths` section in `swagger.yaml`
3. **Add responses** to the `components/responses` section if needed
4. **Test the documentation** in Swagger UI at http://localhost:3456/api-docs

## Testing APIs

Use the Swagger UI at http://localhost:3456/api-docs to:
- ✅ View complete API documentation
- ✅ Test endpoints interactively with "Try it out" buttons
- ✅ See request/response examples
- ✅ Validate API responses against schemas
- ✅ View all available schemas and models

## Verification

To verify the documentation is working:

1. **Check Swagger UI**: Visit http://localhost:3456/api-docs
2. **Verify JSON spec**: Visit http://localhost:3456/api-docs.json
3. **Test endpoints**: Use the "Try it out" feature in Swagger UI
4. **Check schemas**: Expand the "Schemas" section to see all models

## Maintenance

- Keep schemas in sync with actual data models
- Update examples when API behavior changes
- Add new endpoints as they are developed
- Review and update error responses regularly
- Test documentation after any API changes 