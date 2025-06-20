<template>
  <div class="container-fluid px-5 mt-5">
    <h2 class="mb-4 text-center">{{ $t('class.management') }}</h2>

    <div v-if="showForm" class="card bg-light mb-4">
      <div class="card-header">
        <h4>{{ isEditing ? $t('common.edit') : $t('common.add') }}</h4>
      </div>
      <div class="card-body">
        <ClassForm :class-data="selectedClass" :is-editing="isEditing" @submit="saveClass" @cancel="cancelForm" />
      </div>
    </div>

    <div v-if="!showForm">
      <!-- Search and filters -->
      <div class="row mb-3">
        <div class="col-md-9">
          <div class="row">
            <div class="col-md-3 mb-2">
              <select v-model="selectedAcademicYear" class="form-select" @change="filterClasses">
                <option value="">{{ $t('class.all_year') }}</option>
                <option v-for="year in academicYears" :key="year" :value="year">
                  {{ year }}
                </option>
              </select>
            </div>
            <div class="col-md-2 mb-2">
              <select v-model="selectedSemester" class="form-select" @change="filterClasses">
                <option value="">{{ $t('class.all_semesters') }}</option>
                <option :value="1">{{ $t('class.semester_1') }}</option>
                <option :value="2">{{ $t('class.semester_2') }}</option>
                <option :value="3">{{ $t('class.semester_3') }}</option>

              </select>
            </div>
            <div class="col-md-7">
              <div class="input-group">
                <input v-model="searchQuery" type="text" class="form-control"
                  :placeholder="$t('class.search_placeholder')" @keyup.enter="filterClasses">
                <button @click="filterClasses" class="btn btn-primary">{{ $t('common.search') }}</button>
                <button @click="resetFilter" class="btn btn-secondary">{{ $t('common.reset') }}</button>
              </div>
            </div>
          </div>
        </div>
        <div class="col-md-3 text-end">
          <button @click="showAddForm" class="btn btn-success">+ {{ $t('class.add') }}</button>
        </div>
      </div>

      <!-- Classes table -->
      <div class="table-responsive">
        <table class="table table-bordered table-striped">
          <thead class="table-primary text-center">
            <tr>
              <th>{{ $t('class.class_code') }}</th>
              <th>{{ $t('class.course') }}</th>
              <th>{{ $t('class.academic_year') }}</th>
              <th>{{ $t('class.semester') }}</th>
              <th>{{ $t('class.lecturer') }}</th>
              <th>{{ $t('class.student_count') }}</th>
              <th>{{ $t('class.schedule') }}</th>
              <th>{{ $t('common.action') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="loading" class="text-center">
              <td colspan="9">
                <div class="spinner-border text-primary" role="status">
                  <span class="visually-hidden">{{ $t('common.loading') }}</span>
                </div>
              </td>
            </tr>
            <tr v-else-if="filteredClasses.length === 0" class="text-center">
              <td colspan="9">
                <div v-if="searchQuery || selectedAcademicYear || selectedSemester">
                  {{ $t('common.no_result') }}
                </div>
                <div v-else>
                  {{ $t('class.no_data') }}
                </div>
              </td>
            </tr>
            <tr v-for="classItem in paginatedClasses" :key="classItem._id" v-else>
              <td>{{ classItem.classCode }}</td>
              <td>
                {{ getCourseInfo(classItem.course) }}
              </td>
              <td class="text-center">{{ classItem.academicYear }}</td>
              <td class="text-center">{{ formatSemester(classItem.semester) }}</td>
              <td>{{ classItem.instructor }}</td>
              <td class="text-center">
                {{ classItem.enrolledStudents }} / {{ classItem.maxCapacity }}
                <div class="progress" style="height: 5px;">
                  <div class="progress-bar" :class="getProgressBarClass(classItem)"
                    :style="`width: ${(classItem.enrolledStudents / classItem.maxCapacity) * 100}%`">
                  </div>
                </div>
              </td>
              <td class="text-center">
                <button class="btn btn-sm btn-outline-primary" @click="showScheduleModal(classItem)">
                  {{ $t('class.view_schedule') }}
                </button>
              </td>

              <td class="text-center">
                <div class="d-flex gap-1 justify-content-center">
                  <button @click="showEditForm(classItem)" class="btn btn-warning btn-sm" title="Edit">
                    <i class="bi bi-pencil"></i>
                  </button>
                  <button @click="showDeleteModal(classItem)" class="btn btn-danger btn-sm" title="Delete">
                    <i class="bi bi-trash"></i>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <BasePagination v-model="currentPage" :pageSize="pageSize" :totalItems="filteredClasses.length"
        :currentItems="paginatedClasses.length" @update:pageSize="pageSize = $event" />
    </div>

    <!-- Schedule Modal -->
    <ScheduleModal v-model:visible="isScheduleModalVisible" :selectedClass="selectedClass" />

    <!-- Success Modals -->
    <SuccessModal :showModal="showSuccessModal" :title="$t('common.success') + '!'" :message="successMessage"
      @update:showModal="showSuccessModal = $event" />

    <!-- Error Modal -->
    <ErrorModal :showModal="showErrorModal" :title="$t('common.error')" :message="errorMessage"
      :isTranslated="isErrorTranslated" @update:showModal="showErrorModal = $event" />

    <ConfirmModal :showModal="showConfirmModal" :title="$t('common.confirm_delete')"
      :message="`${$t('class.confirm_delete', { classCode: selectedClass.classCode, name: getCourseInfo(selectedClass.course) })}`"
      @update:showModal="showConfirmModal = $event" @confirm="deleteClass" />

  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useStore } from 'vuex'
import ClassForm from '@/components/class/ClassForm.vue'
import BasePagination from '@/components/layout/DefaultPagination.vue'
import ScheduleModal from '@/components/layout/ScheduleModal.vue'
import SuccessModal from '@/components/layout/SuccessModal.vue'
import ErrorModal from '@/components/layout/ErrorModal.vue'
import { useI18n } from 'vue-i18n'
import { useErrorHandler } from '@/composables/useErrorHandler'
import ConfirmModal from '@/components/layout/ConfirmModal.vue'

export default {
  name: 'ClassManage',
  components: {
    ClassForm,
    BasePagination,
    ScheduleModal,
    SuccessModal,
    ErrorModal,
    ConfirmModal
  },
  setup() {
    const { t } = useI18n()
    const store = useStore()
    const { errorMessage, isErrorTranslated, showErrorModal, handleError } = useErrorHandler()

    const showForm = ref(false)
    const isEditing = ref(false)
    const selectedClass = ref({})
    const successMessage = ref('')
    const showSuccessModal = ref(false)
    const showConfirmModal = ref(false)
    const deletingClassId = ref(null)

    const currentPage = ref(1)
    const pageSize = ref(10)

    const searchQuery = ref('')
    const selectedAcademicYear = ref('')
    const selectedSemester = ref('')

    const isScheduleModalVisible = ref(false)

    const currentDate = new Date()
    const currentYear = currentDate.getFullYear()

    const academicYears = computed(() => {
      const years = []
      for (let i = -1; i <= 2; i++) {
        const startYear = currentYear + i
        const endYear = startYear + 1
        years.push(`${startYear}-${endYear}`)
      }
      return years
    })

    const classes = computed(() => store.state.class.classes)
    const loading = computed(() => store.state.class.loading)
    const courses = computed(() => store.state.course.courses)

    const filteredClasses = computed(() => {
      const allClasses = Array.isArray(classes.value) ? [...classes.value] : [];

      return allClasses
        .filter(cls => {

          // Filter by academic year
          if (selectedAcademicYear.value && cls.academicYear !== selectedAcademicYear.value) {
            return false;
          }

          // Filter by semester
          if (selectedSemester.value && cls.semester !== Number(selectedSemester.value)) {
            return false;
          }

          // Filter by search query
          if (searchQuery.value) {
            const query = searchQuery.value.toLowerCase();

            const course = getCourseById(cls.course);
            const courseCode = course?.courseCode?.toLowerCase() || '';
            const courseName = course?.name?.toLowerCase() || '';
            const classCode = cls.classCode?.toLowerCase() || '';
            const instructor = cls.instructor?.toLowerCase() || '';

            const matchesQuery =
              classCode.includes(query) ||
              instructor.includes(query) ||
              courseCode.includes(query) ||
              courseName.includes(query);

            if (!matchesQuery) return false;
          }

          return true;
        })
        .sort((a, b) => {

          // Descending order by academic year
          const yearCompare = b.academicYear.localeCompare(a.academicYear);
          if (yearCompare !== 0) return yearCompare;

          // Ascending order by semester
          const semesterCompare = a.semester - b.semester;
          if (semesterCompare !== 0) return semesterCompare;

          // Ascending order by class code
          return a.classCode.localeCompare(b.classCode);
        });
    });


    const totalPages = computed(() => {
      return Math.ceil(filteredClasses.value.length / pageSize.value) || 1
    })

    const paginatedClasses = computed(() => {
      const start = (currentPage.value - 1) * pageSize.value
      const end = start + pageSize.value
      return filteredClasses.value.slice(start, end)
    })

    const filterClasses = () => {
      currentPage.value = 1
    }

    const resetFilter = () => {
      searchQuery.value = ''
      selectedAcademicYear.value = ''
      selectedSemester.value = ''
      currentPage.value = 1
    }

    const showAddForm = () => {
      selectedClass.value = {}
      isEditing.value = false
      showForm.value = true
    }

    const showEditForm = (classItem) => {
      selectedClass.value = { ...classItem }
      isEditing.value = true
      showForm.value = true
    }

    const cancelForm = () => {
      showForm.value = false
      selectedClass.value = {}
    }

    const showDeleteModal = (classItem) => {
      selectedClass.value = classItem
      deletingClassId.value = classItem.classCode
      showConfirmModal.value = true

    }

    const saveClass = async (classData) => {
      try {
        const isUpdate = isEditing.value;
        const classCode = classData.classCode;

        if (isUpdate) {

          const fieldsToRemove = ['classCode', 'course', 'academicYear', 'semester'];

          const updatedData = Object.fromEntries(
            Object.entries(classData).filter(([key]) => !fieldsToRemove.includes(key))
          );

          await store.dispatch('class/updateClass', {
            classCode: selectedClass.value.classCode,
            data: updatedData
          });
        } else {
          await store.dispatch('class/addClass', classData);
        }

        successMessage.value = isUpdate
          ? t('class.update_success', { classCode })
          : t('class.add_success', { classCode });

        showSuccessModal.value = true;

        await store.dispatch('class/fetchClasses');
        resetForm();
      } catch (err) {
        console.error('Error saving class:', err);
        handleError(err, 'class.save_error_fallback');
      }
    };

    const resetForm = () => {
      showForm.value = false;
      selectedClass.value = {};
    };

    const showScheduleModal = (classItem) => {
      selectedClass.value = classItem
      isScheduleModalVisible.value = true
    }

    const formatSemester = (semester) => {
      if (semester === 3) return t('semester.summer')
      return t('semester.regular', { semester })
    }

    const getCourseById = (courseId) => {
      if (!courseId) return null;

      const id = courseId._id ?? courseId;
      return courses.value?.find(course => course._id === id) || null;
    };

    const getCourseInfo = (courseId) => {
      const course = getCourseById(courseId);

      return course
        ? `${course.courseCode} - ${course.name} (${course.credits} TC)`
        : 'N/A';
    };

    const getProgressBarClass = (classItem) => {
      const ratio = classItem.enrolledStudents / classItem.maxCapacity
      if (ratio >= 0.9) return 'bg-danger'
      if (ratio >= 0.75) return 'bg-warning'
      return 'bg-success'
    }

    const deleteClass = async () => {
      try {
        console.log('Deleting class with ID:', deletingClassId.value);
        await store.dispatch('class/deleteClass', deletingClassId.value);
        showConfirmModal.value = false;
        successMessage.value = t('class.delete_success');
        showSuccessModal.value = true;
      } catch (err) {
        console.error('Error deleting class:', err);
        handleError(err, 'class.delete_error_fallback');
      }
    }

    onMounted(async () => {
      try {
        resetFilter();

        await Promise.all([
          store.dispatch('class/fetchClasses'),
          store.dispatch('course/fetchCourses')
        ]);

        if (!Array.isArray(store.state.class.classes) || store.state.class.classes.length === 0) {
          await store.dispatch('class/fetchClasses', {
            page: 1,
            limit: 50
          });
        }

        if (store.state.class.classes.length > 0) {
          selectedAcademicYear.value = academicYears.value[1];
        }

      } catch (err) {
        console.error('Error loading class data:', err);
        handleError(err, 'error.load_failed');
      }
    });

    return {
      showForm,
      isEditing,
      selectedClass,
      errorMessage,
      isErrorTranslated,
      showErrorModal,
      successMessage,
      currentPage,
      pageSize,
      searchQuery,
      selectedAcademicYear,
      selectedSemester,
      academicYears,
      loading,
      classes,
      filteredClasses,
      paginatedClasses,
      totalPages,
      filterClasses,
      resetFilter,
      showAddForm,
      showEditForm,
      cancelForm,
      saveClass,
      showScheduleModal,
      formatSemester,
      getCourseInfo,
      getProgressBarClass,
      isScheduleModalVisible,
      showSuccessModal,
      showConfirmModal,
      showDeleteModal,
      deletingClassId,
      deleteClass
    }
  }
}
</script>

<style scoped></style>