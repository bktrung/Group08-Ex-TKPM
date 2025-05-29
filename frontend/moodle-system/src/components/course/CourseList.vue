<template>
  <div>
    <!-- Search and filters -->
    <div class="row mb-3">
      <div class="col-md-9">
        <div class="input-group">
          <input v-model="searchQuery" type="text" class="form-control" :placeholder="$t('course.search_placeholder')"
            @keyup.enter="filterCourses">
          <button @click="filterCourses" class="btn btn-primary">{{ $t('common.search') }}</button>
          <button @click="resetFilter" class="btn btn-secondary">{{ $t('common.reset') }}</button>
        </div>
      </div>
      <div class="col-md-3 text-end">
        <button @click="addCourse" class="btn btn-success">+ {{ $t('common.add') }} {{ $t('course.title') }}</button>
      </div>
    </div>

    <!-- Courses table -->
    <div class="table-responsive">
      <table class="table table-bordered table-striped">
        <thead class="table-primary text-center">
          <tr>
            <th>{{ $t('course.course_code') }}</th>
            <th>{{ $t('course.name') }}</th>
            <th>{{ $t('course.department') }}</th>
            <th>{{ $t('course.credits') }}</th>
            <th>{{ $t('course.prerequisite') }}</th>
            <th>{{ $t('common.status') }}</th>
            <th>{{ $t('common.action') }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="loading" class="text-center">
            <td colspan="7">
              <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">{{ $t('common.loading') }}</span>
              </div>
            </td>
          </tr>
          <tr v-else-if="filteredCourses.length === 0" class="text-center">
            <td colspan="7">
              <div v-if="searchQuery">
                {{ $t('course.no_search_result') }}
              </div>
              <div v-else>
                {{ $t('course.no_data') }}
              </div>
            </td>
          </tr>
          <tr v-for="course in paginatedCourses" :key="course.courseCode" v-else>
            <td>{{ course.courseCode }}</td>
            <td>{{ course.name }}</td>
            <td>{{ getDepartmentName(course.department) }}</td>
            <td class="text-center">{{ course.credits }}</td>
            <td>
              <div v-if="course.prerequisites && course.prerequisites.length > 0">
                <div v-for="(prereq, index) in getPrerequisiteNames(course.prerequisites)" :key="index">
                  {{ prereq }}
                </div>
              </div>
              <span v-else class="text-muted">{{ $t('common.none') }}</span>
            </td>
            <td class="text-center">
              <span :class="course.isActive ? 'badge bg-success' : 'badge bg-danger'">
                {{ course.isActive ? $t('course.status.active') : $t('course.status.inactive') }}
              </span>
            </td>
            <td class="text-center">
              <div class="d-flex gap-1 justify-content-center">
                <button @click="editCourse(course)" class="btn btn-warning btn-sm">
                  <i class="bi bi-pencil"></i>
                </button>
                <button @click="toggleActiveStatus(course)"
                  :class="course.isActive ? 'btn btn-outline-danger btn-sm' : 'btn btn-outline-success btn-sm'">
                  <i :class="course.isActive ? 'bi bi-x-circle' : 'bi bi-check-circle'"></i>
                </button>
                <button v-if="canDelete(course)" @click="confirmDelete(course)" class="btn btn-danger btn-sm">
                  <i class="bi bi-trash"></i>
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
        <span>
          {{ $t('course.display_count', { current: paginatedCourses.length, total: filteredCourses.length }) }}
        </span>
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

    <!-- Delete Confirmation Modal -->
    <div class="modal fade" id="deleteModal" tabindex="-1" ref="deleteModalRef">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header bg-danger text-white">
            <h5 class="modal-title">{{ $t('common.confirm_delete') }}</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body" v-if="courseToDelete">
            <p v-html="$t('course.delete_confirm', { code: courseToDelete.courseCode, name: courseToDelete.name })"></p>
            <p class="text-muted small">{{ $t('course.delete_note') }}</p>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">{{ $t('common.cancel') }}</button>
            <button type="button" class="btn btn-danger" @click="deleteCourse">{{ $t('common.delete') }}</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Toggle Status Confirmation Modal -->
    <div class="modal fade" id="toggleStatusModal" tabindex="-1" ref="toggleStatusModalRef">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header"
            :class="courseToToggle && courseToToggle.isActive ? 'bg-danger text-white' : 'bg-success text-white'">
            <h5 class="modal-title" v-if="courseToToggle">
              {{ courseToToggle.isActive ? 'Đóng khóa học' : 'Mở lại khóa học' }}
            </h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body" v-if="courseToToggle">
            <p v-if="courseToToggle.isActive">
              {{ $t('course.confirm_close', { courseCode: courseToToggle.courseCode, name: courseToToggle.name }) }}
            </p>
            <p v-else>
              {{ $t('course.confirm_reopen', { courseCode: courseToToggle.courseCode, name: courseToToggle.name }) }}
            </p>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">{{ $t('common.cancel') }}</button>
            <button type="button"
              :class="courseToToggle && courseToToggle.isActive ? 'btn btn-danger' : 'btn btn-success'"
              @click="confirmToggleStatus">
              {{ courseToToggle && courseToToggle.isActive ? $t('course.close') : $t('course.reopen') }}
            </button>
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
import { useI18n } from 'vue-i18n'

export default {
  name: 'CourseList',
  emits: ['add-course', 'edit-course', 'delete-course', 'toggle-active-status'],
  setup(props, { emit }) {
    const { t } = useI18n()
    const store = useStore()
    const searchQuery = ref('')
    const currentPage = ref(1)
    const pageSize = ref(10)
    const courseToDelete = ref(null)
    const courseToToggle = ref(null)

    console.log(t)

    // Modal refs
    const deleteModalRef = ref(null)
    const toggleStatusModalRef = ref(null)

    // Bootstrap modal instances
    let deleteModal = null
    let toggleStatusModal = null

    // Computed properties
    const courses = computed(() => {
      // Safely handle if courses is not an array
      const coursesData = store.state.course.courses
      return Array.isArray(coursesData) ? coursesData : []
    })

    const loading = computed(() => store.state.course.loading)

    // Filtered courses
    const filteredCourses = computed(() => {
      if (!searchQuery.value) {
        return courses.value
      }

      const query = searchQuery.value.toLowerCase()
      return courses.value.filter(course =>
        course.courseCode.toLowerCase().includes(query) ||
        course.name.toLowerCase().includes(query)
      )
    })

    // Pagination
    const totalPages = computed(() => {
      return Math.ceil(filteredCourses.value.length / pageSize.value) || 1
    })

    const paginatedCourses = computed(() => {
      const start = (currentPage.value - 1) * pageSize.value
      const end = start + pageSize.value
      return filteredCourses.value.slice(start, end)
    })

    // Methods
    const filterCourses = () => {
      currentPage.value = 1
    }

    const resetFilter = () => {
      searchQuery.value = ''
      currentPage.value = 1
    }

    const changePage = (page) => {
      if (page >= 1 && page <= totalPages.value) {
        currentPage.value = page
      }
    }

    // Event emitter methods
    const addCourse = () => {
      emit('add-course')
    }

    const editCourse = (course) => {
      emit('edit-course', course)
    }

    // Delete course methods
    const confirmDelete = (course) => {
      courseToDelete.value = course
      if (deleteModal) {
        deleteModal.show()
      }
    }

    const deleteCourse = () => {
      if (courseToDelete.value) {
        emit('delete-course', courseToDelete.value)
        if (deleteModal) {
          deleteModal.hide()
        }
      }
    }

    // Toggle status methods
    const toggleActiveStatus = (course) => {
      courseToToggle.value = course
      if (toggleStatusModal) {
        toggleStatusModal.show()
      }
    }

    const confirmToggleStatus = () => {
      if (courseToToggle.value) {
        emit('toggle-active-status', courseToToggle.value)
        if (toggleStatusModal) {
          toggleStatusModal.hide()
        }
      }
    }

    // Helper methods
    const getDepartmentName = (departmentId) => {
      if (!departmentId) return 'N/A'

      // If department is already an object with name
      if (typeof departmentId === 'object' && departmentId.name) {
        return departmentId.name
      }

      // Get department from store
      const department = store.getters['department/getDepartmentById'](
        typeof departmentId === 'object' ? departmentId._id : departmentId
      )
      return department ? department.name : 'N/A'
    }

    const getPrerequisiteNames = (prerequisites) => {
      if (!prerequisites || !Array.isArray(prerequisites) || prerequisites.length === 0) {
        return []
      }

      return prerequisites.map(prereq => {
        // If prereq is already an object with courseCode and name
        if (typeof prereq === 'object' && prereq.courseCode && prereq.name) {
          return `${prereq.courseCode} - ${prereq.name}`
        }

        // Find the course by ID
        const course = courses.value.find(c =>
          c._id === (typeof prereq === 'object' ? prereq._id : prereq)
        )
        return course ? `${course.courseCode} - ${course.name}` : 'N/A'
      })
    }

    const canDelete = (course) => {
      if (!course.createdAt) return false

      // Check if course was created less than 30 minutes ago
      const createdAt = new Date(course.createdAt)
      const now = new Date()
      const diffInMinutes = Math.floor((now - createdAt) / (1000 * 60))

      return diffInMinutes <= 30 && !course.hasClasses
    }

    // Initialize modals on component mount
    onMounted(() => {
      // Initialize delete modal
      const deleteModalElement = document.getElementById('deleteModal')
      if (deleteModalElement) {
        deleteModal = new Modal(deleteModalElement)
      }

      // Initialize toggle status modal
      const toggleStatusModalElement = document.getElementById('toggleStatusModal')
      if (toggleStatusModalElement) {
        toggleStatusModal = new Modal(toggleStatusModalElement)
      }
    })

    return {
      searchQuery,
      currentPage,
      pageSize,
      courses,
      loading,
      filteredCourses,
      paginatedCourses,
      totalPages,
      courseToDelete,
      courseToToggle,
      deleteModalRef,
      toggleStatusModalRef,
      filterCourses,
      resetFilter,
      changePage,
      addCourse,
      editCourse,
      confirmDelete,
      deleteCourse,
      toggleActiveStatus,
      confirmToggleStatus,
      getDepartmentName,
      getPrerequisiteNames,
      canDelete
    }
  }
}
</script>