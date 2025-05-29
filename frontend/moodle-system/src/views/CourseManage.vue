<template>
  <div class="container-fluid px-5 mt-5">
    <h2 class="mb-4 text-center"> {{ $t('course.management') }}</h2>

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
        <h4>{{ isEditing ? $t('course.edit') : $t('course.add') }}</h4>
      </div>
      <div class="card-body">
        <CourseForm :course-data="selectedCourse" :is-editing="isEditing" @submit="saveCourse" @cancel="cancelForm" />
      </div>
    </div>

    <CourseList v-if="!showForm" @add-course="showAddForm" @edit-course="showEditForm" @delete-course="deleteCourse"
      @toggle-active-status="toggleCourseActiveStatus" />
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { useStore } from 'vuex'
import CourseForm from '@/components/course/CourseForm.vue'
import CourseList from '@/components/course/CourseList.vue'
import { useI18n } from 'vue-i18n'

export default {
  name: 'CourseManage',
  components: {
    CourseForm,
    CourseList
  },
  setup() {
    const { t } = useI18n()
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
          console.log(`Updating course with code: ${selectedCourse.value.courseCode}`);

          const updateData = {};

          if (courseData.name !== selectedCourse.value.name) {
            updateData.name = courseData.name;
          }

          if (courseData.department !== (typeof selectedCourse.value.department === 'object'
            ? selectedCourse.value.department._id
            : selectedCourse.value.department)) {
            updateData.department = courseData.department;
          }

          if (courseData.description !== selectedCourse.value.description) {
            updateData.description = courseData.description;
          }

          if (Number(courseData.credits) !== selectedCourse.value.credits) {
            updateData.credits = Number(courseData.credits);
          }

          console.log('Only sending changed fields:', updateData);

          await store.dispatch('course/updateCourse', {
            courseCode: selectedCourse.value.courseCode,
            data: updateData
          });

          success.value = t('course.update_success', { name: courseData.name });
        } else {
          await store.dispatch('course/createCourse', courseData);
          success.value = t('course.add_success', { name: courseData.name });
        }

        await store.dispatch('course/fetchCourses');

        showForm.value = false;
        selectedCourse.value = {};

        setTimeout(() => {
          success.value = '';
        }, 5000);
      } catch (err) {
        console.error('Error saving course:', err);

        let errorMessage = '';
        if (err.response && err.response.data) {
          if (err.response.data.message) {
            errorMessage = err.response.data.message;
          } else if (err.response.data.errors) {
            // Join multiple validation errors
            errorMessage = Object.values(err.response.data.errors).join(', ');
          }
        }

        error.value = errorMessage || err.message || t('course.save_error.fallback');
      }
    }

    // Delete a course
    const deleteCourse = async (course) => {
      try {
        console.log('Attempting to delete course:', course);

        // Gọi action deleteCourse, backend sẽ xử lý xóa hoàn toàn hoặc chỉ deactivate
        const result = await store.dispatch('course/deleteCourse', course.courseCode);

        if (result.success) {
          success.value = result.message || t('course.delete_success');

          // Refresh courses data
          await store.dispatch('course/fetchCourses');
        }

        // Clear success message after 5 seconds
        setTimeout(() => {
          success.value = '';
        }, 5000);
      } catch (err) {
        console.error('Error deleting/deactivating course:', err);

        let errorMessage = '';
        if (err.response && err.response.data && err.response.data.message) {
          errorMessage = err.response.data.message;
        }

        error.value = errorMessage || err.message || t('course.delete_error.fallback');
      }
    }

    // Toggle course active status
    const toggleCourseActiveStatus = async (course) => {
      try {
        console.log('Toggling course active status:', course);

        const newStatus = !course.isActive;

        // Lưu ý: Nếu newStatus = true (mở lại khóa học), có thể không được hỗ trợ
        // vì backend không có API để reactivate khóa học
        if (newStatus === true) {
          error.value = t('course.reopen_not_supported');
          return;
        }

        const result = await store.dispatch('course/toggleCourseActiveStatus', {
          courseCode: course.courseCode,
          isActive: newStatus
        });

        if (result.success) {
          success.value = result.message ||
            t(newStatus ? 'course.reopen_success' : 'course.close_success');
        }

        // Clear success message after 5 seconds
        setTimeout(() => {
          success.value = '';
        }, 5000);
      } catch (err) {
        console.error('Error toggling course status:', err);

        let errorMessage = '';
        if (err.response && err.response.data && err.response.data.message) {
          errorMessage = err.response.data.message;
        }

        const action = course.isActive ? t('common.close') : t('common.reopen')
        error.value = errorMessage || err.message || t('course.toggle_error', { action })
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
        if (!Array.isArray(store.state.course.courses) || store.state.course.courses.length === 0) {
          console.log('No courses found, retrying...');
          setTimeout(async () => {
            await store.dispatch('course/fetchCourses');
            console.log('Retry result - courses in store:', store.state.course.courses);
          }, 1000);
        }
      } catch (err) {
        console.error('Error loading initial data:', err);
        const msg = err.message || t('error.load_failed')
        error.value = `${t('error.prefix')}: ${msg}`
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

<style scoped></style>