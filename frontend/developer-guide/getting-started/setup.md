# 🚀 Setup Guide

This guide will help you set up the Moodle Academic Management System on your local development environment.

---

## 📋 Prerequisites

### System Requirements
- **Node.js**: v18.0.0 or higher
- **npm**: v8.0.0 or higher (comes with Node.js)
- **Git**: Latest version
- **Modern Browser**: Chrome, Firefox, Safari, or Edge

### Check Your Environment
```bash
# Verify Node.js version
node --version
# Should output: v18.x.x or higher

# Verify npm version
npm --version
# Should output: 8.x.x or higher

# Verify Git
git --version
```

---

## 📥 Installation

### 1. Clone the Repository
```bash
# Clone the project
git clone [your-repository-url]

# Navigate to the frontend directory
cd frontend/moodle-system
```

### 2. Install Dependencies
```bash
# Install all npm packages
npm install

# This will install:
# - Vue 3 and ecosystem (Vue Router, Vuex)
# - UI libraries (Bootstrap 5, Bootstrap Icons)
# - Development tools (Vue CLI, ESLint, Babel)
# - Utilities (Axios, Vuelidate, i18n, PDF libraries)
```

**Expected Output:**
```
added 1200+ packages in 45s
```

### 3. Verify Installation
```bash
# Check if all packages are installed correctly
npm list --depth=0

# Should show main dependencies without errors
```

---

## ⚙️ Environment Configuration

### 1. Environment Variables
Create environment configuration files:

```bash
# Create development environment file
touch .env.development

# Create production environment file (optional)
touch .env.production
```

### 2. Configure Development Environment
Edit `.env.development`:

```bash
# API Configuration
VUE_APP_API_URL=http://localhost:3456

# Development Settings
NODE_ENV=development
VUE_APP_ENV=development

# Optional: Debug settings
VUE_APP_DEBUG=true
```

### 3. Configure Production Environment (Optional)
Edit `.env.production`:

```bash
# API Configuration
VUE_APP_API_URL=https://your-production-api.com

# Production Settings
NODE_ENV=production
VUE_APP_ENV=production

# Security Settings
VUE_APP_DEBUG=false
```

### 4. Environment Variables Explained

| Variable | Purpose | Default | Required |
|----------|---------|---------|----------|
| `VUE_APP_API_URL` | Backend API base URL | `http://localhost:3456` | ✅ Yes |
| `NODE_ENV` | Build environment | `development` | ✅ Yes |
| `VUE_APP_ENV` | App environment | `development` | ❌ No |
| `VUE_APP_DEBUG` | Enable debug mode | `false` | ❌ No |

---

## 🏃‍♂️ Running the Application

### Development Server
```bash
# Start the development server
npm run serve

# Expected output:
#  App running at:
#  - Local:   http://localhost:8080/
#  - Network: http://192.168.1.x:8080/
```

### Available Commands

| Command | Purpose | When to Use |
|---------|---------|-------------|
| `npm run serve` | Start development server | Daily development |
| `npm run build` | Build for production | Deployment preparation |
| `npm run lint` | Check code quality | Before committing |
| `npm run lint -- --fix` | Fix linting issues | Code cleanup |

### Development Server Features
- **Hot Module Replacement**: Changes reflect instantly
- **Error Overlay**: Compilation errors shown in browser
- **Network Access**: Available on local network
- **Source Maps**: Debug original source code

---

## ✅ Verification Steps

### 1. Application Loads Successfully
1. Open browser to `http://localhost:8080`
2. You should see the **Student Management** page
3. The sidebar should show all navigation items
4. Language switcher (🌐) should be visible in bottom-right

### 2. Check Core Functionality
```bash
# Test basic features:
```

**Navigation Test:**
- Click on different sidebar items (Courses, Classes, Departments)
- All pages should load without errors

**Language Test:**
- Click the 🌐 button in bottom-right
- Switch between English and Vietnamese
- Interface should change languages immediately

**API Connection Test:**
- Go to Student List page
- If backend is running, you should see student data or loading spinner
- If backend is not running, you should see error messages (this is expected)

### 3. Development Tools Check
```bash
# Check linting works
npm run lint

# Should output: No linting errors found
```

**Browser Developer Tools:**
- Open F12 Developer Tools
- Check Console tab for any errors
- Network tab should show API requests (may fail if backend not running)

---

## 🔧 Troubleshooting

### Common Issues and Solutions

#### Node.js Version Issues
```bash
# Error: "engines" field in package.json
# Solution: Update Node.js to v18+

# Check current version
node --version

# Update using nvm (recommended)
nvm install 18
nvm use 18
```

#### Port Already in Use
```bash
# Error: Port 8080 is already in use
# Solution: Use different port

npm run serve -- --port 8081
# Or set in vue.config.js
```

#### npm Install Failures
```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

#### Environment Variables Not Loading
```bash
# Ensure .env files are in correct location
ls -la .env*

# Restart development server after changing .env
# Ctrl+C to stop, then npm run serve again
```

#### API Connection Issues
```bash
# Check if API URL is correct in .env.development
cat .env.development

# Test API connectivity (if backend is running)
curl http://localhost:3456/v1/api/students
```

#### Build Issues
```bash
# Clear Vue CLI cache
rm -rf node_modules/.cache

# Reinstall dependencies
npm install

# Try building again
npm run build
```

### Getting Help

If you encounter issues:

1. **Check Browser Console**: F12 → Console tab for JavaScript errors
2. **Check Terminal Output**: Look for error messages in terminal
3. **Verify Prerequisites**: Ensure Node.js and npm versions are correct
4. **Check Environment**: Verify .env files are configured correctly
5. **Clear Cache**: Try clearing npm cache and node_modules

---

## 🎯 Next Steps

Once your setup is complete:

1. **Explore the Application**: Navigate through different pages
2. **Read Project Structure**: Continue to [Project Structure Guide](project-structure.md)
3. **Understand Architecture**: Review [System Overview](../architecture/overview.md)
4. **Start Development**: Check [Coding Guide](../development/coding-guide.md)

---

## 📝 Development Workflow

### Daily Development
```bash
# 1. Start your day
git pull origin main
npm install  # if package.json changed

# 2. Start development server
npm run serve

# 3. Make changes and test
# - Code changes auto-reload
# - Check browser console for errors
# - Test functionality manually

# 4. Before committing
npm run lint
git add .
git commit -m "Your commit message"
```

### Working with Backend
If you have the backend API running:

```bash
# Backend typically runs on:
# http://localhost:3456

# Frontend will automatically connect via:
# VUE_APP_API_URL=http://localhost:3456
```

---

## 🚀 Ready to Code!

Your development environment is now set up! The application should be running at `http://localhost:8080` with:

- ✅ Vue 3 + Composition API
- ✅ Vuex state management
- ✅ Vue Router navigation
- ✅ Bootstrap 5 UI
- ✅ Internationalization (EN/VI)
- ✅ Hot module replacement
- ✅ ESLint code quality

**Happy coding! 🎉** 