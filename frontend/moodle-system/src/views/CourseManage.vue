<template>
  <div class="container-fluid px-5 mt-5">
    <h2 class="mb-4 text-center"> {{ $t('course.management') }}</h2>

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

    <!-- Success Modal -->
    <SuccessModal :showModal="showSuccessModal" :title="$t('common.success') + '!'" :message="successMessage"
      @update:showModal="showSuccessModal = $event" />

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
import SuccessModal from '@/components/layout/SuccessModal.vue'

export default {
  name: 'CourseManage',
  components: {
    CourseForm,
    CourseList,
    ErrorModal,
    SuccessModal
  },
  setup() {
    const { t } = useI18n()
    const store = useStore()
    const showForm = ref(false)
    const isEditing = ref(false)
    const selectedCourse = ref({})
    const successMessage = ref('')
    const showSuccessModal = ref(false)

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

    // Function to build the update data object
    const buildUpdateData = (newData, oldData) => {
      const updateData = {};

      if (newData.name !== oldData.name) {
        updateData.name = newData.name;
      }

      const oldDept = typeof oldData.department === 'object'
        ? oldData.department._id
        : oldData.department;

      if (newData.department !== oldDept) {
        updateData.department = newData.department;
      }

      if (newData.description !== oldData.description) {
        updateData.description = newData.description;
      }

      if (Number(newData.credits) !== oldData.credits) {
        updateData.credits = Number(newData.credits);
      }

      return updateData;
    };

    // Function to save the course data
    const saveCourse = async (courseData) => {
      try {
        if (isEditing.value) {

          const updateData = buildUpdateData(courseData, selectedCourse.value);

          await store.dispatch('course/updateCourse', {
            courseCode: selectedCourse.value.courseCode,
            data: updateData
          });

          successMessage.value = t('course.update_success', { name: courseData.name });
        } else {
          await store.dispatch('course/createCourse', courseData);
          successMessage.value = t('course.add_success', { name: courseData.name });
        }

        showSuccessModal.value = true;

        await store.dispatch('course/fetchCourses');

        showForm.value = false;
        selectedCourse.value = {};

      } catch (error) {
        console.error('Error saving course:', error);
        handleError(error, 'course.save_error_fallback');
      }
    }

    // Function to delete a course
    const deleteCourse = async (course) => {
      try {
        const result = await store.dispatch('course/deleteCourse', course.courseCode);

        if (result.success) {
          successMessage.value = result.message || t('course.delete_success');
          showSuccessModal.value = true;
          await store.dispatch('course/fetchCourses');
        }
      } catch (error) {
        console.error('Error deleting course:', error);
        handleError(error, 'course.delete_error_fallback');
      }
    }

    // Function to toggle the active status of a course
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
          successMessage.value = result.message || t(newStatus ? 'course.reopen_success' : 'course.close_success');
          showSuccessModal.value = true;
        }
      } catch (error) {
        console.error('Error toggling course status:', error);
        handleError(error, 'course.toggle_error_fallback');
      }
    }

    onMounted(async () => {
      try {
        // Fetch departments when the component is mounted
        await store.dispatch('department/fetchDepartments');

        // Fetch courses when the component is mounted
        await store.dispatch('course/fetchCourses');

        // If no courses are available, retry after 1 second
        if (!Array.isArray(store.state.course.courses) || store.state.course.courses.length === 0) {
          setTimeout(async () => {
            await store.dispatch('course/fetchCourses');
          }, 1000);
        }
      } catch (error) {
        console.error('Error loading course data:', error);
        handleError(error, 'course.load_error_fallback');
      }
    })

    return {
      showForm,
      isEditing,
      selectedCourse,
      successMessage,
      errorMessage,
      isErrorTranslated,
      showErrorModal,
      showAddForm,
      showEditForm,
      cancelForm,
      saveCourse,
      deleteCourse,
      toggleCourseActiveStatus,
      showSuccessModal
    }
  }
}
</script>