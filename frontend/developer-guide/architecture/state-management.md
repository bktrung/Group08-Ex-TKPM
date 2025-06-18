# 🗄️ State Management Guide

This guide explains how state management works in the Moodle Academic Management System using Vuex 4, including store organization, patterns, and best practices.

---

## 🎯 State Management Philosophy

The system uses **Vuex 4** with a **domain-driven modular approach**:

- **🏗️ Modular Architecture**: Each domain has its own store module
- **📦 Namespaced Modules**: Prevent naming conflicts and organize state logically
- **🔄 Predictable State**: All state changes go through mutations
- **⚡ Reactive Updates**: Components automatically update when state changes
- **🌐 Service Integration**: Actions handle API calls and async operations
- **🧮 Computed State**: Getters provide computed values and filtering

---

## 🏛️ Store Architecture

### **Root Store Configuration**

```javascript
// store/index.js
import { createStore } from 'vuex'

// Import all domain modules
import student from './modules/student'
import course from './modules/course'
import class from './modules/class'
import department from './modules/department'
import program from './modules/program'
import status from './modules/status'
import enrollment from './modules/enrollment'
import transcript from './modules/transcript'

export default createStore({
  modules: {
    student,      // Namespaced: store.state.student
    course,       // Namespaced: store.state.course
    class,        // Namespaced: store.state.class
    department,   // Namespaced: store.state.department
    program,      // Namespaced: store.state.program
    status,       // Namespaced: store.state.status
    enrollment,   // Namespaced: store.state.enrollment
    transcript    // Namespaced: store.state.transcript
  }
})
```

### **Store Module Structure**

Each module follows a consistent pattern:

```javascript
// store/modules/example.js
export default {
  namespaced: true,  // Enable namespacing
  
  state: {
    // Data storage
    items: [],
    currentPage: 1,
    totalPages: 0,
    loading: false,
    error: null
  },
  
  mutations: {
    // Synchronous state changes (UPPERCASE)
    SET_ITEMS(state, items) { /* ... */ },
    SET_LOADING(state, loading) { /* ... */ },
    SET_ERROR(state, error) { /* ... */ }
  },
  
  actions: {
    // Asynchronous operations (camelCase)
    async fetchItems({ commit }) { /* ... */ },
    async createItem({ commit }, item) { /* ... */ },
    async updateItem({ commit }, { id, item }) { /* ... */ }
  },
  
  getters: {
    // Computed state values (camelCase)
    activeItems: (state) => { /* ... */ },
    itemCount: (state) => state.items.length,
    isLoading: (state) => state.loading
  }
}
```

---

## 📦 Domain Modules Overview

The system has **8 specialized domain modules**:

### **1. Student Module** 👥 (204 lines)

**Purpose**: Manages student data, pagination, and CRUD operations

```javascript
// store/modules/student.js
export default {
  namespaced: true,
  
  state: {
    students: [],           // Student list
    currentPage: 1,         // Pagination
    totalPages: 0,
    pageSize: 10,
    loading: false,
    error: null,
    searchQuery: '',        // Search functionality
    selectedStudent: null   // Currently selected student
  },
  
  mutations: {
    SET_STUDENTS(state, students) {
      state.students = students
    },
    SET_PAGINATION(state, { currentPage, totalPages, pageSize }) {
      state.currentPage = currentPage
      state.totalPages = totalPages
      state.pageSize = pageSize
    },
    SET_LOADING(state, loading) {
      state.loading = loading
    },
    SET_SEARCH_QUERY(state, query) {
      state.searchQuery = query
    },
    ADD_STUDENT(state, student) {
      state.students.unshift(student)
    },
    UPDATE_STUDENT(state, updatedStudent) {
      const index = state.students.findIndex(s => s.id === updatedStudent.id)
      if (index !== -1) {
        state.students.splice(index, 1, updatedStudent)
      }
    },
    DELETE_STUDENT(state, studentId) {
      state.students = state.students.filter(s => s.id !== studentId)
    }
  },
  
  actions: {
    async fetchStudents({ commit }, { page = 1, limit = 10, search = '' } = {}) {
      commit('SET_LOADING', true)
      try {
        const response = await studentService.getStudents(page, limit, search)
        commit('SET_STUDENTS', response.data.students)
        commit('SET_PAGINATION', {
          currentPage: response.data.currentPage,
          totalPages: response.data.totalPages,
          pageSize: limit
        })
      } catch (error) {
        commit('SET_ERROR', error.message)
      } finally {
        commit('SET_LOADING', false)
      }
    },
    
    async createStudent({ commit }, studentData) {
      try {
        const response = await studentService.createStudent(studentData)
        commit('ADD_STUDENT', response.data)
        return response.data
      } catch (error) {
        commit('SET_ERROR', error.message)
        throw error
      }
    }
  },
  
  getters: {
    activeStudents: (state) => state.students.filter(s => s.status === 'active'),
    studentCount: (state) => state.students.length,
    isLoading: (state) => state.loading,
    hasStudents: (state) => state.students.length > 0,
    getStudentById: (state) => (id) => state.students.find(s => s.id === id)
  }
}
```

### **2. Course Module** 📚 (225 lines)

**Purpose**: Manages course catalog, search, and course-related operations

```javascript
// store/modules/course.js
export default {
  namespaced: true,
  
  state: {
    courses: [],
    selectedCourse: null,
    searchFilters: {
      name: '',
      department: '',
      credits: null
    },
    loading: false,
    error: null
  },
  
  mutations: {
    SET_COURSES(state, courses) {
      state.courses = courses
    },
    SET_SELECTED_COURSE(state, course) {
      state.selectedCourse = course
    },
    UPDATE_SEARCH_FILTERS(state, filters) {
      state.searchFilters = { ...state.searchFilters, ...filters }
    }
  },
  
  actions: {
    async fetchCourses({ commit }, filters = {}) {
      commit('SET_LOADING', true)
      try {
        const response = await courseService.getCourses(filters)
        commit('SET_COURSES', response.data)
      } catch (error) {
        commit('SET_ERROR', error.message)
      } finally {
        commit('SET_LOADING', false)
      }
    },
    
    async searchCourses({ commit, state }) {
      const response = await courseService.searchCourses(state.searchFilters)
      commit('SET_COURSES', response.data)
    }
  },
  
  getters: {
    availableCourses: (state) => state.courses.filter(c => c.isAvailable),
    coursesByDepartment: (state) => (departmentId) => 
      state.courses.filter(c => c.departmentId === departmentId),
    totalCredits: (state) => 
      state.courses.reduce((sum, course) => sum + course.credits, 0)
  }
}
```

### **3. Class Module** 🏫 (152 lines)

**Purpose**: Manages class schedules, capacity, and enrollment limits

```javascript
// store/modules/class.js
export default {
  namespaced: true,
  
  state: {
    classes: [],
    selectedClass: null,
    scheduleConflicts: [],
    loading: false
  },
  
  mutations: {
    SET_CLASSES(state, classes) {
      state.classes = classes
    },
    SET_SCHEDULE_CONFLICTS(state, conflicts) {
      state.scheduleConflicts = conflicts
    }
  },
  
  actions: {
    async checkScheduleConflict({ commit }, classData) {
      const response = await classService.checkConflict(classData)
      commit('SET_SCHEDULE_CONFLICTS', response.data.conflicts)
      return response.data.hasConflict
    }
  },
  
  getters: {
    availableCapacity: (state) => (classId) => {
      const cls = state.classes.find(c => c.id === classId)
      return cls ? cls.maxCapacity - cls.currentEnrollment : 0
    },
    classesByTimeSlot: (state) => (timeSlot) =>
      state.classes.filter(c => c.timeSlot === timeSlot)
  }
}
```

### **4. Status Module** 📊 (292 lines - Most Complex)

**Purpose**: Manages student status types and transition workflows

```javascript
// store/modules/status.js
export default {
  namespaced: true,
  
  state: {
    statusTypes: [],          // Available status types
    transitions: [],          // Status transition rules
    currentTransition: null,  // Active transition
    transitionHistory: [],    // Historical transitions
    loading: false
  },
  
  mutations: {
    SET_STATUS_TYPES(state, types) {
      state.statusTypes = types
    },
    SET_TRANSITIONS(state, transitions) {
      state.transitions = transitions
    },
    ADD_TRANSITION_HISTORY(state, transition) {
      state.transitionHistory.unshift(transition)
    }
  },
  
  actions: {
    async validateTransition({ state }, { fromStatus, toStatus }) {
      const validTransitions = state.transitions.filter(t => 
        t.fromStatus === fromStatus && t.toStatus === toStatus
      )
      return validTransitions.length > 0
    },
    
    async executeTransition({ commit }, transitionData) {
      const response = await statusService.executeTransition(transitionData)
      commit('ADD_TRANSITION_HISTORY', response.data)
      return response.data
    }
  },
  
  getters: {
    activeStatusTypes: (state) => state.statusTypes.filter(s => s.isActive),
    getValidTransitions: (state) => (fromStatus) =>
      state.transitions.filter(t => t.fromStatus === fromStatus),
    transitionCount: (state) => state.transitionHistory.length
  }
}
```

### **5-8. Other Domain Modules**

**Department Module** 🏛️ (91 lines): Organizational structure management
**Program Module** 🎓 (90 lines): Academic program definitions  
**Enrollment Module** 📝 (77 lines): Course registration/dropping
**Transcript Module** 📋 (41 lines): Grade and academic record management

---

## 🔄 Store Usage Patterns

### **1. In Vue Components (Composition API)**

```vue
<script>
import { computed, onMounted } from 'vue'
import { useStore } from 'vuex'

export default {
  setup() {
    const store = useStore()
    
    // Reactive state access
    const students = computed(() => store.state.student.students)
    const loading = computed(() => store.getters['student/isLoading'])
    const activeStudents = computed(() => store.getters['student/activeStudents'])
    
    // Actions
    const fetchStudents = (page = 1) => {
      store.dispatch('student/fetchStudents', { page })
    }
    
    const createStudent = async (studentData) => {
      try {
        await store.dispatch('student/createStudent', studentData)
        // Success handling
      } catch (error) {
        // Error handling
      }
    }
    
    // Lifecycle
    onMounted(() => {
      fetchStudents()
    })
    
    return {
      students,
      loading,
      activeStudents,
      fetchStudents,
      createStudent
    }
  }
}
</script>
```

### **2. In Vue Components (Options API)**

```vue
<script>
import { mapState, mapGetters, mapActions } from 'vuex'

export default {
  computed: {
    // Map state
    ...mapState('student', ['students', 'loading']),
    
    // Map getters
    ...mapGetters('student', ['activeStudents', 'studentCount']),
    
    // Custom computed
    displayStudents() {
      return this.students.slice(0, 10)
    }
  },
  
  methods: {
    // Map actions
    ...mapActions('student', ['fetchStudents', 'createStudent']),
    
    // Custom methods
    async handleCreateStudent(data) {
      try {
        await this.createStudent(data)
        this.$emit('student-created')
      } catch (error) {
        this.$emit('error', error)
      }
    }
  },
  
  async mounted() {
    await this.fetchStudents()
  }
}
</script>
```

### **3. Cross-Module Communication**

```javascript
// In student module action
actions: {
  async enrollStudentInCourse({ commit, dispatch, rootGetters }, { studentId, courseId }) {
    // Check if course is available
    const course = rootGetters['course/getCourseById'](courseId)
    if (!course.isAvailable) {
      throw new Error('Course is not available')
    }
    
    // Check student status
    const student = rootGetters['student/getStudentById'](studentId)
    const canEnroll = await dispatch('status/validateTransition', {
      fromStatus: student.status,
      toStatus: 'enrolled'
    }, { root: true })
    
    if (canEnroll) {
      // Proceed with enrollment
      await dispatch('enrollment/createEnrollment', {
        studentId,
        courseId
      }, { root: true })
    }
  }
}
```

---

## 🎯 State Management Patterns

### **1. Loading States Pattern**

```javascript
// Standard loading pattern used across all modules
mutations: {
  SET_LOADING(state, loading) {
    state.loading = loading
  }
},

actions: {
  async fetchData({ commit }) {
    commit('SET_LOADING', true)
    try {
      const response = await apiService.getData()
      commit('SET_DATA', response.data)
    } catch (error) {
      commit('SET_ERROR', error.message)
    } finally {
      commit('SET_LOADING', false)  // Always reset loading
    }
  }
}
```

### **2. Pagination Pattern**

```javascript
// Consistent pagination across list views
state: {
  items: [],
  currentPage: 1,
  totalPages: 0,
  pageSize: 10
},

mutations: {
  SET_PAGINATION(state, { currentPage, totalPages, pageSize }) {
    state.currentPage = currentPage
    state.totalPages = totalPages
    state.pageSize = pageSize
  }
},

getters: {
  hasNextPage: (state) => state.currentPage < state.totalPages,
  hasPrevPage: (state) => state.currentPage > 1,
  pageInfo: (state) => ({
    current: state.currentPage,
    total: state.totalPages,
    size: state.pageSize
  })
}
```

### **3. Search and Filtering Pattern**

```javascript
// Flexible search and filtering
state: {
  items: [],
  originalItems: [],  // Keep original data
  searchQuery: '',
  filters: {}
},

mutations: {
  SET_SEARCH_QUERY(state, query) {
    state.searchQuery = query
  },
  
  SET_FILTERS(state, filters) {
    state.filters = { ...state.filters, ...filters }
  }
},

getters: {
  filteredItems: (state) => {
    let filtered = state.originalItems
    
    // Apply search
    if (state.searchQuery) {
      filtered = filtered.filter(item => 
        item.name.toLowerCase().includes(state.searchQuery.toLowerCase())
      )
    }
    
    // Apply filters
    Object.entries(state.filters).forEach(([key, value]) => {
      if (value) {
        filtered = filtered.filter(item => item[key] === value)
      }
    })
    
    return filtered
  }
}
```

### **4. CRUD Operations Pattern**

```javascript
// Standard CRUD pattern for all domains
mutations: {
  ADD_ITEM(state, item) {
    state.items.unshift(item)  // Add to beginning
  },
  
  UPDATE_ITEM(state, updatedItem) {
    const index = state.items.findIndex(item => item.id === updatedItem.id)
    if (index !== -1) {
      // Maintain reactivity
      state.items.splice(index, 1, updatedItem)
    }
  },
  
  DELETE_ITEM(state, itemId) {
    state.items = state.items.filter(item => item.id !== itemId)
  }
},

actions: {
  async createItem({ commit }, itemData) {
    const response = await apiService.create(itemData)
    commit('ADD_ITEM', response.data)
    return response.data
  },
  
  async updateItem({ commit }, { id, data }) {
    const response = await apiService.update(id, data)
    commit('UPDATE_ITEM', response.data)
    return response.data
  },
  
  async deleteItem({ commit }, id) {
    await apiService.delete(id)
    commit('DELETE_ITEM', id)
  }
}
```

---

## 🧮 Advanced Getters

### **1. Parameterized Getters**

```javascript
getters: {
  // Return a function for parameterized access
  getStudentById: (state) => (id) => {
    return state.students.find(student => student.id === id)
  },
  
  getStudentsByStatus: (state) => (status) => {
    return state.students.filter(student => student.status === status)
  },
  
  // Complex filtering with multiple parameters
  searchStudents: (state) => ({ query, status, department }) => {
    return state.students.filter(student => {
      const matchesQuery = !query || 
        student.name.toLowerCase().includes(query.toLowerCase())
      const matchesStatus = !status || student.status === status
      const matchesDept = !department || student.department === department
      
      return matchesQuery && matchesStatus && matchesDept
    })
  }
}

// Usage in component
const student = computed(() => 
  store.getters['student/getStudentById'](studentId.value)
)

const filteredStudents = computed(() =>
  store.getters['student/searchStudents']({
    query: searchQuery.value,
    status: selectedStatus.value,
    department: selectedDept.value
  })
)
```

### **2. Cross-Module Getters**

```javascript
// Access data from multiple modules
getters: {
  enrolledCoursesForStudent: (state, getters, rootState, rootGetters) => (studentId) => {
    const enrollments = rootState.enrollment.enrollments
      .filter(e => e.studentId === studentId)
    
    return enrollments.map(enrollment => 
      rootGetters['course/getCourseById'](enrollment.courseId)
    ).filter(Boolean)  // Remove null values
  },
  
  studentWithCourseCount: (state, getters, rootState) => {
    return state.students.map(student => ({
      ...student,
      courseCount: rootState.enrollment.enrollments
        .filter(e => e.studentId === student.id).length
    }))
  }
}
```

---

## 🔧 Store Composition and Helpers

### **1. Store Composition in Components**

```vue
<script>
// composables/useStudentStore.js
import { computed } from 'vue'
import { useStore } from 'vuex'

export function useStudentStore() {
  const store = useStore()
  
  // State
  const students = computed(() => store.state.student.students)
  const loading = computed(() => store.state.student.loading)
  const currentPage = computed(() => store.state.student.currentPage)
  
  // Getters
  const activeStudents = computed(() => store.getters['student/activeStudents'])
  const studentCount = computed(() => store.getters['student/studentCount'])
  
  // Actions
  const fetchStudents = (params) => store.dispatch('student/fetchStudents', params)
  const createStudent = (data) => store.dispatch('student/createStudent', data)
  const updateStudent = (id, data) => store.dispatch('student/updateStudent', { id, data })
  const deleteStudent = (id) => store.dispatch('student/deleteStudent', id)
  
  // Search
  const setSearchQuery = (query) => store.commit('student/SET_SEARCH_QUERY', query)
  
  return {
    // State
    students,
    loading,
    currentPage,
    
    // Getters
    activeStudents,
    studentCount,
    
    // Actions
    fetchStudents,
    createStudent,
    updateStudent,
    deleteStudent,
    
    // Mutations
    setSearchQuery
  }
}

// Usage in component
export default {
  setup() {
    const {
      students,
      loading,
      activeStudents,
      fetchStudents,
      createStudent
    } = useStudentStore()
    
    return {
      students,
      loading,
      activeStudents,
      fetchStudents,
      createStudent
    }
  }
}
</script>
```

### **2. Store Helper Functions**

```javascript
// utils/storeHelpers.js

// Generic pagination helper
export function createPaginationMutations() {
  return {
    SET_PAGINATION(state, { currentPage, totalPages, pageSize }) {
      state.currentPage = currentPage
      state.totalPages = totalPages
      state.pageSize = pageSize
    },
    
    SET_PAGE(state, page) {
      state.currentPage = page
    }
  }
}

// Generic loading helper
export function createLoadingMutations() {
  return {
    SET_LOADING(state, loading) {
      state.loading = loading
    },
    
    SET_ERROR(state, error) {
      state.error = error
    }
  }
}

// Generic CRUD helpers
export function createCrudMutations(itemName) {
  const items = `${itemName}s`
  const addMutation = `ADD_${itemName.toUpperCase()}`
  const updateMutation = `UPDATE_${itemName.toUpperCase()}`
  const deleteMutation = `DELETE_${itemName.toUpperCase()}`
  
  return {
    [addMutation](state, item) {
      state[items].unshift(item)
    },
    
    [updateMutation](state, updatedItem) {
      const index = state[items].findIndex(item => item.id === updatedItem.id)
      if (index !== -1) {
        state[items].splice(index, 1, updatedItem)
      }
    },
    
    [deleteMutation](state, itemId) {
      state[items] = state[items].filter(item => item.id !== itemId)
    }
  }
}

// Usage in module
import { createPaginationMutations, createLoadingMutations, createCrudMutations } from '@/utils/storeHelpers'

export default {
  namespaced: true,
  
  state: {
    students: [],
    currentPage: 1,
    totalPages: 0,
    pageSize: 10,
    loading: false,
    error: null
  },
  
  mutations: {
    SET_STUDENTS(state, students) {
      state.students = students
    },
    
    // Use helpers
    ...createPaginationMutations(),
    ...createLoadingMutations(),
    ...createCrudMutations('student')
  }
}
```

---

## 🎯 Best Practices

### **1. State Structure**

```javascript
// ✅ Good: Normalized state
state: {
  students: [
    { id: 1, name: 'John', courseIds: [101, 102] }
  ],
  courses: [
    { id: 101, name: 'Math', studentIds: [1] }
  ]
}

// ❌ Bad: Denormalized state (data duplication)
state: {
  students: [
    { 
      id: 1, 
      name: 'John', 
      courses: [
        { id: 101, name: 'Math' },  // Duplicated data
        { id: 102, name: 'Science' }
      ]
    }
  ]
}
```

### **2. Mutation Naming**

```javascript
// ✅ Good: Descriptive, uppercase mutations
mutations: {
  SET_STUDENTS(state, students) { /* ... */ },
  ADD_STUDENT(state, student) { /* ... */ },
  UPDATE_STUDENT_STATUS(state, { id, status }) { /* ... */ },
  CLEAR_SEARCH_RESULTS(state) { /* ... */ }
}

// ❌ Bad: Unclear, inconsistent naming
mutations: {
  students(state, data) { /* ... */ },
  addNew(state, item) { /* ... */ },
  change(state, payload) { /* ... */ }
}
```

### **3. Action Error Handling**

```javascript
// ✅ Good: Comprehensive error handling
actions: {
  async fetchStudents({ commit }) {
    commit('SET_LOADING', true)
    commit('SET_ERROR', null)  // Clear previous errors
    
    try {
      const response = await studentService.getStudents()
      commit('SET_STUDENTS', response.data)
    } catch (error) {
      console.error('Failed to fetch students:', error)
      commit('SET_ERROR', error.message || 'Failed to load students')
      
      // Optionally dispatch global error action
      dispatch('app/showErrorMessage', error.message, { root: true })
    } finally {
      commit('SET_LOADING', false)
    }
  }
}

// ❌ Bad: No error handling
actions: {
  async fetchStudents({ commit }) {
    const response = await studentService.getStudents()  // Can throw
    commit('SET_STUDENTS', response.data)
  }
}
```

### **4. Getter Performance**

```javascript
// ✅ Good: Efficient getters
getters: {
  activeStudents: (state) => {
    // Simple filter, will be cached
    return state.students.filter(s => s.status === 'active')
  },
  
  // For expensive computations, consider caching
  studentStatistics: (state) => {
    const stats = state._cachedStats
    if (stats && stats.timestamp > Date.now() - 60000) {  // 1 minute cache
      return stats.data
    }
    
    const computed = {
      total: state.students.length,
      active: state.students.filter(s => s.status === 'active').length,
      // ... other expensive calculations
    }
    
    state._cachedStats = {
      data: computed,
      timestamp: Date.now()
    }
    
    return computed
  }
}

// ❌ Bad: Expensive operations without caching
getters: {
  studentReport: (state) => {
    // This runs on every access!
    return state.students.map(student => ({
      ...student,
      courses: state.courses.filter(c => c.studentIds.includes(student.id)),
      grades: calculateGPA(student.grades),  // Expensive calculation
      // ... more expensive operations
    }))
  }
}
```

---

## 🔍 Debugging State

### **1. Vue DevTools**

```javascript
// Enable Vue DevTools in development
const store = createStore({
  // ... store config
  strict: process.env.NODE_ENV !== 'production'  // Enable strict mode
})

// Custom mutation logging
if (process.env.NODE_ENV === 'development') {
  store.subscribe((mutation, state) => {
    console.log('Mutation:', mutation.type, mutation.payload)
    console.log('New State:', state)
  })
}
```

### **2. State Snapshots**

```javascript
// Development helper for state debugging
export function createStateSnapshot(store) {
  return {
    student: { ...store.state.student },
    course: { ...store.state.course },
    // ... other modules
    timestamp: new Date().toISOString()
  }
}

// Usage in component
const debugSnapshot = () => {
  const snapshot = createStateSnapshot(store)
  console.log('State Snapshot:', snapshot)
  
  // Or save to localStorage for later analysis
  localStorage.setItem('state-snapshot', JSON.stringify(snapshot))
}
```

---

## 🚀 Performance Optimization

### **1. Module Lazy Loading**

```javascript
// Lazy load store modules for better initial performance
const store = createStore({
  modules: {
    // Core modules loaded immediately
    student: require('./modules/student').default,
    
    // Lazy load less critical modules
    transcript: () => import('./modules/transcript'),
    reports: () => import('./modules/reports')
  }
})
```

### **2. State Persistence**

```javascript
// Persist important state to localStorage
const store = createStore({
  plugins: [
    // Simple persistence plugin
    (store) => {
      // Load state from localStorage on init
      const savedState = localStorage.getItem('app-state')
      if (savedState) {
        const parsed = JSON.parse(savedState)
        store.replaceState({ ...store.state, ...parsed })
      }
      
      // Save state changes to localStorage
      store.subscribe((mutation, state) => {
        // Only persist certain modules
        const persistedState = {
          student: {
            searchQuery: state.student.searchQuery,
            currentPage: state.student.currentPage
          },
          course: {
            searchFilters: state.course.searchFilters
          }
        }
        
        localStorage.setItem('app-state', JSON.stringify(persistedState))
      })
    }
  ]
})
```

---

## 🎯 Next Steps

To learn more about the system:

1. **Development**: Read [Coding Guide](../development/coding-guide.md)
2. **Features**: Explore [Feature Development](../development/features.md)
3. **API Integration**: Check [Service Layer Guide](../development/api-integration.md)
4. **Testing**: Review [Testing Strategies](../development/testing.md)

---

**With this state management foundation, you can build scalable, maintainable, and performant Vue.js applications! 🚀** 