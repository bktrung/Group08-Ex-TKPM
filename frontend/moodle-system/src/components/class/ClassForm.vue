<template>
    <form @submit.prevent="handleSubmit" id="class-form">
      <div class="section-title">Thông tin lớp học</div>
      
      <div class="row mb-2">
        <div class="col-md-6">
          <label class="form-label">Mã lớp học <span class="text-danger">*</span></label>
          <input 
            type="text" 
            id="class-code" 
            v-model="form.classCode" 
            class="form-control" 
            :class="{ 'is-invalid': v$.classCode.$error, 'is-valid': !v$.classCode.$invalid && v$.classCode.$dirty }" 
            :readonly="isEditing"
            required
          >
          <div class="invalid-feedback" v-if="v$.classCode.$error">
            {{ v$.classCode.$errors[0].$message }}
          </div>
        </div>
        <div class="col-md-6">
          <label class="form-label">Khóa học <span class="text-danger">*</span></label>
          <select 
            id="class-course" 
            v-model="form.course" 
            class="form-select"
            :class="{ 'is-invalid': v$.course.$error, 'is-valid': !v$.course.$invalid && v$.course.$dirty }"
            required
          >
            <option value="">-- Chọn khóa học --</option>
            <option v-for="course in activeCourses" :key="course._id" :value="course._id">
              {{ course.courseCode }} - {{ course.name }} ({{ course.credits }} tín chỉ)
            </option>
          </select>
          <div class="invalid-feedback" v-if="v$.course.$error">
            Vui lòng chọn khóa học
          </div>
        </div>
      </div>
  
      <div class="row mb-2">
        <div class="col-md-4">
          <label class="form-label">Năm học <span class="text-danger">*</span></label>
          <select 
            id="class-academic-year" 
            v-model="form.academicYear" 
            class="form-select"
            :class="{ 'is-invalid': v$.academicYear.$error, 'is-valid': !v$.academicYear.$invalid && v$.academicYear.$dirty }"
            required
          >
            <option value="">-- Chọn năm học --</option>
            <option v-for="year in academicYears" :key="year" :value="year">
              {{ year }}
            </option>
          </select>
          <div class="invalid-feedback" v-if="v$.academicYear.$error">
            Vui lòng chọn năm học
          </div>
        </div>
        <div class="col-md-4">
          <label class="form-label">Học kỳ <span class="text-danger">*</span></label>
          <select 
            id="class-semester" 
            v-model="form.semester" 
            class="form-select"
            :class="{ 'is-invalid': v$.semester.$error, 'is-valid': !v$.semester.$invalid && v$.semester.$dirty }"
            required
          >
            <option value="">-- Chọn học kỳ --</option>
            <option :value="1">Học kỳ 1</option>
            <option :value="2">Học kỳ 2</option>
            <option :value="3">Học kỳ 3 (Hè)</option>
          </select>
          <div class="invalid-feedback" v-if="v$.semester.$error">
            Vui lòng chọn học kỳ
          </div>
        </div>
        <div class="col-md-4">
          <label class="form-label">Sĩ số tối đa <span class="text-danger">*</span></label>
          <input 
            type="number" 
            id="class-max-capacity" 
            v-model.number="form.maxCapacity" 
            class="form-control"
            :class="{ 'is-invalid': v$.maxCapacity.$error, 'is-valid': !v$.maxCapacity.$invalid && v$.maxCapacity.$dirty }"
            min="1"
            required
          >
          <div class="invalid-feedback" v-if="v$.maxCapacity.$error">
            Sĩ số tối đa phải lớn hơn hoặc bằng 1
          </div>
        </div>
      </div>
  
      <div class="mb-3">
        <label class="form-label">Giảng viên <span class="text-danger">*</span></label>
        <input 
          type="text" 
          id="class-instructor" 
          v-model="form.instructor" 
          class="form-control"
          :class="{ 'is-invalid': v$.instructor.$error, 'is-valid': !v$.instructor.$invalid && v$.instructor.$dirty }"
          required
        >
        <div class="invalid-feedback" v-if="v$.instructor.$error">
          Vui lòng nhập tên giảng viên
        </div>
      </div>
  
      <!-- Schedule section -->
      <div class="section-title d-flex justify-content-between align-items-center">
        <span>Lịch học</span>
        <button type="button" class="btn btn-sm btn-primary" @click="addScheduleItem">
          <i class="bi bi-plus"></i> Thêm lịch học
        </button>
      </div>
      
      <div v-if="form.schedule.length === 0" class="alert alert-warning">
        Vui lòng thêm ít nhất một lịch học.
      </div>
  
      <div v-for="(schedule, index) in form.schedule" :key="index" class="card mb-3">
        <div class="card-body">
          <div class="d-flex justify-content-between">
            <h6 class="card-title">Lịch học #{{ index + 1 }}</h6>
            <button type="button" class="btn btn-sm btn-danger" @click="removeScheduleItem(index)">
              <i class="bi bi-trash"></i>
            </button>
          </div>
          
          <div class="row mb-2">
            <div class="col-md-4">
              <label class="form-label">Thứ <span class="text-danger">*</span></label>
              <select 
                v-model="schedule.dayOfWeek" 
                class="form-select"
                :class="{ 'is-invalid': scheduleErrors[index]?.dayOfWeek }"
                required
              >
                <option value="">-- Chọn thứ --</option>
                <option :value="2">Thứ Hai</option>
                <option :value="3">Thứ Ba</option>
                <option :value="4">Thứ Tư</option>
                <option :value="5">Thứ Năm</option>
                <option :value="6">Thứ Sáu</option>
                <option :value="7">Thứ Bảy</option>
              </select>
              <div class="invalid-feedback" v-if="scheduleErrors[index]?.dayOfWeek">
                Vui lòng chọn thứ
              </div>
            </div>
            <div class="col-md-4">
              <label class="form-label">Phòng học <span class="text-danger">*</span></label>
              <input 
                type="text" 
                v-model="schedule.classroom" 
                class="form-control"
                :class="{ 'is-invalid': scheduleErrors[index]?.classroom }"
                required
              >
              <div class="invalid-feedback" v-if="scheduleErrors[index]?.classroom">
                Vui lòng nhập phòng học
              </div>
            </div>
          </div>
  
          <div class="row">
            <div class="col-md-4">
              <label class="form-label">Tiết bắt đầu <span class="text-danger">*</span></label>
              <select 
                v-model="schedule.startPeriod" 
                class="form-select"
                :class="{ 'is-invalid': scheduleErrors[index]?.startPeriod }"
                required
              >
                <option value="">-- Chọn tiết --</option>
                <option v-for="period in 10" :key="`start-${period}`" :value="period">
                  Tiết {{ period }}
                </option>
              </select>
              <div class="invalid-feedback" v-if="scheduleErrors[index]?.startPeriod">
                Vui lòng chọn tiết bắt đầu
              </div>
            </div>
            <div class="col-md-4">
              <label class="form-label">Tiết kết thúc <span class="text-danger">*</span></label>
              <select 
                v-model="schedule.endPeriod" 
                class="form-select"
                :class="{ 'is-invalid': scheduleErrors[index]?.endPeriod }"
                required
              >
                <option value="">-- Chọn tiết --</option>
                <option v-for="period in 10" :key="`end-${period}`" :value="period" 
                        :disabled="schedule.startPeriod && period < schedule.startPeriod">
                  Tiết {{ period }}
                </option>
              </select>
              <div class="invalid-feedback" v-if="scheduleErrors[index]?.endPeriod">
                {{ scheduleErrors[index]?.endPeriod }}
              </div>
            </div>
          </div>
        </div>
      </div>
  
      <div class="mt-4">
        <button type="submit" class="btn btn-primary mt-3 w-100" :disabled="loading">
          <span v-if="loading" class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
          {{ isEditing ? 'Cập nhật Lớp Học' : 'Thêm Lớp Học' }}
        </button>
        <button type="button" @click="$emit('cancel')" class="btn btn-secondary mt-2 w-100">Hủy</button>
      </div>
    </form>
  </template>
  
  <script>
  import { ref, computed, watch, onMounted } from 'vue'
  import { useStore } from 'vuex'
  import { useVuelidate } from '@vuelidate/core'
  import { required, minValue, helpers, minLength } from '@vuelidate/validators'
  
  export default {
    name: 'ClassForm',
    props: {
      classData: {
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
      
      // Default schedule item template
      const defaultScheduleItem = () => ({
        dayOfWeek: '',
        startPeriod: '',
        endPeriod: '',
        classroom: ''
      })
      
      // Form state
      const form = ref({
        classCode: '',
        course: '',
        academicYear: '',
        semester: '',
        instructor: '',
        maxCapacity: 30,
        schedule: []
      })
      
      // Schedule error state
      const scheduleErrors = ref([])
      
      // Generate academic years (current year - 1 to current year + 2)
      const currentYear = new Date().getFullYear()
      const academicYears = computed(() => {
        const years = []
        for (let i = -1; i <= 2; i++) {
          const startYear = currentYear + i
          const endYear = startYear + 1
          years.push(`${startYear}-${endYear}`)
        }
        return years
      })
      
      // Validation rules
      const rules = computed(() => {
        return {
          classCode: { 
            required: helpers.withMessage('Mã lớp học là bắt buộc', required),
            alphanumeric: helpers.withMessage(
              'Mã lớp học chỉ được chứa chữ cái và số',
              (value) => /^[a-zA-Z0-9-]+$/.test(value)
            )
          },
          course: { 
            required: helpers.withMessage('Khóa học là bắt buộc', required) 
          },
          academicYear: { 
            required: helpers.withMessage('Năm học là bắt buộc', required) 
          },
          semester: { 
            required: helpers.withMessage('Học kỳ là bắt buộc', required) 
          },
          instructor: { 
            required: helpers.withMessage('Giảng viên là bắt buộc', required) 
          },
          maxCapacity: { 
            required: helpers.withMessage('Sĩ số tối đa là bắt buộc', required),
            minValue: helpers.withMessage(
              'Sĩ số tối đa phải lớn hơn hoặc bằng 1',
              minValue(1)
            )
          },
          schedule: {
            required: helpers.withMessage('Lịch học là bắt buộc', required),
            minLength: helpers.withMessage(
              'Phải có ít nhất một lịch học',
              minLength(1)
            )
          }
        }
      })
      
      const v$ = useVuelidate(rules, form)
      
      // Get only active courses for selection
      const activeCourses = computed(() => {
        return store.getters['course/getActiveCourses'] || []
      })
      
      const loading = computed(() => store.state.class.loading)
      
      // Add a new schedule item
      const addScheduleItem = () => {
        form.value.schedule.push(defaultScheduleItem())
        scheduleErrors.value.push({})
      }
      
      // Remove a schedule item
      const removeScheduleItem = (index) => {
        form.value.schedule.splice(index, 1)
        scheduleErrors.value.splice(index, 1)
      }
      
      // Validate a single schedule item
      const validateScheduleItem = (schedule, index) => {
        const errors = {}
        
        if (!schedule.dayOfWeek) {
          errors.dayOfWeek = 'Vui lòng chọn thứ'
        }
        
        if (!schedule.classroom) {
          errors.classroom = 'Vui lòng nhập phòng học'
        }
        
        if (!schedule.startPeriod) {
          errors.startPeriod = 'Vui lòng chọn tiết bắt đầu'
        }
        
        if (!schedule.endPeriod) {
          errors.endPeriod = 'Vui lòng chọn tiết kết thúc'
        } else if (schedule.startPeriod && schedule.endPeriod < schedule.startPeriod) {
          errors.endPeriod = 'Tiết kết thúc phải lớn hơn hoặc bằng tiết bắt đầu'
        }
        
        // Check for overlapping schedules with other schedule items in the same form
        if (schedule.dayOfWeek && schedule.startPeriod && schedule.endPeriod && schedule.classroom) {
          for (let i = 0; i < form.value.schedule.length; i++) {
            if (i === index) continue // Skip comparing with itself
            
            const otherSchedule = form.value.schedule[i]
            if (otherSchedule.dayOfWeek === schedule.dayOfWeek && 
                otherSchedule.classroom === schedule.classroom) {
              
              const overlap = (
                // Case 1: This schedule starts during another schedule
                (schedule.startPeriod <= otherSchedule.endPeriod && 
                 schedule.startPeriod >= otherSchedule.startPeriod) ||
                
                // Case 2: This schedule ends during another schedule
                (schedule.endPeriod >= otherSchedule.startPeriod && 
                 schedule.endPeriod <= otherSchedule.endPeriod) ||
                
                // Case 3: This schedule completely surrounds another schedule
                (schedule.startPeriod <= otherSchedule.startPeriod && 
                 schedule.endPeriod >= otherSchedule.endPeriod)
              )
              
              if (overlap) {
                errors.endPeriod = `Lịch học bị trùng với lịch học #${i + 1} tại phòng ${schedule.classroom}`
                break
              }
            }
          }
        }
        
        scheduleErrors.value[index] = errors
        return Object.keys(errors).length === 0
      }
      
      // Validate all schedule items
      const validateAllSchedules = () => {
        let isValid = true
        
        // First check if we have at least one schedule item
        if (form.value.schedule.length === 0) {
          return false
        }
        
        // Then validate each schedule item
        form.value.schedule.forEach((schedule, index) => {
          if (!validateScheduleItem(schedule, index)) {
            isValid = false
          }
        })
        
        return isValid
      }
      
      // Handle form submission
      const handleSubmit = async () => {
        // Validate main form
        const isFormValid = await v$.value.$validate()
        
        // Validate all schedules
        const areSchedulesValid = validateAllSchedules()
        
        if (!isFormValid || !areSchedulesValid) {
          return
        }
        
        // Convert form data to the format expected by the backend
        const formData = {
          ...form.value,
          semester: Number(form.value.semester) // Ensure semester is a number
        }
        
        // Emit the submit event with the form data
        emit('submit', formData)
      }
      
      // Initialize form data from props
      watch(() => props.classData, (newVal) => {
        if (newVal && Object.keys(newVal).length > 0) {
          // Deep copy to avoid modifying props
          const classData = JSON.parse(JSON.stringify(newVal))
          
          // Map the form data
          form.value = {
            classCode: classData.classCode || '',
            course: classData.course?._id || classData.course || '',
            academicYear: classData.academicYear || '',
            semester: classData.semester || '',
            instructor: classData.instructor || '',
            maxCapacity: classData.maxCapacity || 30,
            schedule: classData.schedule || []
          }
          
          // Initialize schedule errors array
          scheduleErrors.value = Array(form.value.schedule.length).fill({})
        } else {
          // Reset form for new class
          form.value = {
            classCode: '',
            course: '',
            academicYear: academicYears.value[1], // Default to current academic year
            semester: '',
            instructor: '',
            maxCapacity: 30,
            schedule: []
          }
          scheduleErrors.value = []
        }
      }, { immediate: true, deep: true })
      
      // Load courses if not already loaded
      onMounted(async () => {
        if (activeCourses.value.length === 0) {
          await store.dispatch('course/fetchCourses')
        }
        
        // Add a default schedule item for new class
        if (!props.isEditing && form.value.schedule.length === 0) {
          addScheduleItem()
        }
      })
      
      return {
        form,
        v$,
        loading,
        academicYears,
        activeCourses,
        scheduleErrors,
        addScheduleItem,
        removeScheduleItem,
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