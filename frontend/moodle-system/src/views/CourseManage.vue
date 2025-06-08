<template>
  <div class="container-fluid px-5 mt-5">
    <h2 class="mb-4 text-center"> {{ $t('course.management') }}</h2>

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

    <!-- Error Modal -->
    <ErrorModal 
      :showModal="showErrorModal" 
      :title="$t('common.error')" 
      :message="errorMessage"
      :isTranslated="isErrorTranslated"
      @update:showModal="showErrorModal = $event" 
    />
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { useStore } from 'vuex'
import CourseForm from '@/components/course/CourseForm.vue'
import CourseList from '@/components/course/CourseList.vue'
import { useI18n } from 'vue-i18n'
import { useErrorHandler } from '@/composables/useErrorHandler'
import ErrorModal from '@/components/layout/ErrorModal.vue'

export default {
  name: 'CourseManage',
  components: {
    CourseForm,
    CourseList,
    ErrorModal
  },
  setup() {
    const { t } = useI18n()
    const store = useStore()
    const showForm = ref(false)
    const isEditing = ref(false)
    const selectedCourse = ref({})
    const success = ref('')

    const { errorMessage, isErrorTranslated, showErrorModal, handleError } = useErrorHandler()

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
        if (isEditing.value) {
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
      } catch (error) {
        handleError(error, 'course.save_error')
      }
    }

    const deleteCourse = async (course) => {
      try {
        const result = await store.dispatch('course/deleteCourse', course.courseCode);

        if (result.success) {
          success.value = result.message || t('course.delete_success');
          await store.dispatch('course/fetchCourses');
        }

        setTimeout(() => {
          success.value = '';
        }, 5000);
      } catch (error) {
        handleError(error, 'course.delete_error')
      }
    }

    const toggleCourseActiveStatus = async (course) => {
      try {
        const newStatus = !course.isActive;

        if (newStatus === true) {
          handleError({ message: t('course.reopen_not_supported') }, 'course.reopen_not_supported');
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
      } catch (error) {
        handleError(error, 'course.toggle_error')
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
      } catch (error) {
        handleError(error, 'course.load_error')
      }
    })

    return {
      showForm,
      isEditing,
      selectedCourse,
      success,
      errorMessage,
      isErrorTranslated,
      showErrorModal,
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