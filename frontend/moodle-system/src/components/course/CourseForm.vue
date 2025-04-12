<template>
    <form @submit.prevent="handleSubmit" id="course-form">
      <div class="row mb-3">
        <div class="col-md-6">
          <label class="form-label">Mã khóa học <span class="text-danger">*</span></label>
          <input 
            type="text" 
            id="course-code" 
            v-model="form.courseCode" 
            class="form-control"
            :class="{ 'is-invalid': v$.courseCode.$error, 'is-valid': !v$.courseCode.$invalid && v$.courseCode.$dirty }"
            :readonly="isEditing"
            required
          >
          <div class="invalid-feedback" v-if="v$.courseCode.$error">
            {{ v$.courseCode.$errors[0].$message }}
          </div>
        </div>
        <div class="col-md-6">
          <label class="form-label">Tên khóa học <span class="text-danger">*</span></label>
          <input 
            type="text" 
            id="course-name" 
            v-model="form.name" 
            class="form-control"
            :class="{ 'is-invalid': v$.name.$error, 'is-valid': !v$.name.$invalid && v$.name.$dirty }"
            required
          >
          <div class="invalid-feedback" v-if="v$.name.$error">
            {{ v$.name.$errors[0].$message }}
          </div>
        </div>
      </div>
  
      <div class="row mb-3">
        <div class="col-md-6">
          <label class="form-label">Số tín chỉ <span class="text-danger">*</span></label>
          <input 
            type="number" 
            id="course-credits" 
            v-model.number="form.credits" 
            class="form-control"
            :class="{ 'is-invalid': v$.credits.$error, 'is-valid': !v$.credits.$invalid && v$.credits.$dirty }"
            min="2"
            :readonly="isEditing && hasEnrolledStudents"
            required
          >
          <div class="invalid-feedback" v-if="v$.credits.$error">
            {{ v$.credits.$errors[0].$message }}
          </div>
          <div v-if="isEditing && hasEnrolledStudents" class="form-text text-muted">
            Không thể thay đổi số tín chỉ vì đã có sinh viên đăng ký.
          </div>
        </div>
        <div class="col-md-6">
          <label class="form-label">Khoa phụ trách <span class="text-danger">*</span></label>
          <select 
            id="course-department" 
            v-model="form.department" 
            class="form-select"
            :class="{ 'is-invalid': v$.department.$error, 'is-valid': !v$.department.$invalid && v$.department.$dirty }"
            required
          >
            <option value="">-- Chọn khoa --</option>
            <option v-for="dept in departments" :key="dept._id" :value="dept._id">
              {{ dept.name }}
            </option>
          </select>
          <div class="invalid-feedback" v-if="v$.department.$error">
            {{ v$.department.$errors[0].$message }}
          </div>
        </div>
      </div>
  
      <div class="mb-3">
        <label class="form-label">Mô tả khóa học <span class="text-danger">*</span></label>
        <textarea 
          id="course-description" 
          v-model="form.description" 
          class="form-control"
          :class="{ 'is-invalid': v$.description.$error, 'is-valid': !v$.description.$invalid && v$.description.$dirty }"
          rows="3"
          required
        ></textarea>
        <div class="invalid-feedback" v-if="v$.description.$error">
          {{ v$.description.$errors[0].$message }}
        </div>
      </div>
  
      <div class="mb-3">
        <label class="form-label">Môn học tiên quyết</label>
        <div v-if="availablePrerequisites.length === 0" class="form-text text-muted mb-2">
          Không có khóa học nào khả dụng để chọn làm môn tiên quyết.
        </div>
        <div v-else>
          <select 
            id="course-prerequisites" 
            v-model="form.prerequisites" 
            class="form-select"
            multiple
          >
            <option v-for="course in availablePrerequisites" :key="course._id" :value="course._id">
              {{ course.courseCode }} - {{ course.name }}
            </option>
          </select>
          <div class="form-text text-muted">
            Nhấn giữ Ctrl (hoặc Command trên Mac) để chọn nhiều môn học.
          </div>
        </div>
      </div>
  
      <div class="mt-4">
        <button type="submit" class="btn btn-primary mt-3 w-100" :disabled="loading || isSubmitting">
          <span v-if="isSubmitting" class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
          {{ isEditing ? 'Cập nhật khóa học' : 'Thêm khóa học' }}
        </button>
        <router-link to="/courses" class="btn btn-secondary mt-2 w-100">Hủy</router-link>
      </div>
    </form>
  </template>
  
  <script>
  import { ref, computed, watch, onMounted } from 'vue'
  import { useStore } from 'vuex'
  import { useVuelidate } from '@vuelidate/core'
  import { required, minValue, helpers } from '@vuelidate/validators'
  
  export default {
    name: 'CourseForm',
    props: {
      courseData: {
        type: Object,
        default: () => ({})
      },
      isEditing: {
        type: Boolean,
        default: false
      },
      hasEnrolledStudents: {
        type: Boolean,
        default: false
      }
    },
    emits: ['submit'],
    setup(props, { emit }) {
      const store = useStore()
      const isSubmitting = ref(false)
      
      const form = ref({
        courseCode: '',
        name: '',
        credits: 2,
        department: '',
        description: '',
        prerequisites: []
      })
      
      // Validation rules
      const rules = computed(() => {
        return {
          courseCode: { 
            required: helpers.withMessage('Mã khóa học là bắt buộc', required),
            pattern: helpers.withMessage(
              'Mã khóa học chỉ được chứa chữ cái, số và dấu gạch ngang',
              (value) => /^[A-Za-z0-9-]+$/.test(value)
            )
          },
          name: { 
            required: helpers.withMessage('Tên khóa học là bắt buộc', required) 
          },
          credits: { 
            required: helpers.withMessage('Số tín chỉ là bắt buộc', required),
            minValue: helpers.withMessage(
              'Số tín chỉ phải lớn hơn hoặc bằng 2',
              minValue(2)
            )
          },
          department: { 
            required: helpers.withMessage('Khoa phụ trách là bắt buộc', required) 
          },
          description: { 
            required: helpers.withMessage('Mô tả khóa học là bắt buộc', required) 
          }
        }
      })
      
      const v$ = useVuelidate(rules, form)
      
      // Computed properties
      const departments = computed(() => store.state.department.departments)
      const allCourses = computed(() => store.state.course.courses)
      const loading = computed(() => store.state.course.loading)
      
      // Available courses for prerequisites (exclude current course in edit mode)
      const availablePrerequisites = computed(() => {
        if (props.isEditing) {
          return allCourses.value.filter(course => course.courseCode !== form.value.courseCode)
        }
        return allCourses.value
      })
      
      const handleSubmit = async () => {
        isSubmitting.value = true
        const isValid = await v$.value.$validate()
        
        if (!isValid) {
          isSubmitting.value = false
          return
        }
        
        // Create a clean copy of the data
        const courseData = { ...form.value }
        
        // Ensure prerequisites is an array
        if (!Array.isArray(courseData.prerequisites)) {
          courseData.prerequisites = []
        }
        
        emit('submit', courseData)
        isSubmitting.value = false
      }
      
      // Watch for changes in props
      watch(() => props.courseData, (newValue) => {
        if (newValue && Object.keys(newValue).length > 0) {
          // Initialize form with course data
          form.value.courseCode = newValue.courseCode || ''
          form.value.name = newValue.name || ''
          form.value.credits = newValue.credits || 2
          form.value.description = newValue.description || ''
          
          // Handle department reference
          form.value.department = typeof newValue.department === 'object' 
            ? newValue.department._id 
            : newValue.department
          
          // Handle prerequisites array
          if (newValue.prerequisites && Array.isArray(newValue.prerequisites)) {
            form.value.prerequisites = newValue.prerequisites.map(prereq => 
              typeof prereq === 'object' ? prereq._id : prereq
            )
          } else {
            form.value.prerequisites = []
          }
        }
      }, { immediate: true, deep: true })
      
      // Load required data
      onMounted(async () => {
        if (departments.value.length === 0) {
          await store.dispatch('department/fetchDepartments')
        }
        
        if (allCourses.value.length === 0) {
          await store.dispatch('course/fetchCourses', { limit: 100 }) // Fetch with larger limit for prerequisites
        }
      })
      
      return {
        form,
        v$,
        departments,
        availablePrerequisites,
        loading,
        isSubmitting,
        handleSubmit
      }
    }
  }
  </script>
  
  <style scoped>
  .form-label {
    font-weight: 500;
  }
  </style>