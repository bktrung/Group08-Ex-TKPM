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

    const showAddForm = () => {
      selectedCourse.value = {}
      isEditing.value = false
      showForm.value = true
    }

    const showEditForm = (course) => {
      selectedCourse.value = { ...course }
      isEditing.value = true
      showForm.value = true
    }

    const cancelForm = () => {
      showForm.value = false
      selectedCourse.value = {}
    }

    const saveCourse = async (courseData) => {
      try {
        console.log('CourseManage - Saving course:', courseData);

        if (isEditing.value) {
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
            errorMessage = Object.values(err.response.data.errors).join(', ');
          }
        }

        error.value = errorMessage || err.message || t('course.save_error.fallback');
      }
    }

    const deleteCourse = async (course) => {
      try {
        console.log('Attempting to delete course:', course);

        const result = await store.dispatch('course/deleteCourse', course.courseCode);

        if (result.success) {
          success.value = result.message || t('course.delete_success');

          await store.dispatch('course/fetchCourses');
        }

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

    const toggleCourseActiveStatus = async (course) => {
      try {
        console.log('Toggling course active status:', course);

        const newStatus = !course.isActive;

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

    onMounted(async () => {
      try {
        await store.dispatch('department/fetchDepartments');

        console.log('Fetching courses...');
        const result = await store.dispatch('course/fetchCourses');
        console.log('Courses fetched:', result);
        console.log('Current courses in store:', store.state.course.courses);

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