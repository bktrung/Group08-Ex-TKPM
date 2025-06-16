<template>
  <div class="container mt-5 mb-5">
    <h2 class="mb-4 text-center">{{ $t('student.add_student') }}</h2>

    <div v-if="loading" class="text-center py-5">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">{{ $t('common.loading') }}...</span>
      </div>
    </div>

    <div v-else-if="error" class="alert alert-danger">
      {{ error }}
    </div>

    <div v-else class="card bg-light">
      <div class="card-body">
        <StudentForm @submit="handleSubmit" />
      </div>
    </div>

    <!-- Success Modal -->
    <SuccessModal :showModal="showSuccessModal" :title="$t('common.success')"
      :message="$t('student.add_success')" @confirm="redirectToList"
      @update:showModal="showSuccessModal = $event" />

    <!-- Error Modal -->
    <ErrorModal 
      :showModal="showErrorModal" 
      :title="$t('common.error')" 
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
import StudentForm from '@/components/student/StudentForm.vue'
import ErrorModal from '@/components/layout/ErrorModal.vue'
import SuccessModal from '@/components/layout/SuccessModal.vue'
import { useI18n } from 'vue-i18n'
import { useErrorHandler } from '@/composables/useErrorHandler'

export default {
  name: 'AddStudent',
  components: {
    StudentForm,
    ErrorModal,
    SuccessModal
  },
  setup() {
    const { t } = useI18n()
    const store = useStore()
    const router = useRouter()
    const loading = ref(true)
    const error = ref(null)
    const showSuccessModal = ref(false)

    // Use error handler composable
    const { errorMessage, isErrorTranslated, showErrorModal, handleError } = useErrorHandler()

    const loadReferenceData = async () => {
      loading.value = true
      error.value = null

      try {
        await Promise.all([
          store.dispatch('department/fetchDepartments'),
          store.dispatch('program/fetchPrograms'),
          store.dispatch('status/fetchStatusTypes'),
          store.dispatch('status/fetchStatusTransitions'),
          store.dispatch('status/fetchCountries'),
          store.dispatch('status/fetchNationalities')
        ])
      } catch (err) {
        console.error('Error loading reference data:', err)
        error.value = err.message || t('common.loading_error')
      } finally {
        loading.value = false
      }
    }

    const handleSubmit = async (studentData) => {
      try {
        console.log('Adding new student:', JSON.stringify(studentData, null, 2))

        const cleanData = {}

        for (const [key, value] of Object.entries(studentData)) {
          if (key === 'department' || key === 'program' || key === 'status') {
            cleanData[key] = typeof value === 'object' ? value._id : value
          }
          else if (key === 'dateOfBirth') {
            cleanData[key] = new Date(value).toISOString()
          }
          else if (key === 'identityDocument') {
            const docCopy = { ...value }

            if (docCopy.issueDate) {
              docCopy.issueDate = new Date(docCopy.issueDate).toISOString()
            }

            if (docCopy.expiryDate) {
              docCopy.expiryDate = new Date(docCopy.expiryDate).toISOString()
            }

            if (docCopy.type === 'CCCD') {
              docCopy.hasChip = Boolean(docCopy.hasChip)
            }

            cleanData[key] = docCopy
          }
          else if (key === 'mailingAddress' || key === 'permanentAddress' || key === 'temporaryAddress') {
            if (value && value.houseNumberStreet && value.houseNumberStreet.trim() !== '') {
              cleanData[key] = { ...value }
            }
          }
          else {
            cleanData[key] = value
          }
        }

        console.log('Prepared data for API:', JSON.stringify(cleanData, null, 2))

        await store.dispatch('student/createStudent', cleanData)

        showSuccessModal.value = true
      } catch (error) {
        console.error('Error adding student:', error)
        handleError(error, 'student.add_error')
      }
    }

    const redirectToList = () => {
      showSuccessModal.value = false

      setTimeout(() => {
        router.push('/')
      }, 300)
    }

    onMounted(async () => {
      await loadReferenceData()
    })

    return {
      loading,
      error,
      errorMessage,
      isErrorTranslated,
      showErrorModal,
      showSuccessModal,
      handleSubmit,
      redirectToList
    }
  }
}
</script>

<style scoped>
.container {
  max-width: 900px;
}
</style>