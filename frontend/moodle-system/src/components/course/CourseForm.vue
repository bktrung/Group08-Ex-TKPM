<template>
  <form @submit.prevent="submitForm">
    <!-- Thông tin cơ bản -->
    <div class="row mb-3">
      <div class="col-md-3">
        <div class="form-group">
          <label for="courseCode" class="form-label">{{ $t('course.course_code') }} <span
              class="text-danger">*</span></label>
          <input type="text" id="courseCode" class="form-control" v-model="formState.courseCode" :disabled="isEditing"
            :class="{ 'is-invalid': validationErrors.courseCode }" placeholder="VD: CSC101" required />
          <div class="invalid-feedback">{{ validationErrors.courseCode }}</div>
        </div>
      </div>

      <div class="col-md-6">
        <div class="form-group">
          <label for="name" class="form-label">{{ $t('course.name') }} <span class="text-danger">*</span></label>
          <input type="text" id="name" class="form-control" v-model="formState.name"
            :class="{ 'is-invalid': validationErrors.name }" placeholder="VD: Nhập môn Lập trình" required />
          <div class="invalid-feedback">{{ validationErrors.name }}</div>
        </div>
      </div>

      <div class="col-md-3">
        <div class="form-group">
          <label for="credits" class="form-label">{{ $t('course.credits') }} <span class="text-danger">*</span></label>
          <input type="number" id="credits" class="form-control" v-model="formState.credits"
            :class="{ 'is-invalid': validationErrors.credits }" min="2" step="1" required />
          <div class="invalid-feedback">{{ validationErrors.credits }}</div>
        </div>
      </div>
    </div>

    <div class="row mb-3">
      <div class="col-md-6">
        <div class="form-group">
          <label for="department" class="form-label">{{ $t('course.department') }} <span
              class="text-danger">*</span></label>
          <select id="department" class="form-select" v-model="formState.department"
            :class="{ 'is-invalid': validationErrors.department }" required>
            <option value="" disabled>{{ $t('common.choose') }} {{ $t('course.department') }}</option>
            <option v-for="dept in departments" :key="dept._id" :value="dept._id">
              {{ dept.name }}
            </option>
          </select>
          <div class="invalid-feedback">{{ validationErrors.department }}</div>
        </div>
      </div>

      <div class="col-md-6" v-if="!isEditing">
        <div class="form-group">
          <label for="prerequisites" class="form-label">{{ $t('course.prerequisite') }}</label>
          <select id="prerequisites" class="form-select" v-model="formState.prerequisites" multiple
            :class="{ 'is-invalid': validationErrors.prerequisites }">
            <option v-for="course in availableCourses" :key="course._id" :value="course._id">
              {{ course.courseCode }} - {{ course.name }}
            </option>
          </select>
          <div class="form-text">{{ $t('course.multi_select_hint') }}</div>
          <div class="invalid-feedback">{{ validationErrors.prerequisites }}</div>
        </div>
      </div>
    </div>

    <div class="row mb-3">
      <div class="col-12">
        <div class="form-group">
          <label for="description" class="form-label">{{ $t('course.description') }} <span
              class="text-danger">*</span></label>
          <textarea id="description" class="form-control" v-model="formState.description"
            :class="{ 'is-invalid': validationErrors.description }" rows="4" :placeholder="$t('course.enter_description')"
            required></textarea>
          <div class="invalid-feedback">{{ validationErrors.description }}</div>
        </div>
      </div>
    </div>

    <!-- Nút submit và cancel -->
    <div class="d-flex justify-content-end gap-2 mt-4">
      <button type="button" class="btn btn-secondary" @click="cancelForm">{{ $t('common.cancel') }}</button>
      <button type="submit" class="btn btn-primary" :disabled="loading">
        <span v-if="loading" class="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
        {{ isEditing ? $t('common.update') : $t('common.add') }} {{ $t('course.title') }}
      </button>
    </div>
  </form>
</template>

<script>
import { ref, reactive, computed, watch, onMounted } from 'vue'
import { useStore } from 'vuex'
import { useI18n } from 'vue-i18n'

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
    const { t } = useI18n()
    const store = useStore()

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

    const departments = computed(() => store.state.department.departments)
    const courses = computed(() => store.state.course.courses || [])

    const availableCourses = computed(() => {
      return courses.value.filter(course => {
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

    const validateForm = () => {
      const errors = {}

      if (!props.isEditing && !formState.courseCode.trim()) {
        errors.courseCode = t('course.validation.required_course_code')
      } else if (
        !props.isEditing &&
        !/^[A-Za-z0-9]{3,10}$/.test(formState.courseCode)
      ) {
        errors.courseCode = t('course.validation.invalid_course_code')
      }

      if (!formState.name.trim()) {
        errors.name = t('course.validation.required_name')
      } else if (formState.name.length < 3) {
        errors.name = t('course.validation.short_name')
      }

      if (!formState.credits) {
        errors.credits = t('course.validation.required_credits')
      } else if (formState.credits < 2) {
        errors.credits = t('course.validation.min_credits')
      } else if (!Number.isInteger(Number(formState.credits))) {
        errors.credits = t('course.validation.integer_credits')
      }

      if (!formState.department) {
        errors.department = t('course.validation.required_department')
      }

      if (!formState.description.trim()) {
        errors.description = t('course.validation.required_description')
      } else if (formState.description.length < 10) {
        errors.description = t('course.validation.short_description')
      }

      Object.assign(validationErrors, errors)
      return Object.keys(errors).length === 0
    }

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

    const cancelForm = () => {
      emit('cancel')
    }

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