# 📁 Project Structure Guide

This guide explains how the Moodle Academic Management System is organized, including folder structure, naming conventions, and architectural patterns.

---

## 🏗️ High-Level Structure

```
moodle-system/
├── public/                 # Static assets
├── src/                    # Source code (main development area)
├── node_modules/           # Dependencies (auto-generated)
├── package.json            # Project configuration
├── vue.config.js           # Vue CLI configuration
├── .eslintrc.js           # ESLint configuration
├── babel.config.js        # Babel configuration
├── jsconfig.json          # JavaScript configuration
├── Dockerfile             # Docker containerization
├── nginx.conf             # Nginx configuration
└── README.md              # Basic project info
```

---

## 📂 Source Code Organization (`src/`)

The `src/` directory contains all application source code, organized by function and domain:

```
src/
├── views/                  # 📄 Page Components (12 files)
├── components/             # 🧩 Reusable Components (18+ files)
├── store/                  # 🗄️ Vuex State Management (9 files)
├── services/               # 🌐 API Integration Layer (12 files)
├── router/                 # 🛣️ Route Configuration (1 file)
├── locales/                # 🌍 Internationalization (2 files)
├── composables/            # 🔧 Vue 3 Composition Functions (1 file)
├── utils/                  # 🛠️ Utility Functions (3 files)
├── assets/                 # 🎨 Static Assets
├── App.vue                 # 🏠 Root Application Component
├── main.js                 # 🚀 Application Entry Point
└── i18n.js                 # 🌐 i18n Configuration
```

---

## 📄 Views Directory (`src/views/`)

**Purpose**: Page-level components that correspond to routes. Each view represents a complete page in the application.

```
views/
├── StudentList.vue         # 👥 Main student management page (290 lines)
├── AddStudent.vue          # ➕ Add new student form (167 lines)
├── EditStudent.vue         # ✏️ Edit existing student (289 lines)
├── CourseManage.vue        # 📚 Course management page (215 lines)
├── ClassManage.vue         # 🏫 Class management page (417 lines)
├── DepartmentManage.vue    # 🏛️ Department CRUD operations (151 lines)
├── ProgramManage.vue       # 🎓 Academic program management (141 lines)
├── StatusManage.vue        # 📊 Student status types (142 lines)
├── StatusTransition.vue    # 🔄 Status transition rules (280 lines)
├── GradeTable.vue          # 📋 Transcript/grade viewing (142 lines)
├── RegisterCourse.vue      # 📝 Course enrollment (117 lines)
├── DropCourse.vue          # 🗑️ Course dropping (219 lines)
└── AcademicAffairsRegistration.vue # 🏢 Academic affairs hub (128 lines)
```

### View Naming Convention
- **PascalCase**: `StudentList.vue`, `CourseManage.vue`
- **Descriptive**: Names clearly indicate the page purpose
- **Action-based**: `AddStudent`, `EditStudent`, `RegisterCourse`

---

## 🧩 Components Directory (`src/components/`)

**Purpose**: Reusable UI components organized by domain and function.

```
components/
├── layout/                 # 🎨 UI Layout Components (8 files)
│   ├── AppSidebar.vue     # Main navigation sidebar (84 lines)
│   ├── BaseModal.vue      # Base modal component (73 lines)
│   ├── ConfirmModal.vue   # Confirmation dialogs (99 lines)
│   ├── ErrorModal.vue     # Error notifications (103 lines)
│   ├── SuccessModal.vue   # Success notifications (99 lines)
│   ├── DefaultPagination.vue # Pagination component (123 lines)
│   ├── BasePagination.vue # Base pagination logic (96 lines)
│   └── ScheduleModal.vue  # Class schedule display (86 lines)
│
├── student/               # 👥 Student-Specific Components (4 files)
│   ├── StudentForm.vue    # Main student form (524 lines)
│   ├── AddressFields.vue  # Address input fields (913 lines)
│   ├── IdentityDocumentFields.vue # ID document fields (414 lines)
│   └── ImportExport.vue   # Data import/export (333 lines)
│
├── course/                # 📚 Course-Specific Components (3 files)
│   ├── CourseForm.vue     # Course creation/editing (257 lines)
│   ├── CourseTable.vue    # Course data display (188 lines)
│   └── CourseList.vue     # Course listing with filters (356 lines)
│
└── class/                 # 🏫 Class-Specific Components (2 files)
    ├── ClassForm.vue      # Class creation/editing (414 lines)
    └── ClassTable.vue     # Class data display (183 lines)
```

### Component Organization Principles

#### 1. **Domain-Based Grouping**
- `student/` - All student-related components
- `course/` - All course-related components  
- `class/` - All class-related components
- `layout/` - General UI components

#### 2. **Component Types**
- **Forms**: `StudentForm.vue`, `CourseForm.vue` - Data input components
- **Tables**: `CourseTable.vue`, `ClassTable.vue` - Data display components
- **Modals**: `ConfirmModal.vue`, `ErrorModal.vue` - Dialog components
- **Fields**: `AddressFields.vue` - Specialized input groups

#### 3. **Naming Convention**
- **PascalCase**: All component files use PascalCase
- **Descriptive**: Names indicate component purpose
- **Suffix-based**: `Form`, `Table`, `Modal`, `Fields` for component types

---

## 🗄️ Store Directory (`src/store/`)

**Purpose**: Vuex state management organized by domain modules.

```
store/
├── index.js               # 🏠 Root store configuration (38 lines)
└── modules/               # 📦 Domain-specific modules
    ├── student.js         # 👥 Student state management (204 lines)
    ├── course.js          # 📚 Course state management (225 lines)
    ├── class.js           # 🏫 Class state management (152 lines)
    ├── department.js      # 🏛️ Department state (91 lines)
    ├── program.js         # 🎓 Program state (90 lines)
    ├── status.js          # 📊 Status state (292 lines)
    ├── enrollment.js      # 📝 Enrollment state (77 lines)
    └── transcript.js      # 📋 Transcript state (41 lines)
```

### Store Module Pattern
Each module follows the same structure:
```javascript
// Example: store/modules/student.js
export default {
  namespaced: true,
  state: {
    // Domain-specific state
    students: [],
    currentPage: 1,
    loading: false,
    error: null
  },
  mutations: {
    // Synchronous state changes
    SET_STUDENTS(state, students) { /* ... */ }
  },
  actions: {
    // Asynchronous operations
    async fetchStudents({ commit }) { /* ... */ }
  },
  getters: {
    // Computed state values
    activeStudents: (state) => { /* ... */ }
  }
}
```

---

## 🌐 Services Directory (`src/services/`)

**Purpose**: API integration layer that handles all backend communication.

```
services/
├── client.js              # 🔧 Axios configuration & interceptors (41 lines)
├── index.js               # 📋 Service aggregator (21 lines)
├── student.js             # 👥 Student API calls (51 lines)
├── course.js              # 📚 Course API calls (68 lines)
├── class.js               # 🏫 Class API calls (35 lines)
├── department.js          # 🏛️ Department API calls (19 lines)
├── program.js             # 🎓 Program API calls (21 lines)
├── status.type.js         # 📊 Status type API calls (21 lines)
├── status.transition.js   # 🔄 Status transition API calls (17 lines)
├── enrollment.js          # 📝 Enrollment API calls (21 lines)
└── geography.js           # 🌍 Geography API calls (15 lines)
```

### Service Layer Pattern
```javascript
// Example: services/student.js
import apiClient from './client.js'

export default {
  // CRUD operations
  getStudents(page = 1, limit = 10) {
    return apiClient.get(`/v1/api/students?page=${page}&limit=${limit}`)
  },
  
  createStudent(student) {
    return apiClient.post('/v1/api/students', student)
  },
  
  updateStudent(id, student) {
    return apiClient.patch(`/v1/api/students/${id}`, student)
  },
  
  deleteStudent(id) {
    return apiClient.delete(`/v1/api/students/${id}`)
  }
}
```

---

## 🛣️ Router Directory (`src/router/`)

**Purpose**: Vue Router configuration for client-side navigation.

```
router/
└── index.js               # Route definitions and configuration (92 lines)
```

### Route Organization
Routes are organized by domain:
```javascript
const routes = [
  // Student Management
  { path: '/', name: 'StudentList', component: StudentList },
  { path: '/students/add', name: 'AddStudent', component: AddStudent },
  { path: '/students/edit/:id', name: 'EditStudent', component: EditStudent },
  
  // Course & Class Management  
  { path: '/courses', name: 'CourseManage', component: CourseManage },
  { path: '/classes', name: 'ClassManage', component: ClassManage },
  
  // Administrative
  { path: '/departments', name: 'DepartmentManage', component: DepartmentManage },
  { path: '/programs', name: 'ProgramManage', component: ProgramManage },
  
  // Academic Affairs
  { path: '/register-course', name: 'RegisterCourse', component: RegisterCourse },
  { path: '/drop-course', name: 'dropCourse', component: DropCourse },
  { path: '/grade-table', name: 'GradeTable', component: GradeTable }
]
```

---

## 🌍 Locales Directory (`src/locales/`)

**Purpose**: Internationalization (i18n) translation files.

```
locales/
├── en.json                # 🇺🇸 English translations (409 lines, 400+ keys)
└── vi.json                # 🇻🇳 Vietnamese translations (403 lines, 400+ keys)
```

### Translation Structure
```json
{
  "student": {
    "title": "Student",
    "management": "Student Management",
    "add_student": "Add Student",
    "fields": {
      "name": "Name",
      "email": "Email",
      "phone": "Phone Number"
    },
    "validation": {
      "required_name": "Name is required",
      "invalid_email": "Email format is invalid"
    }
  },
  "course": { /* ... */ },
  "class": { /* ... */ }
}
```

---

## 🔧 Composables Directory (`src/composables/`)

**Purpose**: Vue 3 Composition API reusable logic.

```
composables/
└── useErrorHandler.js     # Error handling composable (75 lines)
```

### Composable Pattern
```javascript
// composables/useErrorHandler.js
export function useErrorHandler() {
  const handleError = (error) => {
    // Centralized error handling logic
    console.error('Error occurred:', error)
    // Show error modal, etc.
  }
  
  return {
    handleError
  }
}
```

---

## 🛠️ Utils Directory (`src/utils/`)

**Purpose**: Utility functions and helpers used across the application.

```
utils/
├── format.js              # 📊 Data formatting functions (110 lines)
├── validation.js          # ✅ Custom validation rules (102 lines)
└── api.js                 # 🌐 API utility functions (9 lines)
```

### Utility Categories

#### Format Utils (`format.js`)
```javascript
export function formatDate(dateString, locale = 'vi-VN') { /* ... */ }
export function formatAddress(address) { /* ... */ }
export function formatPhoneNumber(phoneNumber) { /* ... */ }
export function formatCurrency(amount, currency = 'VND') { /* ... */ }
```

#### Validation Utils (`validation.js`)
```javascript
export const vietnamesePhone = helpers.withMessage(/* ... */)
export const notFutureDate = helpers.withMessage(/* ... */)
export const studentIdFormat = helpers.withMessage(/* ... */)
```

---

## 📝 Naming Conventions

### File Naming
| File Type | Convention | Examples |
|-----------|------------|----------|
| **Vue Components** | PascalCase | `StudentList.vue`, `CourseForm.vue` |
| **JavaScript Files** | camelCase | `student.js`, `useErrorHandler.js` |
| **Store Modules** | camelCase | `student.js`, `course.js` |
| **Service Files** | camelCase with domain | `student.js`, `status.type.js` |

### Variable Naming
| Type | Convention | Examples |
|------|------------|----------|
| **Variables** | camelCase | `studentList`, `isLoading` |
| **Constants** | SCREAMING_SNAKE_CASE | `API_BASE_URL`, `MAX_FILE_SIZE` |
| **Functions** | camelCase | `fetchStudents`, `formatDate` |
| **Components** | PascalCase | `StudentForm`, `BaseModal` |

### Vue-Specific Conventions
| Element | Convention | Examples |
|---------|------------|----------|
| **Props** | camelCase | `studentData`, `isVisible` |
| **Events** | kebab-case | `@update-student`, `@close-modal` |
| **Slots** | kebab-case | `<slot name="header">` |
| **CSS Classes** | kebab-case | `.student-form`, `.btn-primary` |

---

## 🎯 Domain Architecture

The application is organized around **8 core domains**:

### 1. **Student Domain** 👥
- **Views**: `StudentList.vue`, `AddStudent.vue`, `EditStudent.vue`
- **Components**: `student/` directory (4 components)
- **Store**: `store/modules/student.js`
- **Service**: `services/student.js`

### 2. **Course Domain** 📚
- **Views**: `CourseManage.vue`
- **Components**: `course/` directory (3 components)
- **Store**: `store/modules/course.js`
- **Service**: `services/course.js`

### 3. **Class Domain** 🏫
- **Views**: `ClassManage.vue`
- **Components**: `class/` directory (2 components)
- **Store**: `store/modules/class.js`
- **Service**: `services/class.js`

### 4. **Department Domain** 🏛️
- **Views**: `DepartmentManage.vue`
- **Store**: `store/modules/department.js`
- **Service**: `services/department.js`

### 5. **Program Domain** 🎓
- **Views**: `ProgramManage.vue`
- **Store**: `store/modules/program.js`
- **Service**: `services/program.js`

### 6. **Status Domain** 📊
- **Views**: `StatusManage.vue`, `StatusTransition.vue`
- **Store**: `store/modules/status.js`
- **Services**: `services/status.type.js`, `services/status.transition.js`

### 7. **Enrollment Domain** 📝
- **Views**: `RegisterCourse.vue`, `DropCourse.vue`
- **Store**: `store/modules/enrollment.js`
- **Service**: `services/enrollment.js`

### 8. **Transcript Domain** 📋
- **Views**: `GradeTable.vue`
- **Store**: `store/modules/transcript.js`

---

## 🔄 Data Flow Architecture

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│    Views    │ -> │ Components  │ -> │   Store     │
│ (Pages)     │    │ (UI Logic)  │    │ (State)     │
└─────────────┘    └─────────────┘    └─────────────┘
       ^                                      |
       |                                      v
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Router    │    │    Utils    │    │  Services   │
│ (Navigation)│    │ (Helpers)   │    │ (API Calls) │
└─────────────┘    └─────────────┘    └─────────────┘
```

### Typical Data Flow
1. **User Interaction** → View component
2. **View** → Calls store action
3. **Store Action** → Calls service method
4. **Service** → Makes API request
5. **API Response** → Service returns data
6. **Store Mutation** → Updates state
7. **Component** → Reactively updates UI

---

## 📚 Best Practices

### File Organization
- **One component per file**: Each `.vue` file contains one component
- **Domain grouping**: Related files are grouped in domain folders
- **Flat structure**: Avoid deep nesting (max 2-3 levels)
- **Consistent naming**: Follow established conventions

### Import Organization
```javascript
// 1. Vue core imports
import { ref, computed, onMounted } from 'vue'
import { useStore } from 'vuex'
import { useI18n } from 'vue-i18n'

// 2. Third-party libraries
import axios from 'axios'

// 3. Internal services
import studentService from '@/services/student'

// 4. Components
import StudentForm from '@/components/student/StudentForm.vue'

// 5. Utils and helpers
import { formatDate } from '@/utils/format'
```

### Code Organization Within Files
```vue
<template>
  <!-- Template content -->
</template>

<script>
// Imports
// Component definition
// Setup function (Composition API)
// Methods
// Lifecycle hooks
</script>

<style scoped>
/* Component-specific styles */
</style>
```

---

## 🎯 Next Steps

Now that you understand the project structure:

1. **Explore the Code**: Navigate through the folders and examine files
2. **Understand Architecture**: Read [System Overview](../architecture/overview.md)
3. **Learn Patterns**: Study [State Management](../architecture/state-management.md)
4. **Start Coding**: Follow [Coding Guide](../development/coding-guide.md)

---

**The project structure is designed for scalability, maintainability, and developer productivity. Each piece has its place and purpose! 🚀** 