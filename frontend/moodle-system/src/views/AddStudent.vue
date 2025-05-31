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
    <div class="modal fade" id="successModal" tabindex="-1" aria-hidden="true" ref="modalRef">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header bg-success text-white">
            <h5 class="modal-title">{{ $t('common.success') }}!</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" :aria-label="$t('common.close')"></button>
          </div>
          <div class="modal-body">
            {{ $t('student.add_success') }}!
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-primary" @click="redirectToList">OK</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Error Modal -->
    <div class="modal fade" id="errorModal" tabindex="-1" aria-hidden="true" ref="errorModalRef">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header bg-danger text-white">
            <h5 class="modal-title">{{ $t('common.error') }}!</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" :aria-label="$t('common.close')"></button>
          </div>
          <div class="modal-body">
            {{ errorMessage }}
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">{{ $t('common.close') }}</button>
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
import StudentForm from '@/components/student/StudentForm.vue'
import { useI18n } from 'vue-i18n'

export default {
  name: 'AddStudent',
  components: {
    StudentForm
  },
  setup() {
    const { t } = useI18n()
    const store = useStore()
    const router = useRouter()
    const modalRef = ref(null)
    const errorModalRef = ref(null)
    const errorMessage = ref('Có lỗi xảy ra. Vui lòng thử lại!')
    const loading = ref(true)
    const error = ref(null)
    let successModal = null
    let errorModal = null
    
    // Load initial reference data
    const loadReferenceData = async () => {
      loading.value = true
      error.value = null
      
      try {
        // Load all reference data needed for the form
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
        
        // Create a clean copy of the data to send to the API
        const cleanData = {}
        
        // Process all fields
        for (const [key, value] of Object.entries(studentData)) {
          // Handle reference fields
          if (key === 'department' || key === 'program' || key === 'status') {
            cleanData[key] = typeof value === 'object' ? value._id : value
          } 
          // Handle date fields
          else if (key === 'dateOfBirth') {
            cleanData[key] = new Date(value).toISOString()
          }
          // Handle identity document
          else if (key === 'identityDocument') {
            const docCopy = {...value}
            
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
          // Handle address fields - copy these directly
          else if (key === 'mailingAddress' || key === 'permanentAddress' || key === 'temporaryAddress') {
            // Only include non-empty addresses
            if (value && value.houseNumberStreet && value.houseNumberStreet.trim() !== '') {
              cleanData[key] = {...value}
            }
          }
          // Handle all other fields
          else {
            cleanData[key] = value
          }
        }
        
        console.log('Prepared data for API:', JSON.stringify(cleanData, null, 2))
        
        // Send the data to the API
        await store.dispatch('student/createStudent', cleanData)
        
        // Show success modal
        if (successModal) {
          successModal.show()
        }
      } catch (error) {
        console.error('Error adding student:', error)
        errorMessage.value = error.response?.data?.message || error.message || 'Có lỗi xảy ra. Vui lòng thử lại!'
        
        // Show error modal
        if (errorModal) {
          errorModal.show()
        }
      }
    }
    
    const redirectToList = () => {
      if (successModal) {
        successModal.hide()
      }
      
      setTimeout(() => {
        router.push('/')
      }, 300)
    }
    
    onMounted(async () => {
      await loadReferenceData()
      
      // Initialize Bootstrap modals
      const successModalElement = document.getElementById('successModal')
      if (successModalElement) {
        successModal = new Modal(successModalElement)
      }
      
      const errorModalElement = document.getElementById('errorModal')
      if (errorModalElement) {
        errorModal = new Modal(errorModalElement)
      }
    })
    
    return {
      loading,
      error,
      errorMessage,
      modalRef,
      errorModalRef,
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