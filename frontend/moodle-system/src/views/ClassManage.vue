<template>
  <div class="container-fluid px-5 mt-5">
    <h2 class="mb-4 text-center">{{ $t('class.management') }}</h2>

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
                  <button @click="showEditForm(classItem)" class="btn btn-warning btn-sm">
                    <i class="bi bi-pencil"></i>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div class="d-flex justify-content-between align-items-center">
        <div>
          <span>{{ $t('class.display_count', { current: paginatedClasses.length, total: filteredClasses.length })}}</span>
        </div>
        <nav>
          <ul class="pagination">
            <li class="page-item" :class="{ disabled: currentPage === 1 }">
              <a class="page-link" href="#" @click.prevent="changePage(currentPage - 1)">{{ $t('common.previous') }}</a>
            </li>
            <li v-for="page in totalPages" :key="page" class="page-item" :class="{ active: page === currentPage }">
              <a class="page-link" href="#" @click.prevent="changePage(page)">{{ page }}</a>
            </li>
            <li class="page-item" :class="{ disabled: currentPage === totalPages }">
              <a class="page-link" href="#" @click.prevent="changePage(currentPage + 1)">{{ $t('common.next') }}</a>
            </li>
          </ul>
        </nav>
        <div>
          <select v-model="pageSize" class="form-select form-select-sm" style="width: auto;">
            <option :value="5">5 / {{ $t('common.page') }}</option>
            <option :value="10">10 / {{ $t('common.page') }}</option>
            <option :value="20">20 / {{ $t('common.page') }}</option>
          </select>
        </div>
      </div>
    </div>

    <!-- Schedule Modal -->
    <div class="modal fade" id="scheduleModal" tabindex="-1" ref="scheduleModalRef">
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" v-if="selectedClass">
              {{ $t('class.schedule') }}: {{ selectedClass.classCode }} - {{ getCourseInfo(selectedClass.course) }}
            </h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body" v-if="selectedClass && selectedClass.schedule">
            <div class="table-responsive">
              <table class="table table-bordered">
                <thead>
                  <tr class="text-center">
                    <th>{{ $t('class.day_of_week') }}</th>
                    <th>{{ $t('class.room') }}</th>
                    <th>{{ $t('class.start_period') }}</th>
                    <th>{{ $t('class.end_period') }}</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(schedule, index) in selectedClass.schedule" :key="index">
                    <td class="text-center">{{ formatDayOfWeek(schedule.dayOfWeek) }}</td>
                    <td class="text-center">{{ schedule.classroom }}</td>
                    <td class="text-center">{{ schedule.startPeriod }}</td>
                    <td class="text-center">{{ schedule.endPeriod }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">{{ $t('common.close') }}</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useStore } from 'vuex'
import { Modal } from 'bootstrap'
import ClassForm from '@/components/class/ClassForm.vue'
import { useI18n } from 'vue-i18n'

export default {
  name: 'ClassManage',
  components: {
    ClassForm
  },
  setup() {
    const { t } = useI18n()
    console.log(t('department.add_department'))
    const store = useStore()
    const showForm = ref(false)
    const isEditing = ref(false)
    const selectedClass = ref({})
    const error = ref('')
    const success = ref('')

    // Pagination state
    const currentPage = ref(1)
    const pageSize = ref(10)

    // Filtering state
    const searchQuery = ref('')
    const selectedAcademicYear = ref('')
    const selectedSemester = ref('')

    // Modal refs
    const scheduleModalRef = ref(null)

    // Bootstrap modal instances
    let scheduleModal = null

    // Current date for academic years
    const currentDate = new Date()
    const currentYear = currentDate.getFullYear()

    // Generate academic years (current year - 1 to current year + 2)
    const academicYears = computed(() => {
      const years = []
      for (let i = -1; i <= 2; i++) {
        const startYear = currentYear + i
        const endYear = startYear + 1
        years.push(`${startYear}-${endYear}`)
      }
      return years
    })

    // Computed properties
    const classes = computed(() => store.state.class.classes)
    const loading = computed(() => store.state.class.loading)
    const courses = computed(() => store.state.course.courses)

    // Filtered classes
    const filteredClasses = computed(() => {
      let filtered = Array.isArray(classes.value) ? [...classes.value] : []

      // Filter by academic year
      if (selectedAcademicYear.value) {
        filtered = filtered.filter(cls => cls.academicYear === selectedAcademicYear.value)
      }

      // Filter by semester
      if (selectedSemester.value) {
        filtered = filtered.filter(cls => cls.semester === Number(selectedSemester.value))
      }

      // Filter by search query
      if (searchQuery.value) {
        const query = searchQuery.value.toLowerCase()
        filtered = filtered.filter(cls => {
          // Check class code
          if (cls.classCode.toLowerCase().includes(query)) return true

          // Check instructor
          if (cls.instructor.toLowerCase().includes(query)) return true

          // Check course info
          const course = getCourseById(cls.course)
          if (course) {
            if (course.courseCode.toLowerCase().includes(query)) return true
            if (course.name.toLowerCase().includes(query)) return true
          }

          return false
        })
      }

      // Sort by academic year, semester, course code
      filtered.sort((a, b) => {
        // First compare academic year (newest first)
        if (a.academicYear !== b.academicYear) {
          return b.academicYear.localeCompare(a.academicYear)
        }

        // Then compare semester
        if (a.semester !== b.semester) {
          return a.semester - b.semester
        }

        // Finally compare class code
        return a.classCode.localeCompare(b.classCode)
      })

      return filtered
    })

    // Total pages for pagination
    const totalPages = computed(() => {
      return Math.ceil(filteredClasses.value.length / pageSize.value) || 1
    })

    // Current page of classes
    const paginatedClasses = computed(() => {
      const start = (currentPage.value - 1) * pageSize.value
      const end = start + pageSize.value
      return filteredClasses.value.slice(start, end)
    })

    // Methods
    const filterClasses = () => {
      currentPage.value = 1 // Reset to first page when filtering
    }

    const resetFilter = () => {
      searchQuery.value = ''
      selectedAcademicYear.value = ''
      selectedSemester.value = ''
      currentPage.value = 1
    }

    const changePage = (page) => {
      if (page >= 1 && page <= totalPages.value) {
        currentPage.value = page
      }
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

    const saveClass = async (classData) => {
      try {
        if (isEditing.value) {
          // Update existing class
          await store.dispatch('class/updateClass', {
            classCode: selectedClass.value.classCode,
            data: classData
          })
          success.value = t('class.update_success', { classCode: classData.classCode })
        } else {
          // Create new class
          await store.dispatch('class/addClass', classData)
          success.value = t('class.add_success', { classCode: classData.classCode })
        }

        // Refresh classes data
        await store.dispatch('class/fetchClasses')

        // Reset form
        showForm.value = false
        selectedClass.value = {}

        // Clear success message after 5 seconds
        setTimeout(() => {
          success.value = ''
        }, 5000)
      } catch (err) {
        error.value = `${t('class.save_error_prefix')} ${err.message || t('class.save_error_fallback')}`;
      }
    }

    const showScheduleModal = (classItem) => {
      selectedClass.value = classItem
      if (scheduleModal) {
        scheduleModal.show()
      }
    }

    const formatDayOfWeek = (day) => {
      return t(`days.${day}`) || `Thứ ${day}`
    }

    const formatSemester = (semester) => {
      if (semester === 3) return t('semester.summer')
      return t('semester.regular', { semester })
    }

    const getCourseById = (courseId) => {
      if (!courseId) return null

      const id = typeof courseId === 'object' ? courseId._id : courseId
      return courses.value.find(course => course._id === id)
    }

    const getCourseInfo = (courseId) => {
      const course = getCourseById(courseId)
      if (!course) return 'N/A'

      return `${course.courseCode} - ${course.name} (${course.credits} TC)`
    }

    const getProgressBarClass = (classItem) => {
      const ratio = classItem.enrolledStudents / classItem.maxCapacity
      if (ratio >= 0.9) return 'bg-danger'
      if (ratio >= 0.75) return 'bg-warning'
      return 'bg-success'
    }
    // Load data
    // In ClassManage.vue, modify the onMounted function to add better debugging:

    onMounted(async () => {
      try {
        // Clear filters first
        resetFilter();

        console.log('Fetching classes and courses...');
        await Promise.all([
          store.dispatch('class/fetchClasses'),
          store.dispatch('course/fetchCourses')
        ]);

        // Add debugging to check what's in the store
        console.log('Classes in store:', store.state.class.classes);
        console.log('Filtered classes:', filteredClasses.value);

        // If no classes were found but they should exist
        if (!Array.isArray(store.state.class.classes) || store.state.class.classes.length === 0) {
          console.log('No classes found, trying direct API call...');

          // Try again with direct API call
          const apiResponse = await store.dispatch('class/fetchClasses', {
            page: 1,
            limit: 50 // Get more classes to ensure we get something
          });

          console.log('Direct API response:', apiResponse);
        }

        // Set default academic year to current year only if we have classes
        if (store.state.class.classes.length > 0) {
          selectedAcademicYear.value = academicYears.value[1];
        }

        // Initialize modals
        if (document.getElementById('scheduleModal')) {
          scheduleModal = new Modal(document.getElementById('scheduleModal'));
        }
      } catch (err) {
        console.error('Error loading data:', err);
        const msg = err.message || t('error.load_failed')
        error.value = `${t('error.prefix')}: ${msg}`
      }
    });

    return {
      showForm,
      isEditing,
      selectedClass,
      error,
      success,
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
      scheduleModalRef,
      filterClasses,
      resetFilter,
      changePage,
      showAddForm,
      showEditForm,
      cancelForm,
      saveClass,
      showScheduleModal,
      formatDayOfWeek,
      formatSemester,
      getCourseInfo,
      getProgressBarClass
    }
  }
}
</script>

<style scoped></style>