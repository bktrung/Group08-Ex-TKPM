# 🚀 Feature Development Guide

This guide covers how to plan, implement, and deploy new features in the Moodle Academic Management System.

---

## 🎯 Feature Development Philosophy

Our feature development approach emphasizes:

- **📋 Requirements-First**: Clear specifications before implementation
- **🔄 Iterative Development**: Build, test, and refine in cycles
- **🧩 Modular Design**: Reusable components and services
- **🧪 Test-Driven Development**: Testing alongside implementation
- **👥 User-Centered**: Focus on user experience and accessibility
- **📊 Data-Driven**: Analytics and feedback inform decisions

---

## 📋 Feature Planning Process

### **1. Feature Requirements Template**

```markdown
# Feature: Student Import/Export System

## 📝 Overview
Enable bulk import/export of student data via CSV/Excel files

## 🎯 User Stories
- As an admin, I want to import students from CSV so I can onboard multiple students efficiently
- As an admin, I want to export student data so I can create reports for external systems
- As an admin, I want to validate import data so I can catch errors before processing

## ✅ Acceptance Criteria
### Import Functionality
- [ ] Support CSV and Excel file formats
- [ ] Validate required fields (name, student_id, email)
- [ ] Handle duplicate student IDs gracefully
- [ ] Provide import progress feedback
- [ ] Generate import summary report

### Export Functionality
- [ ] Export all students or filtered subset
- [ ] Choose export format (CSV/Excel)
- [ ] Include configurable fields
- [ ] Provide download progress indicator

## 🏗️ Technical Specifications
### Frontend Components
- `StudentImportWizard.vue` - Multi-step import process
- `StudentExportDialog.vue` - Export configuration
- `FileUploadArea.vue` - Drag-drop file upload
- `ImportPreview.vue` - Data validation preview

### Backend APIs
- `POST /api/students/import` - Process import file
- `GET /api/students/export` - Generate export file
- `GET /api/students/import/status/{id}` - Check import progress

### Data Models
- ImportSession: Track import progress
- ImportError: Store validation errors
- ExportJob: Manage export generation

## 🧪 Testing Strategy
- Unit tests for validation logic
- Integration tests for file processing
- E2E tests for complete user workflows
- Performance tests for large file handling

## 📊 Success Metrics
- Import success rate > 95%
- File processing time < 30 seconds for 1000 records
- User satisfaction score > 4.5/5
```

### **2. Technical Design Document**

```markdown
# Technical Design: Student Import/Export

## 🏗️ Architecture Overview

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend API    │    │   File Storage  │
│                 │    │                  │    │                 │
│ ┌─────────────┐ │    │ ┌──────────────┐ │    │ ┌─────────────┐ │
│ │ImportWizard │ │───▶│ │ FileProcessor│ │───▶│ │ Temp Files  │ │
│ └─────────────┘ │    │ └──────────────┘ │    │ └─────────────┘ │
│                 │    │                  │    │                 │
│ ┌─────────────┐ │    │ ┌──────────────┐ │    │ ┌─────────────┐ │
│ │ExportDialog │ │───▶│ │ ExportEngine │ │───▶│ │Export Files │ │
│ └─────────────┘ │    │ └──────────────┘ │    │ └─────────────┘ │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

## 🔄 Data Flow

### Import Process
1. User uploads file → Frontend validation
2. File sent to API → Backend processing
3. Data validation → Error reporting
4. Batch processing → Progress updates
5. Import completion → Summary report

### Export Process
1. User configures export → Frontend validation
2. Export request → Backend job creation
3. Data aggregation → File generation
4. File ready → Download notification
```

---

## 🛠️ Implementation Workflow

### **Phase 1: Foundation Setup**

#### **1. Create Feature Branch**
```bash
# Create and switch to feature branch
git checkout -b feature/student-import-export

# Create feature directory structure
mkdir -p src/components/student/import
mkdir -p src/components/student/export
mkdir -p src/services/import-export
mkdir -p src/composables/import-export
```

#### **2. Setup Base Components**
```vue
<!-- src/components/student/import/StudentImportWizard.vue -->
<template>
  <div class="import-wizard">
    <div class="wizard-header">
      <h3>{{ $t('student.import.title') }}</h3>
      <div class="steps-indicator">
        <div 
          v-for="(step, index) in steps"
          :key="step.id"
          :class="getStepClass(index)"
          class="step"
        >
          <span class="step-number">{{ index + 1 }}</span>
          <span class="step-label">{{ $t(step.label) }}</span>
        </div>
      </div>
    </div>
    
    <div class="wizard-content">
      <component 
        :is="currentStepComponent"
        v-model="wizardData"
        @next="nextStep"
        @previous="previousStep"
        @complete="completeImport"
      />
    </div>
  </div>
</template>

<script>
import { ref, computed } from 'vue'
import { useImportWizard } from '@/composables/useImportWizard'

// Step components
import FileUploadStep from './steps/FileUploadStep.vue'
import DataPreviewStep from './steps/DataPreviewStep.vue'
import ValidationStep from './steps/ValidationStep.vue'
import ImportProgressStep from './steps/ImportProgressStep.vue'

export default {
  name: 'StudentImportWizard',
  
  components: {
    FileUploadStep,
    DataPreviewStep,
    ValidationStep,
    ImportProgressStep
  },
  
  setup() {
    const {
      currentStep,
      steps,
      wizardData,
      nextStep,
      previousStep,
      completeImport
    } = useImportWizard()
    
    const currentStepComponent = computed(() => {
      const step = steps.value[currentStep.value]
      return step?.component
    })
    
    const getStepClass = (index) => ({
      'step-active': index === currentStep.value,
      'step-completed': index < currentStep.value,
      'step-pending': index > currentStep.value
    })
    
    return {
      currentStep,
      steps,
      wizardData,
      currentStepComponent,
      getStepClass,
      nextStep,
      previousStep,
      completeImport
    }
  }
}
</script>
```

#### **3. Create Import Composable**
```javascript
// src/composables/useImportWizard.js
import { ref, reactive } from 'vue'
import { useStore } from 'vuex'
import { useI18n } from 'vue-i18n'

export function useImportWizard() {
  const store = useStore()
  const { t } = useI18n()
  
  const currentStep = ref(0)
  const wizardData = reactive({
    file: null,
    mappings: {},
    validationResults: null,
    importProgress: {
      total: 0,
      processed: 0,
      errors: [],
      warnings: []
    }
  })
  
  const steps = ref([
    {
      id: 'upload',
      label: 'student.import.steps.upload',
      component: 'FileUploadStep'
    },
    {
      id: 'preview',
      label: 'student.import.steps.preview',
      component: 'DataPreviewStep'
    },
    {
      id: 'validate',
      label: 'student.import.steps.validate',
      component: 'ValidationStep'
    },
    {
      id: 'import',
      label: 'student.import.steps.import',
      component: 'ImportProgressStep'
    }
  ])
  
  const nextStep = () => {
    if (currentStep.value < steps.value.length - 1) {
      currentStep.value++
    }
  }
  
  const previousStep = () => {
    if (currentStep.value > 0) {
      currentStep.value--
    }
  }
  
  const completeImport = async () => {
    try {
      await store.dispatch('student/importStudents', wizardData)
      // Handle success
    } catch (error) {
      // Handle error
      console.error('Import failed:', error)
    }
  }
  
  return {
    currentStep,
    steps,
    wizardData,
    nextStep,
    previousStep,
    completeImport
  }
}
```

### **Phase 2: Core Implementation**

#### **1. File Upload Component**
```vue
<!-- src/components/student/import/steps/FileUploadStep.vue -->
<template>
  <div class="file-upload-step">
    <div class="upload-instructions">
      <h4>{{ $t('student.import.upload.title') }}</h4>
      <p>{{ $t('student.import.upload.instructions') }}</p>
      
      <div class="supported-formats">
        <span class="format-badge" v-for="format in supportedFormats" :key="format">
          {{ format }}
        </span>
      </div>
    </div>
    
    <div 
      @drop="handleDrop"
      @dragover.prevent
      @dragenter.prevent
      :class="{ 'dragover': isDragOver }"
      class="upload-area"
    >
      <div v-if="!selectedFile" class="upload-placeholder">
        <i class="bi bi-cloud-upload upload-icon"></i>
        <p>{{ $t('student.import.upload.drag_drop') }}</p>
        <span class="or-text">{{ $t('common.or') }}</span>
        <button 
          @click="triggerFileSelect"
          type="button"
          class="btn btn-primary"
        >
          {{ $t('student.import.upload.browse') }}
        </button>
      </div>
      
      <div v-else class="file-selected">
        <div class="file-info">
          <i class="bi bi-file-earmark-spreadsheet file-icon"></i>
          <div class="file-details">
            <h5>{{ selectedFile.name }}</h5>
            <p>{{ formatFileSize(selectedFile.size) }}</p>
          </div>
          <button 
            @click="removeFile"
            type="button"
            class="btn btn-outline-danger btn-sm"
          >
            <i class="bi bi-trash"></i>
          </button>
        </div>
        
        <div v-if="parseProgress" class="parse-progress">
          <div class="progress">
            <div 
              :style="{ width: parseProgress + '%' }"
              class="progress-bar"
            ></div>
          </div>
          <p>{{ $t('student.import.upload.parsing') }} {{ parseProgress }}%</p>
        </div>
      </div>
    </div>
    
    <input 
      ref="fileInput"
      @change="handleFileSelect"
      type="file"
      accept=".csv,.xlsx,.xls"
      style="display: none"
    >
    
    <div class="step-actions">
      <button 
        @click="$emit('next')"
        :disabled="!canProceed"
        type="button"
        class="btn btn-primary"
      >
        {{ $t('common.next') }}
      </button>
    </div>
  </div>
</template>

<script>
import { ref, computed } from 'vue'
import { useFileUpload } from '@/composables/useFileUpload'

export default {
  name: 'FileUploadStep',
  
  props: {
    modelValue: Object
  },
  
  emits: ['update:modelValue', 'next'],
  
  setup(props, { emit }) {
    const {
      selectedFile,
      isDragOver,
      parseProgress,
      handleDrop,
      handleFileSelect,
      removeFile,
      formatFileSize
    } = useFileUpload()
    
    const fileInput = ref(null)
    const supportedFormats = ['CSV', 'XLSX', 'XLS']
    
    const canProceed = computed(() => {
      return selectedFile.value && !parseProgress.value
    })
    
    const triggerFileSelect = () => {
      fileInput.value?.click()
    }
    
    // Update parent component when file changes
    watch(selectedFile, (newFile) => {
      emit('update:modelValue', { 
        ...props.modelValue, 
        file: newFile 
      })
    })
    
    return {
      selectedFile,
      isDragOver,
      parseProgress,
      fileInput,
      supportedFormats,
      canProceed,
      handleDrop,
      handleFileSelect,
      removeFile,
      formatFileSize,
      triggerFileSelect
    }
  }
}
</script>
```

#### **2. Data Validation Service**
```javascript
// src/services/import-export/validation.js
export class ImportValidator {
  constructor(schema) {
    this.schema = schema
    this.errors = []
    this.warnings = []
  }
  
  validateRow(rowData, rowIndex) {
    const errors = []
    const warnings = []
    
    // Required field validation
    this.schema.required.forEach(field => {
      if (!rowData[field] || rowData[field].toString().trim() === '') {
        errors.push({
          row: rowIndex,
          field: field,
          type: 'required',
          message: `${field} is required`
        })
      }
    })
    
    // Student ID validation
    if (rowData.studentId) {
      if (!/^\d{8}$/.test(rowData.studentId)) {
        errors.push({
          row: rowIndex,
          field: 'studentId',
          type: 'format',
          message: 'Student ID must be 8 digits'
        })
      }
    }
    
    // Email validation
    if (rowData.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(rowData.email)) {
        errors.push({
          row: rowIndex,
          field: 'email',
          type: 'format',
          message: 'Invalid email format'
        })
      }
    }
    
    // Phone validation (Vietnamese format)
    if (rowData.phone) {
      const phoneRegex = /^(\+84|0)[0-9]{9,10}$/
      if (!phoneRegex.test(rowData.phone)) {
        warnings.push({
          row: rowIndex,
          field: 'phone',
          type: 'format',
          message: 'Phone number format may be incorrect'
        })
      }
    }
    
    return { errors, warnings }
  }
  
  async validateData(data) {
    const results = {
      valid: [],
      errors: [],
      warnings: [],
      duplicates: []
    }
    
    const studentIds = new Set()
    const emails = new Set()
    
    for (let i = 0; i < data.length; i++) {
      const row = data[i]
      const { errors, warnings } = this.validateRow(row, i + 1)
      
      // Check for duplicates
      if (row.studentId) {
        if (studentIds.has(row.studentId)) {
          results.duplicates.push({
            row: i + 1,
            field: 'studentId',
            value: row.studentId,
            message: 'Duplicate student ID'
          })
        } else {
          studentIds.add(row.studentId)
        }
      }
      
      if (row.email) {
        if (emails.has(row.email)) {
          results.duplicates.push({
            row: i + 1,
            field: 'email',
            value: row.email,
            message: 'Duplicate email address'
          })
        } else {
          emails.add(row.email)
        }
      }
      
      if (errors.length === 0) {
        results.valid.push(row)
      }
      
      results.errors.push(...errors)
      results.warnings.push(...warnings)
    }
    
    return results
  }
}

// Schema definition
export const studentImportSchema = {
  required: ['name', 'studentId', 'email'],
  optional: ['phone', 'birthDate', 'address'],
  fields: {
    name: {
      type: 'string',
      maxLength: 100,
      pattern: /^[a-zA-ZÀ-ỹĂăĐđƠơƯưÂâÊêÔôÎîĨĩŨũỲỳ\s]+$/
    },
    studentId: {
      type: 'string',
      pattern: /^\d{8}$/,
      unique: true
    },
    email: {
      type: 'email',
      unique: true
    },
    phone: {
      type: 'string',
      pattern: /^(\+84|0)[0-9]{9,10}$/
    }
  }
}
```

### **Phase 3: Advanced Features**

#### **1. Real-time Progress Tracking**
```javascript
// src/composables/useImportProgress.js
import { ref, reactive } from 'vue'
import { useWebSocket } from '@/composables/useWebSocket'

export function useImportProgress(importId) {
  const progress = reactive({
    total: 0,
    processed: 0,
    successful: 0,
    failed: 0,
    status: 'pending', // pending, processing, completed, failed
    errors: [],
    warnings: []
  })
  
  const { connect, disconnect, onMessage } = useWebSocket(
    `ws://localhost:8080/import-progress/${importId}`
  )
  
  // Listen for progress updates
  onMessage((data) => {
    const update = JSON.parse(data)
    
    switch (update.type) {
      case 'progress':
        Object.assign(progress, update.data)
        break
      
      case 'error':
        progress.errors.push(update.data)
        break
      
      case 'warning':
        progress.warnings.push(update.data)
        break
      
      case 'completed':
        progress.status = 'completed'
        disconnect()
        break
      
      case 'failed':
        progress.status = 'failed'
        disconnect()
        break
    }
  })
  
  const startTracking = () => {
    connect()
  }
  
  const stopTracking = () => {
    disconnect()
  }
  
  return {
    progress,
    startTracking,
    stopTracking
  }
}
```

#### **2. Export Configuration Component**
```vue
<!-- src/components/student/export/StudentExportDialog.vue -->
<template>
  <div class="modal fade" tabindex="-1">
    <div class="modal-dialog modal-lg">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">{{ $t('student.export.title') }}</h5>
          <button type="button" class="btn-close" @click="close"></button>
        </div>
        
        <div class="modal-body">
          <form @submit.prevent="startExport">
            <!-- Export Format -->
            <div class="mb-3">
              <label class="form-label">{{ $t('student.export.format') }}</label>
              <div class="btn-group" role="group">
                <input 
                  v-model="exportConfig.format"
                  type="radio"
                  value="csv"
                  id="format-csv"
                  class="btn-check"
                >
                <label for="format-csv" class="btn btn-outline-primary">CSV</label>
                
                <input 
                  v-model="exportConfig.format"
                  type="radio"
                  value="xlsx"
                  id="format-xlsx"
                  class="btn-check"
                >
                <label for="format-xlsx" class="btn btn-outline-primary">Excel</label>
              </div>
            </div>
            
            <!-- Field Selection -->
            <div class="mb-3">
              <label class="form-label">{{ $t('student.export.fields') }}</label>
              <div class="row">
                <div class="col-md-6">
                  <h6>{{ $t('student.export.basic_fields') }}</h6>
                  <div class="form-check" v-for="field in basicFields" :key="field.key">
                    <input 
                      v-model="exportConfig.fields"
                      :value="field.key"
                      type="checkbox"
                      :id="`field-${field.key}`"
                      class="form-check-input"
                    >
                    <label :for="`field-${field.key}`" class="form-check-label">
                      {{ $t(field.label) }}
                    </label>
                  </div>
                </div>
                
                <div class="col-md-6">
                  <h6>{{ $t('student.export.additional_fields') }}</h6>
                  <div class="form-check" v-for="field in additionalFields" :key="field.key">
                    <input 
                      v-model="exportConfig.fields"
                      :value="field.key"
                      type="checkbox"
                      :id="`field-${field.key}`"
                      class="form-check-input"
                    >
                    <label :for="`field-${field.key}`" class="form-check-label">
                      {{ $t(field.label) }}
                    </label>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- Filters -->
            <div class="mb-3">
              <label class="form-label">{{ $t('student.export.filters') }}</label>
              
              <div class="row">
                <div class="col-md-6">
                  <label>{{ $t('student.fields.status') }}</label>
                  <select v-model="exportConfig.filters.status" class="form-select">
                    <option value="">{{ $t('common.all') }}</option>
                    <option value="active">{{ $t('student.status.active') }}</option>
                    <option value="inactive">{{ $t('student.status.inactive') }}</option>
                    <option value="graduated">{{ $t('student.status.graduated') }}</option>
                  </select>
                </div>
                
                <div class="col-md-6">
                  <label>{{ $t('student.fields.department') }}</label>
                  <select v-model="exportConfig.filters.department" class="form-select">
                    <option value="">{{ $t('common.all') }}</option>
                    <option 
                      v-for="dept in departments"
                      :key="dept.id"
                      :value="dept.id"
                    >
                      {{ dept.name }}
                    </option>
                  </select>
                </div>
              </div>
            </div>
          </form>
        </div>
        
        <div class="modal-footer">
          <button type="button" @click="close" class="btn btn-secondary">
            {{ $t('common.cancel') }}
          </button>
          <button 
            type="button"
            @click="startExport"
            :disabled="!canExport || isExporting"
            class="btn btn-primary"
          >
            <span v-if="isExporting" class="spinner-border spinner-border-sm me-2"></span>
            {{ isExporting ? $t('student.export.generating') : $t('student.export.download') }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, reactive, computed, onMounted } from 'vue'
import { useStore } from 'vuex'
import { useStudentExport } from '@/composables/useStudentExport'

export default {
  name: 'StudentExportDialog',
  
  emits: ['close'],
  
  setup(props, { emit }) {
    const store = useStore()
    const { generateExport, downloadFile } = useStudentExport()
    
    const isExporting = ref(false)
    const departments = computed(() => store.state.department.departments)
    
    const exportConfig = reactive({
      format: 'xlsx',
      fields: ['name', 'studentId', 'email'],
      filters: {
        status: '',
        department: ''
      }
    })
    
    const basicFields = [
      { key: 'name', label: 'student.fields.name' },
      { key: 'studentId', label: 'student.fields.student_id' },
      { key: 'email', label: 'student.fields.email' },
      { key: 'phone', label: 'student.fields.phone' }
    ]
    
    const additionalFields = [
      { key: 'birthDate', label: 'student.fields.birth_date' },
      { key: 'address', label: 'student.fields.address' },
      { key: 'status', label: 'student.fields.status' },
      { key: 'enrollmentDate', label: 'student.fields.enrollment_date' }
    ]
    
    const canExport = computed(() => {
      return exportConfig.fields.length > 0
    })
    
    const startExport = async () => {
      if (!canExport.value) return
      
      isExporting.value = true
      try {
        const exportJob = await generateExport(exportConfig)
        await downloadFile(exportJob.fileUrl, exportJob.filename)
        emit('close')
      } catch (error) {
        console.error('Export failed:', error)
        // Show error message
      } finally {
        isExporting.value = false
      }
    }
    
    const close = () => {
      emit('close')
    }
    
    onMounted(() => {
      store.dispatch('department/fetchDepartments')
    })
    
    return {
      exportConfig,
      basicFields,
      additionalFields,
      departments,
      isExporting,
      canExport,
      startExport,
      close
    }
  }
}
</script>
```

---

## 🔄 Feature Examples

### **Example 1: Course Scheduling System**

#### **Requirements**
```markdown
# Feature: Automated Course Scheduling

## User Stories
- As a scheduler, I want to auto-generate class schedules to optimize room usage
- As a teacher, I want to see my teaching schedule with conflict detection
- As a student, I want to view available course slots before enrollment

## Technical Components
- ScheduleEngine: Algorithm for conflict-free scheduling
- CalendarView: Visual schedule representation
- ConflictDetector: Real-time conflict validation
- TimeSlotManager: Available time management
```

#### **Implementation Highlights**
```javascript
// src/services/scheduling/ScheduleEngine.js
export class ScheduleEngine {
  constructor(constraints) {
    this.constraints = constraints
    this.conflicts = []
  }
  
  generateSchedule(courses, rooms, timeSlots) {
    const schedule = new Map()
    const unavailableSlots = new Set()
    
    // Sort courses by priority (required > elective, more students > fewer)
    const sortedCourses = this.prioritizeCourses(courses)
    
    for (const course of sortedCourses) {
      const assignment = this.findBestSlot(course, rooms, timeSlots, unavailableSlots)
      
      if (assignment) {
        schedule.set(course.id, assignment)
        this.markSlotUnavailable(assignment, unavailableSlots)
      } else {
        this.conflicts.push({
          courseId: course.id,
          reason: 'No available time slot',
          suggestions: this.getSuggestions(course, rooms, timeSlots)
        })
      }
    }
    
    return { schedule, conflicts: this.conflicts }
  }
  
  findBestSlot(course, rooms, timeSlots, unavailableSlots) {
    // Find rooms that meet course requirements
    const suitableRooms = rooms.filter(room => 
      room.capacity >= course.expectedStudents &&
      room.features.includes(...course.requiredFeatures)
    )
    
    // Find available time slots
    for (const timeSlot of timeSlots) {
      for (const room of suitableRooms) {
        const slotKey = `${room.id}-${timeSlot.id}`
        
        if (!unavailableSlots.has(slotKey) && 
            this.checkTeacherAvailability(course.teacherId, timeSlot)) {
          return {
            courseId: course.id,
            roomId: room.id,
            timeSlotId: timeSlot.id,
            startTime: timeSlot.startTime,
            endTime: timeSlot.endTime
          }
        }
      }
    }
    
    return null
  }
}
```

### **Example 2: Notification System**

#### **Architecture**
```vue
<!-- src/components/notifications/NotificationCenter.vue -->
<template>
  <div class="notification-center">
    <button 
      @click="togglePanel"
      :class="{ 'has-unread': hasUnreadNotifications }"
      class="notification-trigger"
    >
      <i class="bi bi-bell"></i>
      <span v-if="unreadCount" class="badge">{{ unreadCount }}</span>
    </button>
    
    <div v-if="isOpen" class="notification-panel">
      <div class="panel-header">
        <h5>{{ $t('notifications.title') }}</h5>
        <button @click="markAllAsRead" class="btn btn-link btn-sm">
          {{ $t('notifications.mark_all_read') }}
        </button>
      </div>
      
      <div class="notification-list">
        <div 
          v-for="notification in notifications"
          :key="notification.id"
          :class="{ 'unread': !notification.read }"
          class="notification-item"
          @click="handleNotificationClick(notification)"
        >
          <div class="notification-icon">
            <i :class="getNotificationIcon(notification.type)"></i>
          </div>
          <div class="notification-content">
            <h6>{{ notification.title }}</h6>
            <p>{{ notification.message }}</p>
            <small>{{ formatRelativeTime(notification.createdAt) }}</small>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
```

### **Example 3: Advanced Search & Filtering**

#### **Search Component**
```vue
<!-- src/components/search/AdvancedSearch.vue -->
<template>
  <div class="advanced-search">
    <div class="search-header">
      <div class="search-input-group">
        <input 
          v-model="searchQuery"
          @input="debouncedSearch"
          :placeholder="$t('search.placeholder')"
          class="form-control search-input"
        >
        <button 
          @click="toggleFilters"
          :class="{ active: showFilters }"
          class="btn btn-outline-secondary filter-toggle"
        >
          <i class="bi bi-funnel"></i>
          {{ $t('search.filters') }}
        </button>
      </div>
    </div>
    
    <div v-if="showFilters" class="search-filters">
      <div class="row">
        <div class="col-md-3">
          <select v-model="filters.department" class="form-select">
            <option value="">{{ $t('search.all_departments') }}</option>
            <option v-for="dept in departments" :key="dept.id" :value="dept.id">
              {{ dept.name }}
            </option>
          </select>
        </div>
        
        <div class="col-md-3">
          <select v-model="filters.status" class="form-select">
            <option value="">{{ $t('search.all_statuses') }}</option>
            <option value="active">{{ $t('status.active') }}</option>
            <option value="inactive">{{ $t('status.inactive') }}</option>
          </select>
        </div>
        
        <div class="col-md-4">
          <div class="date-range-picker">
            <input 
              v-model="filters.dateFrom"
              type="date"
              class="form-control"
              :placeholder="$t('search.date_from')"
            >
            <input 
              v-model="filters.dateTo"
              type="date"
              class="form-control"
              :placeholder="$t('search.date_to')"
            >
          </div>
        </div>
        
        <div class="col-md-2">
          <button @click="clearFilters" class="btn btn-outline-secondary w-100">
            {{ $t('search.clear') }}
          </button>
        </div>
      </div>
    </div>
    
    <div class="search-results">
      <div class="results-header">
        <span class="results-count">
          {{ $t('search.results_count', { count: searchResults.total }) }}
        </span>
        <div class="results-actions">
          <button @click="exportResults" class="btn btn-outline-primary btn-sm">
            <i class="bi bi-download"></i>
            {{ $t('search.export') }}
          </button>
        </div>
      </div>
      
      <div class="results-list">
        <SearchResultItem 
          v-for="item in searchResults.items"
          :key="item.id"
          :item="item"
          :search-query="searchQuery"
          @select="$emit('item-selected', item)"
        />
      </div>
      
      <DefaultPagination 
        v-if="searchResults.totalPages > 1"
        :current-page="currentPage"
        :total-pages="searchResults.totalPages"
        @page-change="handlePageChange"
      />
    </div>
  </div>
</template>

<script>
import { ref, reactive, computed, watch } from 'vue'
import { useAdvancedSearch } from '@/composables/useAdvancedSearch'
import { debounce } from '@/utils/debounce'

export default {
  setup() {
    const {
      searchQuery,
      filters,
      searchResults,
      currentPage,
      performSearch,
      clearFilters
    } = useAdvancedSearch()
    
    const showFilters = ref(false)
    
    // Debounce search to avoid too many API calls
    const debouncedSearch = debounce(performSearch, 300)
    
    const toggleFilters = () => {
      showFilters.value = !showFilters.value
    }
    
    // Watch for filter changes
    watch(filters, performSearch, { deep: true })
    
    return {
      searchQuery,
      filters,
      searchResults,
      currentPage,
      showFilters,
      debouncedSearch,
      toggleFilters,
      clearFilters
    }
  }
}
</script>
```

---

## 🚀 Deployment & Testing

### **Feature Testing Checklist**

```markdown
## Pre-deployment Testing

### Unit Tests
- [ ] Component rendering
- [ ] Function logic
- [ ] State management
- [ ] Validation rules

### Integration Tests  
- [ ] API integration
- [ ] Store actions
- [ ] Route navigation
- [ ] Component communication

### E2E Tests
- [ ] Complete user workflows
- [ ] Error scenarios
- [ ] Performance under load
- [ ] Cross-browser compatibility

### User Acceptance Testing
- [ ] Feature meets requirements
- [ ] Intuitive user experience
- [ ] Accessibility compliance
- [ ] Mobile responsiveness
```

### **Performance Monitoring**

```javascript
// src/utils/performance.js
export class PerformanceMonitor {
  static trackFeatureUsage(featureName, action, metadata = {}) {
    const startTime = performance.now()
    
    return {
      end: () => {
        const duration = performance.now() - startTime
        
        // Send analytics data
        analytics.track('feature_usage', {
          feature: featureName,
          action: action,
          duration: duration,
          ...metadata
        })
      }
    }
  }
  
  static trackError(error, context) {
    console.error('Feature error:', error)
    
    // Send error tracking
    errorReporting.captureException(error, {
      context: context,
      timestamp: new Date().toISOString()
    })
  }
}

// Usage in components
export default {
  setup() {
    const handleImport = async () => {
      const tracker = PerformanceMonitor.trackFeatureUsage('student_import', 'start')
      
      try {
        await performImport()
        tracker.end()
      } catch (error) {
        PerformanceMonitor.trackError(error, 'student_import')
        throw error
      }
    }
    
    return { handleImport }
  }
}
```

---

## 🎯 Next Steps

Ready to deploy your features? Check out:

1. **Deployment**: Learn about [Deployment Guide](../deployment/guide.md)
2. **Advanced Topics**: Explore [Performance Optimization](../advanced/performance.md)
3. **Maintenance**: Understand [Code Maintenance](../development/maintenance.md)

---

**🚀 You're now equipped to build powerful features for the Moodle system! Happy coding!** 