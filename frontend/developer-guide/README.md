# 📚 Developer Guide - Moodle Academic Management System

## 🎯 Project Overview

This is a comprehensive **Vue.js-based academic management system** (Moodle-like) designed for educational institutions. The system provides complete student lifecycle management, course administration, class scheduling, and academic records management.

### 🏫 What This System Does
- **Student Management**: Complete CRUD operations, status tracking, import/export capabilities
- **Course & Class Management**: Course creation, class scheduling, enrollment management
- **Academic Administration**: Department, program, and status management
- **Enrollment System**: Course registration and dropping with validation
- **Grade Management**: Transcript generation and PDF export
- **Multi-language Support**: Full internationalization (English/Vietnamese)

---

## 🛠️ Technology Stack

### **Core Framework**
- **Vue 3** - Progressive JavaScript framework with Composition API
- **Vuex 4** - Centralized state management (8 domain modules)
- **Vue Router 4** - Client-side routing (15+ routes)
- **Vue I18n 9** - Internationalization (400+ translation keys)

### **UI & Styling**
- **Bootstrap 5** - Responsive CSS framework
- **Bootstrap Icons** - Comprehensive icon library
- **Custom SCSS** - Tailored styling

### **Development Tools**
- **Vue CLI 5** - Build tooling and development server
- **ESLint** - Code linting with Vue 3 rules
- **Babel** - JavaScript transpilation

### **Libraries & Utilities**
- **Axios** - HTTP client with interceptors
- **Vuelidate 2** - Form validation
- **jsPDF & PDFMake** - PDF generation
- **Docker** - Containerization support

---

## 📊 Project Statistics

| Metric | Count |
|--------|-------|
| **Vue Components** | 30+ (12 views + 18+ components) |
| **Store Modules** | 8 (student, course, class, department, program, status, enrollment, transcript) |
| **API Services** | 11 domain-specific services |
| **Translation Keys** | 400+ (English/Vietnamese) |
| **Routes** | 15+ application routes |
| **Lines of Code** | 8,000+ (excluding node_modules) |

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Vue.js Frontend                        │
├─────────────────────────────────────────────────────────────┤
│  Views (12)     │  Components (18+)  │  Composables (1)    │
│  ├─ StudentList │  ├─ Layout (8)     │  └─ useErrorHandler │
│  ├─ AddStudent  │  ├─ Student (4)    │                     │
│  ├─ ClassMgmt   │  ├─ Course (3)     │                     │
│  └─ ...         │  └─ Class (2)      │                     │
├─────────────────────────────────────────────────────────────┤
│              State Management (Vuex 4)                     │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │ 8 Domain Modules: student | course | class | dept |   │ │
│  │ program | status | enrollment | transcript            │ │
│  └─────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────┤
│                Service Layer (11 APIs)                     │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │ Axios Client + Interceptors → Backend REST APIs        │ │
│  └─────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────┤
│         Utilities & Helpers                                │
│  Format Utils | Validation | i18n | Error Handling        │
└─────────────────────────────────────────────────────────────┘
```

---

## 🚀 Key Features

### 👥 Student Management
- **Complete CRUD Operations**: Add, edit, delete, view students
- **Advanced Search & Filtering**: By department, name, ID
- **Status Management**: Student status transitions with validation rules
- **Data Import/Export**: CSV, JSON, XML, Excel support
- **Complex Forms**: Address, identity documents, personal info
- **Pagination**: Efficient data loading and navigation

### 📚 Course & Class System
- **Course Management**: Create and manage academic courses
- **Class Scheduling**: Time slots, rooms, lecturer assignments
- **Enrollment Management**: Student registration and capacity limits
- **Academic Calendar**: Semester and academic year handling

### 🏛️ Administrative Features
- **Department Management**: Organizational structure
- **Program Management**: Academic programs and curricula
- **Status Types**: Configurable student status categories
- **Status Transitions**: Business rules for status changes

### 📊 Academic Records
- **Grade Management**: Transcript generation and viewing
- **PDF Export**: Professional transcript documents
- **GPA Calculation**: Multiple grading scales (4.0 and 10.0)
- **Course History**: Complete academic record tracking

### 🌍 Internationalization
- **Multi-language Support**: English and Vietnamese
- **Dynamic Language Switching**: Runtime language changes
- **Localized Content**: 400+ translation keys
- **Cultural Formatting**: Dates, numbers, addresses

---

## 📖 Documentation Structure

This developer guide is organized into focused sections for easy navigation:

### 🚀 Getting Started
- **[Setup Guide](getting-started/setup.md)** - Installation, environment setup, first run
- **[Project Structure](getting-started/project-structure.md)** - Code organization and conventions

### 🏗️ Architecture
- **[System Overview](architecture/overview.md)** - Design patterns, data flow, components
- **[State Management](architecture/state-management.md)** - Vuex stores, modules, best practices

### 💻 Development
- **[Coding Guide](development/coding-guide.md)** - Standards, components, validation, i18n
- **[Features Guide](development/features.md)** - Domain-specific implementation details

### 🚀 Deployment
- **[Deployment Guide](deployment/guide.md)** - Build process, Docker, production setup

### 🔧 Support
- **[Troubleshooting](troubleshooting/common-issues.md)** - FAQ, debugging, common problems

---

## 🎯 Quick Start

```bash
# 1. Clone and install
git clone [repository-url]
cd moodle-system
npm install

# 2. Environment setup
cp .env.example .env
# Edit .env with your API URL

# 3. Start development
npm run serve
# Open http://localhost:8080

# 4. Build for production
npm run build
```

---

## 👥 Target Audience

This documentation is designed for:

- **Frontend Developers** - Working with Vue.js, Vuex, and modern JavaScript
- **Full-stack Developers** - Integrating frontend with backend APIs
- **DevOps Engineers** - Deploying and maintaining the application
- **QA Engineers** - Understanding system functionality for testing
- **Project Managers** - Technical overview and feature scope

---

## 🤝 Contributing

When working on this project:

1. **Read the Documentation** - Start with the relevant sections above
2. **Follow Coding Standards** - Detailed in the [Coding Guide](development/coding-guide.md)
3. **Understand Architecture** - Review [System Overview](architecture/overview.md)
4. **Test Your Changes** - Ensure functionality works across features
5. **Update Documentation** - Keep docs current with code changes

---

## 📞 Support

For questions or issues:

- **Architecture Questions** → See [System Overview](architecture/overview.md)
- **Development Issues** → Check [Troubleshooting](troubleshooting/common-issues.md)
- **Feature Implementation** → Review [Features Guide](development/features.md)
- **Deployment Problems** → Consult [Deployment Guide](deployment/guide.md)

---

## 📄 License

This project is part of the academic management system developed for educational purposes.

---

**Happy Coding! 🚀**

> *This documentation is maintained alongside the codebase. Please keep it updated as the system evolves.* 