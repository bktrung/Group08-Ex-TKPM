<template>
  <div class="container mt-4">
    <h3>Đăng ký môn học</h3>

    <!-- Tìm kiếm sinh viên -->
    <div class="mb-3">
      <label class="form-label">Tên hoặc MSSV</label>
      <input type="text" class="form-control" v-model="studentQuery" placeholder="Nhập tên hoặc MSSV..." />
    </div>

    <!-- Bảng danh sách khóa học -->
    <CourseTable @select-course="selectCourse" />

    <!-- Bảng danh sách lớp học của môn đã chọn -->
    <ClassTable v-if="selectedCourseId" :courseId="selectedCourseId" @register="register" />
  </div>
</template>

<script>
import { ref, onMounted, computed } from 'vue'
import { useStore } from 'vuex'
import CourseTable from '@/components/course/CourseTable.vue'
import ClassTable from '@/components/class/ClassTable.vue'
import { useRouter } from 'vue-router'

export default {
  props: {
  },
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

    const classes = ref([])

    const courses = computed(() => store.state.course.courses)

    const selectCourse = (course) => {
      selectedCourseId.value = course._id
    }

    const register = async (classCode) => {
      if (!studentQuery.value.trim()) {
        alert('Vui lòng nhập MSSV trước khi đăng ký.')
        return
      }
      
      console.log("Lóp " + classCode)
      await store.dispatch('enrollment/postEnrollment', {
        studentId: studentQuery.value,
        classCode: classCode
      })

      const error = store.state.enrollment.error

      if (error) {
        alert('Đăng ký thất bại. Lỗi: ' + error)
      } else {
        alert(`✅ Đã đăng ký lớp ${classCode} thành công cho sinh viên ${studentQuery.value}`)
        router.back()
      }
    }


    onMounted(async () => {
      await store.dispatch('course/fetchCourses')
    })

    return {
      studentQuery,
      selectedCourseId,
      courses,
      classes,
      selectCourse,
      register
    }
  }
}
</script>

<style scoped>
.container {
  max-width: 1000px;
}
</style>
