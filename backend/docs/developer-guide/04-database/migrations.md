# Database Migrations

This document covers database migration strategies, scripts, and best practices for the Student Management System. While MongoDB doesn't require traditional schema migrations like relational databases, managing data structure changes and maintaining consistency across environments is still crucial.

## Migration Philosophy

### MongoDB Migration Approach

Unlike relational databases, MongoDB migrations focus on:

1. **Data Transformation**: Converting existing documents to new structures
2. **Index Management**: Creating, modifying, or dropping indexes
3. **Validation Updates**: Updating schema validation rules
4. **Collection Management**: Creating collections with proper configurations
5. **Data Cleanup**: Removing obsolete fields or invalid data

### Migration Principles

1. **Non-Destructive**: Preserve existing data whenever possible
2. **Backward Compatible**: Ensure application can handle both old and new data structures
3. **Idempotent**: Migrations can be run multiple times safely
4. **Versioned**: Track migration versions and execution status
5. **Testable**: Migrations should be thoroughly tested in staging environments

## Migration Management System

### Migration Structure

```
migrations/
├── scripts/                    # Migration script files
│   ├── 001-initial-setup.js
│   ├── 002-add-student-indexes.js
│   ├── 003-update-identity-document.js
│   └── 004-add-semester-collection.js
├── utils/                      # Migration utilities
│   ├── migration-helper.js
│   └── validation-helper.js
├── templates/                  # Migration templates
│   ├── collection-migration.js
│   └── index-migration.js
├── rollback/                   # Rollback scripts
│   ├── 003-rollback-identity-document.js
│   └── 004-rollback-semester-collection.js
└── migrate.js                  # Migration runner
```

### Migration File Naming Convention

```
{version}-{description}.js

Examples:
001-initial-setup.js
002-add-student-indexes.js
003-update-identity-document-structure.js
004-create-semester-collection.js
005-migrate-grade-calculation.js
```

## Migration Runner Implementation

### Core Migration Runner

```javascript
// migrations/migrate.js
const { MongoClient } = require('mongodb');
const fs = require('fs');
const path = require('path');

class MigrationRunner {
  constructor(connectionString) {
    this.connectionString = connectionString;
    this.db = null;
    this.migrationsCollection = 'migrations';
  }

  async connect() {
    this.client = new MongoClient(this.connectionString);
    await this.client.connect();
    this.db = this.client.db();
    
    // Ensure migrations collection exists
    await this.ensureMigrationsCollection();
  }

  async ensureMigrationsCollection() {
    const collections = await this.db.listCollections({ 
      name: this.migrationsCollection 
    }).toArray();
    
    if (collections.length === 0) {
      await this.db.createCollection(this.migrationsCollection);
      console.log(`Created ${this.migrationsCollection} collection`);
    }
  }

  async getExecutedMigrations() {
    return await this.db.collection(this.migrationsCollection)
      .find({}, { projection: { version: 1 } })
      .sort({ version: 1 })
      .toArray();
  }

  async getPendingMigrations() {
    const executed = await this.getExecutedMigrations();
    const executedVersions = executed.map(m => m.version);
    
    const migrationFiles = fs.readdirSync(path.join(__dirname, 'scripts'))
      .filter(file => file.endsWith('.js'))
      .sort();
    
    return migrationFiles.filter(file => {
      const version = parseInt(file.split('-')[0]);
      return !executedVersions.includes(version);
    });
  }

  async executeMigration(filename) {
    const migrationPath = path.join(__dirname, 'scripts', filename);
    const migration = require(migrationPath);
    
    const version = parseInt(filename.split('-')[0]);
    const startTime = new Date();
    
    console.log(`Executing migration ${version}: ${filename}`);
    
    try {
      // Execute the migration
      await migration.up(this.db);
      
      // Record successful execution
      await this.db.collection(this.migrationsCollection).insertOne({
        version,
        filename,
        executedAt: new Date(),
        duration: new Date() - startTime,
        status: 'completed'
      });
      
      console.log(`✓ Migration ${version} completed successfully`);
    } catch (error) {
      // Record failed execution
      await this.db.collection(this.migrationsCollection).insertOne({
        version,
        filename,
        executedAt: new Date(),
        duration: new Date() - startTime,
        status: 'failed',
        error: error.message
      });
      
      console.error(`✗ Migration ${version} failed:`, error.message);
      throw error;
    }
  }

  async migrate() {
    await this.connect();
    
    const pendingMigrations = await this.getPendingMigrations();
    
    if (pendingMigrations.length === 0) {
      console.log('No pending migrations');
      return;
    }
    
    console.log(`Found ${pendingMigrations.length} pending migrations`);
    
    for (const migration of pendingMigrations) {
      await this.executeMigration(migration);
    }
    
    console.log('All migrations completed');
  }

  async rollback(version) {
    const rollbackFile = `${version}-rollback-*.js`;
    const rollbackPath = path.join(__dirname, 'rollback');
    
    const files = fs.readdirSync(rollbackPath)
      .filter(file => file.startsWith(`${version.toString().padStart(3, '0')}-rollback`));
    
    if (files.length === 0) {
      throw new Error(`No rollback script found for version ${version}`);
    }
    
    const rollbackScript = require(path.join(rollbackPath, files[0]));
    
    console.log(`Rolling back migration ${version}`);
    
    try {
      await rollbackScript.down(this.db);
      
      // Remove migration record
      await this.db.collection(this.migrationsCollection).deleteOne({ version });
      
      console.log(`✓ Rollback ${version} completed successfully`);
    } catch (error) {
      console.error(`✗ Rollback ${version} failed:`, error.message);
      throw error;
    }
  }

  async disconnect() {
    if (this.client) {
      await this.client.close();
    }
  }
}

module.exports = MigrationRunner;
```

### Migration Template

```javascript
// migrations/templates/collection-migration.js
/**
 * Migration Template
 * Version: XXX
 * Description: [Description of what this migration does]
 * 
 * IMPORTANT: 
 * - Test this migration in staging environment first
 * - Ensure you have a backup before running in production
 * - Review the rollback script before deployment
 */

module.exports = {
  async up(db) {
    console.log('Starting migration XXX: [Description]');
    
    try {
      // Migration logic here
      // Example operations:
      
      // 1. Create new collection
      // await db.createCollection('newCollection', options);
      
      // 2. Add new field to existing documents
      // await db.collection('students').updateMany(
      //   {},
      //   { $set: { newField: defaultValue } }
      // );
      
      // 3. Create indexes
      // await db.collection('students').createIndex({ newField: 1 });
      
      // 4. Data transformation
      // const cursor = db.collection('students').find({});
      // while (await cursor.hasNext()) {
      //   const doc = await cursor.next();
      //   // Transform document
      //   await db.collection('students').updateOne(
      //     { _id: doc._id },
      //     { $set: { transformedField: transformFunction(doc) } }
      //   );
      // }
      
      console.log('Migration XXX completed successfully');
    } catch (error) {
      console.error('Migration XXX failed:', error);
      throw error;
    }
  },

  async down(db) {
    // Rollback logic (implemented in separate rollback file)
    throw new Error('Use dedicated rollback script for this migration');
  }
};
```

## Sample Migration Scripts

### 1. Initial Setup Migration

```javascript
// migrations/scripts/001-initial-setup.js
module.exports = {
  async up(db) {
    console.log('Setting up initial database structure');
    
    // Create collections with validation
    await db.createCollection('students', {
      validator: {
        $jsonSchema: {
          bsonType: 'object',
          required: ['studentId', 'fullName', 'email'],
          properties: {
            studentId: {
              bsonType: 'string',
              description: 'Student ID must be a string and is required'
            },
            fullName: {
              bsonType: 'string',
              description: 'Full name must be a string and is required'
            },
            email: {
              bsonType: 'string',
              pattern: '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$',
              description: 'Email must be a valid email address'
            }
          }
        }
      }
    });

    await db.createCollection('departments');
    await db.createCollection('courses');
    await db.createCollection('classes');
    await db.createCollection('enrollments');
    await db.createCollection('grades');
    await db.createCollection('semesters');
    await db.createCollection('studentStatus');
    await db.createCollection('studentStatusTransitions');

    // Create basic indexes
    await db.collection('students').createIndex({ studentId: 1 }, { unique: true });
    await db.collection('students').createIndex({ email: 1 }, { unique: true });
    await db.collection('courses').createIndex({ courseCode: 1 }, { unique: true });
    await db.collection('classes').createIndex({ classCode: 1 }, { unique: true });
    
    console.log('Initial setup completed');
  }
};
```

### 2. Student Index Migration

```javascript
// migrations/scripts/002-add-student-indexes.js
module.exports = {
  async up(db) {
    console.log('Adding comprehensive indexes for student collection');
    
    const studentCollection = db.collection('students');
    
    // Add text search index
    await studentCollection.createIndex(
      {
        fullName: 'text',
        studentId: 'text'
      },
      {
        weights: {
          fullName: 10,
          studentId: 5
        },
        name: 'StudentTextIndex'
      }
    );
    
    // Add identity document unique index
    await studentCollection.createIndex(
      { 'identityDocument.number': 1 },
      { 
        unique: true, 
        name: 'UniqueIdentityDocumentNumber',
        partialFilterExpression: {
          'identityDocument.number': { $exists: true }
        }
      }
    );
    
    // Add query optimization indexes
    await studentCollection.createIndex({ department: 1 });
    await studentCollection.createIndex({ program: 1 });
    await studentCollection.createIndex({ status: 1 });
    await studentCollection.createIndex({ schoolYear: 1 });
    await studentCollection.createIndex({ phoneNumber: 1 }, { unique: true });
    
    console.log('Student indexes created successfully');
  }
};
```

### 3. Identity Document Structure Migration

```javascript
// migrations/scripts/003-update-identity-document.js
module.exports = {
  async up(db) {
    console.log('Updating identity document structure');
    
    const studentCollection = db.collection('students');
    
    // Find students with old identity document format
    const studentsWithOldFormat = await studentCollection.find({
      'identityDocument.type': { $exists: false }
    }).toArray();
    
    console.log(`Found ${studentsWithOldFormat.length} students with old identity format`);
    
    for (const student of studentsWithOldFormat) {
      const oldDoc = student.identityDocument;
      
      // Transform to new format
      const newDoc = {
        type: 'CMND', // Default to CMND for existing documents
        number: oldDoc.number || oldDoc.cmndNumber || '',
        issueDate: oldDoc.issueDate || new Date('2000-01-01'),
        issuedBy: oldDoc.issuedBy || 'Unknown',
        expiryDate: oldDoc.expiryDate || new Date('2030-12-31')
      };
      
      await studentCollection.updateOne(
        { _id: student._id },
        { $set: { identityDocument: newDoc } }
      );
    }
    
    console.log('Identity document structure updated');
  }
};
```

### 4. Semester Collection Migration

```javascript
// migrations/scripts/004-add-semester-collection.js
module.exports = {
  async up(db) {
    console.log('Creating semester collection and initial data');
    
    // Create semester collection with validation
    await db.createCollection('semesters', {
      validator: {
        $jsonSchema: {
          bsonType: 'object',
          required: ['academicYear', 'semester'],
          properties: {
            academicYear: {
              bsonType: 'string',
              description: 'Academic year must be a string'
            },
            semester: {
              bsonType: 'int',
              minimum: 1,
              maximum: 3,
              description: 'Semester must be 1, 2, or 3'
            }
          }
        }
      }
    });
    
    // Create unique compound index
    await db.collection('semesters').createIndex(
      { academicYear: 1, semester: 1 },
      { unique: true }
    );
    
    // Add other indexes
    await db.collection('semesters').createIndex({ isActive: 1 });
    await db.collection('semesters').createIndex({ registrationStartDate: 1 });
    await db.collection('semesters').createIndex({ registrationEndDate: 1 });
    
    // Insert initial semester data
    const currentYear = new Date().getFullYear();
    const academicYear = `${currentYear}-${currentYear + 1}`;
    
    await db.collection('semesters').insertMany([
      {
        academicYear,
        semester: 1,
        registrationStartDate: new Date(`${currentYear}-08-01`),
        registrationEndDate: new Date(`${currentYear}-08-31`),
        dropDeadline: new Date(`${currentYear}-10-15`),
        semesterStartDate: new Date(`${currentYear}-09-01`),
        semesterEndDate: new Date(`${currentYear}-12-31`),
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        academicYear,
        semester: 2,
        registrationStartDate: new Date(`${currentYear + 1}-01-01`),
        registrationEndDate: new Date(`${currentYear + 1}-01-31`),
        dropDeadline: new Date(`${currentYear + 1}-03-15`),
        semesterStartDate: new Date(`${currentYear + 1}-02-01`),
        semesterEndDate: new Date(`${currentYear + 1}-05-31`),
        isActive: false,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]);
    
    console.log('Semester collection created with initial data');
  }
};
```

### 5. Grade Calculation Migration

```javascript
// migrations/scripts/005-migrate-grade-calculation.js
module.exports = {
  async up(db) {
    console.log('Updating grade calculation logic');
    
    const gradeCollection = db.collection('grades');
    
    // Define grade calculation function
    const calculateGrade = (totalScore) => {
      if (totalScore >= 8.5) return { letter: 'A', points: 4.0 };
      if (totalScore >= 7.0) return { letter: 'B', points: 3.0 };
      if (totalScore >= 5.5) return { letter: 'C', points: 2.0 };
      if (totalScore >= 4.0) return { letter: 'D', points: 1.0 };
      return { letter: 'F', points: 0.0 };
    };
    
    // Update grades with new calculation
    const cursor = gradeCollection.find({});
    let updatedCount = 0;
    
    while (await cursor.hasNext()) {
      const grade = await cursor.next();
      
      if (grade.totalScore !== undefined) {
        const { letter, points } = calculateGrade(grade.totalScore);
        
        await gradeCollection.updateOne(
          { _id: grade._id },
          {
            $set: {
              letterGrade: letter,
              gradePoints: points,
              calculatedAt: new Date()
            }
          }
        );
        
        updatedCount++;
      }
    }
    
    console.log(`Updated ${updatedCount} grade records`);
    
    // Add index for grade queries
    await gradeCollection.createIndex({ letterGrade: 1 });
    await gradeCollection.createIndex({ gradePoints: 1 });
    
    console.log('Grade calculation migration completed');
  }
};
```

## Rollback Scripts

### Identity Document Rollback

```javascript
// migrations/rollback/003-rollback-identity-document.js
module.exports = {
  async down(db) {
    console.log('Rolling back identity document structure changes');
    
    const studentCollection = db.collection('students');
    
    // Find students with new format and convert back
    const studentsWithNewFormat = await studentCollection.find({
      'identityDocument.type': { $exists: true }
    }).toArray();
    
    for (const student of studentsWithNewFormat) {
      const newDoc = student.identityDocument;
      
      // Convert back to old format
      const oldDoc = {
        cmndNumber: newDoc.number,
        issueDate: newDoc.issueDate,
        issuedBy: newDoc.issuedBy,
        expiryDate: newDoc.expiryDate
      };
      
      await studentCollection.updateOne(
        { _id: student._id },
        { $set: { identityDocument: oldDoc } }
      );
    }
    
    // Drop the unique index on identity document number
    try {
      await studentCollection.dropIndex('UniqueIdentityDocumentNumber');
    } catch (error) {
      console.log('Index may not exist:', error.message);
    }
    
    console.log('Identity document rollback completed');
  }
};
```

## Migration Utilities

### Migration Helper Functions

```javascript
// migrations/utils/migration-helper.js
class MigrationHelper {
  constructor(db) {
    this.db = db;
  }

  async batchUpdate(collectionName, filter, update, batchSize = 1000) {
    const collection = this.db.collection(collectionName);
    let processedCount = 0;
    
    const cursor = collection.find(filter);
    const documents = [];
    
    while (await cursor.hasNext()) {
      const doc = await cursor.next();
      documents.push(doc);
      
      if (documents.length >= batchSize) {
        await this.processBatch(collection, documents, update);
        processedCount += documents.length;
        documents.length = 0;
        console.log(`Processed ${processedCount} documents`);
      }
    }
    
    // Process remaining documents
    if (documents.length > 0) {
      await this.processBatch(collection, documents, update);
      processedCount += documents.length;
    }
    
    console.log(`Total processed: ${processedCount} documents`);
    return processedCount;
  }

  async processBatch(collection, documents, updateFunction) {
    const bulkOps = documents.map(doc => ({
      updateOne: {
        filter: { _id: doc._id },
        update: updateFunction(doc)
      }
    }));
    
    await collection.bulkWrite(bulkOps);
  }

  async createIndexSafely(collectionName, indexSpec, options = {}) {
    const collection = this.db.collection(collectionName);
    
    try {
      await collection.createIndex(indexSpec, options);
      console.log(`✓ Created index on ${collectionName}:`, indexSpec);
    } catch (error) {
      if (error.code === 85) { // IndexAlreadyExists
        console.log(`Index already exists on ${collectionName}:`, indexSpec);
      } else {
        throw error;
      }
    }
  }

  async dropIndexSafely(collectionName, indexName) {
    const collection = this.db.collection(collectionName);
    
    try {
      await collection.dropIndex(indexName);
      console.log(`✓ Dropped index ${indexName} from ${collectionName}`);
    } catch (error) {
      if (error.code === 27) { // IndexNotFound
        console.log(`Index ${indexName} not found on ${collectionName}`);
      } else {
        throw error;
      }
    }
  }

  async validateDocuments(collectionName, validator) {
    const collection = this.db.collection(collectionName);
    const cursor = collection.find({});
    const errors = [];
    
    while (await cursor.hasNext()) {
      const doc = await cursor.next();
      const validation = validator(doc);
      
      if (!validation.isValid) {
        errors.push({
          _id: doc._id,
          errors: validation.errors
        });
      }
    }
    
    return errors;
  }
}

module.exports = MigrationHelper;
```

### Validation Helper

```javascript
// migrations/utils/validation-helper.js
class ValidationHelper {
  static validateStudentDocument(doc) {
    const errors = [];
    
    if (!doc.studentId) {
      errors.push('Missing studentId');
    }
    
    if (!doc.fullName) {
      errors.push('Missing fullName');
    }
    
    if (!doc.email || !this.isValidEmail(doc.email)) {
      errors.push('Invalid email');
    }
    
    if (doc.identityDocument && !this.isValidIdentityDocument(doc.identityDocument)) {
      errors.push('Invalid identity document structure');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  static isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  static isValidIdentityDocument(doc) {
    const requiredFields = ['type', 'number', 'issueDate', 'issuedBy', 'expiryDate'];
    return requiredFields.every(field => doc[field] !== undefined);
  }

  static validateEnrollmentDocument(doc) {
    const errors = [];
    
    if (!doc.student) {
      errors.push('Missing student reference');
    }
    
    if (!doc.class) {
      errors.push('Missing class reference');
    }
    
    if (!doc.status || !['ACTIVE', 'DROPPED', 'COMPLETED'].includes(doc.status)) {
      errors.push('Invalid enrollment status');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

module.exports = ValidationHelper;
```

## Usage Examples

### Running Migrations

```bash
# Run all pending migrations
node migrations/migrate.js

# Run migrations with specific environment
NODE_ENV=production node migrations/migrate.js

# Check migration status
node migrations/migrate.js --status

# Rollback specific migration
node migrations/migrate.js --rollback 003
```

### CLI Implementation

```javascript
// migrations/cli.js
const MigrationRunner = require('./migrate');
const config = require('../src/configs/database.config');

async function main() {
  const args = process.argv.slice(2);
  const command = args[0];
  
  const migrationRunner = new MigrationRunner(config.mongoURI);
  
  try {
    switch (command) {
      case '--status':
        await migrationRunner.connect();
        const executed = await migrationRunner.getExecutedMigrations();
        const pending = await migrationRunner.getPendingMigrations();
        
        console.log('Executed migrations:', executed.length);
        executed.forEach(m => console.log(`  ✓ ${m.version}: ${m.filename}`));
        
        console.log('Pending migrations:', pending.length);
        pending.forEach(m => console.log(`  ○ ${m}`));
        break;
        
      case '--rollback':
        const version = parseInt(args[1]);
        if (!version) {
          throw new Error('Version number required for rollback');
        }
        await migrationRunner.rollback(version);
        break;
        
      case '--dry-run':
        console.log('Dry run mode - migrations will not be executed');
        await migrationRunner.connect();
        const pendingDryRun = await migrationRunner.getPendingMigrations();
        console.log('Would execute:', pendingDryRun);
        break;
        
      default:
        await migrationRunner.migrate();
    }
  } catch (error) {
    console.error('Migration failed:', error.message);
    process.exit(1);
  } finally {
    await migrationRunner.disconnect();
  }
}

main();
```

## Best Practices

### 1. Migration Development

- **Test First**: Always test migrations in development and staging
- **Backup Data**: Create backups before running migrations in production
- **Small Changes**: Keep migrations focused on single, specific changes
- **Version Control**: Include migrations in version control system
- **Documentation**: Document complex migrations thoroughly

### 2. Performance Considerations

- **Batch Processing**: Use batch updates for large collections
- **Index Creation**: Create indexes during low-traffic periods
- **Progress Tracking**: Log progress for long-running migrations
- **Resource Monitoring**: Monitor CPU and memory usage during migrations

### 3. Error Handling

- **Atomic Operations**: Use transactions where possible
- **Rollback Plans**: Always have rollback procedures ready
- **Error Logging**: Log detailed error information
- **Partial Failures**: Handle partial migration failures gracefully

### 4. Production Deployment

- **Maintenance Windows**: Schedule migrations during maintenance windows
- **Monitoring**: Monitor application health during and after migrations
- **Communication**: Notify stakeholders of planned migrations
- **Validation**: Validate data integrity after migrations

## Troubleshooting

### Common Issues

1. **Index Creation Failures**:
   ```javascript
   // Handle duplicate key errors
   try {
     await collection.createIndex({ field: 1 }, { unique: true });
   } catch (error) {
     if (error.code === 11000) {
       console.log('Duplicate data found, cleaning up...');
       // Clean up duplicates before creating index
     }
   }
   ```

2. **Memory Issues with Large Collections**:
   ```javascript
   // Use cursor with proper batch size
   const cursor = collection.find({}).batchSize(100);
   ```

3. **Migration Conflicts**:
   ```javascript
   // Check for conflicting migrations
   const conflicts = await migrationRunner.checkConflicts();
   if (conflicts.length > 0) {
     throw new Error(`Migration conflicts detected: ${conflicts.join(', ')}`);
   }
   ```

### Recovery Procedures

1. **Failed Migration Recovery**:
   - Identify the point of failure
   - Restore from backup if necessary
   - Fix the migration script
   - Re-run the migration

2. **Data Corruption Recovery**:
   - Stop the application
   - Restore from the most recent backup
   - Review and fix the migration
   - Re-deploy with corrected migration

## Related Documentation

- [Database Schema](./schema.md) - Complete database schema documentation
- [Architecture Overview](../02-architecture/overview.md) - System architecture
- [Adding New Entities](../03-development/adding-entities.md) - Entity development guide
- [Data Validation](../03-development/validation.md) - Validation patterns 