<template>
  <div class="container-fluid px-5 mt-5">
    <h2 class="mb-4 text-center">Quản lý Khóa Học</h2>

    <div v-if="error" class="alert alert-danger alert-dismissible fade show" role="alert">
      {{ error }}
      <button type="button" class="btn-close" @click="error = ''" aria-label="Close"></button>
    </div>

    <div v-if="success" class="alert alert-success alert-dismissible fade show" role="alert">
      {{ success }}
      <button type="button" class="btn-close" @click="success = ''" aria-label="Close"></button>
    </div>

    <div v-if="showForm" class="card bg-light mb-4">
      <div class="card-header">
        <h4>{{ isEditing ? 'Chỉnh sửa Khóa Học' : 'Thêm Khóa Học Mới' }}</h4>
      </div>
      <div class="card-body">
        <CourseForm 
          :course-data="selectedCourse" 
          :is-editing="isEditing"
          @submit="saveCourse"
          @cancel="cancelForm"
        />
      </div>
    </div>

    <CourseList 
      v-if="!showForm"
      @add-course="showAddForm"
      @edit-course="showEditForm"
      @delete-course="deleteCourse"
      @toggle-active-status="toggleCourseActiveStatus"
    />
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { useStore } from 'vuex'
import CourseForm from '@/components/course/CourseForm.vue'
import CourseList from '@/components/course/CourseList.vue'

export default {
  name: 'CourseManage',
  components: {
    CourseForm,
    CourseList
  },
  setup() {
    const store = useStore()
    const showForm = ref(false)
    const isEditing = ref(false)
    const selectedCourse = ref({})
    const error = ref('')
    const success = ref('')
    
    // Show the add course form
    const showAddForm = () => {
      selectedCourse.value = {}
      isEditing.value = false
      showForm.value = true
    }
    
    // Show the edit course form
    const showEditForm = (course) => {
      selectedCourse.value = { ...course }
      isEditing.value = true
      showForm.value = true
    }
    
    // Cancel the form
    const cancelForm = () => {
      showForm.value = false
      selectedCourse.value = {}
    }
    
    // Save a course (create or update)
    const saveCourse = async (courseData) => {
      try {
        console.log('CourseManage - Saving course:', courseData);
        
        if (isEditing.value) {
          // Update existing course
          await store.dispatch('course/updateCourse', {
            courseCode: selectedCourse.value.courseCode,
            data: courseData
          })
          success.value = `Cập nhật khóa học ${courseData.name} thành công!`
        } else {
          // Create new course
          await store.dispatch('course/createCourse', courseData)
          success.value = `Thêm khóa học ${courseData.name} thành công!`
        }
        
        // Refresh courses data
        await store.dispatch('course/fetchCourses')
        
        // Reset form
        showForm.value = false
        selectedCourse.value = {}
        
        // Clear success message after 5 seconds
        setTimeout(() => {
          success.value = ''
        }, 5000)
      } catch (err) {
        console.error('Error saving course:', err);
        
        // Extract detailed error message from response if available
        let errorMessage = '';
        if (err.response && err.response.data) {
          if (err.response.data.message) {
            errorMessage = err.response.data.message;
          } else if (err.response.data.errors) {
            // Join multiple validation errors
            errorMessage = Object.values(err.response.data.errors).join(', ');
          }
        }
        
        error.value = errorMessage || err.message || 'Đã xảy ra lỗi khi lưu khóa học';
      }
    }
    
    // Delete a course
    const deleteCourse = async (course) => {
      try {
        await store.dispatch('course/deleteCourse', course.courseCode)
        success.value = `Xóa khóa học ${course.name} thành công!`
        
        // Clear success message after 5 seconds
        setTimeout(() => {
          success.value = ''
        }, 5000)
      } catch (err) {
        error.value = `Lỗi: ${err.message || 'Đã xảy ra lỗi khi xóa khóa học'}`
      }
    }
    
    // Toggle course active status
    const toggleCourseActiveStatus = async (course) => {
      try {
        await store.dispatch('course/toggleCourseActiveStatus', {
          courseCode: course.courseCode,
          isActive: !course.isActive
        })
        
        const action = course.isActive ? 'đóng' : 'mở lại'
        success.value = `${action} khóa học ${course.name} thành công!`
        
        // Clear success message after 5 seconds
        setTimeout(() => {
          success.value = ''
        }, 5000)
      } catch (err) {
        error.value = `Lỗi: ${err.message || `Đã xảy ra lỗi khi ${course.isActive ? 'đóng' : 'mở lại'} khóa học`}`
      }
    }
    
    // Load initial data
    onMounted(async () => {
      try {
        // Load departments first
        await store.dispatch('department/fetchDepartments');
        
        // Then load courses with logging to debug issues
        console.log('Fetching courses...');
        const result = await store.dispatch('course/fetchCourses');
        console.log('Courses fetched:', result);
        console.log('Current courses in store:', store.state.course.courses);
        
        // If we still don't have courses but know they should exist, try again
        if (store.state.course.courses.length === 0) {
          console.log('No courses found, retrying...');
          setTimeout(async () => {
            await store.dispatch('course/fetchCourses');
            console.log('Retry result - courses in store:', store.state.course.courses);
          }, 1000);
        }
      } catch (err) {
        console.error('Error loading initial data:', err);
        error.value = `Lỗi: ${err.message || 'Đã xảy ra lỗi khi tải dữ liệu'}`;
      }
    })
    
    return {
      showForm,
      isEditing,
      selectedCourse,
      error,
      success,
      showAddForm,
      showEditForm,
      cancelForm,
      saveCourse,
      deleteCourse,
      toggleCourseActiveStatus
    }
  }
}
</script>

<style scoped>
/* Any component-specific styles can go here */
</style>