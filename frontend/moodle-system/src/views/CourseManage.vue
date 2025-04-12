<template>
  <div class="container-fluid px-5 mt-5">
    <h2 class="mb-4 text-center">Quản lý Khóa học</h2>

    <!-- Search and filters -->
    <div class="row mb-3">
      <div class="col-md-8">
        <div class="row">
          <div class="col-md-4 mb-2">
            <select v-model="selectedDepartment" class="form-select" @change="filterCourses">
              <option value="">Tất cả khoa</option>
              <option v-for="dept in departments" :key="dept._id" :value="dept._id">
                {{ dept.name }}
              </option>
            </select>
          </div>
          <div class="col-md-8">
            <div class="input-group">
              <input v-model="searchQuery" type="text" class="form-control" placeholder="Tìm kiếm..."
                @keyup.enter="searchCourses">
              <button @click="searchCourses" class="btn btn-primary">Tìm kiếm</button>
              <button @click="resetSearch" class="btn btn-secondary">Đặt lại</button>
            </div>
          </div>
        </div>
      </div>
      <div class="col-md-4 text-end">
        <router-link to="/courses/add" class="btn btn-success">+ Thêm Khóa học</router-link>
      </div>
    </div>

    <!-- Course table -->
    <div class="table-responsive">
      <table class="table table-bordered table-striped">
        <thead class="table-primary text-center">
          <tr>
            <th>Mã khóa học</th>
            <th>Tên khóa học</th>
            <th>Tín chỉ</th>
            <th>Khoa</th>
            <th>Môn tiên quyết</th>
            <th>Trạng thái</th>
            <th>Thời gian tạo</th>
            <th>Hành động</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="loading" class="text-center">
            <td colspan="8">
              <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Loading...</span>
              </div>
            </td>
          </tr>
          <tr v-else-if="filteredCourses.length === 0" class="text-center">
            <td colspan="8">
              <div v-if="searchQuery || selectedDepartment">
                Không tìm thấy kết quả phù hợp với tìm kiếm của bạn.
              </div>
              <div v-else>
                Chưa có khóa học nào trong cơ sở dữ liệu. Vui lòng thêm khóa học mới.
              </div>
            </td>
          </tr>
          <tr v-for="course in filteredCourses" :key="course.courseCode" v-else>
            <td>{{ course.courseCode }}</td>
            <td>{{ course.name }}</td>
            <td class="text-center">{{ course.credits }}</td>
            <td>{{ getDepartmentName(course.department) }}</td>
            <td>
              <div v-if="course.prerequisites && course.prerequisites.length > 0">
                <ul class="list-unstyled mb-0">
                  <li v-for="prereq in course.prerequisites" :key="prereq._id || prereq">
                    {{ getPrerequisiteName(prereq) }}
                  </li>
                </ul>
              </div>
              <span v-else>Không có</span>
            </td>
            <td class="text-center">
              <span :class="getStatusBadgeClass(course.isActive)">
                {{ course.isActive ? 'Đang hoạt động' : 'Không hoạt động' }}
              </span>
            </td>
            <td>
              {{ formatDate(course.createdAt) }}
              <div v-if="getTimeRemaining(course) > 0" class="small text-muted">
                Còn {{ getTimeRemaining(course) }} phút để xóa
              </div>
            </td>
            <td class="text-center">
              <div class="d-flex justify-content-center gap-1">
                <router-link 
                  :to="`/courses/edit/${course.courseCode}`" 
                  class="btn btn-warning btn-sm">Sửa
                </router-link>
                <router-link 
                  :to="`/courses/${course.courseCode}/add-class`" 
                  class="btn btn-info btn-sm">
                  Mở lớp
                </router-link>
                <button 
                  @click="confirmDelete(course)" 
                  class="btn btn-danger btn-sm"
                  :disabled="!canDelete(course)">
                  {{ canDelete(course) ? 'Xóa' : 'Hủy kích hoạt' }}
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Pagination -->
    <nav v-if="totalPages > 1">
      <ul class="pagination justify-content-center">
        <li class="page-item" :class="{ disabled: currentPage === 1 }">
          <a class="page-link" href="#" @click.prevent="changePage(currentPage - 1)">Trước</a>
        </li>
        
        <li v-if="startPage > 1" class="page-item">
          <a class="page-link" href="#" @click.prevent="changePage(1)">1</a>
        </li>
        
        <li v-if="startPage > 2" class="page-item disabled">
          <span class="page-link">...</span>
        </li>
        
        <li v-for="page in paginationPages" :key="page" class="page-item" :class="{ active: page === currentPage }">
          <a class="page-link" href="#" @click.prevent="changePage(page)">{{ page }}</a>
        </li>
        
        <li v-if="endPage < totalPages - 1" class="page-item disabled">
          <span class="page-link">...</span>
        </li>
        
        <li v-if="endPage < totalPages" class="page-item">
          <a class="page-link" href="#" @click.prevent="changePage(totalPages)">{{ totalPages }}</a>
        </li>
        
        <li class="page-item" :class="{ disabled: currentPage === totalPages }">
          <a class="page-link" href="#" @click.prevent="changePage(currentPage + 1)">Sau</a>
        </li>
      </ul>
    </nav>

    <!-- Delete confirmation modal -->
    <div class="modal fade" id="confirmDeleteModal" tabindex="-1" aria-hidden="true" ref="deleteModalRef">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">{{ deleteTitle }}</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body" v-if="courseToDelete">
            <p>{{ deleteMessage }}</p>
            <div v-if="canDeleteSelectedCourse" class="alert alert-warning">
              <i class="bi bi-exclamation-triangle me-2"></i>
              Lưu ý: Khi xóa, tất cả dữ liệu liên quan đến khóa học này sẽ bị xóa vĩnh viễn.
            </div>
            <div v-else class="alert alert-info">
              <i class="bi bi-info-circle me-2"></i>
              Khóa học sẽ bị đánh dấu là không hoạt động và không thể mở lớp mới.
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Hủy</button>
            <button @click="deleteCourse" type="button" class="btn btn-danger">
              {{ canDeleteSelectedCourse ? 'Xóa' : 'Hủy kích hoạt' }}
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
  name: 'CourseManage',
  setup() {
    const store = useStore()
    const searchQuery = ref('')
    const selectedDepartment = ref('')
    const courseToDelete = ref(null)
    const deleteModal = ref(null)
    
    // Computed properties
    const courses = computed(() => store.state.course.courses)
    const loading = computed(() => store.state.course.loading)
    const currentPage = computed(() => store.state.course.currentPage)
    const totalPages = computed(() => store.state.course.totalPages)
    const departments = computed(() => store.state.department.departments)
    
    const filteredCourses = computed(() => {
      if (!searchQuery.value && !selectedDepartment.value) {
        return courses.value
      }
      
      return courses.value.filter(course => {
        const matchesDepartment = !selectedDepartment.value || 
          (course.department === selectedDepartment.value || 
          (typeof course.department === 'object' && course.department._id === selectedDepartment.value))
        
        const matchesSearch = !searchQuery.value || 
          course.courseCode.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
          course.name.toLowerCase().includes(searchQuery.value.toLowerCase())
        
        return matchesDepartment && matchesSearch
      })
    })
    
    // For deletion logic
    const canDeleteSelectedCourse = computed(() => {
      return courseToDelete.value && canDelete(courseToDelete.value)
    })
    
    const deleteTitle = computed(() => {
      return canDeleteSelectedCourse.value 
        ? 'Xác nhận xóa khóa học' 
        : 'Xác nhận hủy kích hoạt khóa học'
    })
    
    const deleteMessage = computed(() => {
      if (!courseToDelete.value) return ''
      
      return canDeleteSelectedCourse.value
        ? `Bạn có chắc chắn muốn xóa khóa học "${courseToDelete.value.name}" (${courseToDelete.value.courseCode})?`
        : `Bạn có chắc chắn muốn hủy kích hoạt khóa học "${courseToDelete.value.name}" (${courseToDelete.value.courseCode})?`
    })
    
    // Calculate pagination range
    const startPage = computed(() => {
      return Math.max(1, currentPage.value - 2)
    })
    
    const endPage = computed(() => {
      return Math.min(totalPages.value, startPage.value + 4)
    })
    
    const paginationPages = computed(() => {
      const pages = []
      for (let i = startPage.value; i <= endPage.value; i++) {
        pages.push(i)
      }
      return pages
    })
    
    // Methods
    const loadData = async () => {
      await Promise.all([
        store.dispatch('course/fetchCourses'),
        store.dispatch('department/fetchDepartments')
      ])
    }
    
    const searchCourses = async () => {
      await store.dispatch('course/fetchCourses')
    }
    
    const filterCourses = async () => {
      await store.dispatch('course/fetchCourses')
    }
    
    const resetSearch = async () => {
      searchQuery.value = ''
      selectedDepartment.value = ''
      await loadData()
    }
    
    const changePage = async (page) => {
      if (page >= 1 && page <= totalPages.value) {
        await store.dispatch('course/fetchCourses', { page })
      }
    }
    
    const confirmDelete = (course) => {
      courseToDelete.value = course
      deleteModal.value.show()
    }
    
    const deleteCourse = async () => {
      if (!courseToDelete.value) return
      
      try {
        await store.dispatch('course/deleteCourse', courseToDelete.value.courseCode)
        deleteModal.value.hide()
        
        // Refresh the course list
        await loadData()
      } catch (error) {
        console.error('Error deleting course:', error)
        alert('Lỗi khi xóa hoặc hủy kích hoạt khóa học: ' + error.message)
      }
    }
    
    const formatDate = (dateString) => {
      if (!dateString) return ''
      return new Date(dateString).toLocaleDateString('vi-VN')
    }
    
    const getDepartmentName = (department) => {
      if (!department) return ''
      if (typeof department === 'object') return department.name
      return store.getters['department/getDepartmentName'](department) || department
    }
    
    const getPrerequisiteName = (prerequisite) => {
      if (!prerequisite) return ''
      if (typeof prerequisite === 'object') return prerequisite.name || prerequisite.courseCode || ''
      
      // Try to find the course in the courses list
      const prereqCourse = courses.value.find(c => c._id === prerequisite || c.courseCode === prerequisite)
      return prereqCourse ? prereqCourse.courseCode : prerequisite
    }
    
    const getStatusBadgeClass = (isActive) => {
      return isActive 
        ? 'badge bg-success' 
        : 'badge bg-secondary'
    }
    
    const getTimeRemaining = (course) => {
      return store.getters['course/getCreationTimeRemaining'](course)
    }
    
    const canDelete = (course) => {
      return store.getters['course/canDeleteCourse'](course)
    }
    
    // Lifecycle hooks
    onMounted(async () => {
      await loadData()
      
      // Initialize Bootstrap modal
      const modalElement = document.getElementById('confirmDeleteModal')
      if (modalElement) {
        deleteModal.value = new Modal(modalElement)
      }
    })

    return {
      courses,
      filteredCourses,
      loading,
      currentPage,
      totalPages,
      departments,
      startPage,
      endPage,
      paginationPages,
      searchQuery,
      selectedDepartment,
      courseToDelete,
      canDeleteSelectedCourse,
      deleteTitle,
      deleteMessage,
      searchCourses,
      filterCourses,
      resetSearch,
      changePage,
      confirmDelete,
      deleteCourse,
      formatDate,
      getDepartmentName,
      getPrerequisiteName,
      getStatusBadgeClass,
      getTimeRemaining,
      canDelete
    }
  }
}
</script>