<template>
  <div>
    <!-- Search and filters -->
    <div class="row mb-3">
      <div class="col-md-8">
        <div class="input-group">
          <select v-model="selectedDepartment" class="form-select" @change="filterCourses">
            <option value="">Tất cả khoa</option>
            <option v-for="dept in departments" :key="dept._id" :value="dept._id">
              {{ dept.name }}
            </option>
          </select>
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
      <div class="col-md-4 text-end">
        <button @click="$emit('add-course')" class="btn btn-success">+ Thêm Khóa Học</button>
      </div>
    </div>

    <!-- Course table -->
    <div class="table-responsive">
      <table class="table table-bordered table-striped">
        <thead class="table-primary text-center">
          <tr>
            <th @click="sortBy('courseCode')">
              Mã khóa học
              <i v-if="sortField === 'courseCode'" 
                :class="sortDirection === 'asc' ? 'bi bi-arrow-up' : 'bi bi-arrow-down'"></i>
            </th>
            <th @click="sortBy('name')">
              Tên khóa học
              <i v-if="sortField === 'name'" 
                :class="sortDirection === 'asc' ? 'bi bi-arrow-up' : 'bi bi-arrow-down'"></i>
            </th>
            <th @click="sortBy('credits')">
              Tín chỉ
              <i v-if="sortField === 'credits'" 
                :class="sortDirection === 'asc' ? 'bi bi-arrow-up' : 'bi bi-arrow-down'"></i>
            </th>
            <th>Khoa phụ trách</th>
            <th>Mô tả</th>
            <th>Môn tiên quyết</th>
            <th>Trạng thái</th>
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
                Không tìm thấy khóa học phù hợp với tìm kiếm của bạn.
              </div>
              <div v-else>
                Chưa có khóa học nào. Vui lòng thêm khóa học mới.
              </div>
            </td>
          </tr>
          <tr v-for="course in paginatedCourses" :key="course._id" v-else>
            <td>{{ course.courseCode }}</td>
            <td>{{ course.name }}</td>
            <td class="text-center">{{ course.credits }}</td>
            <td>{{ getDepartmentName(course.department) }}</td>
            <td>
              <span v-if="course.description.length > 50">
                {{ course.description.slice(0, 50) }}...
                <button class="btn btn-link btn-sm p-0" @click="showDescriptionModal(course)">Xem thêm</button>
              </span>
              <span v-else>{{ course.description }}</span>
            </td>
            <td>
              <span v-if="!course.prerequisites || course.prerequisites.length === 0">
                Không có
              </span>
              <span v-else-if="course.prerequisites.length > 2">
                {{ getPrerequisiteNames(course.prerequisites, 2) }}
                <button class="btn btn-link btn-sm p-0" @click="showPrerequisitesModal(course)">Xem thêm</button>
              </span>
              <span v-else>
                {{ getPrerequisiteNames(course.prerequisites) }}
              </span>
            </td>
            <td class="text-center">
              <span :class="course.isActive ? 'badge bg-success' : 'badge bg-danger'">
                {{ course.isActive ? 'Đang mở' : 'Đã đóng' }}
              </span>
            </td>
            <td class="text-center">
              <div class="d-flex gap-1 justify-content-center">
                <button @click="$emit('edit-course', course)" class="btn btn-warning btn-sm">
                  <i class="bi bi-pencil"></i>
                </button>
                <button v-if="canDelete(course)" @click="confirmDelete(course)" class="btn btn-danger btn-sm">
                  <i class="bi bi-trash"></i>
                </button>
                <button v-else @click="confirmToggleActiveStatus(course)" 
                        :class="course.isActive ? 'btn btn-outline-danger btn-sm' : 'btn btn-outline-success btn-sm'">
                  <i :class="course.isActive ? 'bi bi-x-circle' : 'bi bi-check-circle'"></i>
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
          <option :value="50">50 / trang</option>
        </select>
      </div>
    </div>

    <!-- Delete confirmation modal -->
    <div class="modal fade" id="deleteModal" tabindex="-1" ref="deleteModalRef">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Xác nhận xóa</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body" v-if="selectedCourse">
            <p>Bạn có chắc chắn muốn xóa khóa học <strong>{{ selectedCourse.name }}</strong>?</p>
            <p class="text-muted">Lưu ý: Chỉ có thể xóa khóa học trong vòng 30 phút sau khi tạo.</p>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Hủy</button>
            <button type="button" class="btn btn-danger" @click="deleteCourse">Xóa</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Toggle active status confirmation modal -->
    <div class="modal fade" id="toggleActiveModal" tabindex="-1" ref="toggleActiveModalRef">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">
              {{ selectedCourse && selectedCourse.isActive ? 'Xác nhận đóng khóa học' : 'Xác nhận mở lại khóa học' }}
            </h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body" v-if="selectedCourse">
            <p v-if="selectedCourse.isActive">
              Bạn có chắc chắn muốn đóng khóa học <strong>{{ selectedCourse.name }}</strong>?
              <br>
              <small class="text-muted">Khóa học sẽ không còn được đăng ký nhưng vẫn hiển thị trong lịch sử.</small>
            </p>
            <p v-else>
              Bạn có chắc chắn muốn mở lại khóa học <strong>{{ selectedCourse.name }}</strong>?
            </p>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Hủy</button>
            <button type="button" 
                    :class="selectedCourse && selectedCourse.isActive ? 'btn btn-danger' : 'btn btn-success'" 
                    @click="toggleActiveStatus">
              {{ selectedCourse && selectedCourse.isActive ? 'Đóng khóa học' : 'Mở lại khóa học' }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Description modal -->
    <div class="modal fade" id="descriptionModal" tabindex="-1" ref="descriptionModalRef">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" v-if="selectedCourse">Mô tả khóa học: {{ selectedCourse.name }}</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body" v-if="selectedCourse">
            <p>{{ selectedCourse.description }}</p>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Đóng</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Prerequisites modal -->
    <div class="modal fade" id="prerequisitesModal" tabindex="-1" ref="prerequisitesModalRef">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" v-if="selectedCourse">Môn tiên quyết: {{ selectedCourse.name }}</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body" v-if="selectedCourse">
            <ul class="list-group">
              <li v-for="prereq in prerequisiteCourses" :key="prereq._id" class="list-group-item">
                {{ prereq.courseCode }} - {{ prereq.name }}
              </li>
            </ul>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Đóng</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, watch, onMounted } from 'vue'
import { useStore } from 'vuex'
import { Modal } from 'bootstrap'

export default {
  name: 'CourseList',
  emits: ['add-course', 'edit-course', 'delete-course', 'toggle-active-status'],
  setup(props, { emit }) {
    const store = useStore()
    
    const currentPage = ref(1)
    const pageSize = ref(10)
    
    const searchQuery = ref('')
    const selectedDepartment = ref('')
    const sortField = ref('courseCode')
    const sortDirection = ref('asc')
    
    const selectedCourse = ref(null)
    const prerequisiteCourses = ref([])
    
    const deleteModalRef = ref(null)
    const toggleActiveModalRef = ref(null)
    const descriptionModalRef = ref(null)
    const prerequisitesModalRef = ref(null)
    
    let deleteModal = null
    let toggleActiveModal = null
    let descriptionModal = null
    let prerequisitesModal = null
    
    const courses = computed(() => {
      const courseState = store.state.course;
      
      if (courseState && courseState.courses) {
        if (courseState.courses.courses && Array.isArray(courseState.courses.courses)) {
          return courseState.courses.courses;
        }
        
        if (Array.isArray(courseState.courses)) {
          return courseState.courses;
        }
      }
      
      console.warn('No valid courses array found in state');
      return [];
    })
    
    const departments = computed(() => {
      const departmentsFromStore = store.state.department.departments;
      return departmentsFromStore;
    })
    
    const loading = computed(() => store.state.course.loading)
    
    const filteredCourses = computed(() => {
      
      if (!Array.isArray(courses.value)) {
        console.warn('courses.value is not an array:', courses.value);
        return [];
      }
      
      if (courses.value.length === 0) {
        return [];
      }
      
      let filtered = [...courses.value];
      
      if (selectedDepartment.value) {
        filtered = filtered.filter(course => {
          const deptId = typeof course.department === 'object' 
            ? course.department._id 
            : course.department;
          return deptId === selectedDepartment.value;
        });
      }
      
      if (searchQuery.value) {
        const query = searchQuery.value.toLowerCase()
        filtered = filtered.filter(course => 
          course.courseCode.toLowerCase().includes(query) || 
          course.name.toLowerCase().includes(query)
        )
      }
      
      filtered.sort((a, b) => {
        let aValue = a[sortField.value]
        let bValue = b[sortField.value]
        
        if (sortField.value === 'department') {
          aValue = getDepartmentName(a.department)
          bValue = getDepartmentName(b.department)
        }
        
        if (typeof aValue === 'string') {
          aValue = aValue.toLowerCase()
          bValue = bValue.toLowerCase()
        }
        
        if (sortDirection.value === 'asc') {
          return aValue > bValue ? 1 : -1
        } else {
          return aValue < bValue ? 1 : -1
        }
      })
      
      return filtered
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
      selectedDepartment.value = ''
      currentPage.value = 1
    }
    
    const sortBy = (field) => {
      if (sortField.value === field) {
        sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc'
      } else {
        sortField.value = field
        sortDirection.value = 'asc'
      }
    }
    
    const changePage = (page) => {
      if (page >= 1 && page <= totalPages.value) {
        currentPage.value = page
      }
    }
    
    const confirmDelete = (course) => {
      selectedCourse.value = course
      if (deleteModal) {
        deleteModal.show()
      }
    }
    
    const deleteCourse = () => {
      if (selectedCourse.value) {
        emit('delete-course', selectedCourse.value)
        if (deleteModal) {
          deleteModal.hide()
        }
      }
    }
    
    const confirmToggleActiveStatus = (course) => {
      selectedCourse.value = course
      if (toggleActiveModal) {
        toggleActiveModal.show()
      }
    }
    
    const toggleActiveStatus = () => {
      if (selectedCourse.value) {
        emit('toggle-active-status', selectedCourse.value)
        if (toggleActiveModal) {
          toggleActiveModal.hide()
        }
      }
    }
    
    const showDescriptionModal = (course) => {
      selectedCourse.value = course
      if (descriptionModal) {
        descriptionModal.show()
      }
    }
    
    const showPrerequisitesModal = (course) => {
      selectedCourse.value = course
      
      if (course.prerequisites && course.prerequisites.length > 0) {
        prerequisiteCourses.value = course.prerequisites.map(prereqId => {
          const prereq = courses.value.find(c => {
            const prereqObjId = typeof prereqId === 'object' ? prereqId._id : prereqId
            return c._id === prereqObjId
          })
          return prereq || { courseCode: 'Unknown', name: 'Unknown Course' }
        })
      } else {
        prerequisiteCourses.value = []
      }
      
      if (prerequisitesModal) {
        prerequisitesModal.show()
      }
    }
    
    const getDepartmentName = (department) => {
      if (!department) return 'N/A'
      
      if (typeof department === 'object') {
        return department.name
      }
      
      const dept = departments.value.find(d => d._id === department)
      return dept ? dept.name : 'N/A'
    }
    
    const getPrerequisiteNames = (prerequisites, limit = null) => {
      if (!prerequisites || prerequisites.length === 0) return 'Không có'
      
      const prereqList = prerequisites.map(prereqId => {
        const prereq = courses.value.find(c => {
          const prereqObjId = typeof prereqId === 'object' ? prereqId._id : prereqId
          return c._id === prereqObjId
        })
        return prereq ? `${prereq.courseCode} - ${prereq.name}` : 'Unknown'
      })
      
      if (limit && prereqList.length > limit) {
        return prereqList.slice(0, limit).join(', ') + '...'
      }
      
      return prereqList.join(', ')
    }
    
    const canDelete = (course) => {
      if (!course.createdAt) return false
      
      const createdAt = new Date(course.createdAt)
      const now = new Date()
      const diffInMinutes = Math.floor((now - createdAt) / (1000 * 60))
      
      return diffInMinutes <= 30
    }
    
    watch(pageSize, () => {
      const currentFirstItem = (currentPage.value - 1) * pageSize.value + 1
      currentPage.value = Math.ceil(currentFirstItem / pageSize.value) || 1
    })
    
    onMounted(() => {
      if (document.getElementById('deleteModal')) {
        deleteModal = new Modal(document.getElementById('deleteModal'))
      }
      
      if (document.getElementById('toggleActiveModal')) {
        toggleActiveModal = new Modal(document.getElementById('toggleActiveModal'))
      }
      
      if (document.getElementById('descriptionModal')) {
        descriptionModal = new Modal(document.getElementById('descriptionModal'))
      }
      
      if (document.getElementById('prerequisitesModal')) {
        prerequisitesModal = new Modal(document.getElementById('prerequisitesModal'))
      }
    })
    
    return {
      currentPage,
      pageSize,
      searchQuery,
      selectedDepartment,
      sortField,
      sortDirection,
      loading,
      courses,
      departments,
      filteredCourses,
      paginatedCourses,
      totalPages,
      selectedCourse,
      prerequisiteCourses,
      deleteModalRef,
      toggleActiveModalRef,
      descriptionModalRef,
      prerequisitesModalRef,
      filterCourses,
      resetFilter,
      sortBy,
      changePage,
      confirmDelete,
      deleteCourse,
      confirmToggleActiveStatus,
      toggleActiveStatus,
      showDescriptionModal,
      showPrerequisitesModal,
      getDepartmentName,
      getPrerequisiteNames,
      canDelete
    }
  }
}
</script>

<style scoped>
.table th {
  cursor: pointer;
}
</style>