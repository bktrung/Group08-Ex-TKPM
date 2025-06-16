# Installation Guide

This guide will help you set up the Student Management System development environment on your local machine.

## Prerequisites

Before you begin, ensure you have the following installed:

### Required Software
- **Node.js** (v16.0.0 or higher) - [Download](https://nodejs.org/)
- **npm** (v8.0.0 or higher) - Usually comes with Node.js
- **MongoDB** (v5.0 or higher) - [Download](https://www.mongodb.com/try/download/community)
- **Git** - [Download](https://git-scm.com/downloads)

### Verify Installation
```bash
# Check Node.js version
node --version

# Check npm version
npm --version

# Check MongoDB version
mongod --version

# Check Git version
git --version
```

## Clone the Repository

```bash
# Clone the repository
git clone <repository-url>
cd student-management-system/backend

# Or if you already have the project
cd path/to/your/project/backend
```

## Install Dependencies

```bash
# Install all dependencies
npm install

# This will install both dependencies and devDependencies
```

### Key Dependencies Installed
- **express**: Web framework
- **mongoose**: MongoDB object modeling
- **inversify**: Dependency injection container
- **joi**: Data validation
- **jest**: Testing framework
- **typescript**: TypeScript compiler
- **swagger-ui-express**: API documentation

## Environment Configuration

### 1. Environment Variables

Create a `.env` file in the root directory:

```bash
# Copy from example (if available)
cp .env.example .env

# Or create manually
touch .env
```

Add the following environment variables to `.env`:

```env
# Application
NODE_ENV=development
PORT=3456

# Database
MONGODB_URI=mongodb://localhost:27017/student_management_dev
MONGODB_TEST_URI=mongodb://localhost:27017/student_management_test

# API Configuration
API_VERSION=v1
BASE_URL=http://localhost:3456

# Logging
LOG_LEVEL=debug
```

### 2. Database Setup

#### Option A: Local MongoDB
```bash
# Start MongoDB service (Linux/macOS)
sudo systemctl start mongod

# Or using Homebrew on macOS
brew services start mongodb-community

# Or start manually
mongod --dbpath /path/to/your/db/directory
```

#### Option B: MongoDB Atlas (Cloud)
1. Create account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a cluster
3. Get connection string
4. Update `MONGODB_URI` in `.env`

## Build the Application

```bash
# Compile TypeScript to JavaScript
npm run build

# The compiled code will be in the 'dist' directory
```

## Verify Installation

### 1. Run Tests
```bash
# Run all tests
npm test

# Run tests with coverage
npm run test

# The tests should pass with >80% coverage
```

### 2. Start Development Server
```bash
# Start in development mode
npm run dev

# You should see output like:
# Server running on port 3456
# Connected to MongoDB
# Swagger docs available at http://localhost:3456/api-docs
```

### 3. Verify API Endpoints
```bash
# Test basic endpoint
curl http://localhost:3456/v1/api/departments

# Or visit in browser:
# http://localhost:3456/api-docs (Swagger documentation)
```

## Development Tools Setup

### 1. TypeScript Configuration
The project uses `tsconfig.json` for TypeScript configuration. Key settings:
- Target: ES2020
- Module: CommonJS
- Strict type checking enabled
- Decorators enabled for Inversify

### 2. Jest Configuration
Testing is configured in `jest.config.js`:
- TypeScript support with ts-jest
- MongoDB Memory Server for testing
- 80% code coverage threshold

### 3. Code Quality Tools (Optional but Recommended)

Install ESLint and Prettier:
```bash
# Install globally or use npx
npm install -g eslint prettier

# Or use with npx
npx eslint src/
npx prettier --write src/
```

## Initial Data Setup

Run the initial data setup script:
```bash
# This will create default departments, programs, and status types
./setup_initial_data.sh

# Or run manually if needed
chmod +x setup_initial_data.sh
./setup_initial_data.sh
```

## Troubleshooting

### Common Issues

#### 1. MongoDB Connection Issues
```bash
# Check if MongoDB is running
sudo systemctl status mongod

# Check logs
tail -f /var/log/mongodb/mongod.log
```

#### 2. Port Already in Use
```bash
# Find process using port 3456
lsof -i :3456

# Kill the process
kill -9 <PID>

# Or change port in .env file
```

#### 3. TypeScript Compilation Errors
```bash
# Clean and rebuild
rm -rf dist/
npm run build

# Check for TypeScript errors
npx tsc --noEmit
```

#### 4. Dependency Issues
```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

#### 5. Test Failures
```bash
# Run tests in verbose mode
npm test -- --verbose

# Run specific test file
npm test -- student.test.ts
```

### Getting Help

If you encounter issues not covered here:
1. Check the [troubleshooting section](#troubleshooting)
2. Review error logs in `logs/` directory
3. Search existing issues in the repository
4. Create a new issue with detailed error information

## Next Steps

Once installation is complete:
1. [First Run Guide](./first-run.md) - Start the application
2. [Architecture Overview](../02-architecture/overview.md) - Understand the system
3. [Coding Standards](../03-development/coding-standards.md) - Learn our conventions 