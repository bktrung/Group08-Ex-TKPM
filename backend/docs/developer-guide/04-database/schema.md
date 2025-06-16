# Database Schema

This document provides a comprehensive overview of the database schema for the Student Management System. The application uses MongoDB with Mongoose ODM for data modeling and validation.

## Database Design Overview

The Student Management System follows a relational-style design approach within MongoDB, utilizing references between documents to maintain data integrity and support complex queries. The schema is designed to support:

- **Academic Management**: Students, Departments, Programs, Courses
- **Class Management**: Class scheduling, capacity management, instructor assignment
- **Enrollment System**: Student enrollment in classes with status tracking
- **Grading System**: Grade recording and management
- **Academic Calendar**: Semester and academic year management
- **Status Tracking**: Student status management and transitions

### Design Principles

1. **Normalization**: Related data is stored in separate collections with references
2. **Validation**: Comprehensive validation rules at both application and database levels
3. **Indexing**: Strategic indexing for performance optimization
4. **Extensibility**: Schema designed to accommodate future requirements
5. **Data Integrity**: Referential integrity maintained through application logic

## Entity Relationship Diagram

```mermaid
erDiagram
    DEPARTMENT {
        ObjectId _id PK
        string name UK
        timestamp createdAt
        timestamp updatedAt
    }
    
    PROGRAM {
        ObjectId _id PK
        string name UK
        timestamp createdAt
        timestamp updatedAt
    }
    
    COURSE {
        ObjectId _id PK
        string courseCode UK
        string name
        number credits
        ObjectId department FK
        string description
        ObjectId prerequisites
        boolean isActive
        timestamp createdAt
        timestamp updatedAt
    }
    
    CLASS {
        ObjectId _id PK
        string classCode UK
        ObjectId course FK
        string academicYear
        number semester
        string instructor
        number maxCapacity
        number enrolledStudents
        boolean isActive
        timestamp createdAt
        timestamp updatedAt
    }
    
    SCHEDULE {
        number dayOfWeek
        number startPeriod
        number endPeriod
        string classroom
    }
    
    STUDENT {
        ObjectId _id PK
        string studentId UK
        string fullName
        date dateOfBirth
        string gender
        ObjectId department FK
        number schoolYear
        ObjectId program FK
        string email UK
        string phoneNumber UK
        ObjectId status FK
        string nationality
        timestamp createdAt
        timestamp updatedAt
    }
    
    STUDENT_STATUS {
        ObjectId _id PK
        string type UK
        timestamp createdAt
        timestamp updatedAt
    }
    
    STUDENT_STATUS_TRANSITION {
        ObjectId _id PK
        ObjectId fromStatus FK
        ObjectId toStatus FK
        timestamp createdAt
        timestamp updatedAt
    }
    
    ENROLLMENT {
        ObjectId _id PK
        ObjectId student FK
        ObjectId class FK
        date enrollmentDate
        string status
        date dropDate
        string dropReason
        timestamp createdAt
        timestamp updatedAt
    }
    
    GRADE {
        ObjectId _id PK
        ObjectId enrollment FK
        number midtermScore
        number finalScore
        number totalScore
        string letterGrade
        number gradePoints
        boolean isPublished
        timestamp createdAt
        timestamp updatedAt
    }
    
    SEMESTER {
        ObjectId _id PK
        string academicYear
        number semester
        date registrationStartDate
        date registrationEndDate
        date dropDeadline
        date semesterStartDate
        date semesterEndDate
        boolean isActive
        timestamp createdAt
        timestamp updatedAt
    }
    
    %% Relationships
    DEPARTMENT ||--o{ STUDENT : manages
    DEPARTMENT ||--o{ COURSE : offers
    PROGRAM ||--o{ STUDENT : enrolls
    
    COURSE ||--o{ CLASS : instantiated_as
    COURSE ||--o{ COURSE : prerequisites
    
    CLASS ||--o{ ENROLLMENT : has
    CLASS ||--|| SCHEDULE : contains
    
    STUDENT ||--o{ ENROLLMENT : enrolls_in
    STUDENT ||--|| STUDENT_STATUS : has_status
    
    STUDENT_STATUS ||--o{ STUDENT_STATUS_TRANSITION : transitions_from
    STUDENT_STATUS ||--o{ STUDENT_STATUS_TRANSITION : transitions_to
    
    ENROLLMENT ||--|| GRADE : receives
```

### Entity Details

#### Core Academic Entities
- **DEPARTMENT**: Academic departments (unique name)
- **PROGRAM**: Academic programs offered
- **COURSE**: Course definitions with prerequisites support
- **CLASS**: Specific course instances with scheduling

#### Student Management
- **STUDENT**: Student records with personal information
- **STUDENT_STATUS**: Available student status types
- **STUDENT_STATUS_TRANSITION**: Allowed status changes

#### Enrollment System
- **ENROLLMENT**: Student-class enrollment records
- **GRADE**: Grade records linked to enrollments
- **SEMESTER**: Academic calendar management

#### Embedded Documents
- **SCHEDULE**: Embedded in CLASS for time/location data
- **IAddress**: Embedded in STUDENT for address information
- **IdentityDocument**: Embedded in STUDENT for ID documents

### Key Relationships Explained

1. **Academic Structure**:
   - `Department` manages `Students` and offers `Courses`
   - `Program` enrolls `Students`
   - `Course` can have prerequisites (self-referencing relationship)

2. **Class Management**:
   - `Course` is instantiated as multiple `Classes` across semesters
   - `Class` contains embedded `Schedule` objects for time/location
   - `Class` tracks enrollment capacity and current count

3. **Student Enrollment**:
   - `Student` enrolls in multiple `Classes` through `Enrollment`
   - `Enrollment` tracks status (ACTIVE/DROPPED/COMPLETED)
   - Each `Enrollment` can have one associated `Grade`

4. **Status Management**:
   - `Student` has current `StudentStatus`
   - `StudentStatusTransition` defines allowed status changes
   - Supports workflow for student lifecycle management

5. **Academic Calendar**:
   - `Semester` defines registration and academic periods
   - `Class` references academic year and semester number
   - Supports multiple semesters per academic year

## Detailed Schema Documentation

### 1. Student Collection

**Collection**: `students`  
**Purpose**: Core student information and personal data

#### Schema Structure

```typescript
{
  _id: ObjectId,
  studentId: String,           // Unique student identifier
  fullName: String,            // Student's full name
  dateOfBirth: Date,           // Date of birth
  gender: String,              // "Nam" | "Nữ"
  department: ObjectId,        // Reference to Department
  schoolYear: Number,          // Year of enrollment (1990-current)
  program: ObjectId,           // Reference to Program
  permanentAddress: Object,    // IAddress structure (optional)
  temporaryAddress: Object,    // IAddress structure (optional) 
  mailingAddress: Object,      // IAddress structure (required)
  email: String,               // Unique email address
  phoneNumber: String,         // Unique phone number
  status: ObjectId,            // Reference to StudentStatus
  identityDocument: Object,    // Identity document information
  nationality: String,         // Student's nationality
  createdAt: Date,            // Document creation timestamp
  updatedAt: Date             // Document update timestamp
}
```

#### Nested Structures

##### Address Structure (IAddress)
```typescript
{
  houseNumberStreet: String,   // House number and street
  wardCommune: String,         // Ward or commune
  districtCounty: String,      // District or county  
  provinceCity: String,        // Province or city
  country: String              // Country
}
```

##### Identity Document Structure (IdentityDocument)
```typescript
// Base structure
{
  type: String,                // "CMND" | "CCCD" | "PASSPORT"
  number: String,              // Document number
  issueDate: Date,             // Issue date
  issuedBy: String,            // Issuing authority
  expiryDate: Date             // Expiry date
}

// CCCD specific (extends base)
{
  hasChip: Boolean             // Whether card has chip
}

// Passport specific (extends base)  
{
  issuedCountry: String,       // Country of issue
  notes?: String               // Additional notes
}
```

#### Validation Rules

- `studentId`: Required, unique, trimmed
- `fullName`: Required, trimmed
- `dateOfBirth`: Required, valid date
- `gender`: Required, enum values ["Nam", "Nữ"]
- `schoolYear`: Required, integer between 1990 and current year
- `email`: Required, unique, lowercase, valid email format
- `phoneNumber`: Required, unique, trimmed
- `mailingAddress`: Required object
- `identityDocument`: Required, unique number

#### Indexes

```javascript
// Unique constraints
{ studentId: 1 }                    // Unique index
{ email: 1 }                        // Unique index  
{ phoneNumber: 1 }                  // Unique index
{ "identityDocument.number": 1 }    // Unique index

// Text search index
{
  fullName: "text",
  studentId: "text"
} // Weights: fullName(10), studentId(5)

// Query optimization indexes
{ department: 1 }                   // Department filter
{ program: 1 }                      // Program filter
{ status: 1 }                       // Status filter
{ schoolYear: 1 }                   // School year filter
```

### 2. Department Collection

**Collection**: `departments`  
**Purpose**: Academic departments and organizational units

#### Schema Structure

```typescript
{
  _id: ObjectId,
  name: String,                // Department name (unique)
  createdAt: Date,            // Document creation timestamp
  updatedAt: Date             // Document update timestamp
}
```

#### Validation Rules

- `name`: Required, unique, trimmed

#### Relationships

- **One-to-Many**: Department → Students
- **One-to-Many**: Department → Courses
- **One-to-Many**: Department → Programs

### 3. Program Collection

**Collection**: `programs`  
**Purpose**: Academic programs offered by departments

#### Schema Structure

```typescript
{
  _id: ObjectId,
  name: String,                // Program name
  createdAt: Date,            // Document creation timestamp
  updatedAt: Date             // Document update timestamp
}
```

#### Validation Rules

- `name`: Required

#### Relationships

- **One-to-Many**: Program → Students

### 4. Course Collection

**Collection**: `courses`  
**Purpose**: Academic courses and their metadata

#### Schema Structure

```typescript
{
  _id: ObjectId,
  courseCode: String,          // Unique course identifier
  name: String,                // Course name
  credits: Number,             // Credit hours (minimum 2)
  department: ObjectId,        // Reference to Department
  description: String,         // Course description
  prerequisites: [ObjectId],   // Array of prerequisite Course references
  isActive: Boolean,           // Course availability status
  createdAt: Date,            // Document creation timestamp
  updatedAt: Date             // Document update timestamp
}
```

#### Validation Rules

- `courseCode`: Required, unique
- `name`: Required
- `credits`: Required, integer ≥ 2
- `department`: Required ObjectId reference
- `description`: Required
- `isActive`: Default true

#### Indexes

```javascript
{ courseCode: 1 }               // Unique index
{ department: 1 }               // Department filter
{ isActive: 1 }                 // Active courses filter
{ credits: 1 }                  // Credits filter
```

#### Relationships

- **Many-to-One**: Course → Department
- **Many-to-Many**: Course → Prerequisites (self-reference)
- **One-to-Many**: Course → Classes

### 5. Class Collection

**Collection**: `classes`  
**Purpose**: Specific class instances of courses with schedules

#### Schema Structure

```typescript
{
  _id: ObjectId,
  classCode: String,           // Unique class identifier
  course: ObjectId,            // Reference to Course
  academicYear: String,        // Academic year (e.g., "2023-2024")
  semester: Number,            // Semester number (1, 2, or 3)
  instructor: String,          // Instructor name
  maxCapacity: Number,         // Maximum enrollment capacity
  schedule: [Schedule],        // Array of schedule objects
  enrolledStudents: Number,    // Current enrollment count
  isActive: Boolean,           // Class availability status
  createdAt: Date,            // Document creation timestamp
  updatedAt: Date             // Document update timestamp
}
```

#### Schedule Structure

```typescript
{
  dayOfWeek: Number,           // Day of week (2-7: Monday-Saturday)
  startPeriod: Number,         // Starting period (1-10)
  endPeriod: Number,           // Ending period (1-10)
  classroom: String            // Classroom location
}
```

#### Validation Rules

- `classCode`: Required, unique
- `course`: Required ObjectId reference
- `academicYear`: Required
- `semester`: Required, enum [1, 2, 3]
- `instructor`: Required
- `maxCapacity`: Required, minimum 1
- `schedule`: Required array with at least one schedule
- `dayOfWeek`: Integer 2-7 (Monday-Saturday)
- `startPeriod`, `endPeriod`: Integer 1-10
- `endPeriod` ≥ `startPeriod`
- `enrolledStudents`: Default 0, minimum 0

#### Indexes

```javascript
{ classCode: 1 }               // Unique index
{ course: 1 }                  // Course filter
{ academicYear: 1 }            // Academic year filter
{ semester: 1 }                // Semester filter
{ isActive: 1 }                // Active classes filter
{ instructor: 1 }              // Instructor filter
```

#### Relationships

- **Many-to-One**: Class → Course
- **One-to-Many**: Class → Enrollments

### 6. Enrollment Collection

**Collection**: `enrollments`  
**Purpose**: Student enrollment in specific classes

#### Schema Structure

```typescript
{
  _id: ObjectId,
  student: ObjectId,           // Reference to Student
  class: ObjectId,             // Reference to Class
  enrollmentDate: Date,        // Enrollment timestamp
  status: String,              // Enrollment status
  dropDate: Date,              // Drop date (optional)
  dropReason: String,          // Drop reason (optional)
  createdAt: Date,            // Document creation timestamp
  updatedAt: Date             // Document update timestamp
}
```

#### Enrollment Status Enum

```typescript
enum EnrollmentStatus {
  ACTIVE = 'ACTIVE',           // Currently enrolled
  DROPPED = 'DROPPED',         // Dropped from class
  COMPLETED = 'COMPLETED'      // Successfully completed
}
```

#### Validation Rules

- `student`: Required ObjectId reference
- `class`: Required ObjectId reference
- `enrollmentDate`: Default current date
- `status`: Required, enum values, default 'ACTIVE'
- `dropDate`: Optional, required if status is 'DROPPED'
- `dropReason`: Optional

#### Indexes

```javascript
{ student: 1 }                 // Student enrollments
{ class: 1 }                   // Class enrollment list
{ status: 1 }                  // Status filter
{ enrollmentDate: 1 }          // Enrollment date range
{ student: 1, class: 1 }       // Composite unique constraint
```

#### Relationships

- **Many-to-One**: Enrollment → Student
- **Many-to-One**: Enrollment → Class
- **One-to-One**: Enrollment → Grade

### 7. Grade Collection

**Collection**: `grades`  
**Purpose**: Student grades for enrolled classes

#### Schema Structure

```typescript
{
  _id: ObjectId,
  enrollment: ObjectId,        // Reference to Enrollment
  midtermScore: Number,        // Midterm examination score (optional)
  finalScore: Number,          // Final examination score (optional)
  totalScore: Number,          // Total calculated score
  letterGrade: String,         // Letter grade (A, B, C, D, F)
  gradePoints: Number,         // Grade point value
  isPublished: Boolean,        // Publication status
  createdAt: Date,            // Document creation timestamp
  updatedAt: Date             // Document update timestamp
}
```

#### Validation Rules

- `enrollment`: Required ObjectId reference
- `totalScore`: Required
- `letterGrade`: Required
- `gradePoints`: Required
- `isPublished`: Default true
- `midtermScore`, `finalScore`: Optional

#### Indexes

```javascript
{ enrollment: 1 }              // Unique index (one grade per enrollment)
{ letterGrade: 1 }             // Grade distribution queries
{ gradePoints: 1 }             // GPA calculations
{ isPublished: 1 }             // Published grades filter
```

#### Relationships

- **One-to-One**: Grade → Enrollment

### 8. Semester Collection

**Collection**: `semesters`  
**Purpose**: Academic calendar and semester management

#### Schema Structure

```typescript
{
  _id: ObjectId,
  academicYear: String,        // Academic year (e.g., "2023-2024")
  semester: Number,            // Semester number (1, 2, or 3)
  registrationStartDate: Date, // Registration period start
  registrationEndDate: Date,   // Registration period end
  dropDeadline: Date,          // Last date to drop classes
  semesterStartDate: Date,     // Semester start date
  semesterEndDate: Date,       // Semester end date
  isActive: Boolean,           // Current active semester
  createdAt: Date,            // Document creation timestamp
  updatedAt: Date             // Document update timestamp
}
```

#### Validation Rules

- `academicYear`: Required
- `semester`: Required, enum [1, 2, 3]
- All date fields: Required
- `isActive`: Default true

#### Indexes

```javascript
{ academicYear: 1, semester: 1 } // Composite unique constraint
{ isActive: 1 }                  // Active semester lookup
{ registrationStartDate: 1 }     // Date range queries
{ registrationEndDate: 1 }       // Date range queries
```

### 9. StudentStatus Collection

**Collection**: `studentStatus`  
**Purpose**: Available student status types

#### Schema Structure

```typescript
{
  _id: ObjectId,
  type: String,                // Status type name (unique)
  createdAt: Date,            // Document creation timestamp
  updatedAt: Date             // Document update timestamp
}
```

#### Common Status Types

- "Đang học" (Active/Studying)
- "Tạm nghỉ" (Temporary leave)
- "Thôi học" (Withdrew)
- "Tốt nghiệp" (Graduated)
- "Chuyển trường" (Transferred)

#### Validation Rules

- `type`: Required, unique, trimmed

#### Relationships

- **One-to-Many**: StudentStatus → Students
- **One-to-Many**: StudentStatus → StatusTransitions (from)
- **One-to-Many**: StudentStatus → StatusTransitions (to)

### 10. StudentStatusTransition Collection

**Collection**: `studentStatusTransitions`  
**Purpose**: Track allowed transitions between student statuses

#### Schema Structure

```typescript
{
  _id: ObjectId,
  fromStatus: ObjectId,        // Reference to StudentStatus (source)
  toStatus: ObjectId,          // Reference to StudentStatus (target)
  createdAt: Date,            // Document creation timestamp
  updatedAt: Date             // Document update timestamp
}
```

#### Validation Rules

- `fromStatus`: Required ObjectId reference
- `toStatus`: Required ObjectId reference

#### Indexes

```javascript
{ fromStatus: 1 }              // Source status lookup
{ toStatus: 1 }                // Target status lookup
{ fromStatus: 1, toStatus: 1 } // Composite unique constraint
```

#### Relationships

- **Many-to-One**: StatusTransition → StudentStatus (from)
- **Many-to-One**: StatusTransition → StudentStatus (to)

## Indexing Strategy

### Primary Indexes

All collections have default indexes on `_id` field created automatically by MongoDB.

### Unique Constraints

1. **Student Collection**:
   - `studentId`: Ensures unique student identifiers
   - `email`: Prevents duplicate email addresses
   - `phoneNumber`: Ensures unique phone numbers
   - `identityDocument.number`: Prevents duplicate identity documents

2. **Department Collection**:
   - `name`: Ensures unique department names

3. **Course Collection**:
   - `courseCode`: Ensures unique course codes

4. **Class Collection**:
   - `classCode`: Ensures unique class codes

5. **Semester Collection**:
   - `academicYear + semester`: Ensures unique semester per academic year

6. **StudentStatus Collection**:
   - `type`: Ensures unique status types

### Performance Indexes

1. **Reference Lookups**:
   ```javascript
   // Student references
   students.department: 1
   students.program: 1
   students.status: 1
   
   // Course references
   courses.department: 1
   
   // Class references
   classes.course: 1
   
   // Enrollment references
   enrollments.student: 1
   enrollments.class: 1
   
   // Grade references
   grades.enrollment: 1
   ```

2. **Query Optimization**:
   ```javascript
   // Common filter fields
   students.schoolYear: 1
   courses.isActive: 1
   classes.isActive: 1
   classes.academicYear: 1
   classes.semester: 1
   enrollments.status: 1
   semesters.isActive: 1
   
   // Date range queries
   enrollments.enrollmentDate: 1
   semesters.registrationStartDate: 1
   semesters.registrationEndDate: 1
   ```

3. **Full-Text Search**:
   ```javascript
   // Student search
   {
     fullName: "text",
     studentId: "text"
   }
   // Weights: fullName(10), studentId(5)
   ```

4. **Composite Indexes**:
   ```javascript
   // Prevent duplicate enrollments
   { student: 1, class: 1 }
   
   // Semester identification
   { academicYear: 1, semester: 1 }
   
   // Status transition validation
   { fromStatus: 1, toStatus: 1 }
   ```

## Common Query Patterns

### 1. Student Queries

#### Find Students by Department
```javascript
db.students.find({ 
  department: ObjectId("departmentId") 
}).populate('department program status');
```

#### Search Students by Name or ID
```javascript
db.students.find({
  $text: { $search: "search term" }
}).sort({ score: { $meta: "textScore" } });
```

#### Get Student with Full Profile
```javascript
db.students.aggregate([
  { $match: { _id: ObjectId("studentId") } },
  {
    $lookup: {
      from: "departments",
      localField: "department",
      foreignField: "_id",
      as: "departmentInfo"
    }
  },
  {
    $lookup: {
      from: "programs", 
      localField: "program",
      foreignField: "_id",
      as: "programInfo"
    }
  },
  {
    $lookup: {
      from: "studentStatus",
      localField: "status", 
      foreignField: "_id",
      as: "statusInfo"
    }
  }
]);
```

### 2. Enrollment Queries

#### Get Student's Current Enrollments
```javascript
db.enrollments.find({
  student: ObjectId("studentId"),
  status: "ACTIVE"
}).populate('class');
```

#### Get Class Enrollment List
```javascript
db.enrollments.aggregate([
  { $match: { 
    class: ObjectId("classId"),
    status: "ACTIVE" 
  }},
  {
    $lookup: {
      from: "students",
      localField: "student", 
      foreignField: "_id",
      as: "studentInfo"
    }
  },
  { $unwind: "$studentInfo" },
  {
    $project: {
      enrollmentDate: 1,
      "studentInfo.studentId": 1,
      "studentInfo.fullName": 1,
      "studentInfo.email": 1
    }
  }
]);
```

### 3. Grade Queries

#### Get Student's Transcript
```javascript
db.grades.aggregate([
  {
    $lookup: {
      from: "enrollments",
      localField: "enrollment",
      foreignField: "_id", 
      as: "enrollmentInfo"
    }
  },
  { $unwind: "$enrollmentInfo" },
  { $match: { "enrollmentInfo.student": ObjectId("studentId") } },
  {
    $lookup: {
      from: "classes",
      localField: "enrollmentInfo.class",
      foreignField: "_id",
      as: "classInfo" 
    }
  },
  { $unwind: "$classInfo" },
  {
    $lookup: {
      from: "courses",
      localField: "classInfo.course", 
      foreignField: "_id",
      as: "courseInfo"
    }
  },
  { $unwind: "$courseInfo" },
  {
    $project: {
      "courseInfo.courseCode": 1,
      "courseInfo.name": 1,
      "courseInfo.credits": 1,
      "classInfo.academicYear": 1,
      "classInfo.semester": 1,
      totalScore: 1,
      letterGrade: 1,
      gradePoints: 1
    }
  }
]);
```

### 4. Class Queries

#### Find Available Classes for Enrollment
```javascript
db.classes.find({
  academicYear: "2023-2024",
  semester: 1,
  isActive: true,
  $expr: { $lt: ["$enrolledStudents", "$maxCapacity"] }
}).populate('course');
```

#### Get Class Schedule by Day
```javascript
db.classes.find({
  "schedule.dayOfWeek": 2, // Monday
  academicYear: "2023-2024",
  semester: 1,
  isActive: true
}).populate('course');
```

### 5. Academic Calendar Queries

#### Get Current Active Semester
```javascript
db.semesters.findOne({
  isActive: true,
  semesterStartDate: { $lte: new Date() },
  semesterEndDate: { $gte: new Date() }
});
```

#### Check if Registration is Open
```javascript
db.semesters.findOne({
  isActive: true,
  registrationStartDate: { $lte: new Date() },
  registrationEndDate: { $gte: new Date() }
});
```

## Data Validation Rules

### Database Level Validation

MongoDB schema validation is enforced through Mongoose at the application level. Key validation rules include:

1. **Required Fields**: All essential fields are marked as required
2. **Data Types**: Strict type checking for all fields
3. **String Constraints**: Length limits, trimming, format validation
4. **Number Constraints**: Min/max values, integer validation
5. **Date Constraints**: Valid date ranges, chronological validation
6. **Enum Validation**: Restricted value sets for status fields
7. **Reference Validation**: ObjectId format validation for references

### Application Level Validation

Additional validation is implemented in the service layer:

1. **Business Logic Validation**: 
   - Course prerequisites verification
   - Enrollment capacity limits
   - Academic calendar constraints
   - Status transition rules

2. **Data Integrity Validation**:
   - Referential integrity checks
   - Duplicate prevention
   - Cascade validation for related entities

3. **Custom Validation**:
   - Email domain restrictions
   - Phone number format validation
   - Identity document format validation
   - Address completeness validation

## Performance Considerations

### Index Optimization

1. **Compound Indexes**: Created for common query patterns
2. **Partial Indexes**: Used for conditional queries (e.g., active records)
3. **Text Indexes**: Optimized for search functionality
4. **TTL Indexes**: For time-based data cleanup (if needed)

### Query Optimization

1. **Aggregation Pipelines**: Used for complex multi-collection queries
2. **Projection**: Limiting returned fields to reduce data transfer
3. **Population Limits**: Selective population of referenced documents
4. **Pagination**: Implemented for large result sets

### Monitoring

1. **Index Usage**: Regular monitoring of index hit rates
2. **Query Performance**: Slow query logging and optimization
3. **Collection Statistics**: Regular analysis of collection sizes and growth
4. **Memory Usage**: Monitoring of working set size

## Migration Considerations

While MongoDB doesn't require traditional schema migrations like relational databases, the following practices are recommended:

1. **Schema Versioning**: Track schema changes in application code
2. **Backward Compatibility**: Ensure new fields are optional or have defaults
3. **Data Migration Scripts**: Create scripts for data transformation when needed
4. **Index Management**: Plan index creation/deletion for production systems
5. **Validation Updates**: Coordinate validation rule changes with application deployments

## Related Documentation

- [Database Migrations](./migrations.md) - Migration strategies and scripts
- [Architecture Overview](../02-architecture/overview.md) - System architecture context
- [Adding New Entities](../03-development/adding-entities.md) - Entity development guide
- [Data Validation](../03-development/validation.md) - Application validation patterns