<template>
  <div class="container mt-4">
    <h3 class="pb-3">{{ $t('enrollment.register.title') }}</h3>

    <!-- Search Student -->
    <div class="mb-3">
      <label class="form-label">{{ $t('student.student_id') }}</label>
      <input type="text" class="form-control" v-model="studentQuery" :placeholder="$t('student.enter_student_id')" />
    </div>

    <!-- Course Table -->
    <CourseTable @select-course="selectCourse" />

    <!-- Class Table of Selected Course -->
    <ClassTable v-if="selectedCourseId" :courseId="selectedCourseId" @register="register" />

    <SuccessModal :showModal="showSuccessModal" :title="$t('enrollment.register.success')" :message="$t('enrollment.register.confirm_success', {
      registeredClassCode,
      studentQuery
    })" @confirm="goBack" @update:showModal="showSuccessModal = $event" />

    <!-- Error Modal -->
    <ErrorModal 
      :showModal="showErrorModal" 
      :title="$t('enrollment.register.failed')" 
      :message="errorMessage"
      :isTranslated="isErrorTranslated"
      @update:showModal="showErrorModal = $event" 
    />

  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useErrorHandler } from '@/composables/useErrorHandler'
import CourseTable from '@/components/course/CourseTable.vue'
import ClassTable from '@/components/class/ClassTable.vue'
import SuccessModal from '@/components/layout/SuccessModal.vue'
import ErrorModal from '@/components/layout/ErrorModal.vue'

export default {
  name: 'RegisterCourse',
  components: {
    CourseTable,
    ClassTable,
    SuccessModal,
    ErrorModal
  },
  setup() {
    const { t } = useI18n()
    const router = useRouter()
    const store = useStore()
    const { errorMessage, isErrorTranslated, showErrorModal, handleError } = useErrorHandler()

    const studentQuery = ref('')
    const selectedCourseId = ref(null)
    const registeredClassCode = ref('')
    const classes = ref([])

    // Modal control flags
    const showSuccessModal = ref(false)

    const selectCourse = (course) => {
      selectedCourseId.value = course._id
    }

    const goBack = () => {
      router.back()
    }

    const register = async (classCode) => {
      if (!studentQuery.value.trim()) {
        handleError({ message: t('student.validation.required_student_id') }, 'student.validation.required_student_id')
        return
      }

      try {
        await store.dispatch('enrollment/postEnrollment', {
          studentId: studentQuery.value,
          classCode: classCode
        })

        const error = store.state.enrollment.error
        if (error) {
          handleError({ 
            response: { data: { message: error } }
          }, 'enrollment.register.failed')
        } else {
          registeredClassCode.value = classCode
          showSuccessModal.value = true
        }
      } catch (err) {
        console.error('Error during registration:', err)
        handleError(err, 'enrollment.register.failed')
      }
    }

    onMounted(async () => {
      try {
        await store.dispatch('course/fetchCourses')
      } catch (error) {
        console.error('Error loading courses:', error)
        handleError(error, 'course.load_error')
      }
    })

    return {
      studentQuery,
      selectedCourseId,
      classes,
      registeredClassCode,
      errorMessage,
      isErrorTranslated,
      showErrorModal,
      register,
      selectCourse,
      goBack,
      showSuccessModal
    }
  }
}
</script>

<style scoped>
.container {
  max-width: 1000px;
}
</style>