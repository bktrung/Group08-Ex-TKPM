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
    })" @confirm="goBack" @update:showModal="showSuccess = $event" />

    <ErrorModal :showModal="showErrorModal" :title="$t('enrollment.register.failed')" :message="registerError"
      @update:showModal="showErrorModal = $event" />

  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'
import CourseTable from '@/components/course/CourseTable.vue'
import ClassTable from '@/components/class/ClassTable.vue'
import { useI18n } from 'vue-i18n'
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

    const studentQuery = ref('')
    const selectedCourseId = ref(null)
    const registeredClassCode = ref('')
    const registerError = ref('')
    const classes = ref([])

    // Modal control flags
    const showSuccessModal = ref(false)
    const showErrorModal = ref(false)

    const selectCourse = (course) => {
      selectedCourseId.value = course._id
    }

    const goBack = () => {
      router.back()
    }

    const register = async (classCode) => {
      if (!studentQuery.value.trim()) {
        registerError.value = t('student.validation.required_student_id')
        showErrorModal.value = true
        return
      }

      await store.dispatch('enrollment/postEnrollment', {
        studentId: studentQuery.value,
        classCode: classCode
      })

      const error = store.state.enrollment.error

      if (error) {
        registerError.value = error
        showErrorModal.value = true
      } else {
        registeredClassCode.value = classCode
        showSuccessModal.value = true
      }
    }

    onMounted(async () => {
      await store.dispatch('course/fetchCourses')
    })

    return {
      studentQuery,
      selectedCourseId,
      classes,
      register,
      selectCourse,
      registeredClassCode,
      registerError,
      goBack,
      showSuccessModal,
      showErrorModal
    }
  }
}
</script>

<style scoped>
.container {
  max-width: 1000px;
}
</style>
