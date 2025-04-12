<template>
    <div class="container mt-5 mb-5">
      <h2 class="mb-4 text-center">Thêm Khóa học</h2>
  
      <div v-if="loading" class="text-center py-5">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
      </div>
  
      <div v-else-if="error" class="alert alert-danger">
        {{ error }}
      </div>
  
      <div v-else class="card bg-light">
        <div class="card-body">
          <CourseForm @submit="handleSubmit" />
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
              <p>Thêm khóa học thành công!</p>
              <p>Bạn có thể xóa khóa học này trong vòng 30 phút kể từ khi tạo.</p>
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
  import { ref, computed, onMounted } from 'vue'
  import { useStore } from 'vuex'
  import { useRouter } from 'vue-router'
  import { Modal } from 'bootstrap'
  import CourseForm from '@/components/course/CourseForm.vue'
  
  export default {
    name: 'CourseAdd',
    components: {
      CourseForm
    },
    setup() {
      const store = useStore()
      const router = useRouter()
      const errorMessage = ref('Có lỗi xảy ra. Vui lòng thử lại!')
      const loading = computed(() => store.state.course.loading)
      const error = computed(() => store.state.course.error)
      let successModal = null
      let errorModal = null
      
      const handleSubmit = async (courseData) => {
        try {
          await store.dispatch('course/createCourse', courseData)
          
          // Show success modal
          if (successModal) {
            successModal.show()
          }
        } catch (error) {
          console.error('Error adding course:', error)
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
          router.push('/courses')
        }, 300)
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
        loading,
        error,
        errorMessage,
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