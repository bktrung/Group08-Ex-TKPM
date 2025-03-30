<template>
    <div class="container mt-5 mb-5">
      <h2 class="mb-4 text-center">Thêm Sinh Viên</h2>
  
      <div class="card bg-light">
        <div class="card-body">
          <StudentForm @submit="handleSubmit" />
        </div>
      </div>
  
      <!-- Success Modal -->
      <div class="modal fade" id="successModal" tabindex="-1" aria-hidden="true" ref="modalRef">
        <div class="modal-dialog">
          <div class="modal-content">
            <div class="modal-header bg-success text-white">
              <h5 class="modal-title">Thành công!</h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body">
              Thêm sinh viên thành công!
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
              <h5 class="modal-title">Lỗi!</h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body">
              {{ errorMessage }}
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Đóng</button>
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
  
  export default {
    name: 'AddStudent',
    components: {
      StudentForm
    },
    setup() {
      const store = useStore()
      const router = useRouter()
      const modalRef = ref(null)
      const errorModalRef = ref(null)
      const errorMessage = ref('Có lỗi xảy ra. Vui lòng thử lại!')
      let successModal = null
      let errorModal = null
      
      const handleSubmit = async (studentData) => {
        try {
          await store.dispatch('student/createStudent', studentData)
          
          // Show success modal
          if (successModal) {
            successModal.show()
          }
        } catch (error) {
          console.error('Error adding student:', error)
          errorMessage.value = error.message || 'Có lỗi xảy ra. Vui lòng thử lại!'
          
          // Show error modal
          if (errorModal) {
            errorModal.show()
          }
        }
      }
      
      const redirectToList = () => {
        router.push('/')
      }
      
      onMounted(() => {
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