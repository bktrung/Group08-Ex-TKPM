<template>
  <div class="container mt-4">
    <h3>Đăng ký môn học</h3>

    <!-- Tìm kiếm sinh viên -->
    <div class="mb-3">
      <label class="form-label">MSSV</label>
      <input type="text" class="form-control" v-model="studentQuery" placeholder="Nhập MSSV..." />
    </div>

    <!-- Bảng danh sách khóa học -->
    <CourseTable @select-course="selectCourse" />

    <!-- Bảng danh sách lớp học của môn đã chọn -->
    <ClassTable v-if="selectedCourseId" :courseId="selectedCourseId" @register="register" />

    <!-- Modal Thành Công -->
    <div class="modal fade" id="successModal" tabindex="-1" aria-labelledby="successModalLabel" aria-hidden="true">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header bg-success text-white">
            <h5 class="modal-title" id="successModalLabel">Đăng ký thành công</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Đóng"></button>
          </div>
          <div class="modal-body">
            ✅ Đã đăng ký lớp {{ registeredClassCode }} thành công cho sinh viên {{ studentQuery }}
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-success" data-bs-dismiss="modal" @click="goBack">OK</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal Thất Bại -->
    <div class="modal fade" id="errorModal" tabindex="-1" aria-labelledby="errorModalLabel" aria-hidden="true">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header bg-danger text-white">
            <h5 class="modal-title" id="errorModalLabel">Đăng ký thất bại</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Đóng"></button>
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


export default {
  name: 'RegisterCourse',
  components: {
    CourseTable,
    ClassTable
  },
  setup() {
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
      router.back()  // Hoặc router.go(-1)
    }

    const register = async (classCode) => {
      if (!studentQuery.value.trim()) {
        registerError.value = 'Vui lòng nhập MSSV trước khi đăng ký.'
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
