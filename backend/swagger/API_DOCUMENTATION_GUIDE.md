# API Documentation Guide for Student Management System

## Overview

This guide explains how to add comprehensive API documentation to the Student Management System by analyzing existing code patterns and following established conventions.

## Project Architecture Analysis

### File Structure Pattern
```
src/
├── routes/{module}/index.ts          # API endpoint definitions
├── controllers/{module}.controller.ts # Request handling logic
├── services/{module}.service.ts       # Business logic
├── models/{module}.model.ts           # Database schemas
├── validators/{module}/               # Request validation
│   ├── create-{module}.validator.ts
│   ├── update-{module}.validator.ts
│   └── ...
└── interfaces/                       # TypeScript interfaces
```

### Documentation Structure
```
swagger/
├── docs/
│   ├── swagger.yaml                  # Main OpenAPI specification
│   └── swagger-config.json           # Swagger UI configuration
├── README.md                         # Documentation overview
└── API_DOCUMENTATION_GUIDE.md        # This guide
```

## Step-by-Step Documentation Process

### Step 1: Analyze Route Structure

**File to examine**: `src/routes/{module}/index.ts`

**What to look for**:
- HTTP methods (GET, POST, PATCH, DELETE)
- Route paths and parameters
- Middleware usage (validators, authentication)
- Controller method calls

**Example from Address API**:
```typescript
// src/routes/address/index.ts
router.get('/countries', asyncHandler((req, res, next) => 
    getAddressController().getCountries(req, res, next)
));
router.get('/children/:geonameId', asyncHandler((req, res, next) => 
    getAddressController().getChildren(req, res, next)
));
```

**Documentation implications**:
- `/countries` → GET endpoint, no parameters
- `/children/:geonameId` → GET endpoint, requires geonameId path parameter

### Step 2: Examine Controller Logic

**File to examine**: `src/controllers/{module}.controller.ts`

**What to look for**:
- Request parameter extraction
- Service method calls
- Response structure and messages
- Error handling patterns

**Example from Semester Controller**:
```typescript
getAllSemesters = async (req: Request, res: Response, next: NextFunction) => {
    const { academicYear, semester, page, limit } = req.query;
    
    const semestersData = await this.semesterService.getAllSemesters({
        academicYear: academicYear as string,
        semester: semester as string,
        page: page as string,
        limit: limit as string
    });

    return new OK({
        message: 'Retrieved semesters successfully',
        metadata: semestersData,
    }).send(res);
}
```

**Documentation implications**:
- Query parameters: academicYear, semester, page, limit
- Response format: OK response with metadata containing semestersData
- Success message: "Retrieved semesters successfully"

### Step 3: Study Data Models

**File to examine**: `src/models/{module}.model.ts`

**What to look for**:
- Schema field definitions
- Required vs optional fields
- Data types and constraints
- Relationships (refs to other models)
- Default values

**Example from Course Model**:
```typescript
const courseSchema = new Schema<ICourse>({
    courseCode: {
        type: String,
        required: true,
        unique: true,
    },
    name: {
        type: String,
        required: true,
    },
    credits: {
        type: Number,
        required: true,
        min: 2,
        validate: {
            validator: Number.isInteger,
            message: 'Credits must be an integer greater than or equal to 2'
        },
    },
    department: {
        type: Schema.Types.ObjectId,
        ref: "Department",
        required: true,
    },
    // ... more fields
});
```

**Documentation implications**:
- courseCode: required string, unique
- name: required string
- credits: required integer, minimum 2
- department: required ObjectId reference to Department

### Step 4: Review Validation Rules

**Files to examine**: `src/validators/{module}/*.validator.ts`

**What to look for**:
- Joi validation schemas
- Required field definitions
- Data type validations
- Custom validation rules
- Error messages (often in Vietnamese)

**Example from Semester Validator**:
```typescript
export const createSemesterSchema = Joi.object({
    academicYear: Joi.string()
        .pattern(/^\d{4}-\d{4}$/)
        .required()
        .messages({
            'string.pattern.base': 'Năm học phải có định dạng YYYY-YYYY (vd: 2024-2025)',
            'any.required': 'Năm học là trường bắt buộc'
        }),
    semester: Joi.number()
        .valid(1, 2, 3)
        .required(),
    // ... more validations
});
```

**Documentation implications**:
- academicYear: string with pattern YYYY-YYYY, required
- semester: number, must be 1, 2, or 3, required
- Validation error messages available for documentation

### Step 5: Test API Endpoints

**Commands to use**:
```bash
# Test GET endpoints
curl -X GET "http://localhost:3456/v1/api/{module}" -H "Content-Type: application/json"

# Test POST endpoints
curl -X POST "http://localhost:3456/v1/api/{module}" \
  -H "Content-Type: application/json" \
  -d '{"field": "value"}'
```

**What to capture**:
- Actual response structure
- Real data examples
- Error response formats
- HTTP status codes

### Step 6: Add to Swagger Documentation

#### 6.1 Add Tags
```yaml
tags:
  - name: ModuleName
    description: Module description and operations
```

#### 6.2 Define Paths
```yaml
paths:
  /v1/api/module:
    get:
      tags:
        - ModuleName
      summary: Brief description
      description: Detailed description
      operationId: uniqueOperationId
      parameters:
        - name: paramName
          in: query|path
          required: true|false
          description: Parameter description
          schema:
            type: string|integer|boolean
            example: "example value"
      responses:
        '200':
          description: Success response description
          content:
            application/json:
              schema:
                allOf:
                  - $ref: '#/components/schemas/SuccessResponse'
                  - type: object
                    properties:
                      metadata:
                        type: object
                        properties:
                          dataField:
                            $ref: '#/components/schemas/SchemaName'
              example:
                status: "success"
                code: 200
                message: "Operation completed successfully"
                metadata:
                  dataField: {}
```

#### 6.3 Define Schemas
```yaml
components:
  schemas:
    ModuleName:
      type: object
      properties:
        _id:
          $ref: '#/components/schemas/ObjectId'
        fieldName:
          type: string
          example: "Example value"
          description: "Field description"
        requiredField:
          type: string
          description: "Required field description"
      required:
        - _id
        - requiredField

    ModuleCreateRequest:
      type: object
      properties:
        fieldName:
          type: string
          example: "Example value"
          description: "Field description"
      required:
        - fieldName

    ModuleUpdateRequest:
      type: object
      properties:
        fieldName:
          type: string
          example: "Updated value"
          description: "Field description"
```

## Response Format Patterns

### Success Response Structure
All APIs follow this pattern:
```json
{
  "status": "success",
  "code": 200,
  "message": "Operation completed successfully",
  "metadata": {
    // Actual response data here
  }
}
```

### Error Response Structure
```json
{
  "status": "error",
  "code": 400,
  "message": "Error description",
  "stack": "Stack trace (development only)"
}
```

### Common HTTP Status Codes
- `200` - OK (successful GET, PATCH, DELETE)
- `201` - Created (successful POST)
- `400` - Bad Request (invalid parameters)
- `404` - Not Found (resource doesn't exist)
- `422` - Validation Error (Joi validation failed)
- `500` - Internal Server Error

## Documentation Examples

### Address API Documentation Pattern

**Endpoints analyzed**:
- `GET /v1/api/address/countries` - No parameters, returns array of countries
- `GET /v1/api/address/children/{geonameId}` - Path parameter, returns nested object
- `GET /v1/api/address/nationalities` - No parameters, returns array of strings

**Key patterns**:
- Simple GET endpoints with no request body
- Path parameters for specific resource lookup
- Consistent response wrapper with metadata
- Real-world data examples from API testing

### Semester API Documentation Pattern

**Endpoints analyzed**:
- `GET /v1/api/semesters` - Query parameters for filtering and pagination
- `POST /v1/api/semesters` - Request body with complex validation
- `PATCH /v1/api/semesters/{id}` - Path parameter + request body
- `DELETE /v1/api/semesters/{id}` - Path parameter only
- `GET /v1/api/semesters/{academicYear}/{semester}` - Multiple path parameters

**Key patterns**:
- Full CRUD operations
- Complex validation rules (date relationships, pattern matching)
- Pagination support with query parameters
- Multiple path parameter combinations

### Course API Documentation Pattern

**Endpoints analyzed**:
- `GET /v1/api/courses` - Query parameters for filtering
- `POST /v1/api/courses` - Request body with relationships
- `PATCH /v1/api/courses/{courseCode}` - String path parameter (not ObjectId)
- `DELETE /v1/api/courses/{courseCode}` - String path parameter

**Key patterns**:
- Non-ObjectId path parameters (courseCode)
- Relationship fields (department reference, prerequisites array)
- Minimum value constraints (credits >= 2)
- Optional array fields (prerequisites)

## Best Practices

### 1. Consistency
- Follow the same pattern for all APIs
- Use consistent naming conventions
- Maintain the same response structure

### 2. Completeness
- Document all endpoints, parameters, and responses
- Include both success and error scenarios
- Provide realistic examples

### 3. Accuracy
- Test all endpoints before documenting
- Keep schemas in sync with actual models
- Update documentation when APIs change

### 4. Usability
- Write clear descriptions and summaries
- Use meaningful examples
- Group related endpoints with tags

### 5. Validation Documentation
- Document all validation rules
- Include pattern requirements
- Specify required vs optional fields

## Common Patterns in the Codebase

### 1. Dependency Injection
Controllers use dependency injection with inversify:
```typescript
@injectable()
export class ModuleController {
    constructor(
        @inject(TYPES.ModuleService) private moduleService: IModuleService
    ) {}
}
```

### 2. Async Handler Wrapper
All routes use asyncHandler for error handling:
```typescript
router.get('/', asyncHandler((req, res, next) => 
    getController().method(req, res, next)
));
```

### 3. Response Classes
Consistent response formatting with response classes:
```typescript
return new OK({
    message: 'Success message',
    metadata: { data }
}).send(res);

return new CREATED({
    message: 'Created message',
    metadata: { newItem }
}).send(res);
```

### 4. Validation Middleware
Joi validation applied as middleware:
```typescript
router.post('', createValidator, asyncHandler(...));
```

## Troubleshooting

### Common Issues

1. **Swagger UI not loading**
   - Check if server is running on correct port
   - Verify swagger.yaml syntax is valid
   - Check browser console for errors

2. **Schema references not resolving**
   - Ensure all referenced schemas are defined
   - Check for typos in $ref paths
   - Verify schema names match exactly

3. **Examples not displaying**
   - Validate JSON syntax in examples
   - Ensure examples match schema structure
   - Check for missing required fields

### Validation Commands

```bash
# Check if server is running
curl -X GET "http://localhost:3456/api-docs.json" | head -5

# Test specific endpoint
curl -X GET "http://localhost:3456/v1/api/{module}" -H "Content-Type: application/json"

# Validate YAML syntax
npx swagger-jsdoc -d swagger/docs/swagger.yaml
```

## Next Steps

After documenting an API module:

1. **Test the documentation**
   - Visit http://localhost:3456/api-docs
   - Try the "Try it out" feature for each endpoint
   - Verify all schemas are visible

2. **Update the README**
   - Move the API from "Pending Documentation" to "Currently Documented APIs"
   - Add the new schemas to the schema list
   - Update any relevant sections

3. **Validate completeness**
   - Ensure all endpoints are documented
   - Check that all request/response examples are accurate
   - Verify error responses are included

4. **Maintain consistency**
   - Follow the same patterns as existing documentation
   - Use consistent naming and formatting
   - Keep the same level of detail

This guide provides the foundation for documenting any remaining APIs in the system following the same thorough analysis and documentation patterns. 