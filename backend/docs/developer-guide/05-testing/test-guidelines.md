# Test Guidelines

*This document provides an overview of testing best practices and conventions for the Student Management System.*

## Overview

Testing is a critical aspect of our Student Management System development process. We follow a comprehensive testing strategy that ensures code quality, reliability, and maintainability across all layers of the application.

## Testing Strategy

### Testing Pyramid

Our testing approach follows the testing pyramid principle:

```
    /\
   /  \     E2E Tests (10%)
  /____\    - Full workflow testing
 /      \   - User journey validation
/________\  Integration Tests (20%)
           - API endpoint testing
           - Database integration
           - Service interactions
____________________________
         Unit Tests (70%)
         - Individual component testing
         - Business logic validation
         - Isolated functionality
```

### Testing Levels

1. **Unit Tests (70%)**: Fast, isolated tests for individual components
   - Services (business logic)
   - Repositories (data access)
   - Controllers (API handling)
   - Utilities and helpers

2. **Integration Tests (20%)**: Test component interactions
   - API endpoint testing
   - Database operations
   - Service integrations
   - External service mocking

3. **End-to-End Tests (10%)**: Full application workflow testing
   - User journey testing
   - Complete feature validation
   - Cross-system integration

## Testing Tools and Framework

### Core Testing Stack

- **Jest**: JavaScript testing framework
- **TypeScript**: Type-safe test development
- **Inversify**: Dependency injection for testability
- **MongoDB Memory Server**: In-memory database for testing
- **Supertest**: HTTP assertion library for API testing

### Development Dependencies

```json
{
  "devDependencies": {
    "@types/jest": "^29.x.x",
    "jest": "^29.x.x",
    "ts-jest": "^29.x.x",
    "mongodb-memory-server": "^8.x.x",
    "supertest": "^6.x.x"
  }
}
```

## Test Organization

### Directory Structure

```
tests/
├── unit/                           # Unit tests
│   ├── controllers/               # Controller layer tests
│   │   ├── student.controller.test.ts
│   │   ├── course.controller.test.ts
│   │   └── department.controller.test.ts
│   ├── services/                  # Service layer tests
│   │   ├── student.service.test.ts
│   │   ├── course.service.test.ts
│   │   └── enrollment.service.test.ts
│   └── repositories/              # Repository layer tests
│       ├── student.repository.test.ts
│       ├── course.repository.test.ts
│       └── grade.repository.test.ts
├── integration/                   # Integration tests
│   ├── api/                      # API integration tests
│   │   ├── student.api.test.ts
│   │   ├── course.api.test.ts
│   │   └── enrollment.api.test.ts
│   └── database/                 # Database integration tests
│       ├── student.db.test.ts
│       └── grade.db.test.ts
├── e2e/                          # End-to-end tests
│   ├── student-lifecycle.e2e.test.ts
│   ├── enrollment-workflow.e2e.test.ts
│   └── grade-management.e2e.test.ts
└── utils/                        # Test utilities
    ├── test-database.ts          # Database setup utilities
    ├── test-fixtures.ts          # Test data fixtures
    ├── mock-factories.ts         # Mock object factories
    └── test-helpers.ts           # Common test helpers
```

## Naming Conventions

### File Naming

- **Unit Tests**: `{component}.test.ts` or `{component}.spec.ts`
- **Integration Tests**: `{feature}.integration.test.ts` or `{feature}.api.test.ts`
- **End-to-End Tests**: `{workflow}.e2e.test.ts`
- **Test Utilities**: `test-{purpose}.ts`

### Test Suite Naming

```typescript
describe('ComponentName', () => {
  describe('methodName', () => {
    it('should perform expected behavior when given valid input', () => {
      // Test implementation
    });

    it('should throw appropriate error when given invalid input', () => {
      // Test implementation
    });
  });
});
```

### Test Data Naming

Use descriptive, intention-revealing names:

```typescript
// Good examples
const validStudentData = { /* ... */ };
const invalidEmailData = { /* ... */ };
const existingStudentRecord = { /* ... */ };
const mockStudentRepository = { /* ... */ };

// Avoid generic names
const data = { /* ... */ };
const mock = { /* ... */ };
const result = { /* ... */ };
```

## Quality Standards

### Code Coverage Requirements

- **Minimum Coverage**: 80% line coverage
- **Critical Components**: 90%+ coverage for business logic
- **Coverage Reporting**: HTML and console reports
- **CI/CD Integration**: Coverage checks in build pipeline

### Test Quality Metrics

1. **Test Reliability**: Tests should be deterministic and stable
2. **Test Speed**: Unit tests should run in milliseconds
3. **Test Clarity**: Tests should be readable and self-documenting
4. **Test Maintenance**: Tests should be easy to update and maintain

### Performance Standards

| Test Type | Target Speed | Acceptable Threshold |
|-----------|--------------|---------------------|
| Unit Tests | < 10ms per test | < 50ms per test |
| Integration Tests | < 100ms per test | < 500ms per test |
| E2E Tests | < 5s per test | < 30s per test |

## Testing Best Practices

### General Principles

1. **Test First Mindset**: Write tests before or alongside implementation
2. **Single Responsibility**: Each test should verify one specific behavior
3. **Arrange-Act-Assert**: Structure tests with clear phases
4. **Test Independence**: Tests should not depend on each other
5. **Meaningful Assertions**: Use specific, descriptive assertions

### Test Data Management

```typescript
// Use factories for consistent test data
const createValidStudent = (overrides = {}) => ({
  studentId: 'STU001',
  firstName: 'John',
  lastName: 'Doe',
  email: 'john.doe@example.com',
  // ... other required fields
  ...overrides
});

// Use constants for test scenarios
const TEST_SCENARIOS = {
  DUPLICATE_EMAIL: 'duplicate.email@example.com',
  INVALID_DEPARTMENT: 'invalid-dept-id',
  EXPIRED_STATUS: 'expired-status-id'
};
```

### Mock Management

```typescript
// Create reusable mock factories
export const createMockStudentRepository = () => ({
  findStudent: jest.fn(),
  addStudent: jest.fn(),
  updateStudent: jest.fn(),
  deleteStudent: jest.fn(),
  // ... other methods
});

// Reset mocks between tests
beforeEach(() => {
  jest.clearAllMocks();
});
```

## Test Documentation

### Test Comments

Add comments for complex test scenarios:

```typescript
it('should validate status transition rules when updating student status', async () => {
  // This test verifies that the business rule preventing direct transitions
  // from 'Active' to 'Graduated' without going through 'Completing' is enforced
  
  // Arrange: Create student with 'Active' status
  const activeStudent = { status: 'active-status-id' };
  
  // Act & Assert: Attempt invalid direct transition
  await expect(service.updateStudent('STU001', { status: 'graduated-status-id' }))
    .rejects.toThrow('Cannot transition from current status to desired status');
});
```

### Test Specifications

Document test requirements and scenarios in each test file:

```typescript
/**
 * Student Service Tests
 * 
 * Test Coverage:
 * - Student creation with validation
 * - Student updates with business rules
 * - Student deletion with cascade checks
 * - Search functionality with filters
 * - Status transition validation
 * 
 * Business Rules Tested:
 * - Unique student ID, email, phone number
 * - Department and program existence validation
 * - Status transition rules enforcement
 * - Identity document uniqueness
 */
describe('StudentService', () => {
  // Tests go here
});
```

## Continuous Integration

### Pre-commit Hooks

```bash
# Run tests before commit
npm run test:ci

# Check coverage threshold
npm run test:coverage

# Lint test files
npm run lint:tests
```

### CI/CD Pipeline Integration

```yaml
# Example GitHub Actions workflow
name: Test Pipeline

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run unit tests
        run: npm run test:unit
      
      - name: Run integration tests
        run: npm run test:integration
      
      - name: Check coverage
        run: npm run test:coverage
      
      - name: Upload coverage reports
        uses: codecov/codecov-action@v3
```

## Related Documentation

For detailed implementation guides, refer to:

- **[Unit Testing Guidelines](./unit-testing.md)**: Comprehensive guide for unit testing with Jest, Inversify mocking, and practical examples
- **[Integration Testing Guide](./integration-testing.md)**: API testing, database integration, and service interaction testing *(Coming Soon)*
- **[E2E Testing Guide](./e2e-testing.md)**: End-to-end workflow testing and user journey validation *(Coming Soon)*

## Development Commands

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode during development
npm run test:watch

# Run tests with coverage report
npm run test:coverage

# Run specific test types
npm run test:unit
npm run test:integration
npm run test:e2e

# Run specific test file
npm test -- student.service.test.ts

# Run tests matching a pattern
npm test -- --testNamePattern="addStudent"

# Run tests for changed files only
npm test -- --onlyChanged
```

### Debugging Tests

```bash
# Debug specific test file
npm test -- --debug student.service.test.ts

# Run tests with verbose output
npm test -- --verbose

# Run single test in debug mode
npm test -- --testNamePattern="should add student" --debug
```

## Common Patterns

### Error Testing Pattern

```typescript
it('should throw BadRequestError when required field is missing', async () => {
  // Arrange
  const invalidData = { /* missing required fields */ };
  
  // Act & Assert
  await expect(service.createStudent(invalidData))
    .rejects.toThrow(BadRequestError);
  
  // Verify specific error message
  await expect(service.createStudent(invalidData))
    .rejects.toThrow('Email is required');
});
```

### Async Operation Testing

```typescript
it('should handle concurrent student creation requests', async () => {
  // Arrange
  const studentData1 = createValidStudent({ studentId: 'STU001' });
  const studentData2 = createValidStudent({ studentId: 'STU002' });
  
  // Act
  const promises = [
    service.addStudent(studentData1),
    service.addStudent(studentData2)
  ];
  
  // Assert
  const results = await Promise.all(promises);
  expect(results).toHaveLength(2);
  expect(results[0].studentId).toBe('STU001');
  expect(results[1].studentId).toBe('STU002');
});
```

### Database State Testing

```typescript
it('should maintain data consistency after student deletion', async () => {
  // Arrange
  const student = await repository.addStudent(validStudentData);
  const initialCount = await repository.getStudentCount();
  
  // Act
  await repository.deleteStudent(student.studentId);
  
  // Assert
  const finalCount = await repository.getStudentCount();
  expect(finalCount).toBe(initialCount - 1);
  
  // Verify student no longer exists
  const deletedStudent = await repository.findStudent({ studentId: student.studentId });
  expect(deletedStudent).toBeNull();
});
```

---

*This document serves as the entry point for testing guidelines in the Student Management System. Follow these conventions and refer to the detailed guides for specific testing scenarios and implementation patterns.* 