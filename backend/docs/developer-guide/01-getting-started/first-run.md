# First Run Guide

This guide walks you through running the Student Management System for the first time after installation.

## Pre-flight Checklist

Before starting the application, ensure you have completed:

- ✅ [Installation Guide](./installation.md)
- ✅ MongoDB is running
- ✅ Dependencies are installed (`npm install`)
- ✅ Environment variables are configured (`.env` file)
- ✅ Application builds successfully (`npm run build`)

## Starting the Application

### Development Mode

```bash
# Start in development mode with hot reload
npm run dev
```

Expected output:
```
[INFO] Starting Student Management System...
[INFO] Environment: development
[INFO] Connecting to MongoDB...
[INFO] ✓ Connected to MongoDB: mongodb://localhost:27017/student_management_dev
[INFO] ✓ Dependency injection container configured
[INFO] ✓ Express server configured
[INFO] ✓ Routes initialized
[INFO] ✓ Middleware configured
[INFO] Server running on port 3456
[INFO] Swagger documentation available at: http://localhost:3456/api-docs
```

### Production Mode

```bash
# Build and start in production mode
npm run build
npm start
```

## Verify the Application

### 1. Health Check

Test basic connectivity:
```bash
# Using curl
curl http://localhost:3456/health

# Expected response:
# {"status": "OK", "timestamp": "2024-01-15T10:30:00.000Z"}
```

### 2. API Documentation

Visit the Swagger documentation:
- **URL**: http://localhost:3456/api-docs
- This provides interactive API documentation
- You can test endpoints directly from the browser

### 3. Test Basic Endpoints

#### Get Departments
```bash
curl http://localhost:3456/v1/api/departments
```

Expected response:
```json
{
  "status": "success",
  "code": 200,
  "message": "Departments retrieved successfully",
  "metadata": {
    "departments": []
  }
}
```

#### Get Programs
```bash
curl http://localhost:3456/v1/api/programs
```

#### Get Student Status Types
```bash
curl http://localhost:3456/v1/api/students/status-types
```

## Initial Data Setup

### Run Setup Script

If you haven't already, run the initial data setup:

```bash
./setup_initial_data.sh
```

This script will:
- Create default departments (Computer Science, Mathematics, etc.)
- Create default programs (Bachelor, Master, etc.)
- Create student status types (Active, Graduated, etc.)
- Set up status transitions

### Verify Initial Data

After running the setup script, verify data was created:

```bash
# Check departments
curl http://localhost:3456/v1/api/departments

# Check programs
curl http://localhost:3456/v1/api/programs

# Check student status types
curl http://localhost:3456/v1/api/students/status-types
```

You should now see actual data instead of empty arrays.

## Testing the API

### Using Swagger UI

1. Open http://localhost:3456/api-docs in your browser
2. Expand any endpoint (e.g., "Departments")
3. Click "Try it out"
4. Click "Execute"
5. Review the response

### Using curl Examples

#### Create a Department
```bash
curl -X POST http://localhost:3456/v1/api/departments \
  -H "Content-Type: application/json" \
  -d '{"name": "Computer Science"}'
```

#### Create a Program
```bash
curl -X POST http://localhost:3456/v1/api/programs \
  -H "Content-Type: application/json" \
  -d '{"name": "Bachelor of Computer Science"}'
```

#### Create a Student
```bash
curl -X POST http://localhost:3456/v1/api/students \
  -H "Content-Type: application/json" \
  -d '{
    "studentId": "22000001",
    "fullName": "John Doe",
    "dateOfBirth": "2000-01-15T00:00:00.000Z",
    "gender": "Male",
    "department": "<department-id>",
    "schoolYear": 2022,
    "program": "<program-id>",
    "mailingAddress": {
      "houseNumberStreet": "123 Main St",
      "wardCommune": "Ward 1",
      "districtCounty": "District 1",
      "provinceCity": "Ho Chi Minh City",
      "country": "Vietnam"
    },
    "email": "john.doe@student.edu",
    "phoneNumber": "0901234567",
    "status": "<status-id>",
    "identityDocument": {
      "type": "CCCD",
      "number": "038204012567",
      "issueDate": "2020-01-15T00:00:00.000Z",
      "issuedBy": "Cong An TP HCM",
      "expiryDate": "2035-01-15T00:00:00.000Z",
      "hasChip": true
    },
    "nationality": "Vietnamese"
  }'
```

## Monitoring and Logs

### Application Logs

The application logs are stored in the `logs/` directory:
- `logs/app.log` - Application logs
- `logs/error.log` - Error logs
- `logs/access.log` - HTTP access logs

View logs in real-time:
```bash
# All logs
tail -f logs/app.log

# Error logs only
tail -f logs/error.log

# Access logs
tail -f logs/access.log
```

### Database Monitoring

Monitor MongoDB connection:
```bash
# Check MongoDB status
sudo systemctl status mongod

# MongoDB logs
tail -f /var/log/mongodb/mongod.log

# Connect to MongoDB shell
mongo mongodb://localhost:27017/student_management_dev
```

## Common First-Run Issues

### 1. Port Already in Use

**Error**: `EADDRINUSE: address already in use :::3456`

**Solution**:
```bash
# Find and kill process using port 3456
lsof -i :3456
kill -9 <PID>

# Or change port in .env file
echo "PORT=3457" >> .env
```

### 2. MongoDB Connection Failed

**Error**: `MongoNetworkError: failed to connect to server`

**Solution**:
```bash
# Start MongoDB
sudo systemctl start mongod

# Check if MongoDB is running
sudo systemctl status mongod
```

### 3. TypeScript Compilation Errors

**Error**: Build failures or type errors

**Solution**:
```bash
# Clean build
rm -rf dist/
npm run build

# Check TypeScript configuration
npx tsc --noEmit
```

### 4. Missing Environment Variables

**Error**: `Environment variable not found`

**Solution**:
1. Ensure `.env` file exists
2. Check all required variables are set
3. Restart the application

## Next Steps

Now that your application is running:

1. **Explore the API**: Use Swagger UI to understand available endpoints
2. **Read Architecture**: [Architecture Overview](../02-architecture/overview.md)
3. **Learn Development**: [Coding Standards](../03-development/coding-standards.md)
4. **Database Schema**: [Database Documentation](../04-database/schema.md)
5. **Testing**: [Unit Testing Guide](../05-testing/unit-testing.md)

## Development Workflow

### Typical Development Session

1. **Start the application**:
   ```bash
   npm run dev
   ```

2. **Make code changes** in `src/` directory

3. **Application auto-reloads** (thanks to nodemon/ts-node)

4. **Run tests**:
   ```bash
   npm test
   ```

5. **Check API documentation** at http://localhost:3456/api-docs

6. **Test endpoints** using Swagger UI or curl

### Hot Reload

The development server supports hot reload:
- Changes to TypeScript files automatically restart the server
- No need to manually restart for most changes
- Database connections are preserved

## Support

If you encounter issues during first run:
1. Check the [troubleshooting section](#common-first-run-issues)
2. Review application logs in `logs/` directory
3. Verify all prerequisites are met
4. Consult the [Installation Guide](./installation.md)

Congratulations! Your Student Management System is now running successfully. 🎉 