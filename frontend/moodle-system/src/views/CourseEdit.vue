<template>
    <div class="container mt-5 mb-5">
      <h2 class="mb-4 text-center">Chỉnh sửa Khóa học</h2>
  
      <div v-if="loading" class="text-center py-5">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
      </div>
  
      <div v-else-if="error" class="alert alert-danger">
        {{ error }}
      </div>
  
      <div v-else-if="!courseData" class="alert alert-warning">
        Không tìm thấy thông tin khóa học. Vui lòng kiểm tra lại mã khóa học.
      </div>
  
      <div v-else class="card bg-light">
        <div class="card-body">
          <CourseForm 
            :course-data="courseData" 
            :is-editing="true"
            :has-enrolled-students="hasEnrolledStudents"
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
              Cập nhật khóa học thành công!
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
  import { useRouter, useRoute } from 'vue-router'
  import { Modal } from 'bootstrap'
  import CourseForm from '@/components/course/CourseForm.vue'
  
  export default {
    name: 'CourseEdit',
    components: {
      CourseForm
    },
    setup() {
      const store = useStore()
      const router = useRouter()
      const route = useRoute()
      const courseCode = route.params.courseCode
      
      const courseData = ref(null)
      const hasEnrolledStudents = ref(false)
      const errorMessage = ref('Có lỗi xảy ra. Vui lòng thử lại!')
      const loading = computed(() => store.state.course.loading)
      const error = computed(() => store.state.course.error)
      let successModal = null
      let errorModal = null
      
      const fetchCourseData = async () => {
        try {
          const course = await store.dispatch('course/fetchCourse', courseCode)
          courseData.value = course
          
          // Check if course has classes with enrolled students
          if (course.classes && course.classes.length > 0) {
            const hasStudents = course.classes.some(cls => 
              cls.enrolledStudents && cls.enrolledStudents > 0
            )
            hasEnrolledStudents.value = hasStudents
          }
        } catch (err) {
          console.error('Error fetching course:', err)
          error.value = err.message || 'Không thể tải thông tin khóa học'
        }
      }
      
      const handleSubmit = async (updatedCourseData) => {
        try {
          await store.dispatch('course/updateCourse', {
            courseCode: courseCode,
            courseData: updatedCourseData
          })
          
          // Show success modal
          if (successModal) {
            successModal.show()
          }
        } catch (error) {
          console.error('Error updating course:', error)
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
      
      onMounted(async () => {
        // First load any needed reference data
        await Promise.all([
          store.dispatch('department/fetchDepartments'),
          store.dispatch('course/fetchCourses', { limit: 100 })
        ])
        
        // Then load the course data
        await fetchCourseData()
        
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
        courseData,
        hasEnrolledStudents,
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