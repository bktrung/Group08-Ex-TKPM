<template>
    <div class="container mt-5 mb-5">
      <h2 class="mb-4 text-center">Mở lớp cho khóa học</h2>
  
      <div v-if="loading" class="text-center py-5">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
      </div>
  
      <div v-else-if="error" class="alert alert-danger">
        {{ error }}
      </div>
  
      <div v-else-if="!courseExists" class="alert alert-warning">
        Không tìm thấy thông tin khóa học với mã <strong>{{ courseCode }}</strong>.
      </div>
  
      <div v-else-if="!courseActive" class="alert alert-warning">
        Khóa học với mã <strong>{{ courseCode }}</strong> hiện đã ngừng hoạt động và không thể mở lớp mới.
      </div>
  
      <div v-else class="card bg-light">
        <div class="card-body">
          <ClassForm 
            :course-code="courseCode"
            @submit="handleSubmit" 
          />
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
              Mở lớp học mới thành công!
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-primary" @click="redirectToCourse">OK</button>
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
  import { useRouter, useRoute } from 'vue-router'
  import { Modal } from 'bootstrap'
  import ClassForm from '@/components/course/ClassForm.vue'
  
  export default {
    name: 'CourseClassAdd',
    components: {
      ClassForm
    },
    setup() {
      const store = useStore()
      const router = useRouter()
      const route = useRoute()
      const courseCode = route.params.courseCode
      
      const courseExists = ref(false)
      const courseActive = ref(false)
      const errorMessage = ref('Có lỗi xảy ra. Vui lòng thử lại!')
      const loading = computed(() => store.state.course.loading)
      const error = computed(() => store.state.course.error)
      let successModal = null
      let errorModal = null
      
      const checkCourseExists = async () => {
        try {
          const course = await store.dispatch('course/fetchCourse', courseCode)
          courseExists.value = !!course
          courseActive.value = course && course.isActive
        } catch (err) {
          console.error('Error checking course:', err)
          courseExists.value = false
        }
      }
      
      const handleSubmit = async (classData) => {
        try {
          await store.dispatch('course/createClass', classData)
          
          // Show success modal
          if (successModal) {
            successModal.show()
          }
        } catch (error) {
          console.error('Error creating class:', error)
          // Extract meaningful error message for the user
          if (error.response && error.response.data && error.response.data.message) {
            errorMessage.value = error.response.data.message
          } else {
            errorMessage.value = error.message || 'Có lỗi xảy ra khi mở lớp học. Vui lòng thử lại!'
          }
          
          // Show error modal
          if (errorModal) {
            errorModal.show()
          }
        }
      }
      
      const redirectToCourse = () => {
        if (successModal) {
          successModal.hide()
        }
        
        setTimeout(() => {
          router.push('/courses')
        }, 300)
      }
      
      onMounted(async () => {
        await checkCourseExists()
        
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
        courseCode,
        courseExists,
        courseActive,
        loading,
        error,
        errorMessage,
        handleSubmit,
        redirectToCourse
      }
    }
  }
  </script>
  
  <style scoped>
  .container {
    max-width: 900px;
  }
  </style>