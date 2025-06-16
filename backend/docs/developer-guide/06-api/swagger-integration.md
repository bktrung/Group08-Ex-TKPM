# Swagger Integration

*This document provides comprehensive guidelines for API documentation using Swagger/OpenAPI in the Student Management System.*

## Table of Contents

1. [Swagger Overview](#swagger-overview)
2. [Setup and Configuration](#setup-and-configuration)
3. [API Documentation Best Practices](#api-documentation-best-practices)
4. [Schema Definition Patterns](#schema-definition-patterns)
5. [Interactive Documentation Usage](#interactive-documentation-usage)
6. [Swagger UI Customization](#swagger-ui-customization)
7. [API Specification Maintenance](#api-specification-maintenance)
8. [Advanced Features](#advanced-features)
9. [Integration with Development Workflow](#integration-with-development-workflow)
10. [Troubleshooting and Common Issues](#troubleshooting-and-common-issues)

## Swagger Overview

### What is Swagger/OpenAPI?

Swagger (now OpenAPI) is a specification for documenting REST APIs. It provides:

- **Interactive Documentation**: Auto-generated, interactive API documentation
- **Code Generation**: Generate client SDKs and server stubs
- **API Testing**: Test API endpoints directly from the documentation
- **Validation**: Validate requests and responses against the schema
- **Standardization**: Industry-standard API specification format

### Current Implementation

Our Student Management System uses:

- **OpenAPI Version**: 3.0.3
- **Specification Location**: `swagger/docs/swagger.yaml`
- **Documentation URL**: `http://localhost:3456/api-docs`
- **Component-Based Structure**: Modular YAML files for maintainability

## Setup and Configuration

### Project Structure

```
swagger/
├── docs/
│   ├── swagger.yaml                    # Main OpenAPI specification
│   ├── components/
│   │   ├── schemas/
│   │   │   ├── common.yaml            # Common response/error schemas
│   │   │   ├── student.yaml           # Student entity schemas
│   │   │   ├── department.yaml        # Department entity schemas
│   │   │   ├── program.yaml            # Program entity schemas
│   │   │   └── course.yaml             # Course entity schemas
│   │   ├── responses/
│   │   │   └── common.yaml            # Standard response definitions
│   │   ├── parameters/
│   │   │   └── common.yaml            # Reusable parameters
│   │   └── paths/
│   │       ├── students.yaml          # Student endpoints
│   │       ├── departments.yaml       # Department endpoints
│   │       └── programs.yaml          # Program endpoints
├── README.md                          # Swagger documentation guide
└── API_DOCUMENTATION_GUIDE.md        # API documentation best practices
```

### Main Configuration

The main `swagger.yaml` file contains the OpenAPI specification:

```yaml
openapi: 3.0.3
info:
  title: Student Management System API
  description: |
    Comprehensive API for managing students, departments, programs, and academic records.
    
    ## Features
    - Student enrollment and records management
    - Course and class management
    - Grade and transcript management
    - Data import/export functionality
    
    ## Response Format
    All responses follow a consistent format with `status`, `code`, `message`, and `metadata` fields.
    
    ## Error Handling
    Errors are returned with appropriate HTTP status codes and descriptive messages.
    The API supports internationalization (i18n) for error messages.
  
  version: 1.0.0
  contact:
    name: API Support
    email: support@example.com
  license:
    name: MIT
    url: https://opensource.org/licenses/MIT

servers:
  - url: http://localhost:3456
    description: Development server
  - url: https://api.yourdomain.com
    description: Production server

tags:
  - name: Students
    description: Student management operations
  - name: Departments
    description: Department management operations
  - name: Programs
    description: Program management operations
  # ... additional tags
```

### Integration with Express Application

```typescript
// src/app.ts
import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';
import path from 'path';

const app = express();

// Load Swagger specification
const swaggerDocument = YAML.load(path.join(__dirname, '../swagger/docs/swagger.yaml'));

// Swagger UI setup
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: "Student Management System API",
  customfavIcon: "/favicon.ico"
}));

// Serve raw OpenAPI spec
app.get('/swagger.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerDocument);
});
```

## API Documentation Best Practices

### 1. Comprehensive Descriptions

Write clear, detailed descriptions for all API components:

```yaml
paths:
  /v1/api/students:
    get:
      summary: Get all students
      description: |
        Retrieve a paginated list of all students with optional filtering.
        
        This endpoint supports:
        - Pagination with page and limit parameters
        - Filtering by department, status, and other attributes
        - Sorting by various fields including creation time
        
        ## Usage Examples
        - Get first 10 students: `?page=1&limit=10`
        - Filter by department: `?departmentId=507f1f77bcf86cd799439011`
        - Sort by name: `?sort=fullName`
      operationId: getAllStudents
      tags:
        - Students
      # ... parameters and responses
```

### 2. Consistent Naming Conventions

Use consistent naming patterns across the API:

```yaml
# Operation IDs follow verb + noun pattern
operationId: getAllStudents      # GET collection
operationId: getStudentById      # GET individual
operationId: createStudent       # POST
operationId: updateStudent       # PUT
operationId: deleteStudent       # DELETE

# Schema names use PascalCase
$ref: '#/components/schemas/Student'
$ref: '#/components/schemas/StudentCreateRequest'
$ref: '#/components/schemas/StudentUpdateRequest'
```

### 3. Detailed Parameter Descriptions

Provide comprehensive parameter documentation:

```yaml
parameters:
  - name: page
    in: query
    description: |
      Page number for pagination (1-based).
      
      **Default**: 1  
      **Minimum**: 1  
      **Example**: `?page=2` to get the second page
    required: false
    schema:
      type: integer
      minimum: 1
      default: 1
      example: 1
  
  - name: limit
    in: query
    description: |
      Number of items per page.
      
      **Default**: 10  
      **Range**: 1-100  
      **Example**: `?limit=20` to get 20 items per page
    required: false
    schema:
      type: integer
      minimum: 1
      maximum: 100
      default: 10
      example: 10
```

### 4. Comprehensive Examples

Include realistic examples for requests and responses:

```yaml
requestBody:
  required: true
  content:
    application/json:
      schema:
        $ref: '#/components/schemas/StudentCreateRequest'
      examples:
        complete_student:
          summary: Complete student record
          description: Example of creating a student with all fields
          value:
            studentId: "22000002"
            fullName: "Trần Thị B"
            dateOfBirth: "2000-05-20T00:00:00.000Z"
            gender: "Nữ"
            department: "507f1f77bcf86cd799439011"
            schoolYear: 2022
            program: "507f1f77bcf86cd799439013"
            mailingAddress:
              houseNumberStreet: "123 Nguyen Van Cu"
              wardCommune: "Ward 1"
              districtCounty: "District 5"
              provinceCity: "Ho Chi Minh City"
              country: "Vietnam"
            email: "tranthib@student.hcmus.edu.vn"
            phoneNumber: "0987654321"
            nationality: "Vietnamese"
        
        minimal_student:
          summary: Minimal required fields
          description: Example with only required fields
          value:
            studentId: "22000003"
            fullName: "Nguyễn Văn C"
            email: "nguyenvanc@student.hcmus.edu.vn"
            department: "507f1f77bcf86cd799439011"
            program: "507f1f77bcf86cd799439013"
```

## Schema Definition Patterns

### 1. Common Response Patterns

Define reusable response schemas:

```yaml
# components/schemas/common.yaml
SuccessResponse:
  type: object
  properties:
    status:
      type: string
      enum: ["success"]
      example: "success"
    code:
      type: integer
      example: 200
      description: HTTP status code
    message:
      type: string
      example: "Operation completed successfully"
      description: Human-readable success message
    metadata:
      type: object
      description: Response data specific to the endpoint
  required:
    - status
    - code
    - message

ErrorResponse:
  type: object
  properties:
    status:
      type: string
      enum: ["error"]
      example: "error"
    code:
      type: integer
      example: 400
      description: HTTP status code
    message:
      type: string
      example: "Bad Request"
      description: Human-readable error message
    stack:
      type: string
      description: Stack trace (only in development environment)
  required:
    - status
    - code
    - message

PaginationInfo:
  type: object
  properties:
    page:
      type: integer
      minimum: 1
      example: 1
      description: Current page number
    limit:
      type: integer
      minimum: 1
      maximum: 100
      example: 10
      description: Number of items per page
    total:
      type: integer
      minimum: 0
      example: 50
      description: Total number of items
    totalPages:
      type: integer
      minimum: 0
      example: 5
      description: Total number of pages
  required:
    - page
    - limit
    - total
    - totalPages
```

### 2. Entity Schema Patterns

Create comprehensive entity schemas:

```yaml
# components/schemas/student.yaml
Student:
  type: object
  properties:
    _id:
      $ref: '../common.yaml#/ObjectId'
      description: Unique database identifier
    studentId:
      type: string
      pattern: '^[0-9]{8}$'
      example: "22000001"
      description: Unique student identification number
    fullName:
      type: string
      minLength: 2
      maxLength: 100
      example: "Nguyễn Văn A"
      description: Student's full name
    dateOfBirth:
      type: string
      format: date-time
      example: "1999-01-15T00:00:00.000Z"
      description: Student's date of birth
    gender:
      type: string
      enum: ["Nam", "Nữ", "Khác"]
      example: "Nam"
      description: Student's gender
    email:
      type: string
      format: email
      example: "nguyenvana@student.hcmus.edu.vn"
      description: Student's email address (must be unique)
    phoneNumber:
      type: string
      pattern: '^(\+84|0)[0-9]{9,10}$'
      example: "0901234567"
      description: Student's phone number
    department:
      oneOf:
        - $ref: '../common.yaml#/ObjectId'
        - $ref: 'department.yaml#/Department'
      description: Student's department (can be ID or populated object)
    program:
      oneOf:
        - $ref: '../common.yaml#/ObjectId'
        - $ref: 'program.yaml#/Program'
      description: Student's academic program
    status:
      oneOf:
        - $ref: '../common.yaml#/ObjectId'
        - $ref: '#/StudentStatus'
      description: Student's current status
    identityDocument:
      $ref: '#/IdentityDocument'
      description: Student's identity document information
    mailingAddress:
      $ref: '#/Address'
      description: Student's mailing address
    nationality:
      type: string
      example: "Vietnamese"
      description: Student's nationality
    schoolYear:
      type: integer
      minimum: 1900
      maximum: 2100
      example: 2022
      description: Year student entered the school
    createdAt:
      type: string
      format: date-time
      example: "2024-01-15T10:30:00.000Z"
      description: Record creation timestamp
    updatedAt:
      type: string
      format: date-time
      example: "2024-01-15T10:30:00.000Z"
      description: Record last update timestamp
  required:
    - studentId
    - fullName
    - email
    - department
    - program

StudentCreateRequest:
  type: object
  properties:
    studentId:
      type: string
      pattern: '^[0-9]{8}$'
      example: "22000002"
    fullName:
      type: string
      minLength: 2
      maxLength: 100
      example: "Trần Thị B"
    dateOfBirth:
      type: string
      format: date-time
      example: "2000-05-20T00:00:00.000Z"
    # ... other properties
  required:
    - studentId
    - fullName
    - email
    - department
    - program

StudentUpdateRequest:
  type: object
  properties:
    fullName:
      type: string
      minLength: 2
      maxLength: 100
      example: "Trần Thị B Updated"
    email:
      type: string
      format: email
      example: "updated.email@student.hcmus.edu.vn"
    # ... other updateable properties
  # No required fields for updates
```

### 3. Nested Schema Patterns

Handle complex nested objects:

```yaml
Address:
  type: object
  properties:
    houseNumberStreet:
      type: string
      example: "123 Nguyen Van Cu"
      description: House number and street name
    wardCommune:
      type: string
      example: "Ward 1"
      description: Ward or commune
    districtCounty:
      type: string
      example: "District 5"
      description: District or county
    provinceCity:
      type: string
      example: "Ho Chi Minh City"
      description: Province or city
    country:
      type: string
      example: "Vietnam"
      description: Country name
  required:
    - houseNumberStreet
    - provinceCity
    - country

IdentityDocument:
  type: object
  properties:
    type:
      type: string
      enum: ["CCCD", "CMND", "Passport"]
      example: "CCCD"
      description: Type of identity document
    number:
      type: string
      pattern: '^[0-9A-Z]{9,12}$'
      example: "038204012567"
      description: Document number
    issueDate:
      type: string
      format: date
      example: "2018-02-03"
      description: Document issue date
    expiryDate:
      type: string
      format: date
      example: "2030-03-02"
      description: Document expiry date
    issuedBy:
      type: string
      example: "Cong An TP HCM"
      description: Issuing authority
    hasChip:
      type: boolean
      example: true
      description: Whether the document has an electronic chip
  required:
    - type
    - number
    - issueDate
    - issuedBy
```

## Interactive Documentation Usage

### Accessing Swagger UI

Navigate to `http://localhost:3456/api-docs` to access the interactive documentation.

### Features Available

#### 1. API Exploration

- **Browse Endpoints**: View all available endpoints organized by tags
- **View Details**: Expand endpoints to see parameters, request/response schemas
- **Example Values**: See example requests and responses

#### 2. Interactive Testing

```http
# Test endpoint directly from the UI
1. Click "Try it out" button
2. Fill in required parameters
3. Modify request body if needed
4. Click "Execute"
5. View response with status code, headers, and body
```

#### 3. Schema Documentation

- **Model Definitions**: View detailed schema definitions
- **Property Details**: See field types, constraints, and descriptions
- **Example Objects**: Preview example data structures

#### 4. Download Specifications

```bash
# Download OpenAPI specification
curl http://localhost:3456/swagger.json > openapi.json

# Convert to different formats
npx swagger-codegen generate -i openapi.json -l html2 -o ./docs
```

## Swagger UI Customization

### Basic Customization

```typescript
// Custom Swagger UI configuration
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument, {
  customCss: `
    .swagger-ui .topbar { display: none }
    .swagger-ui .info { margin: 20px 0; }
    .swagger-ui .scheme-container { 
      background: #fafafa; 
      padding: 10px; 
    }
  `,
  customSiteTitle: "Student Management System API",
  customfavIcon: "/favicon.ico",
  swaggerOptions: {
    persistAuthorization: true,
    displayRequestDuration: true,
    docExpansion: 'list',
    filter: true,
    showExtensions: true,
    tryItOutEnabled: true
  }
}));
```

### Advanced Customization

```typescript
// Custom Swagger UI with additional features
const customSwaggerOptions = {
  explorer: true,
  swaggerOptions: {
    urls: [
      {
        url: '/swagger.json',
        name: 'Student Management System API v1'
      }
    ],
    requestInterceptor: (request) => {
      // Add custom headers
      request.headers['X-API-Version'] = '1.0.0';
      return request;
    },
    responseInterceptor: (response) => {
      // Log API calls
      console.log('API Response:', response.status, response.url);
      return response;
    }
  }
};

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument, customSwaggerOptions));
```

### Custom Themes

```css
/* Custom CSS for dark theme */
.swagger-ui {
  font-family: 'Inter', sans-serif;
}

.swagger-ui .topbar {
  background-color: #1a1a1a;
}

.swagger-ui .info .title {
  color: #ffffff;
}

.swagger-ui .scheme-container {
  background-color: #2d2d2d;
  border: 1px solid #404040;
}

.swagger-ui .opblock .opblock-summary {
  border-left: 4px solid #61affe;
}
```

## API Specification Maintenance

### 1. Modular Organization

Keep documentation organized in separate files:

```
components/
├── schemas/
│   ├── entities/           # Core entity schemas
│   │   ├── student.yaml
│   │   ├── course.yaml
│   │   └── enrollment.yaml
│   ├── requests/           # Request body schemas
│   │   ├── student-requests.yaml
│   │   └── course-requests.yaml
│   └── responses/          # Response schemas
│       ├── success.yaml
│       └── errors.yaml
├── parameters/             # Reusable parameters
│   ├── pagination.yaml
│   └── filtering.yaml
└── paths/                  # Endpoint definitions
    ├── students/
    │   ├── collection.yaml
    │   ├── individual.yaml
    │   └── search.yaml
    └── courses/
        ├── collection.yaml
        └── individual.yaml
```

### 2. Version Control Integration

```bash
# Git hooks for documentation validation
# .git/hooks/pre-commit
#!/bin/bash
echo "Validating OpenAPI specification..."

# Validate YAML syntax
yamllint swagger/docs/**/*.yaml

# Validate OpenAPI specification
npx swagger-parser validate swagger/docs/swagger.yaml

# Check for breaking changes (if previous version exists)
if [ -f "swagger/docs/previous-version.yaml" ]; then
  npx oasdiff swagger/docs/previous-version.yaml swagger/docs/swagger.yaml
fi
```

### 3. Automated Documentation Updates

```typescript
// Generate documentation from code annotations
import { generateSwaggerSpec } from './tools/swagger-generator';

// JSDoc comments in controllers
/**
 * @swagger
 * /v1/api/students:
 *   get:
 *     summary: Get all students
 *     tags: [Students]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Students retrieved successfully
 */
export class StudentController {
  async getAllStudents(req: Request, res: Response) {
    // Implementation
  }
}

// Auto-generate updated specification
generateSwaggerSpec('./src', './swagger/docs/generated.yaml');
```

### 4. Documentation Review Process

```yaml
# GitHub Actions workflow for documentation review
name: API Documentation Review

on:
  pull_request:
    paths:
      - 'swagger/**'
      - 'src/controllers/**'
      - 'src/routes/**'

jobs:
  validate-docs:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Validate OpenAPI Spec
        run: |
          npm install -g swagger-parser
          swagger-parser validate swagger/docs/swagger.yaml
      
      - name: Check for Breaking Changes
        run: |
          npm install -g oasdiff
          if [ -f "main-branch-swagger.yaml" ]; then
            oasdiff main-branch-swagger.yaml swagger/docs/swagger.yaml
          fi
      
      - name: Generate Documentation Preview
        run: |
          npm install -g redoc-cli
          redoc-cli build swagger/docs/swagger.yaml --output docs-preview.html
      
      - name: Upload Preview
        uses: actions/upload-artifact@v3
        with:
          name: documentation-preview
          path: docs-preview.html
```

## Advanced Features

### 1. Authentication Documentation

```yaml
# Document planned authentication
components:
  securitySchemes:
    BearerAuth:
      type: http
      scheme: bearer
      bearerFormat: JWT
      description: |
        JWT authentication for API access.
        
        **How to obtain a token:**
        1. Login via `/v1/api/auth/login`
        2. Include token in Authorization header
        3. Format: `Authorization: Bearer <token>`
    
    ApiKeyAuth:
      type: apiKey
      in: header
      name: X-API-Key
      description: API key for service-to-service authentication

# Apply security to endpoints
paths:
  /v1/api/students:
    get:
      security:
        - BearerAuth: []
      # ... rest of endpoint definition
```

### 2. Webhook Documentation

```yaml
# Document webhook endpoints
webhooks:
  studentCreated:
    post:
      summary: Student Created Webhook
      description: Triggered when a new student is created
      operationId: studentCreatedWebhook
      requestBody:
        content:
          application/json:
            schema:
              type: object
              properties:
                event:
                  type: string
                  example: "student.created"
                timestamp:
                  type: string
                  format: date-time
                data:
                  $ref: '#/components/schemas/Student'
      responses:
        '200':
          description: Webhook received successfully
```

### 3. API Deprecation

```yaml
# Mark deprecated endpoints
paths:
  /v1/api/students/legacy:
    get:
      deprecated: true
      summary: Get students (Legacy)
      description: |
        **⚠️ DEPRECATED**: This endpoint is deprecated and will be removed in v2.0.0.
        
        Use `/v1/api/students` instead.
        
        **Migration Guide:**
        - Replace `/students/legacy` with `/students`
        - Update response parsing to handle new format
        - See migration guide: [Link to migration docs]
      
      tags:
        - Students (Deprecated)
```

## Integration with Development Workflow

### 1. Development Commands

```json
{
  "scripts": {
    "docs:validate": "swagger-parser validate swagger/docs/swagger.yaml",
    "docs:serve": "swagger-ui-serve swagger/docs/swagger.yaml",
    "docs:build": "redoc-cli build swagger/docs/swagger.yaml --output public/api-docs.html",
    "docs:lint": "spectral lint swagger/docs/swagger.yaml",
    "docs:diff": "oasdiff swagger/docs/previous.yaml swagger/docs/swagger.yaml"
  }
}
```

### 2. IDE Integration

```yaml
# VS Code settings for YAML editing
# .vscode/settings.json
{
  "yaml.schemas": {
    "https://raw.githubusercontent.com/OAI/OpenAPI-Specification/main/schemas/v3.0/schema.json": [
      "swagger/docs/**/*.yaml"
    ]
  },
  "yaml.format.enable": true,
  "yaml.validate": true
}
```

### 3. Automated Testing

```typescript
// Test API against specification
import { validateApiResponse } from 'swagger-response-validator';

describe('API Specification Compliance', () => {
  const validator = validateApiResponse({
    apiDocumentPath: './swagger/docs/swagger.yaml'
  });

  it('should match specification for GET /students', async () => {
    const response = await request(app)
      .get('/v1/api/students')
      .expect(200);

    const result = validator.validateResponse('get', '/v1/api/students', response);
    expect(result.errors).toEqual([]);
  });
});
```

## Troubleshooting and Common Issues

### 1. Validation Errors

```bash
# Common validation issues and solutions

# Issue: Invalid YAML syntax
Error: YAMLException: bad indentation
Solution: Check indentation (use spaces, not tabs)

# Issue: Circular references
Error: Schema contains circular reference
Solution: Use $ref to break circular dependencies

# Issue: Missing required properties
Error: Missing required property 'operationId'
Solution: Add operationId to all endpoints
```

### 2. Performance Issues

```yaml
# Optimize large specifications

# Use external references
$ref: './external-schemas/student.yaml#/Student'

# Split large files
# Instead of one large swagger.yaml:
paths:
  $ref: './paths/index.yaml'
components:
  $ref: './components/index.yaml'
```

### 3. Browser Compatibility

```html
<!-- Ensure Swagger UI works across browsers -->
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <!-- Use specific Swagger UI version for consistency -->
  <link rel="stylesheet" type="text/css" href="https://unpkg.com/swagger-ui-dist@4.15.5/swagger-ui.css" />
</head>
<body>
  <div id="swagger-ui"></div>
  <script src="https://unpkg.com/swagger-ui-dist@4.15.5/swagger-ui-bundle.js"></script>
  <script>
    SwaggerUIBundle({
      url: '/swagger.json',
      dom_id: '#swagger-ui',
      supportedSubmitMethods: ['get', 'post', 'put', 'delete', 'patch'],
      onComplete: function() {
        console.log('Swagger UI loaded successfully');
      }
    });
  </script>
</body>
</html>
```

### 4. Security Considerations

```yaml
# Avoid exposing sensitive information
components:
  schemas:
    User:
      type: object
      properties:
        id: 
          type: string
        email:
          type: string
        # DON'T include password in schema
        # password:
        #   type: string
```

---

*This document provides comprehensive guidelines for Swagger integration in the Student Management System. Follow these practices to maintain high-quality, interactive API documentation that enhances developer experience and API adoption.* 