<template>
    <form @submit.prevent="handleSubmit" id="class-form">
      <div class="row mb-3">
        <div class="col-md-6">
          <label class="form-label">Mã lớp học <span class="text-danger">*</span></label>
          <input 
            type="text" 
            id="class-code" 
            v-model="form.classCode" 
            class="form-control"
            :class="{ 'is-invalid': v$.classCode.$error, 'is-valid': !v$.classCode.$invalid && v$.classCode.$dirty }"
            required
          >
          <div class="invalid-feedback" v-if="v$.classCode.$error">
            {{ v$.classCode.$errors[0].$message }}
          </div>
        </div>
        <div class="col-md-6">
          <label class="form-label">Khóa học: <span class="fw-bold">{{ courseInfo }}</span></label>
          <input type="hidden" v-model="form.course">
        </div>
      </div>
  
      <div class="row mb-3">
        <div class="col-md-4">
          <label class="form-label">Năm học <span class="text-danger">*</span></label>
          <input 
            type="text" 
            id="academic-year" 
            v-model="form.academicYear" 
            class="form-control"
            :class="{ 'is-invalid': v$.academicYear.$error, 'is-valid': !v$.academicYear.$invalid && v$.academicYear.$dirty }"
            placeholder="2023-2024"
            required
          >
          <div class="invalid-feedback" v-if="v$.academicYear.$error">
            {{ v$.academicYear.$errors[0].$message }}
          </div>
        </div>
        <div class="col-md-4">
          <label class="form-label">Học kỳ <span class="text-danger">*</span></label>
          <select 
            id="semester" 
            v-model="form.semester" 
            class="form-select"
            :class="{ 'is-invalid': v$.semester.$error, 'is-valid': !v$.semester.$invalid && v$.semester.$dirty }"
            required
          >
            <option value="">-- Chọn học kỳ --</option>
            <option value="1">Học kỳ 1</option>
            <option value="2">Học kỳ 2</option>
            <option value="3">Học kỳ 3</option>
          </select>
          <div class="invalid-feedback" v-if="v$.semester.$error">
            {{ v$.semester.$errors[0].$message }}
          </div>
        </div>
        <div class="col-md-4">
          <label class="form-label">Số lượng tối đa <span class="text-danger">*</span></label>
          <input 
            type="number" 
            id="max-capacity" 
            v-model.number="form.maxCapacity" 
            class="form-control"
            :class="{ 'is-invalid': v$.maxCapacity.$error, 'is-valid': !v$.maxCapacity.$invalid && v$.maxCapacity.$dirty }"
            min="1"
            required
          >
          <div class="invalid-feedback" v-if="v$.maxCapacity.$error">
            {{ v$.maxCapacity.$errors[0].$message }}
          </div>
        </div>
      </div>
  
      <div class="mb-3">
        <label class="form-label">Giảng viên <span class="text-danger">*</span></label>
        <input 
          type="text" 
          id="instructor" 
          v-model="form.instructor" 
          class="form-control"
          :class="{ 'is-invalid': v$.instructor.$error, 'is-valid': !v$.instructor.$invalid && v$.instructor.$dirty }"
          required
        >
        <div class="invalid-feedback" v-if="v$.instructor.$error">
          {{ v$.instructor.$errors[0].$message }}
        </div>
      </div>
  
      <div class="section-title">Lịch học</div>
      
      <div v-for="(schedule, index) in form.schedule" :key="index" class="card mb-3">
        <div class="card-body">
          <div class="d-flex justify-content-between mb-2">
            <h6 class="card-title">Lịch học #{{ index + 1 }}</h6>
            <button 
              type="button" 
              class="btn btn-sm btn-danger" 
              @click="removeSchedule(index)"
              v-if="form.schedule.length > 1"
            >
              Xóa
            </button>
          </div>
          
          <div class="row mb-2">
            <div class="col-md-4">
              <label class="form-label">Thứ <span class="text-danger">*</span></label>
              <select 
                v-model="schedule.dayOfWeek" 
                class="form-select"
                required
              >
                <option value="">-- Chọn thứ --</option>
                <option value="2">Thứ Hai</option>
                <option value="3">Thứ Ba</option>
                <option value="4">Thứ Tư</option>
                <option value="5">Thứ Năm</option>
                <option value="6">Thứ Sáu</option>
                <option value="7">Thứ Bảy</option>
              </select>
            </div>
            <div class="col-md-4">
              <label class="form-label">Từ tiết <span class="text-danger">*</span></label>
              <select 
                v-model="schedule.startPeriod" 
                class="form-select"
                @change="updateEndPeriod(index)"
                required
              >
                <option value="">-- Chọn tiết bắt đầu --</option>
                <option v-for="period in 10" :key="`start-${period}`" :value="period">
                  Tiết {{ period }}
                </option>
              </select>
            </div>
            <div class="col-md-4">
              <label class="form-label">Đến tiết <span class="text-danger">*</span></label>
              <select 
                v-model="schedule.endPeriod" 
                class="form-select"
                required
                :disabled="!schedule.startPeriod"
              >
                <option value="">-- Chọn tiết kết thúc --</option>
                <option 
                  v-for="period in getEndPeriodOptions(schedule.startPeriod)" 
                  :key="`end-${period}`" 
                  :value="period"
                >
                  Tiết {{ period }}
                </option>
              </select>
            </div>
          </div>
          
          <div class="mb-2">
            <label class="form-label">Phòng học <span class="text-danger">*</span></label>
            <input 
              type="text" 
              v-model="schedule.classroom" 
              class="form-control"
              required
            >
          </div>
        </div>
      </div>
      
      <div class="text-center mb-3">
        <button type="button" class="btn btn-outline-primary" @click="addSchedule">
          <i class="bi bi-plus-circle"></i> Thêm lịch học
        </button>
      </div>
  
      <div class="alert alert-info">
        <i class="bi bi-info-circle-fill me-2"></i>
        Lưu ý: Hệ thống sẽ kiểm tra xung đột lịch học về thời gian và phòng học khi thêm mới lớp.
      </div>
  
      <div class="mt-4">
        <button type="submit" class="btn btn-primary mt-3 w-100" :disabled="loading || isSubmitting">
          <span v-if="isSubmitting" class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
          Mở lớp học
        </button>
        <router-link :to="`/courses`" class="btn btn-secondary mt-2 w-100">Hủy</router-link>
      </div>
    </form>
  </template>
  
  <script>
  import { ref, computed, onMounted } from 'vue'
  import { useStore } from 'vuex'
  import { useVuelidate } from '@vuelidate/core'
  import { required, minValue, helpers } from '@vuelidate/validators'
  
  export default {
    name: 'ClassForm',
    props: {
      courseCode: {
        type: String,
        required: true
      }
    },
    emits: ['submit'],
    setup(props, { emit }) {
      const store = useStore()
      const isSubmitting = ref(false)
      
      const form = ref({
        classCode: '',
        course: '',
        academicYear: getCurrentAcademicYear(),
        semester: '',
        instructor: '',
        maxCapacity: 30,
        schedule: [
          {
            dayOfWeek: '',
            startPeriod: '',
            endPeriod: '',
            classroom: ''
          }
        ]
      })
      
      const course = ref(null)
      
      // Validation rules
      const rules = computed(() => {
        return {
          classCode: { 
            required: helpers.withMessage('Mã lớp học là bắt buộc', required),
            pattern: helpers.withMessage(
              'Mã lớp học chỉ được chứa chữ cái, số và dấu gạch ngang',
              (value) => /^[A-Za-z0-9\-.]+$/.test(value)
            )
          },
          course: { 
            required: helpers.withMessage('Khóa học là bắt buộc', required) 
          },
          academicYear: { 
            required: helpers.withMessage('Năm học là bắt buộc', required),
            pattern: helpers.withMessage(
              'Năm học phải có định dạng YYYY-YYYY (vd: 2023-2024)',
              (value) => /^\d{4}-\d{4}$/.test(value)
            ),
            valid: helpers.withMessage(
              'Năm thứ hai phải lớn hơn năm thứ nhất đúng 1 năm',
              (value) => {
                if (!/^\d{4}-\d{4}$/.test(value)) return true // let pattern validation handle this
                const [year1, year2] = value.split('-').map(Number)
                return year2 === year1 + 1
              }
            )
          },
          semester: { 
            required: helpers.withMessage('Học kỳ là bắt buộc', required)
          },
          instructor: { 
            required: helpers.withMessage('Giảng viên là bắt buộc', required) 
          },
          maxCapacity: { 
            required: helpers.withMessage('Số lượng tối đa là bắt buộc', required),
            minValue: helpers.withMessage(
              'Số lượng tối đa phải ít nhất là 1',
              minValue(1)
            )
          }
        }
      })
      
      const v$ = useVuelidate(rules, form)
      
      // Computed properties
      const loading = computed(() => store.state.course.loading)
      
      const courseInfo = computed(() => {
        if (!course.value) return props.courseCode
        return `${course.value.courseCode} - ${course.value.name}`
      })
      
      function getCurrentAcademicYear() {
        const now = new Date()
        const currentYear = now.getFullYear()
        const month = now.getMonth() + 1
        
        // If current month is before September, we're in the second half of the academic year
        if (month < 9) {
          return `${currentYear-1}-${currentYear}`
        } else {
          return `${currentYear}-${currentYear+1}`
        }
      }
      
      const fetchCourseData = async () => {
        try {
          const fetchedCourse = await store.dispatch('course/fetchCourse', props.courseCode)
          course.value = fetchedCourse
          form.value.course = fetchedCourse._id
        } catch (error) {
          console.error('Error fetching course data:', error)
        }
      }
      
      const getEndPeriodOptions = (startPeriod) => {
        if (!startPeriod) return []
        
        const options = []
        for (let i = Number(startPeriod); i <= 10; i++) {
          options.push(i)
        }
        return options
      }
      
      const updateEndPeriod = (index) => {
        const startPeriod = Number(form.value.schedule[index].startPeriod)
        const endPeriod = Number(form.value.schedule[index].endPeriod)
        
        // If end period is less than start period or not set, update it
        if (!endPeriod || endPeriod < startPeriod) {
          form.value.schedule[index].endPeriod = startPeriod
        }
      }
      
      const addSchedule = () => {
        form.value.schedule.push({
          dayOfWeek: '',
          startPeriod: '',
          endPeriod: '',
          classroom: ''
        })
      }
      
      const removeSchedule = (index) => {
        form.value.schedule.splice(index, 1)
      }
      
      const validateSchedules = () => {
        // Check if all required fields in schedules are filled
        for (const schedule of form.value.schedule) {
          if (!schedule.dayOfWeek || !schedule.startPeriod || 
              !schedule.endPeriod || !schedule.classroom) {
            return false
          }
        }
        
        // Check for conflicts within the schedules
        for (let i = 0; i < form.value.schedule.length; i++) {
          const scheduleA = form.value.schedule[i]
          for (let j = i + 1; j < form.value.schedule.length; j++) {
            const scheduleB = form.value.schedule[j]
            
            // Check if same day and classroom
            if (scheduleA.dayOfWeek === scheduleB.dayOfWeek && 
                scheduleA.classroom === scheduleB.classroom) {
                  
              // Check for period overlap
              const aStart = Number(scheduleA.startPeriod)
              const aEnd = Number(scheduleA.endPeriod)
              const bStart = Number(scheduleB.startPeriod)
              const bEnd = Number(scheduleB.endPeriod)
              
              if ((aStart <= bEnd && aStart >= bStart) || // A starts during B
                  (aEnd >= bStart && aEnd <= bEnd) ||     // A ends during B
                  (aStart <= bStart && aEnd >= bEnd)) {   // A completely overlaps B
                return false
              }
            }
          }
        }
        
        return true
      }
      
      const handleSubmit = async () => {
        isSubmitting.value = true
        const isValid = await v$.value.$validate()
        
        if (!isValid || !validateSchedules()) {
          alert('Vui lòng kiểm tra lại thông tin lịch học. Đảm bảo rằng không có xung đột về thời gian và phòng học.')
          isSubmitting.value = false
          return
        }
        
        // Convert any string numbers to actual numbers
        const formattedData = {
          ...form.value,
          semester: Number(form.value.semester),
          maxCapacity: Number(form.value.maxCapacity),
          schedule: form.value.schedule.map(schedule => ({
            ...schedule,
            dayOfWeek: Number(schedule.dayOfWeek),
            startPeriod: Number(schedule.startPeriod),
            endPeriod: Number(schedule.endPeriod)
          }))
        }
        
        emit('submit', formattedData)
        isSubmitting.value = false
      }
      
      onMounted(async () => {
        await fetchCourseData()
      })
      
      return {
        form,
        v$,
        course,
        courseInfo,
        loading,
        isSubmitting,
        getEndPeriodOptions,
        updateEndPeriod,
        addSchedule,
        removeSchedule,
        handleSubmit
      }
    }
  }
  </script>
  
  <style scoped>
  .form-label {
    font-weight: 500;
  }
  
  .section-title {
    background-color: #e9ecef;
    padding: 8px 12px;
    margin-top: 15px;
    margin-bottom: 15px;
    border-radius: 5px;
    font-weight: bold;
  }
  </style>