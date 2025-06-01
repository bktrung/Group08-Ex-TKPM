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

    <!-- Modal Success -->
    <div class="modal fade" id="successModal" tabindex="-1" aria-labelledby="successModalLabel" aria-hidden="true">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header bg-success text-white">
            <h5 class="modal-title" id="successModalLabel">{{ $t('enrollment.register.success') }}</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" :aria-label="$t('common.close')"></button>
          </div>
          <div class="modal-body">
            ✅ {{ $t('enrollment.register.confirm_success', { registeredClassCode, studentQuery }) }}
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-success" data-bs-dismiss="modal" @click="goBack">OK</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal Failed -->
    <div class="modal fade" id="errorModal" tabindex="-1" aria-labelledby="errorModalLabel" aria-hidden="true">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header bg-danger text-white">
            <h5 class="modal-title" id="errorModalLabel">{{ $t('enrollment.register.failed') }}</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" :aria-label="$t('common.close')"></button>
          </div>
          <div class="modal-body">
            ❌ {{ registerError }}
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-danger" data-bs-dismiss="modal">OK</button>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'
import { Modal } from 'bootstrap'
import CourseTable from '@/components/course/CourseTable.vue'
import ClassTable from '@/components/class/ClassTable.vue'
import { useI18n } from 'vue-i18n'

export default {
  name: 'RegisterCourse',
  components: {
    CourseTable,
    ClassTable
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

    const selectCourse = (course) => {
      selectedCourseId.value = course._id
    }

    const showModal = (id) => {
      const modal = new Modal(document.getElementById(id))
      modal.show()
    }

    const goBack = () => {
      router.back()  
    }

    const register = async (classCode) => {
      if (!studentQuery.value.trim()) {
        registerError.value = t('student.validation.required_student_id')
        showModal('errorModal')
        return
      }

      await store.dispatch('enrollment/postEnrollment', {
        studentId: studentQuery.value,
        classCode: classCode
      })

      const error = store.state.enrollment.error

      if (error) {
        registerError.value = error
        showModal('errorModal')
      } else {
        registeredClassCode.value = classCode
        showModal('successModal')
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
      goBack
    }
  }
}
</script>

<style scoped>
.container {
  max-width: 1000px;
}
</style>
