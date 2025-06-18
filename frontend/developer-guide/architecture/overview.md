# 🏗️ System Architecture Overview

This document provides a comprehensive overview of the Moodle Academic Management System's architecture, design patterns, and how all components work together.

---

## 🎯 Architectural Philosophy

The system follows **modern Vue.js best practices** with a focus on:

- **🔧 Modular Design**: Domain-driven organization for scalability
- **🔄 Reactive Architecture**: Vue 3 Composition API for optimal reactivity  
- **📦 Separation of Concerns**: Clear boundaries between layers
- **🌐 API-First Design**: Frontend as a client to RESTful backend
- **🌍 Internationalization**: Built-in multi-language support
- **♿ Accessibility**: Bootstrap 5 for responsive, accessible UI

---

## 🏛️ High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    🌐 Vue.js Frontend                       │
├─────────────────────────────────────────────────────────────┤
│  📄 Presentation Layer (Views + Components)                │
│  ├── 12 Views (Pages)                                      │
│  └── 18+ Components (Reusable UI)                          │
├─────────────────────────────────────────────────────────────┤
│  🗄️ State Management Layer (Vuex)                          │
│  ├── 8 Domain Modules                                      │
│  └── Centralized State + Actions                           │
├─────────────────────────────────────────────────────────────┤
│  🌐 Service Layer (API Integration)                        │
│  ├── 11 Service Classes                                    │
│  └── Axios HTTP Client                                     │
├─────────────────────────────────────────────────────────────┤
│  🛠️ Utility Layer                                          │
│  ├── Validation, Formatting, Error Handling                │
│  └── i18n, Composables, Helpers                            │
└─────────────────────────────────────────────────────────────┘
                              ↕ HTTP/REST API
┌─────────────────────────────────────────────────────────────┐
│                   🖥️ Backend API Server                     │
│                  (Node.js/Express)                         │
└─────────────────────────────────────────────────────────────┘
```

---

## 📐 Layered Architecture

### 1. **Presentation Layer** 📄

**Purpose**: User interface and user experience

```
Presentation Layer
├── Views/           # Route-level components (12 files)
│   ├── StudentList.vue
│   ├── CourseManage.vue
│   └── ...
└── Components/      # Reusable UI components (18+ files)
    ├── layout/      # UI framework components
    ├── student/     # Domain-specific components
    ├── course/      # Course management components
    └── class/       # Class management components
```

**Key Characteristics:**
- **Vue 3 + Composition API**: Modern reactive programming
- **Bootstrap 5**: Responsive, mobile-first design
- **Component-based**: Reusable, maintainable UI elements
- **Scoped Styling**: CSS isolation per component

### 2. **State Management Layer** 🗄️

**Purpose**: Application state and business logic

```
State Management (Vuex 4)
├── Root Store       # Central store configuration
└── Domain Modules   # 8 specialized modules
    ├── student.js   # Student management state
    ├── course.js    # Course management state
    ├── class.js     # Class management state
    ├── department.js, program.js, status.js
    └── enrollment.js, transcript.js
```

**Vuex Pattern:**
```javascript
Module {
  state: {          // Data storage
    items: [],
    loading: false,
    currentPage: 1
  },
  mutations: {      // Synchronous state changes
    SET_ITEMS,
    SET_LOADING
  },
  actions: {        // Asynchronous operations
    fetchItems,
    createItem,
    updateItem
  },
  getters: {        // Computed state values
    activeItems,
    totalCount
  }
}
```

### 3. **Service Layer** 🌐

**Purpose**: API communication and data transformation

```
Service Layer
├── client.js        # Axios configuration + interceptors
├── index.js         # Service aggregator
└── Domain Services  # 11 API service classes
    ├── student.js   # CRUD operations for students
    ├── course.js    # Course management APIs
    ├── class.js     # Class management APIs
    └── ...
```

**Service Pattern:**
```javascript
// services/student.js
export default {
  // Standard CRUD operations
  getStudents(page, limit) { /* GET /v1/api/students */ },
  createStudent(data) { /* POST /v1/api/students */ },
  updateStudent(id, data) { /* PATCH /v1/api/students/:id */ },
  deleteStudent(id) { /* DELETE /v1/api/students/:id */ },
  
  // Domain-specific operations
  importStudents(file) { /* POST /v1/api/students/import */ },
  exportStudents() { /* GET /v1/api/students/export */ }
}
```

### 4. **Utility Layer** 🛠️

**Purpose**: Cross-cutting concerns and helpers

```
Utility Layer
├── format.js        # Data formatting (dates, addresses, currency)
├── validation.js    # Custom validation rules (Vuelidate)
├── api.js          # API utility functions
├── i18n.js         # Internationalization setup
└── composables/    # Vue 3 composition functions
    └── useErrorHandler.js
```

---

## 🎯 Domain-Driven Design

The system is organized around **8 core academic domains**:

### **Core Academic Domains**

```
🎓 Academic Management System
├── 👥 Student Domain
│   ├── Student CRUD, Status tracking
│   ├── Address & identity management
│   └── Import/export capabilities
│
├── 📚 Course Domain  
│   ├── Course creation & management
│   ├── Course catalog & search
│   └── Prerequisites handling
│
├── 🏫 Class Domain
│   ├── Class scheduling & management
│   ├── Capacity & enrollment limits
│   └── Schedule conflict resolution
│
├── 🏛️ Department Domain
│   ├── Organizational structure
│   └── Department-course relationships
│
├── 🎓 Program Domain
│   ├── Academic program definitions
│   └── Program-course mappings
│
├── 📊 Status Domain
│   ├── Student status types
│   ├── Status transition rules
│   └── Workflow management
│
├── 📝 Enrollment Domain
│   ├── Course registration
│   ├── Course dropping
│   └── Enrollment validation
│
└── 📋 Transcript Domain
    ├── Grade management
    ├── Academic records
    └── Transcript generation
```

### **Domain Interaction Patterns**

```
Student ←→ Enrollment ←→ Course
   ↓           ↓          ↓
Status    Class ←→ Department
   ↓           ↓          ↓
Transcript ←→ Program ←→ Course
```

---

## 🔄 Data Flow Patterns

### **1. Standard CRUD Flow**

```
User Action → View Component → Store Action → Service Call → API Request
     ↓              ↓              ↓             ↓            ↓
User Sees ← Component ← Store Mutation ← Service Response ← API Response
```

**Example: Adding a Student**
1. User fills `AddStudent.vue` form
2. Form calls `store.dispatch('student/createStudent', data)`
3. Store action calls `studentService.createStudent(data)`
4. Service makes `POST /v1/api/students` request
5. API responds with created student
6. Store commits `SET_STUDENTS` mutation
7. `StudentList.vue` reactively updates

### **2. Real-time Data Flow**

```
Component Mount → Fetch Data → Display Loading → Show Data → Handle Errors
      ↓              ↓            ↓              ↓           ↓
   onMounted() → store.dispatch → UI spinner → reactive UI → error modal
```

### **3. Form Validation Flow**

```
User Input → Vuelidate Rules → Validation State → UI Feedback → Submit
     ↓            ↓               ↓               ↓          ↓
Field Change → Custom Validators → Error Messages → Disabled Button → API Call
```

---

## 🧩 Component Architecture

### **Component Hierarchy**

```
App.vue (Root)
├── AppSidebar.vue (Navigation)
├── Router View (Dynamic page content)
│   ├── StudentList.vue
│   │   ├── StudentForm.vue
│   │   │   ├── AddressFields.vue
│   │   │   └── IdentityDocumentFields.vue
│   │   ├── ImportExport.vue
│   │   └── DefaultPagination.vue
│   ├── CourseManage.vue
│   │   ├── CourseForm.vue
│   │   ├── CourseTable.vue
│   │   └── CourseList.vue
│   └── ...
└── Global Modals
    ├── ConfirmModal.vue
    ├── ErrorModal.vue
    └── SuccessModal.vue
```

### **Component Communication Patterns**

#### **1. Parent-Child Communication**
```vue
<!-- Parent Component -->
<template>
  <StudentForm 
    :student-data="selectedStudent"
    @update-student="handleStudentUpdate"
    @close-form="showForm = false"
  />
</template>

<!-- Child Component -->
<script>
export default {
  props: ['studentData'],           // Data from parent
  emits: ['update-student', 'close-form'],  // Events to parent
  
  setup(props, { emit }) {
    const updateStudent = (data) => {
      emit('update-student', data)  // Send data up
    }
    return { updateStudent }
  }
}
</script>
```

#### **2. Store-based Communication**
```vue
<script>
import { useStore } from 'vuex'
import { computed } from 'vue'

export default {
  setup() {
    const store = useStore()
    
    // Reactive state
    const students = computed(() => store.getters['student/activeStudents'])
    const loading = computed(() => store.state.student.loading)
    
    // Actions
    const fetchStudents = () => store.dispatch('student/fetchStudents')
    
    return { students, loading, fetchStudents }
  }
}
</script>
```

#### **3. Event Bus Pattern** (for global events)
```javascript
// composables/useErrorHandler.js
import { ref } from 'vue'

const globalError = ref(null)

export function useErrorHandler() {
  const showError = (error) => {
    globalError.value = error
    // Show error modal globally
  }
  
  return { globalError, showError }
}
```

---

## 🌐 API Integration Architecture

### **HTTP Client Configuration**

```javascript
// services/client.js
import axios from 'axios'

const apiClient = axios.create({
  baseURL: process.env.VUE_APP_API_URL || 'http://localhost:3456',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Request interceptor
apiClient.interceptors.request.use(config => {
  // Add auth token, loading states, etc.
  return config
})

// Response interceptor  
apiClient.interceptors.response.use(
  response => response,
  error => {
    // Global error handling
    return Promise.reject(error)
  }
)
```

### **API Endpoint Patterns**

| Domain | Base Endpoint | Operations |
|--------|---------------|------------|
| **Students** | `/v1/api/students` | CRUD + Import/Export |
| **Courses** | `/v1/api/courses` | CRUD + Search |
| **Classes** | `/v1/api/classes` | CRUD + Scheduling |
| **Departments** | `/v1/api/departments` | CRUD |
| **Programs** | `/v1/api/programs` | CRUD |
| **Status** | `/v1/api/status-types` | CRUD + Transitions |
| **Enrollment** | `/v1/api/enrollments` | Register/Drop |
| **Geography** | `/v1/api/geography` | Provinces/Districts |

### **Error Handling Strategy**

```javascript
// Global error handling hierarchy
try {
  const response = await studentService.getStudents()
  // Success path
} catch (error) {
  if (error.response?.status === 401) {
    // Authentication error
    router.push('/login')
  } else if (error.response?.status >= 500) {
    // Server error
    showErrorModal('Server error occurred')
  } else {
    // Client error
    showErrorModal(error.response?.data?.message || 'Unknown error')
  }
}
```

---

## 🌍 Internationalization Architecture

### **i18n Structure**

```javascript
// i18n.js configuration
import { createI18n } from 'vue-i18n'
import en from './locales/en.json'
import vi from './locales/vi.json'

const i18n = createI18n({
  legacy: false,           // Use Composition API
  locale: 'vi',           // Default language
  fallbackLocale: 'en',   // Fallback language
  messages: { en, vi }
})
```

### **Translation Key Organization**

```json
{
  "student": {
    "title": "Student",
    "management": "Student Management",
    "actions": {
      "add": "Add Student",
      "edit": "Edit Student",
      "delete": "Delete Student"
    },
    "fields": {
      "name": "Full Name",
      "email": "Email Address",
      "phone": "Phone Number"
    },
    "validation": {
      "required_name": "Name is required",
      "invalid_email": "Invalid email format"
    }
  }
}
```

### **Usage in Components**

```vue
<template>
  <h1>{{ $t('student.management') }}</h1>
  <button>{{ $t('student.actions.add') }}</button>
</template>

<script>
import { useI18n } from 'vue-i18n'

export default {
  setup() {
    const { t, locale } = useI18n()
    
    const switchLanguage = (lang) => {
      locale.value = lang
    }
    
    return { t, switchLanguage }
  }
}
</script>
```

---

## 🔐 Security Architecture

### **Frontend Security Measures**

1. **Input Validation**
   ```javascript
   // validation.js
   export const studentIdFormat = helpers.withMessage(
     'Student ID must be 8 digits',
     (value) => /^\d{8}$/.test(value)
   )
   ```

2. **XSS Prevention**
   ```vue
   <!-- Safe: Vue automatically escapes -->
   <p>{{ userInput }}</p>
   
   <!-- Dangerous: Only use with trusted content -->
   <div v-html="trustedHtml"></div>
   ```

3. **API Security**
   ```javascript
   // Axios interceptor for auth
   apiClient.interceptors.request.use(config => {
     const token = localStorage.getItem('authToken')
     if (token) {
       config.headers.Authorization = `Bearer ${token}`
     }
     return config
   })
   ```

---

## 📊 Performance Architecture

### **Optimization Strategies**

1. **Lazy Loading**
   ```javascript
   // router/index.js
   const routes = [
     {
       path: '/students',
       component: () => import('@/views/StudentList.vue')  // Lazy loaded
     }
   ]
   ```

2. **Component Optimization**
   ```vue
   <script>
   import { computed, ref } from 'vue'
   
   export default {
     setup() {
       const searchQuery = ref('')
       
       // Computed properties are cached
       const filteredStudents = computed(() => {
         return students.value.filter(s => 
           s.name.includes(searchQuery.value)
         )
       })
       
       return { searchQuery, filteredStudents }
     }
   }
   </script>
   ```

3. **Bundle Optimization**
   ```javascript
   // vue.config.js
   module.exports = {
     configureWebpack: {
       optimization: {
         splitChunks: {
           chunks: 'all'
         }
       }
     }
   }
   ```

---

## 🧪 Testing Architecture

### **Testing Strategy**

1. **Unit Tests** (Components)
   ```javascript
   // StudentForm.spec.js
   import { mount } from '@vue/test-utils'
   import StudentForm from '@/components/student/StudentForm.vue'
   
   describe('StudentForm', () => {
     it('validates required fields', () => {
       const wrapper = mount(StudentForm)
       // Test validation logic
     })
   })
   ```

2. **Integration Tests** (Store + Services)
   ```javascript
   // student.store.spec.js
   import store from '@/store'
   import studentService from '@/services/student'
   
   describe('Student Store', () => {
     it('fetches students successfully', async () => {
       await store.dispatch('student/fetchStudents')
       expect(store.state.student.students).toHaveLength(10)
     })
   })
   ```

3. **E2E Tests** (User Workflows)
   ```javascript
   // cypress/integration/student-management.spec.js
   describe('Student Management', () => {
     it('adds a new student', () => {
       cy.visit('/students/add')
       cy.get('[data-cy=name-input]').type('John Doe')
       cy.get('[data-cy=submit-btn]').click()
       cy.contains('Student added successfully')
     })
   })
   ```

---

## 🚀 Deployment Architecture

### **Build Process**

```bash
# Development
npm run serve      # Hot reload dev server

# Production
npm run build      # Optimized production build
npm run lint       # Code quality check
```

### **Docker Containerization**

```dockerfile
# Dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 8080
CMD ["npm", "run", "serve"]
```

### **Environment Configuration**

```bash
# .env.development
VUE_APP_API_URL=http://localhost:3456
VUE_APP_ENV=development

# .env.production  
VUE_APP_API_URL=https://api.your-domain.com
VUE_APP_ENV=production
```

---

## 📈 Scalability Considerations

### **Horizontal Scaling**

1. **Modular Architecture**: Easy to split into micro-frontends
2. **Domain Separation**: Each domain can be developed independently
3. **Component Library**: Reusable components across projects
4. **Service Layer**: Easy to swap API backends

### **Performance Scaling**

1. **Code Splitting**: Lazy-loaded routes and components
2. **State Management**: Efficient Vuex modules
3. **Caching**: HTTP caching and local storage
4. **CDN**: Static asset distribution

### **Development Scaling**

1. **Team Structure**: Domain-based team organization
2. **Code Standards**: ESLint + Prettier enforcement
3. **Documentation**: Comprehensive developer guides
4. **Testing**: Automated testing pipelines

---

## 🎯 Architecture Benefits

### **Developer Experience**
- **🔧 Modern Stack**: Vue 3, Composition API, TypeScript-ready
- **📦 Modular Design**: Easy to understand and maintain
- **🔄 Hot Reload**: Fast development cycle
- **📝 Type Safety**: ESLint + JSDoc for better code quality

### **User Experience**
- **⚡ Fast Loading**: Optimized bundles and lazy loading
- **📱 Responsive**: Mobile-first Bootstrap 5 design
- **🌍 Multilingual**: Seamless language switching
- **♿ Accessible**: WCAG-compliant UI components

### **Business Value**
- **🚀 Rapid Development**: Reusable components and patterns
- **📈 Scalable**: Domain-driven architecture
- **🔒 Secure**: Built-in security best practices
- **🛠️ Maintainable**: Clear separation of concerns

---

## 🎯 Next Steps

To dive deeper into specific aspects:

1. **State Management**: Read [State Management Guide](state-management.md)
2. **Development**: Check [Coding Guide](../development/coding-guide.md)
3. **Features**: Explore [Feature Development](../development/features.md)
4. **Deployment**: Review [Deployment Guide](../deployment/guide.md)

---

**This architecture provides a solid foundation for building scalable, maintainable, and performant academic management systems! 🚀** 