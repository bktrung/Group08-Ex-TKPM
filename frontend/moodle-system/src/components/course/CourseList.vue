<template>
  <div>
    <!-- Search and filters -->
    <div class="row mb-3">
      <div class="col-md-9">
        <div class="input-group">
          <input 
            v-model="searchQuery" 
            type="text" 
            class="form-control" 
            placeholder="Tìm kiếm theo mã hoặc tên khóa học..."
            @keyup.enter="filterCourses"
          >
          <button @click="filterCourses" class="btn btn-primary">Tìm kiếm</button>
          <button @click="resetFilter" class="btn btn-secondary">Đặt lại</button>
        </div>
      </div>
      <div class="col-md-3 text-end">
        <button @click="addCourse" class="btn btn-success">+ Thêm Khóa Học</button>
      </div>
    </div>

    <!-- Courses table -->
    <div class="table-responsive">
      <table class="table table-bordered table-striped">
        <thead class="table-primary text-center">
          <tr>
            <th>Mã khóa học</th>
            <th>Tên khóa học</th>
            <th>Khoa</th>
            <th>Tín chỉ</th>
            <th>Môn học tiên quyết</th>
            <th>Trạng thái</th>
            <th>Hành động</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="loading" class="text-center">
            <td colspan="7">
              <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Loading...</span>
              </div>
            </td>
          </tr>
          <tr v-else-if="filteredCourses.length === 0" class="text-center">
            <td colspan="7">
              <div v-if="searchQuery">
                Không tìm thấy khóa học phù hợp với tìm kiếm của bạn.
              </div>
              <div v-else>
                Chưa có khóa học nào. Vui lòng thêm khóa học mới.
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
              <span v-else class="text-muted">Không có</span>
            </td>
            <td class="text-center">
              <span :class="course.isActive ? 'badge bg-success' : 'badge bg-danger'">
                {{ course.isActive ? 'Đang mở' : 'Đã đóng' }}
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
        <span>Hiển thị {{ paginatedCourses.length }} / {{ filteredCourses.length }} khóa học</span>
      </div>
      <nav>
        <ul class="pagination">
          <li class="page-item" :class="{ disabled: currentPage === 1 }">
            <a class="page-link" href="#" @click.prevent="changePage(currentPage - 1)">Trước</a>
          </li>
          <li v-for="page in totalPages" :key="page" class="page-item" :class="{ active: page === currentPage }">
            <a class="page-link" href="#" @click.prevent="changePage(page)">{{ page }}</a>
          </li>
          <li class="page-item" :class="{ disabled: currentPage === totalPages }">
            <a class="page-link" href="#" @click.prevent="changePage(currentPage + 1)">Sau</a>
          </li>
        </ul>
      </nav>
      <div>
        <select v-model="pageSize" class="form-select form-select-sm" style="width: auto;">
          <option :value="5">5 / trang</option>
          <option :value="10">10 / trang</option>
          <option :value="20">20 / trang</option>
        </select>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <div class="modal fade" id="deleteModal" tabindex="-1" ref="deleteModalRef">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header bg-danger text-white">
            <h5 class="modal-title">Xác nhận xóa</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body" v-if="courseToDelete">
            <p>Bạn có chắc chắn muốn xóa khóa học <strong>{{ courseToDelete.courseCode }} - {{ courseToDelete.name }}</strong>?</p>
            <p class="text-muted small">Lưu ý: Khóa học chỉ có thể xóa nếu chưa có lớp học nào được mở và được tạo trong vòng 30 phút.</p>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Hủy</button>
            <button type="button" class="btn btn-danger" @click="deleteCourse">Xóa</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Toggle Status Confirmation Modal -->
    <div class="modal fade" id="toggleStatusModal" tabindex="-1" ref="toggleStatusModalRef">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header" :class="courseToToggle && courseToToggle.isActive ? 'bg-danger text-white' : 'bg-success text-white'">
            <h5 class="modal-title" v-if="courseToToggle">
              {{ courseToToggle.isActive ? 'Đóng khóa học' : 'Mở lại khóa học' }}
            </h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body" v-if="courseToToggle">
            <p v-if="courseToToggle.isActive">
              Bạn có chắc chắn muốn đóng khóa học <strong>{{ courseToToggle.courseCode }} - {{ courseToToggle.name }}</strong>?
            </p>
            <p v-else>
              Bạn có chắc chắn muốn mở lại khóa học <strong>{{ courseToToggle.courseCode }} - {{ courseToToggle.name }}</strong>?
            </p>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Hủy</button>
            <button 
              type="button" 
              :class="courseToToggle && courseToToggle.isActive ? 'btn btn-danger' : 'btn btn-success'"
              @click="confirmToggleStatus"
            >
              {{ courseToToggle && courseToToggle.isActive ? 'Đóng khóa học' : 'Mở lại khóa học' }}
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

export default {
  name: 'CourseList',
  emits: ['add-course', 'edit-course', 'delete-course', 'toggle-active-status'],
  setup(props, { emit }) {
    const store = useStore()
    const searchQuery = ref('')
    const currentPage = ref(1)
    const pageSize = ref(10)
    const courseToDelete = ref(null)
    const courseToToggle = ref(null)
    
    const deleteModalRef = ref(null)
    const toggleStatusModalRef = ref(null)
    
    let deleteModal = null
    let toggleStatusModal = null
    
    const courses = computed(() => {
      const coursesData = store.state.course.courses
      return Array.isArray(coursesData) ? coursesData : []
    })
    
    const loading = computed(() => store.state.course.loading)
    
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
    
    const totalPages = computed(() => {
      return Math.ceil(filteredCourses.value.length / pageSize.value) || 1
    })
    
    const paginatedCourses = computed(() => {
      const start = (currentPage.value - 1) * pageSize.value
      const end = start + pageSize.value
      return filteredCourses.value.slice(start, end)
    })
    
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
    
    const addCourse = () => {
      emit('add-course')
    }
    
    const editCourse = (course) => {
      emit('edit-course', course)
    }
    
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
    
    const getDepartmentName = (departmentId) => {
      if (!departmentId) return 'N/A'
      
      if (typeof departmentId === 'object' && departmentId.name) {
        return departmentId.name
      }
      
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
        if (typeof prereq === 'object' && prereq.courseCode && prereq.name) {
          return `${prereq.courseCode} - ${prereq.name}`
        }
        
        const course = courses.value.find(c => 
          c._id === (typeof prereq === 'object' ? prereq._id : prereq)
        )
        return course ? `${course.courseCode} - ${course.name}` : 'N/A'
      })
    }
    
    const canDelete = (course) => {
      if (!course.createdAt) return false
      
      const createdAt = new Date(course.createdAt)
      const now = new Date()
      const diffInMinutes = Math.floor((now - createdAt) / (1000 * 60))
      
      return diffInMinutes <= 30 && !course.hasClasses
    }
    
    const initializeModals = () => {
      const deleteModalElement = document.getElementById('deleteModal')
      if (deleteModalElement) {
        deleteModal = new Modal(deleteModalElement)
      }
      
      const toggleStatusModalElement = document.getElementById('toggleStatusModal')
      if (toggleStatusModalElement) {
        toggleStatusModal = new Modal(toggleStatusModalElement)
      }
    }
    
    onMounted(initializeModals)
    
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