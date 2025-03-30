<template>
  <div class="container mt-5 mb-5">
    <h2 class="mb-4 text-center">Sửa Thông Tin Sinh Viên</h2>

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
        <StudentForm 
          :student-data="studentData" 
          :is-editing="true" 
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
            Cập nhật sinh viên thành công!
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
import { useRouter, useRoute } from 'vue-router'
import { Modal } from 'bootstrap'
import StudentForm from '@/components/student/StudentForm.vue'

export default {
  name: 'EditStudent',
  components: {
    StudentForm
  },
  setup() {
    const store = useStore()
    const router = useRouter()
    const route = useRoute()
    const studentId = route.params.id
    
    const studentData = ref({})
    const loading = ref(true)
    const error = ref(null)
    const modalRef = ref(null)
    const errorModalRef = ref(null)
    const errorMessage = ref('Có lỗi xảy ra. Vui lòng thử lại!')
    let successModal = null
    let errorModal = null
    
    const fetchStudentData = async () => {
      loading.value = true
      error.value = null
      
      try {
        // Try to find the student in the current store state first
        let student = store.getters['student/getStudentById'](studentId)
        
        if (!student) {
          // If not found in store, fetch from API
          student = await store.dispatch('student/fetchStudent', studentId)
        }
        
        if (student) {
          studentData.value = student
        } else {
          error.value = 'Không tìm thấy sinh viên với mã số này'
        }
      } catch (err) {
        console.error('Error fetching student:', err)
        error.value = err.message || 'Không thể tải thông tin sinh viên'
      } finally {
        loading.value = false
      }
    }
    
    const handleSubmit = async (updatedStudentData) => {
      try {
        await store.dispatch('student/updateStudent', {
          id: studentId,
          student: updatedStudentData
        })
        
        // Show success modal
        if (successModal) {
          successModal.show()
        }
      } catch (err) {
        console.error('Error updating student:', err)
        errorMessage.value = err.message || 'Có lỗi xảy ra khi cập nhật sinh viên'
        
        // Show error modal
        if (errorModal) {
          errorModal.show()
        }
      }
    }
    
    const redirectToList = () => {
      router.push('/')
    }
    
    onMounted(async () => {
      await fetchStudentData()
      
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
      studentData,
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