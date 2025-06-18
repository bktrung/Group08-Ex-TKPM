# 💻 Coding Guide

This guide covers development practices, code standards, component patterns, and workflows for the Moodle Academic Management System.

---

## 🎯 Development Philosophy

Our coding approach emphasizes:

- **🚀 Developer Experience**: Fast, intuitive development workflow
- **📚 Maintainability**: Clean, readable, self-documenting code
- **🔄 Consistency**: Standardized patterns across the codebase
- **⚡ Performance**: Optimized for speed and efficiency
- **🌍 Accessibility**: Inclusive design for all users
- **🔧 Modularity**: Reusable, composable components

---

## 📋 Code Standards

### **1. Naming Conventions**

#### **Files and Directories**
```
✅ Good:
StudentList.vue          # PascalCase for components
CourseForm.vue          # Descriptive names
student.js              # camelCase for services/stores
AddressFields.vue       # Clear, specific names

❌ Bad:
studentlist.vue         # No separation
CF.vue                  # Unclear abbreviations
form.vue                # Too generic
student_form.vue        # Underscore notation
```

#### **Variables and Functions**
```javascript
// ✅ Good: camelCase, descriptive names
const studentData = ref({})
const activeStudents = computed(() => /* ... */)
const fetchStudentList = async () => { /* ... */ }
const handleFormSubmit = (data) => { /* ... */ }

// ❌ Bad: unclear, inconsistent naming
const data = ref({})
const students1 = computed(() => /* ... */)
const getStud = async () => { /* ... */ }
const submit = (d) => { /* ... */ }
```

#### **Constants**
```javascript
// ✅ Good: SCREAMING_SNAKE_CASE
const API_ENDPOINTS = {
  STUDENTS: '/v1/api/students',
  COURSES: '/v1/api/courses'
}

const VALIDATION_RULES = {
  STUDENT_ID_LENGTH: 8,
  MAX_NAME_LENGTH: 100
}

// ❌ Bad: inconsistent casing
const apiEndpoints = { /* ... */ }
const ValidationRules = { /* ... */ }
```

#### **Component Props and Events**
```vue
<script>
export default {
  props: {
    studentData: Object,      // camelCase
    isLoading: Boolean,       // descriptive
    pageSize: {               // typed props
      type: Number,
      default: 10
    }
  },
  
  emits: [
    'update-student',         // kebab-case events
    'delete-student',
    'form-submit'
  ]
}
</script>
```

### **2. Code Formatting**

#### **Vue Component Structure**
```vue
<template>
  <!-- Template content -->
  <div class="student-list">
    <h2>{{ $t('student.management') }}</h2>
    
    <!-- Search section -->
    <div class="search-section mb-3">
      <input 
        v-model="searchQuery"
        :placeholder="$t('common.search')"
        class="form-control"
      >
    </div>
    
    <!-- Content section -->
    <div class="content-section">
      <!-- Component content -->
    </div>
  </div>
</template>

<script>
// 1. Imports
import { ref, computed, onMounted } from 'vue'
import { useStore } from 'vuex'
import { useI18n } from 'vue-i18n'

// 2. Components
import StudentForm from '@/components/student/StudentForm.vue'
import DefaultPagination from '@/components/layout/DefaultPagination.vue'

export default {
  name: 'StudentList',  // Always include component name
  
  // 3. Component registration
  components: {
    StudentForm,
    DefaultPagination
  },
  
  // 4. Props
  props: {
    initialPage: {
      type: Number,
      default: 1
    }
  },
  
  // 5. Events
  emits: ['student-updated'],
  
  // 6. Setup function
  setup(props, { emit }) {
    // Composition API logic
    return {
      // Return reactive references
    }
  }
}
</script>

<style scoped>
/* Component-specific styles */
.student-list {
  padding: 1rem;
}

.search-section {
  margin-bottom: 1rem;
}

/* Use CSS custom properties for consistency */
.content-section {
  background-color: var(--bg-secondary);
  border-radius: var(--border-radius);
}
</style>
```

#### **JavaScript Formatting**
```javascript
// ✅ Good: consistent spacing, clear structure
export default {
  namespaced: true,
  
  state: {
    students: [],
    loading: false,
    error: null
  },
  
  mutations: {
    SET_STUDENTS(state, students) {
      state.students = students
    },
    
    SET_LOADING(state, loading) {
      state.loading = loading
    }
  },
  
  actions: {
    async fetchStudents({ commit }, { page = 1, limit = 10 } = {}) {
      commit('SET_LOADING', true)
      
      try {
        const response = await studentService.getStudents(page, limit)
        commit('SET_STUDENTS', response.data.students)
      } catch (error) {
        console.error('Failed to fetch students:', error)
        throw error
      } finally {
        commit('SET_LOADING', false)
      }
    }
  }
}
```

---

## 🏗️ Component Architecture

### **1. Component Categories**

#### **Layout Components** (`components/layout/`)
```vue
<!-- AppSidebar.vue - Navigation component -->
<template>
  <nav class="sidebar">
    <router-link 
      v-for="item in menuItems"
      :key="item.path"
      :to="item.path"
      class="nav-link"
    >
      {{ $t(item.label) }}
    </router-link>
  </nav>
</template>

<script>
export default {
  name: 'AppSidebar',
  
  setup() {
    const menuItems = [
      { path: '/students', label: 'menu.students' },
      { path: '/courses', label: 'menu.courses' },
      { path: '/classes', label: 'menu.classes' }
    ]
    
    return { menuItems }
  }
}
</script>
```

#### **Domain Components** (`components/student/`, `components/course/`)
```vue
<!-- StudentForm.vue - Domain-specific form -->
<template>
  <form @submit.prevent="handleSubmit" class="student-form">
    <div class="row">
      <div class="col-md-6">
        <label>{{ $t('student.fields.name') }}</label>
        <input 
          v-model="form.name"
          :class="{ 'is-invalid': $v.name.$error }"
          class="form-control"
        >
        <div v-if="$v.name.$error" class="invalid-feedback">
          {{ $t('validation.required_name') }}
        </div>
      </div>
      
      <div class="col-md-6">
        <label>{{ $t('student.fields.student_id') }}</label>
        <input 
          v-model="form.studentId"
          :class="{ 'is-invalid': $v.studentId.$error }"
          class="form-control"
        >
      </div>
    </div>
    
    <!-- Address fields component -->
    <AddressFields 
      v-model:address="form.address"
      :errors="addressErrors"
    />
    
    <div class="form-actions">
      <button type="submit" :disabled="isSubmitting" class="btn btn-primary">
        {{ isEditing ? $t('common.update') : $t('common.create') }}
      </button>
      <button type="button" @click="$emit('cancel')" class="btn btn-secondary">
        {{ $t('common.cancel') }}
      </button>
    </div>
  </form>
</template>

<script>
import { ref, computed } from 'vue'
import { useValidation } from '@/composables/useValidation'
import { useI18n } from 'vue-i18n'
import AddressFields from './AddressFields.vue'

export default {
  name: 'StudentForm',
  
  components: {
    AddressFields
  },
  
  props: {
    studentData: {
      type: Object,
      default: () => ({})
    },
    isEditing: {
      type: Boolean,
      default: false
    }
  },
  
  emits: ['submit', 'cancel'],
  
  setup(props, { emit }) {
    const { t } = useI18n()
    
    // Form state
    const form = ref({
      name: props.studentData.name || '',
      studentId: props.studentData.studentId || '',
      address: props.studentData.address || {}
    })
    
    // Validation
    const { $v, isValid } = useValidation(form, {
      name: { required: true },
      studentId: { required: true, studentIdFormat: true }
    })
    
    // Form submission
    const isSubmitting = ref(false)
    
    const handleSubmit = async () => {
      if (!isValid.value) return
      
      isSubmitting.value = true
      try {
        emit('submit', form.value)
      } finally {
        isSubmitting.value = false
      }
    }
    
    return {
      form,
      $v,
      isSubmitting,
      handleSubmit
    }
  }
}
</script>
```

#### **Utility Components** (`components/layout/DefaultPagination.vue`)
```vue
<template>
  <nav aria-label="Pagination">
    <ul class="pagination justify-content-center">
      <li :class="{ disabled: !hasPrevPage }" class="page-item">
        <button 
          @click="$emit('page-change', currentPage - 1)"
          :disabled="!hasPrevPage"
          class="page-link"
        >
          {{ $t('pagination.previous') }}
        </button>
      </li>
      
      <li 
        v-for="page in visiblePages"
        :key="page"
        :class="{ active: page === currentPage }"
        class="page-item"
      >
        <button 
          @click="$emit('page-change', page)"
          class="page-link"
        >
          {{ page }}
        </button>
      </li>
      
      <li :class="{ disabled: !hasNextPage }" class="page-item">
        <button 
          @click="$emit('page-change', currentPage + 1)"
          :disabled="!hasNextPage"
          class="page-link"
        >
          {{ $t('pagination.next') }}
        </button>
      </li>
    </ul>
  </nav>
</template>

<script>
import { computed } from 'vue'

export default {
  name: 'DefaultPagination',
  
  props: {
    currentPage: {
      type: Number,
      required: true
    },
    totalPages: {
      type: Number,
      required: true
    }
  },
  
  emits: ['page-change'],
  
  setup(props) {
    const hasPrevPage = computed(() => props.currentPage > 1)
    const hasNextPage = computed(() => props.currentPage < props.totalPages)
    
    const visiblePages = computed(() => {
      const pages = []
      const start = Math.max(1, props.currentPage - 2)
      const end = Math.min(props.totalPages, props.currentPage + 2)
      
      for (let i = start; i <= end; i++) {
        pages.push(i)
      }
      
      return pages
    })
    
    return {
      hasPrevPage,
      hasNextPage,
      visiblePages
    }
  }
}
</script>
```

### **2. Component Communication Patterns**

#### **Props Down, Events Up**
```vue
<!-- Parent Component -->
<template>
  <StudentForm 
    :student-data="selectedStudent"
    :is-editing="isEditing"
    @submit="handleStudentSubmit"
    @cancel="closeForm"
  />
</template>

<!-- Child Component -->
<script>
export default {
  props: {
    studentData: Object,
    isEditing: Boolean
  },
  
  emits: ['submit', 'cancel'],
  
  setup(props, { emit }) {
    const handleSubmit = (data) => {
      emit('submit', data)
    }
    
    const handleCancel = () => {
      emit('cancel')
    }
    
    return { handleSubmit, handleCancel }
  }
}
</script>
```

#### **Store-based Communication**
```vue
<script>
import { useStore } from 'vuex'
import { computed } from 'vue'

export default {
  setup() {
    const store = useStore()
    
    // Reactive state
    const students = computed(() => store.state.student.students)
    const loading = computed(() => store.getters['student/isLoading'])
    
    // Actions
    const fetchStudents = () => store.dispatch('student/fetchStudents')
    
    return { students, loading, fetchStudents }
  }
}
</script>
```

---

## 🔧 Vue.js Best Practices

### **1. Composition API Patterns**

#### **Composable Functions**
```javascript
// composables/useStudentForm.js
import { ref, computed } from 'vue'
import { useValidation } from './useValidation'

export function useStudentForm(initialData = {}) {
  const form = ref({
    name: initialData.name || '',
    studentId: initialData.studentId || '',
    email: initialData.email || '',
    phone: initialData.phone || ''
  })
  
  const { $v, isValid } = useValidation(form, {
    name: { required: true },
    studentId: { required: true, studentIdFormat: true },
    email: { required: true, email: true }
  })
  
  const resetForm = () => {
    form.value = {
      name: '',
      studentId: '',
      email: '',
      phone: ''
    }
  }
  
  const populateForm = (data) => {
    Object.assign(form.value, data)
  }
  
  return {
    form,
    $v,
    isValid,
    resetForm,
    populateForm
  }
}

// Usage in component
export default {
  setup() {
    const { form, $v, isValid, resetForm } = useStudentForm()
    
    return { form, $v, isValid, resetForm }
  }
}
```

#### **Reactive Data Management**
```javascript
// ✅ Good: proper reactive usage
export default {
  setup() {
    // Use ref for primitive values
    const searchQuery = ref('')
    const isLoading = ref(false)
    
    // Use reactive for objects
    const filters = reactive({
      status: '',
      department: '',
      dateRange: null
    })
    
    // Use computed for derived state
    const filteredStudents = computed(() => {
      return students.value.filter(student => 
        student.name.includes(searchQuery.value)
      )
    })
    
    // Use watch for side effects
    watch(searchQuery, (newQuery) => {
      if (newQuery.length > 2) {
        performSearch(newQuery)
      }
    })
    
    return {
      searchQuery,
      isLoading,
      filters,
      filteredStudents
    }
  }
}
```

### **2. Performance Optimization**

#### **Lazy Loading**
```javascript
// router/index.js - Route-level code splitting
const routes = [
  {
    path: '/students',
    name: 'StudentList',
    component: () => import('@/views/StudentList.vue')
  },
  {
    path: '/courses',
    name: 'CourseManage',
    component: () => import('@/views/CourseManage.vue')
  }
]
```

#### **Component Optimization**
```vue
<template>
  <div class="student-list">
    <!-- Use v-show for frequently toggled elements -->
    <div v-show="showFilters" class="filters-panel">
      <!-- Filter content -->
    </div>
    
    <!-- Use v-if for conditionally rendered content -->
    <StudentForm 
      v-if="showForm"
      :student-data="selectedStudent"
    />
    
    <!-- Use key for list items to help Vue track changes -->
    <div 
      v-for="student in students"
      :key="student.id"
      class="student-item"
    >
      {{ student.name }}
    </div>
  </div>
</template>

<script>
export default {
  setup() {
    // Debounce search input
    const searchQuery = ref('')
    const debouncedSearch = debounce((query) => {
      performSearch(query)
    }, 300)
    
    watch(searchQuery, debouncedSearch)
    
    return { searchQuery }
  }
}
</script>
```

### **3. Error Handling**

#### **Component Error Boundaries**
```vue
<template>
  <div class="error-boundary">
    <slot v-if="!hasError" />
    
    <div v-else class="error-message">
      <h3>{{ $t('error.component_error') }}</h3>
      <p>{{ errorMessage }}</p>
      <button @click="retry" class="btn btn-primary">
        {{ $t('common.retry') }}
      </button>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue'

export default {
  name: 'ErrorBoundary',
  
  setup() {
    const hasError = ref(false)
    const errorMessage = ref('')
    
    const handleError = (error) => {
      hasError.value = true
      errorMessage.value = error.message
      console.error('Component error:', error)
    }
    
    const retry = () => {
      hasError.value = false
      errorMessage.value = ''
    }
    
    return {
      hasError,
      errorMessage,
      handleError,
      retry
    }
  }
}
</script>
```

#### **API Error Handling**
```javascript
// services/errorHandler.js
export class APIError extends Error {
  constructor(message, status, response) {
    super(message)
    this.name = 'APIError'
    this.status = status
    this.response = response
  }
}

export function handleAPIError(error) {
  if (error.response) {
    // Server responded with error status
    const { status, data } = error.response
    
    switch (status) {
      case 400:
        throw new APIError('Bad Request', status, data)
      case 401:
        // Handle authentication error
        router.push('/login')
        throw new APIError('Unauthorized', status, data)
      case 403:
        throw new APIError('Forbidden', status, data)
      case 404:
        throw new APIError('Not Found', status, data)
      case 500:
        throw new APIError('Server Error', status, data)
      default:
        throw new APIError('Unknown Error', status, data)
    }
  } else if (error.request) {
    // Network error
    throw new APIError('Network Error', 0, null)
  } else {
    // Other error
    throw new APIError(error.message, 0, null)
  }
}

// Usage in component
export default {
  setup() {
    const { showErrorMessage } = useNotification()
    
    const fetchData = async () => {
      try {
        const data = await studentService.getStudents()
        // Handle success
      } catch (error) {
        if (error instanceof APIError) {
          showErrorMessage(error.message)
        } else {
          showErrorMessage('Unexpected error occurred')
        }
      }
    }
    
    return { fetchData }
  }
}
```

---

## 📝 Form Handling

### **1. Form Validation**

#### **Validation Rules**
```javascript
// utils/validation.js
import { helpers } from '@vuelidate/validators'

export const studentIdFormat = helpers.withMessage(
  'Student ID must be 8 digits',
  (value) => !helpers.req(value) || /^\d{8}$/.test(value)
)

export const phoneFormat = helpers.withMessage(
  'Invalid phone number format',
  (value) => !helpers.req(value) || /^(\+84|0)[0-9]{9,10}$/.test(value)
)

export const vietnameseCharacters = helpers.withMessage(
  'Only Vietnamese characters allowed',
  (value) => !helpers.req(value) || /^[a-zA-ZÀ-ỹĂăĐđƠơƯưÂâÊêÔôÎîĨĩŨũỲỳ\s]+$/.test(value)
)
```

#### **Form Component with Validation**
```vue
<template>
  <form @submit.prevent="handleSubmit" class="validated-form">
    <div class="form-group">
      <label>{{ $t('student.fields.name') }}</label>
      <input 
        v-model="form.name"
        :class="getFieldClass('name')"
        class="form-control"
        @blur="$v.name.$touch"
      >
      <div v-if="$v.name.$error" class="invalid-feedback">
        <div v-for="error in $v.name.$errors" :key="error.$uid">
          {{ error.$message }}
        </div>
      </div>
    </div>
    
    <div class="form-group">
      <label>{{ $t('student.fields.student_id') }}</label>
      <input 
        v-model="form.studentId"
        :class="getFieldClass('studentId')"
        class="form-control"
        @blur="$v.studentId.$touch"
      >
      <div v-if="$v.studentId.$error" class="invalid-feedback">
        <div v-for="error in $v.studentId.$errors" :key="error.$uid">
          {{ error.$message }}
        </div>
      </div>
    </div>
    
    <button 
      type="submit" 
      :disabled="$v.$invalid || isSubmitting"
      class="btn btn-primary"
    >
      {{ isSubmitting ? $t('common.saving') : $t('common.save') }}
    </button>
  </form>
</template>

<script>
import { reactive, ref } from 'vue'
import { useVuelidate } from '@vuelidate/core'
import { required, email } from '@vuelidate/validators'
import { studentIdFormat, vietnameseCharacters } from '@/utils/validation'

export default {
  setup() {
    const form = reactive({
      name: '',
      studentId: '',
      email: ''
    })
    
    const rules = {
      name: { required, vietnameseCharacters },
      studentId: { required, studentIdFormat },
      email: { required, email }
    }
    
    const $v = useVuelidate(rules, form)
    const isSubmitting = ref(false)
    
    const getFieldClass = (fieldName) => {
      const field = $v.value[fieldName]
      return {
        'is-valid': field.$dirty && !field.$invalid,
        'is-invalid': field.$dirty && field.$invalid
      }
    }
    
    const handleSubmit = async () => {
      $v.value.$touch()
      if ($v.value.$invalid) return
      
      isSubmitting.value = true
      try {
        // Submit form
        await submitForm(form)
      } catch (error) {
        // Handle error
      } finally {
        isSubmitting.value = false
      }
    }
    
    return {
      form,
      $v,
      isSubmitting,
      getFieldClass,
      handleSubmit
    }
  }
}
</script>
```

### **2. Dynamic Forms**

#### **Address Fields Component**
```vue
<template>
  <div class="address-fields">
    <div class="row">
      <div class="col-md-4">
        <label>{{ $t('address.province') }}</label>
        <select 
          v-model="localAddress.provinceId"
          @change="handleProvinceChange"
          class="form-select"
        >
          <option value="">{{ $t('common.select_option') }}</option>
          <option 
            v-for="province in provinces"
            :key="province.id"
            :value="province.id"
          >
            {{ province.name }}
          </option>
        </select>
      </div>
      
      <div class="col-md-4">
        <label>{{ $t('address.district') }}</label>
        <select 
          v-model="localAddress.districtId"
          @change="handleDistrictChange"
          :disabled="!localAddress.provinceId"
          class="form-select"
        >
          <option value="">{{ $t('common.select_option') }}</option>
          <option 
            v-for="district in availableDistricts"
            :key="district.id"
            :value="district.id"
          >
            {{ district.name }}
          </option>
        </select>
      </div>
      
      <div class="col-md-4">
        <label>{{ $t('address.ward') }}</label>
        <select 
          v-model="localAddress.wardId"
          :disabled="!localAddress.districtId"
          class="form-select"
        >
          <option value="">{{ $t('common.select_option') }}</option>
          <option 
            v-for="ward in availableWards"
            :key="ward.id"
            :value="ward.id"
          >
            {{ ward.name }}
          </option>
        </select>
      </div>
    </div>
    
    <div class="mt-3">
      <label>{{ $t('address.detail') }}</label>
      <textarea 
        v-model="localAddress.detail"
        class="form-control"
        rows="3"
      ></textarea>
    </div>
  </div>
</template>

<script>
import { ref, computed, watch } from 'vue'
import { useGeography } from '@/composables/useGeography'

export default {
  name: 'AddressFields',
  
  props: {
    address: {
      type: Object,
      default: () => ({})
    }
  },
  
  emits: ['update:address'],
  
  setup(props, { emit }) {
    const { provinces, districts, wards, fetchDistricts, fetchWards } = useGeography()
    
    const localAddress = ref({
      provinceId: props.address.provinceId || '',
      districtId: props.address.districtId || '',
      wardId: props.address.wardId || '',
      detail: props.address.detail || ''
    })
    
    const availableDistricts = computed(() => {
      return districts.value.filter(d => d.provinceId === localAddress.value.provinceId)
    })
    
    const availableWards = computed(() => {
      return wards.value.filter(w => w.districtId === localAddress.value.districtId)
    })
    
    const handleProvinceChange = () => {
      localAddress.value.districtId = ''
      localAddress.value.wardId = ''
      if (localAddress.value.provinceId) {
        fetchDistricts(localAddress.value.provinceId)
      }
    }
    
    const handleDistrictChange = () => {
      localAddress.value.wardId = ''
      if (localAddress.value.districtId) {
        fetchWards(localAddress.value.districtId)
      }
    }
    
    // Emit changes to parent
    watch(localAddress, (newAddress) => {
      emit('update:address', newAddress)
    }, { deep: true })
    
    return {
      localAddress,
      provinces,
      availableDistricts,
      availableWards,
      handleProvinceChange,
      handleDistrictChange
    }
  }
}
</script>
```

---

## 🌍 Internationalization

### **1. Translation Keys Organization**

```javascript
// locales/en.json
{
  "common": {
    "save": "Save",
    "cancel": "Cancel",
    "delete": "Delete",
    "edit": "Edit",
    "create": "Create",
    "search": "Search",
    "loading": "Loading...",
    "no_data": "No data available"
  },
  "student": {
    "title": "Student",
    "management": "Student Management",
    "add_student": "Add Student",
    "edit_student": "Edit Student",
    "fields": {
      "name": "Full Name",
      "student_id": "Student ID",
      "email": "Email Address",
      "phone": "Phone Number",
      "birth_date": "Date of Birth"
    },
    "status": {
      "active": "Active",
      "inactive": "Inactive",
      "graduated": "Graduated",
      "suspended": "Suspended"
    }
  },
  "validation": {
    "required": "This field is required",
    "email_format": "Invalid email format",
    "student_id_format": "Student ID must be 8 digits",
    "phone_format": "Invalid phone number"
  }
}
```

### **2. Component Internationalization**

```vue
<template>
  <div class="student-management">
    <h1>{{ $t('student.management') }}</h1>
    
    <button @click="showAddForm" class="btn btn-primary">
      {{ $t('student.add_student') }}
    </button>
    
    <table class="table">
      <thead>
        <tr>
          <th>{{ $t('student.fields.name') }}</th>
          <th>{{ $t('student.fields.student_id') }}</th>
          <th>{{ $t('student.fields.email') }}</th>
          <th>{{ $t('common.actions') }}</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="student in students" :key="student.id">
          <td>{{ student.name }}</td>
          <td>{{ student.studentId }}</td>
          <td>{{ student.email }}</td>
          <td>
            <button @click="editStudent(student)" class="btn btn-sm btn-outline-primary">
              {{ $t('common.edit') }}
            </button>
            <button @click="deleteStudent(student)" class="btn btn-sm btn-outline-danger">
              {{ $t('common.delete') }}
            </button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
import { useI18n } from 'vue-i18n'

export default {
  setup() {
    const { t, locale } = useI18n()
    
    // Format dates based on locale
    const formatDate = (date) => {
      return new Intl.DateTimeFormat(locale.value).format(new Date(date))
    }
    
    // Format numbers based on locale
    const formatNumber = (number) => {
      return new Intl.NumberFormat(locale.value).format(number)
    }
    
    return {
      formatDate,
      formatNumber
    }
  }
}
</script>
```

---

## 🧪 Testing Patterns

### **1. Component Testing**

```javascript
// tests/components/StudentForm.spec.js
import { mount } from '@vue/test-utils'
import { createTestingPinia } from '@pinia/testing'
import StudentForm from '@/components/student/StudentForm.vue'

describe('StudentForm.vue', () => {
  let wrapper
  
  beforeEach(() => {
    wrapper = mount(StudentForm, {
      global: {
        plugins: [createTestingPinia()],
        mocks: {
          $t: (key) => key  // Mock translation
        }
      },
      props: {
        studentData: {
          name: 'John Doe',
          studentId: '12345678'
        }
      }
    })
  })
  
  afterEach(() => {
    wrapper.unmount()
  })
  
  it('renders student form correctly', () => {
    expect(wrapper.find('[data-test="student-name"]').exists()).toBe(true)
    expect(wrapper.find('[data-test="student-id"]').exists()).toBe(true)
  })
  
  it('validates required fields', async () => {
    const nameInput = wrapper.find('[data-test="student-name"]')
    await nameInput.setValue('')
    await nameInput.trigger('blur')
    
    expect(wrapper.find('.invalid-feedback').text()).toContain('required')
  })
  
  it('emits submit event with form data', async () => {
    const form = wrapper.find('form')
    await form.trigger('submit.prevent')
    
    expect(wrapper.emitted('submit')).toBeTruthy()
    expect(wrapper.emitted('submit')[0][0]).toEqual({
      name: 'John Doe',
      studentId: '12345678'
    })
  })
})
```

### **2. Store Testing**

```javascript
// tests/store/student.spec.js
import { createStore } from 'vuex'
import studentModule from '@/store/modules/student'
import studentService from '@/services/student'

// Mock the service
jest.mock('@/services/student')

describe('Student Store', () => {
  let store
  
  beforeEach(() => {
    store = createStore({
      modules: {
        student: studentModule
      }
    })
  })
  
  it('fetches students successfully', async () => {
    const mockStudents = [
      { id: 1, name: 'John Doe' },
      { id: 2, name: 'Jane Smith' }
    ]
    
    studentService.getStudents.mockResolvedValue({
      data: {
        students: mockStudents,
        currentPage: 1,
        totalPages: 1
      }
    })
    
    await store.dispatch('student/fetchStudents')
    
    expect(store.state.student.students).toEqual(mockStudents)
    expect(store.state.student.loading).toBe(false)
  })
  
  it('handles fetch students error', async () => {
    const errorMessage = 'Network error'
    studentService.getStudents.mockRejectedValue(new Error(errorMessage))
    
    await store.dispatch('student/fetchStudents')
    
    expect(store.state.student.error).toBe(errorMessage)
    expect(store.state.student.loading).toBe(false)
  })
})
```

---

## 🎯 Development Workflow

### **1. Feature Development Process**

```bash
# 1. Create feature branch
git checkout -b feature/student-import-export

# 2. Install dependencies (if needed)
npm install

# 3. Start development server
npm run serve

# 4. Run tests in watch mode
npm run test:unit -- --watch

# 5. Run linting
npm run lint

# 6. Commit changes
git add .
git commit -m "feat: add student import/export functionality"

# 7. Push and create PR
git push origin feature/student-import-export
```

### **2. Code Review Checklist**

```markdown
## Code Review Checklist

### 🏗️ Architecture
- [ ] Component follows single responsibility principle
- [ ] Proper separation of concerns
- [ ] Reusable and composable design

### 📝 Code Quality
- [ ] Follows naming conventions
- [ ] Proper error handling
- [ ] No console.log in production code
- [ ] TypeScript/JSDoc annotations where needed

### 🎨 UI/UX
- [ ] Responsive design
- [ ] Accessibility considerations
- [ ] Consistent with design system
- [ ] Proper loading states

### 🧪 Testing
- [ ] Unit tests for components
- [ ] Store tests for business logic
- [ ] Integration tests for critical flows

### 🌍 Internationalization
- [ ] All text uses i18n
- [ ] Supports multiple locales
- [ ] Date/number formatting

### ⚡ Performance
- [ ] No unnecessary re-renders
- [ ] Proper use of computed properties
- [ ] Lazy loading where appropriate
```

### **3. Git Workflow**

```bash
# Commit message format
feat(student): add import functionality
fix(course): resolve pagination issue
docs(readme): update setup instructions
style(student): improve form layout
refactor(store): extract common pagination logic
test(student): add form validation tests

# Branch naming
feature/student-import-export
bugfix/course-pagination
hotfix/security-vulnerability
docs/api-documentation
```

---

## 🎯 Next Steps

To continue your development journey:

1. **Features**: Learn about [Feature Development](features.md)
2. **Deployment**: Check [Deployment Guide](../deployment/guide.md)
3. **Advanced**: Explore [Advanced Topics](../advanced/performance.md)

---

**Happy coding! 🚀 This guide provides the foundation for writing clean, maintainable, and scalable Vue.js code!** 