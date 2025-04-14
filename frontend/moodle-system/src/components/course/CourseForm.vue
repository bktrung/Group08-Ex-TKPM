<template>
  <form @submit.prevent="submitForm">
    <!-- Thông tin cơ bản -->
    <div class="row mb-3">
      <div class="col-md-3">
        <div class="form-group">
          <label for="courseCode" class="form-label">Mã khóa học <span class="text-danger">*</span></label>
          <input
            type="text"
            id="courseCode"
            class="form-control"
            v-model="formState.courseCode"
            :disabled="isEditing"
            :class="{ 'is-invalid': validationErrors.courseCode }"
            placeholder="VD: CSC101"
            required
          />
          <div class="invalid-feedback">{{ validationErrors.courseCode }}</div>
        </div>
      </div>
      
      <div class="col-md-6">
        <div class="form-group">
          <label for="name" class="form-label">Tên khóa học <span class="text-danger">*</span></label>
          <input
            type="text"
            id="name"
            class="form-control"
            v-model="formState.name"
            :class="{ 'is-invalid': validationErrors.name }"
            placeholder="VD: Nhập môn Lập trình"
            required
          />
          <div class="invalid-feedback">{{ validationErrors.name }}</div>
        </div>
      </div>
      
      <div class="col-md-3">
        <div class="form-group">
          <label for="credits" class="form-label">Số tín chỉ <span class="text-danger">*</span></label>
          <input
            type="number"
            id="credits"
            class="form-control"
            v-model="formState.credits"
            :class="{ 'is-invalid': validationErrors.credits }"
            min="2"
            step="1"
            required
          />
          <div class="invalid-feedback">{{ validationErrors.credits }}</div>
        </div>
      </div>
    </div>
    
    <div class="row mb-3">
      <div class="col-md-6">
        <div class="form-group">
          <label for="department" class="form-label">Khoa <span class="text-danger">*</span></label>
          <select
            id="department"
            class="form-select"
            v-model="formState.department"
            :class="{ 'is-invalid': validationErrors.department }"
            required
          >
            <option value="" disabled>Chọn khoa</option>
            <option v-for="dept in departments" :key="dept._id" :value="dept._id">
              {{ dept.name }}
            </option>
          </select>
          <div class="invalid-feedback">{{ validationErrors.department }}</div>
        </div>
      </div>
      
      <div class="col-md-6" v-if="!isEditing">
        <div class="form-group">
          <label for="prerequisites" class="form-label">Môn học tiên quyết</label>
          <select
            id="prerequisites"
            class="form-select"
            v-model="formState.prerequisites"
            multiple
            :class="{ 'is-invalid': validationErrors.prerequisites }"
          >
            <option v-for="course in availableCourses" :key="course._id" :value="course._id">
              {{ course.courseCode }} - {{ course.name }}
            </option>
          </select>
          <div class="form-text">Giữ Ctrl để chọn nhiều môn học</div>
          <div class="invalid-feedback">{{ validationErrors.prerequisites }}</div>
        </div>
      </div>
    </div>
    
    <div class="row mb-3">
      <div class="col-12">
        <div class="form-group">
          <label for="description" class="form-label">Mô tả khóa học <span class="text-danger">*</span></label>
          <textarea
            id="description"
            class="form-control"
            v-model="formState.description"
            :class="{ 'is-invalid': validationErrors.description }"
            rows="4"
            placeholder="Mô tả chi tiết về khóa học"
            required
          ></textarea>
          <div class="invalid-feedback">{{ validationErrors.description }}</div>
        </div>
      </div>
    </div>
    
    <!-- Nút submit và cancel -->
    <div class="d-flex justify-content-end gap-2 mt-4">
      <button type="button" class="btn btn-secondary" @click="cancelForm">Hủy</button>
      <button type="submit" class="btn btn-primary" :disabled="loading">
        <span v-if="loading" class="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
        {{ isEditing ? 'Cập nhật' : 'Thêm' }} Khóa Học
      </button>
    </div>
  </form>
</template>

<script>
import { ref, reactive, computed, watch, onMounted } from 'vue'
import { useStore } from 'vuex'

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
    }
  },
  emits: ['submit', 'cancel'],
  setup(props, { emit }) {
    const store = useStore()
    
    // Create a reactive form state that's separate from the props
    const formState = reactive({
      courseCode: '',
      name: '',
      credits: 3,
      department: '',
      description: '',
      prerequisites: []
    })
    
    const loading = ref(false)
    const validationErrors = reactive({})
    
    // Get departments and courses from store
    const departments = computed(() => store.state.department.departments)
    const courses = computed(() => store.state.course.courses || [])
    
    // Filter available courses for prerequisites (exclude current course if editing)
    const availableCourses = computed(() => {
      return courses.value.filter(course => {
        // If editing, exclude the current course
        if (props.isEditing && course.courseCode === formState.courseCode) {
          return false
        }
        return true
      })
    })
    
    watch(() => props.courseData, (newData) => {
      if (newData && Object.keys(newData).length > 0) {
        formState.courseCode = newData.courseCode || ''
        formState.name = newData.name || ''
        formState.credits = newData.credits || 3
        
        if (newData.department) {
          formState.department = typeof newData.department === 'object' 
            ? newData.department._id 
            : newData.department
        } else {
          formState.department = ''
        }
        
        formState.description = newData.description || ''
        
        if (newData.prerequisites && Array.isArray(newData.prerequisites)) {
          formState.prerequisites = newData.prerequisites.map(prereq => 
            typeof prereq === 'object' ? prereq._id : prereq
          )
        } else {
          formState.prerequisites = []
        }
      }
    }, { immediate: true, deep: true })
    
    // Validate form data
    const validateForm = () => {
      const errors = {}
      
      // Validate course code (only if not editing)
      if (!props.isEditing && !formState.courseCode.trim()) {
        errors.courseCode = 'Mã khóa học không được để trống'
      } else if (!props.isEditing && !/^[A-Za-z0-9]{3,10}$/.test(formState.courseCode)) {
        errors.courseCode = 'Mã khóa học phải có 3-10 ký tự và không chứa ký tự đặc biệt'
      }
      
      // Validate name
      if (!formState.name.trim()) {
        errors.name = 'Tên khóa học không được để trống'
      } else if (formState.name.length < 3) {
        errors.name = 'Tên khóa học phải có ít nhất 3 ký tự'
      }
      
      // Validate credits
      if (!formState.credits) {
        errors.credits = 'Số tín chỉ không được để trống'
      } else if (formState.credits < 2) {
        errors.credits = 'Số tín chỉ phải lớn hơn hoặc bằng 2'
      } else if (!Number.isInteger(Number(formState.credits))) {
        errors.credits = 'Số tín chỉ phải là số nguyên'
      }
      
      // Validate department
      if (!formState.department) {
        errors.department = 'Vui lòng chọn khoa'
      }
      
      // Validate description
      if (!formState.description.trim()) {
        errors.description = 'Mô tả khóa học không được để trống'
      } else if (formState.description.length < 10) {
        errors.description = 'Mô tả khóa học phải có ít nhất 10 ký tự'
      }
      
      Object.assign(validationErrors, errors)
      return Object.keys(errors).length === 0
    }
    
    // Submit form
    const submitForm = async () => {
      if (!validateForm()) {
        return
      }
      
      loading.value = true
      
      try {
        const submitData = {
          courseCode: formState.courseCode,
          name: formState.name,
          credits: Number(formState.credits),
          department: formState.department,
          description: formState.description,
          prerequisites: formState.prerequisites
        }
        
        emit('submit', submitData)
      } catch (error) {
        console.error('Error in form submission:', error)
      } finally {
        loading.value = false
      }
    }
    
    // Cancel form
    const cancelForm = () => {
      emit('cancel')
    }
    
    // Load initial data
    onMounted(async () => {
      if (departments.value.length === 0) {
        await store.dispatch('department/fetchDepartments')
      }
      
      if (courses.value.length === 0) {
        await store.dispatch('course/fetchCourses')
      }
    })
    
    return {
      formState,
      loading,
      validationErrors,
      departments,
      availableCourses,
      submitForm,
      cancelForm
    }
  }
}
</script>

<style scoped>
select[multiple] {
  height: 150px;
}
</style>