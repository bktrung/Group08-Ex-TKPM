# Data Validation

This document covers the data validation patterns and practices used in the Student Management System. The application uses Joi for schema validation with custom error handling and internationalization support.

## Validation Architecture

### Validation Stack
1. **Joi Schema Definition**: Define validation rules
2. **Validation Middleware**: Process and validate requests
3. **Error Handling**: Transform validation errors into user-friendly messages
4. **Internationalization**: Support multiple languages for error messages

### Validation Flow
```
Request → Validation Middleware → Joi Schema → Error Translation → Response/Next
```

## Joi Schema Patterns

### 1. Basic Schema Structure

```typescript
import Joi from 'joi';
import { validateRequest } from '../../middlewares/validation.middleware';

export const createEntitySchema = Joi.object({
  // Required fields
  field1: Joi.string().required().messages({
    'string.empty': 'Field cannot be empty',
    'any.required': 'Field is required'
  }),
  
  // Optional fields
  field2: Joi.string().optional().allow('').messages({
    'string.base': 'Field must be a string'
  }),
  
  // Nested objects
  nestedObject: Joi.object({
    subField: Joi.string().required()
  }).required()
});

export const createEntityValidator = validateRequest(createEntitySchema);
```

### 2. Common Field Validation Patterns

#### String Validations
```typescript
// Basic string validation
name: Joi.string()
  .min(2)
  .max(100)
  .required()
  .messages({
    'string.empty': 'Name cannot be empty',
    'string.min': 'Name must be at least 2 characters',
    'string.max': 'Name cannot exceed 100 characters',
    'any.required': 'Name is required'
  }),

// Pattern validation (regex)
phoneNumber: Joi.string()
  .pattern(/^(\+84|0)[0-9]{9,10}$/)
  .required()
  .messages({
    'string.pattern.base': 'Phone number must be a valid Vietnamese phone number',
    'any.required': 'Phone number is required'
  }),

// Custom validation function
email: Joi.string()
  .email()
  .custom(isAllowedEmailDomain)
  .required()
  .messages({
    'string.email': 'Email must be a valid email address',
    'string.emailDomain': 'Email domain not allowed. Allowed domains: {domains}',
    'any.required': 'Email is required'
  })
```

#### Number Validations
```typescript
// Integer validation
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

// Year validation
schoolYear: Joi.number()
  .integer()
  .min(1990)
  .max(new Date().getFullYear())
  .required()
  .messages({
    'number.min': 'School year must be from 1990 onwards',
    'number.max': `School year cannot exceed current year (${new Date().getFullYear()})`,
    'any.required': 'School year is required'
  })
```

#### Date Validations
```typescript
// Past date validation
dateOfBirth: Joi.date()
  .required()
  .max('now')
  .messages({
    'date.base': 'Date of birth must be a valid date',
    'date.max': 'Date of birth cannot be in the future',
    'any.required': 'Date of birth is required'
  }),

// Future date validation
expiryDate: Joi.date()
  .required()
  .min('now')
  .messages({
    'date.base': 'Expiry date must be a valid date',
    'date.min': 'Expiry date must be after current date',
    'any.required': 'Expiry date is required'
  })
```

#### Enum Validations
```typescript
import { Gender } from '../../models/interfaces/student.interface';

gender: Joi.string()
  .valid(...Object.values(Gender))
  .required()
  .messages({
    'any.only': `Gender must be one of: ${Object.values(Gender).join(', ')}`,
    'any.required': 'Gender is required'
  })
```

#### MongoDB ObjectId Validations
```typescript
department: Joi.string()
  .pattern(/^[0-9a-fA-F]{24}$/)
  .required()
  .messages({
    'string.empty': 'Department ID cannot be empty',
    'string.pattern.base': 'Department ID is invalid (must be MongoDB ObjectId)',
    'any.required': 'Department is required'
  })
```

### 3. Complex Validation Patterns

#### Conditional Validation
```typescript
// Identity document validation with conditional schemas
const identityDocumentSchema = Joi.alternatives().try(
  // CMND schema
  Joi.object({
    type: Joi.string().valid(IdentityDocumentType.CMND).required(),
    number: Joi.string()
      .pattern(/^[0-9]{9}$/)
      .required()
      .messages({
        'string.pattern.base': 'CMND number must have exactly 9 digits'
      }),
    ...baseIdentityDocumentSchema
  }),
  
  // CCCD schema
  Joi.object({
    type: Joi.string().valid(IdentityDocumentType.CCCD).required(),
    number: Joi.string()
      .pattern(/^[0-9]{12}$/)
      .required()
      .messages({
        'string.pattern.base': 'CCCD number must have exactly 12 digits'
      }),
    hasChip: Joi.boolean().required(),
    ...baseIdentityDocumentSchema
  }),
  
  // Passport schema
  Joi.object({
    type: Joi.string().valid(IdentityDocumentType.PASSPORT).required(),
    number: Joi.string()
      .pattern(/^[A-Z][0-9]{8}$/)
      .required(),
    issuingCountry: Joi.string().required(),
    ...baseIdentityDocumentSchema
  })
).required().messages({
  'any.required': 'Identity document is required',
  'alternatives.match': 'Identity document is invalid'
});
```

#### Array Validations
```typescript
// Array of ObjectIds
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

// Array with min/max length
subjects: Joi.array()
  .items(Joi.string().required())
  .min(1)
  .max(10)
  .required()
  .messages({
    'array.min': 'At least one subject is required',
    'array.max': 'Cannot have more than 10 subjects',
    'any.required': 'Subjects are required'
  })
```

#### Nested Object Validations
```typescript
// Address validation (reusable schema)
export const addressSchema = Joi.object({
  houseNumberStreet: Joi.string().required().messages({
    'string.empty': 'House number/street cannot be empty',
    'any.required': 'House number/street is required'
  }),
  wardCommune: Joi.string().required().messages({
    'string.empty': 'Ward/commune cannot be empty',
    'any.required': 'Ward/commune is required'
  }),
  districtCounty: Joi.string().required().messages({
    'string.empty': 'District/county cannot be empty',
    'any.required': 'District/county is required'
  }),
  provinceCity: Joi.string().required().messages({
    'string.empty': 'Province/city cannot be empty',
    'any.required': 'Province/city is required'
  }),
  country: Joi.string().required().messages({
    'string.empty': 'Country cannot be empty',
    'any.required': 'Country is required'
  })
});

// Using nested schema
permanentAddress: addressSchema.optional(),
temporaryAddress: addressSchema.optional(),
mailingAddress: addressSchema.required()
```

## Custom Validation Functions

### 1. Email Domain Validation

```typescript
import configService from "../../configs/init.config";

const getAllowedEmailDomains = () => configService.get<string[]>("allowedEmailDomains");

export const isAllowedEmailDomain = (value: string, helpers: Joi.CustomHelpers) => {
  const allowedDomains = getAllowedEmailDomains();
  if (!allowedDomains || allowedDomains.length === 0) {
    return value;  // If no domains configured, allow all
  }

  const domain = value.split('@')[1];
  if (!allowedDomains.includes(domain)) {
    return helpers.error('string.emailDomain', { domains: allowedDomains.join(', ') });
  }
  return value;
};
```

### 2. Phone Number Validation

```typescript
const getPhoneFormats = () => configService.get<Record<string, string>>("phoneFormats");

export const isValidPhoneNumber = (value: string, helpers: Joi.CustomHelpers) => {
  const phoneFormats = getPhoneFormats();
  const formats = Object.keys(phoneFormats);

  for (const format of formats) {
    const regex = new RegExp(phoneFormats[format]);
    if (regex.test(value)) {
      return value;
    }
  }

  return helpers.error('string.phoneFormat', { formats: formats.join(', ') });
};
```

### 3. Business Logic Validation

```typescript
// Custom validation for business rules
export const validateEnrollmentPeriod = (value: Date, helpers: Joi.CustomHelpers) => {
  const currentDate = new Date();
  const enrollmentDeadline = new Date('2024-08-31'); // This could come from config
  
  if (currentDate > enrollmentDeadline) {
    return helpers.error('date.enrollmentClosed');
  }
  
  return value;
};
```

## Validation Middleware

### Core Validation Middleware

```typescript
// src/middlewares/validation.middleware.ts
import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import { BadRequestError } from '../responses/error.responses';

interface RequestWithI18n extends Request {
  t: any; // i18n translation function
}

export const validateRequest = (schema: Joi.ObjectSchema) => {
  return (req: RequestWithI18n, res: Response, next: NextFunction) => {
    const { error } = schema.validate(req.body, {
      abortEarly: false,    // Collect all errors
      stripUnknown: true    // Remove unknown fields
    });

    if (error) {
      // Map validation errors with translation support
      const translatedErrors = error.details.map(detail => {
        // Build structured key for translation
        const structuredKey = detail.path.join('.') + '.' + detail.type;
        
        // Try structured key first, fallback to message
        let translatedMessage = req.t(structuredKey, detail.context);
        
        if (translatedMessage === structuredKey) {
          translatedMessage = req.t(detail.message, detail.context);
        }
        
        return translatedMessage;
      });

      const errorMessage = translatedErrors.join(', ');
      return next(new BadRequestError(errorMessage));
    }

    next();
  };
};
```

### Query Parameter Validation

```typescript
export const validateQuery = (schema: Joi.ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error, value } = schema.validate(req.query, {
      abortEarly: false,
      stripUnknown: true,
      convert: true  // Convert string values to appropriate types
    });

    if (error) {
      const errorMessage = error.details.map(detail => detail.message).join(', ');
      return next(new BadRequestError(errorMessage));
    }

    // Replace req.query with validated and converted values
    req.query = value;
    next();
  };
};
```

### Path Parameter Validation

```typescript
export const validateParams = (schema: Joi.ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error } = schema.validate(req.params, {
      abortEarly: false
    });

    if (error) {
      const errorMessage = error.details.map(detail => detail.message).join(', ');
      return next(new BadRequestError(errorMessage));
    }

    next();
  };
};

// Usage example
const studentParamsSchema = Joi.object({
  studentId: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .required()
    .messages({
      'string.pattern.base': 'Student ID must be a valid MongoDB ObjectId'
    })
});

export const validateStudentParams = validateParams(studentParamsSchema);
```

## Validation Schemas Organization

### File Structure
```
src/validators/
├── {entity}/
│   ├── create-{entity}.validator.ts
│   ├── update-{entity}.validator.ts
│   ├── query-{entity}.validator.ts
│   └── {entity}-params.validator.ts
└── common/
    ├── common.validators.ts
    └── shared.schemas.ts
```

### Shared Validation Schemas

```typescript
// src/validators/common/shared.schemas.ts
import Joi from 'joi';

// Reusable ObjectId validation
export const objectIdSchema = Joi.string()
  .pattern(/^[0-9a-fA-F]{24}$/)
  .messages({
    'string.pattern.base': 'ID must be a valid MongoDB ObjectId'
  });

// Reusable pagination schema
export const paginationSchema = {
  page: Joi.number()
    .integer()
    .min(1)
    .default(1)
    .messages({
      'number.min': 'Page must be at least 1'
    }),
  limit: Joi.number()
    .integer()
    .min(1)
    .max(100)
    .default(10)
    .messages({
      'number.min': 'Limit must be at least 1',
      'number.max': 'Limit cannot exceed 100'
    })
};

// Reusable search schema
export const searchSchema = Joi.string()
  .optional()
  .allow('')
  .max(100)
  .messages({
    'string.max': 'Search term cannot exceed 100 characters'
  });
```

### Update Schema Patterns

```typescript
// Pattern for update schemas (all fields optional)
export const updateStudentSchema = Joi.object({
  fullName: Joi.string()
    .min(2)
    .max(100)
    .optional()
    .messages({
      'string.min': 'Full name must be at least 2 characters',
      'string.max': 'Full name cannot exceed 100 characters'
    }),
  
  email: Joi.string()
    .email()
    .custom(isAllowedEmailDomain)
    .optional()
    .messages({
      'string.email': 'Email must be a valid email address'
    }),
  
  // Nested updates (partial objects)
  identityDocument: Joi.object({
    number: Joi.string().optional(),
    issueDate: Joi.date().optional(),
    expiryDate: Joi.date().optional()
  }).optional()
}).min(1).messages({
  'object.min': 'At least one field must be provided for update'
});
```

### Query Schema Patterns

```typescript
export const studentQuerySchema = Joi.object({
  // Filters
  department: objectIdSchema.optional(),
  program: objectIdSchema.optional(),
  status: objectIdSchema.optional(),
  schoolYear: Joi.number().integer().optional(),
  
  // Search
  search: searchSchema,
  
  // Pagination
  ...paginationSchema,
  
  // Sorting
  sortBy: Joi.string()
    .valid('fullName', 'studentId', 'createdAt', 'schoolYear')
    .default('createdAt')
    .messages({
      'any.only': 'Sort field must be one of: fullName, studentId, createdAt, schoolYear'
    }),
  
  sortOrder: Joi.string()
    .valid('asc', 'desc')
    .default('desc')
    .messages({
      'any.only': 'Sort order must be either asc or desc'
    })
});
```

## Error Message Internationalization

### Translation Key Structure

```typescript
// Translation keys follow pattern: fieldName.errorType
{
  "fullName.string.empty": "Tên đầy đủ không được để trống",
  "fullName.string.min": "Tên đầy đủ phải có ít nhất {limit} ký tự",
  "fullName.string.max": "Tên đầy đủ không được vượt quá {limit} ký tự",
  "fullName.any.required": "Tên đầy đủ là bắt buộc",
  
  "email.string.email": "Email phải có định dạng hợp lệ",
  "email.string.emailDomain": "Tên miền email không được phép. Các tên miền được phép: {domains}",
  
  "phoneNumber.string.phoneFormat": "Số điện thoại không hợp lệ. Các định dạng được chấp nhận: {formats}"
}
```

### Validation Message Context

```typescript
// Joi provides context data for dynamic messages
const schema = Joi.object({
  age: Joi.number()
    .min(18)
    .max(65)
    .messages({
      'number.min': 'Age must be at least {limit} years old',
      'number.max': 'Age cannot exceed {limit} years'
    })
});

// Context available: { limit: 18 } or { limit: 65 }
```

## Best Practices

### 1. Schema Organization

```typescript
// Keep related validations together
const baseStudentFields = {
  fullName: Joi.string().min(2).max(100).required(),
  dateOfBirth: Joi.date().max('now').required(),
  gender: Joi.string().valid(...Object.values(Gender)).required()
};

// Extend for different operations
export const createStudentSchema = Joi.object({
  studentId: Joi.string().pattern(/^[0-9]{8}$/).required(),
  ...baseStudentFields,
  department: objectIdSchema.required(),
  // ... other create-specific fields
});

export const updateStudentSchema = Joi.object({
  ...Object.fromEntries(
    Object.entries(baseStudentFields).map(([key, schema]) => [key, schema.optional()])
  ),
  // ... other update-specific fields
}).min(1);
```

### 2. Validation Performance

```typescript
// Pre-compile schemas for better performance
const compiledSchema = Joi.compile(schema);

export const validateRequest = (schema: Joi.Schema) => {
  const compiledSchema = Joi.compile(schema);
  
  return (req: Request, res: Response, next: NextFunction) => {
    const { error } = compiledSchema.validate(req.body);
    // ... rest of validation logic
  };
};
```

### 3. Consistent Error Messages

```typescript
// Use message templates for consistency
const COMMON_MESSAGES = {
  REQUIRED: '{field} is required',
  MIN_LENGTH: '{field} must be at least {limit} characters',
  MAX_LENGTH: '{field} cannot exceed {limit} characters',
  INVALID_FORMAT: '{field} format is invalid',
  INVALID_OBJECTID: '{field} must be a valid ID'
};

// Apply consistently across schemas
fullName: Joi.string()
  .min(2)
  .max(100)
  .required()
  .messages({
    'string.empty': COMMON_MESSAGES.REQUIRED.replace('{field}', 'Full name'),
    'string.min': COMMON_MESSAGES.MIN_LENGTH.replace('{field}', 'Full name'),
    'string.max': COMMON_MESSAGES.MAX_LENGTH.replace('{field}', 'Full name'),
    'any.required': COMMON_MESSAGES.REQUIRED.replace('{field}', 'Full name')
  })
```

### 4. Testing Validation

```typescript
// Test validation schemas separately
describe('Student Validation', () => {
  describe('createStudentSchema', () => {
    it('should pass with valid data', () => {
      const validData = {
        studentId: '12345678',
        fullName: 'Nguyen Van A',
        // ... other valid fields
      };
      
      const { error } = createStudentSchema.validate(validData);
      expect(error).toBeUndefined();
    });
    
    it('should fail with invalid student ID', () => {
      const invalidData = {
        studentId: '123', // Too short
        fullName: 'Nguyen Van A'
      };
      
      const { error } = createStudentSchema.validate(invalidData);
      expect(error).toBeDefined();
      expect(error.details[0].path).toEqual(['studentId']);
    });
  });
});
```

## Related Documentation

- [Coding Standards](./coding-standards.md) - Code formatting and naming conventions
- [Adding New Entities](./adding-entities.md) - Complete entity development guide
- [API Routing](./api-routing.md) - Route organization and middleware usage
- [Error Handling](../04-database/error-handling.md) - Error response patterns 