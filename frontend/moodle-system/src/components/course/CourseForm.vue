<template>
  <form @submit.prevent="handleSubmit" id="course-form">
    <div class="section-title">Thông tin khóa học</div>
    <div class="row mb-2">
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

    <div class="row mb-2">
      <div class="col-md-6">
        <label class="form-label">Số tín chỉ <span class="text-danger">*</span></label>
        <input 
          type="number" 
          id="course-credits" 
          v-model.number="form.credits" 
          class="form-control"
          :class="{ 'is-invalid': v$.credits.$error, 'is-valid': !v$.credits.$invalid && v$.credits.$dirty }"
          min="2"
          required
        >
        <div class="invalid-feedback" v-if="v$.credits.$error">
          Số tín chỉ phải lớn hơn hoặc bằng 2
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
          Vui lòng chọn khoa phụ trách
        </div>
      </div>
    </div>

    <div class="mb-3">
      <label class="form-label">Mô tả <span class="text-danger">*</span></label>
      <textarea 
        id="course-description" 
        v-model="form.description" 
        class="form-control"
        :class="{ 'is-invalid': v$.description.$error, 'is-valid': !v$.description.$invalid && v$.description.$dirty }"
        rows="3"
        required
      ></textarea>
      <div class="invalid-feedback" v-if="v$.description.$error">
        Vui lòng nhập mô tả khóa học
      </div>
    </div>

    <div class="mb-3">
      <label class="form-label">Môn học tiên quyết</label>
      <div v-if="loading" class="d-flex align-items-center">
        <div class="spinner-border spinner-border-sm me-2" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
        <span>Đang tải danh sách môn học...</span>
      </div>
      <select 
        v-else
        id="course-prerequisites" 
        v-model="form.prerequisites" 
        class="form-select"
        multiple
      >
        <option v-for="course in availablePrerequisites" :key="course._id" :value="course._id">
          {{ course.courseCode }} - {{ course.name }}
        </option>
      </select>
      <small class="form-text text-muted">
        Giữ phím Ctrl (hoặc Command trên Mac) để chọn nhiều môn học
      </small>
    </div>

    <div class="mt-4">
      <button type="submit" class="btn btn-primary mt-3 w-100" :disabled="loading">
        <span v-if="loading" class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
        {{ isEditing ? 'Cập nhật Khóa Học' : 'Thêm Khóa Học' }}
      </button>
      <button type="button" @click="$emit('cancel')" class="btn btn-secondary mt-2 w-100">Hủy</button>
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
    }
  },
  emits: ['submit', 'cancel'],
  setup(props, { emit }) {
    const store = useStore()
    
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
          alphanumeric: helpers.withMessage(
            'Mã khóa học chỉ được chứa chữ cái và số',
            (value) => /^[a-zA-Z0-9]+$/.test(value)
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
    
    const departments = computed(() => store.state.department.departments)
    const courses = computed(() => store.state.course.courses)
    const loading = computed(() => store.state.course.loading)
    
    // Filter out the current course from prerequisites to avoid circular references
    const availablePrerequisites = computed(() => {
      if (!Array.isArray(courses.value)) return [];
      
      return courses.value.filter(course => {
        if (props.isEditing) {
          return course.courseCode !== props.courseData.courseCode
        }
        return true
      })
    })
    
    const handleSubmit = async () => {
      const isValid = await v$.value.$validate()
      if (!isValid) return
      
      // Create a clean copy of the form data to send to the API
      const formData = {
        courseCode: form.value.courseCode,
        name: form.value.name,
        credits: Number(form.value.credits), // Ensure this is a number
        department: form.value.department,
        description: form.value.description,
        prerequisites: Array.isArray(form.value.prerequisites) ? form.value.prerequisites : []
      }
      
      console.log('Submitting course form data:', formData)
      emit('submit', formData)
    }
    
    watch(() => props.courseData, (newVal) => {
      if (newVal && Object.keys(newVal).length > 0) {
        form.value = {
          courseCode: newVal.courseCode || '',
          name: newVal.name || '',
          credits: newVal.credits || 2,
          department: newVal.department?._id || newVal.department || '',
          description: newVal.description || '',
          prerequisites: newVal.prerequisites || []
        }
      }
    }, { immediate: true, deep: true })
    
    onMounted(async () => {
      // Load departments if not already loaded
      if (departments.value.length === 0) {
        await store.dispatch('department/fetchDepartments')
      }
      
      // Always load courses to ensure we have the latest data
      await store.dispatch('course/fetchCourses')
    })
    
    return {
      form,
      v$,
      departments,
      availablePrerequisites,
      loading,
      handleSubmit
    }
  }
}
</script>

<style scoped>
.section-title {
  background-color: #e9ecef;
  padding: 8px 12px;
  margin-top: 15px;
  margin-bottom: 15px;
  border-radius: 5px;
  font-weight: bold;
}
</style>