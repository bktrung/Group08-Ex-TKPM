<template>
  <div class="container-fluid px-5 mt-5">
    <h2 class="mb-4 text-center">Quản lý Lớp Học</h2>

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
        <h4>{{ isEditing ? 'Chỉnh sửa Lớp Học' : 'Thêm Lớp Học Mới' }}</h4>
      </div>
      <div class="card-body">
        <ClassForm 
          :class-data="selectedClass" 
          :is-editing="isEditing"
          @submit="saveClass"
          @cancel="cancelForm"
        />
      </div>
    </div>

    <div v-if="!showForm">
      <!-- Search and filters -->
      <div class="row mb-3">
        <div class="col-md-9">
          <div class="row">
            <div class="col-md-3 mb-2">
              <select v-model="selectedAcademicYear" class="form-select" @change="filterClasses">
                <option value="">Tất cả năm học</option>
                <option v-for="year in academicYears" :key="year" :value="year">
                  {{ year }}
                </option>
              </select>
            </div>
            <div class="col-md-2 mb-2">
              <select v-model="selectedSemester" class="form-select" @change="filterClasses">
                <option value="">Tất cả học kỳ</option>
                <option :value="1">Học kỳ 1</option>
                <option :value="2">Học kỳ 2</option>
                <option :value="3">Học kỳ 3 (Hè)</option>
              </select>
            </div>
            <div class="col-md-7">
              <div class="input-group">
                <input 
                  v-model="searchQuery" 
                  type="text" 
                  class="form-control" 
                  placeholder="Tìm kiếm theo mã, tên khóa học hoặc giảng viên..."
                  @keyup.enter="filterClasses"
                >
                <button @click="filterClasses" class="btn btn-primary">Tìm kiếm</button>
                <button @click="resetFilter" class="btn btn-secondary">Đặt lại</button>
              </div>
            </div>
          </div>
        </div>
        <div class="col-md-3 text-end">
          <button @click="showAddForm" class="btn btn-success">+ Thêm Lớp Học</button>
        </div>
      </div>

      <!-- Classes table -->
      <div class="table-responsive">
        <table class="table table-bordered table-striped">
          <thead class="table-primary text-center">
            <tr>
              <th>Mã lớp</th>
              <th>Khóa học</th>
              <th>Năm học</th>
              <th>Học kỳ</th>
              <th>Giảng viên</th>
              <th>Sĩ số</th>
              <th>Lịch học</th>
              <th>Trạng thái</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="loading" class="text-center">
              <td colspan="9">
                <div class="spinner-border text-primary" role="status">
                  <span class="visually-hidden">Loading...</span>
                </div>
              </td>
            </tr>
            <tr v-else-if="filteredClasses.length === 0" class="text-center">
              <td colspan="9">
                <div v-if="searchQuery || selectedAcademicYear || selectedSemester">
                  Không tìm thấy lớp học phù hợp với tìm kiếm của bạn.
                </div>
                <div v-else>
                  Chưa có lớp học nào. Vui lòng thêm lớp học mới.
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
              <td>
                <button class="btn btn-sm btn-outline-primary" @click="showScheduleModal(classItem)">
                  Xem lịch học
                </button>
              </td>
              <td class="text-center">
                <span :class="classItem.isActive ? 'badge bg-success' : 'badge bg-danger'">
                  {{ classItem.isActive ? 'Đang mở' : 'Đã đóng' }}
                </span>
              </td>
              <td class="text-center">
                <div class="d-flex gap-1 justify-content-center">
                  <button @click="showEditForm(classItem)" class="btn btn-warning btn-sm">
                    <i class="bi bi-pencil"></i>
                  </button>
                  <button @click="confirmToggleStatus(classItem)" 
                          :class="classItem.isActive ? 'btn btn-outline-danger btn-sm' : 'btn btn-outline-success btn-sm'">
                    <i :class="classItem.isActive ? 'bi bi-x-circle' : 'bi bi-check-circle'"></i>
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
          <span>Hiển thị {{ paginatedClasses.length }} / {{ filteredClasses.length }} lớp học</span>
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
    </div>

    <!-- Schedule Modal -->
    <div class="modal fade" id="scheduleModal" tabindex="-1" ref="scheduleModalRef">
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" v-if="selectedClass">
              Lịch học: {{ selectedClass.classCode }} - {{ getCourseInfo(selectedClass.course) }}
            </h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body" v-if="selectedClass && selectedClass.schedule">
            <div class="table-responsive">
              <table class="table table-bordered">
                <thead>
                  <tr class="text-center">
                    <th>Thứ</th>
                    <th>Phòng học</th>
                    <th>Tiết bắt đầu</th>
                    <th>Tiết kết thúc</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(schedule, index) in selectedClass.schedule" :key="index">
                    <td class="text-center">{{ formatDayOfWeek(schedule.dayOfWeek) }}</td>
                    <td>{{ schedule.classroom }}</td>
                    <td class="text-center">{{ schedule.startPeriod }}</td>
                    <td class="text-center">{{ schedule.endPeriod }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Đóng</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Toggle Status Modal -->
    <div class="modal fade" id="toggleStatusModal" tabindex="-1" ref="toggleStatusModalRef">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" v-if="selectedClass">
              {{ selectedClass.isActive ? 'Đóng lớp học' : 'Mở lại lớp học' }}
            </h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body" v-if="selectedClass">
            <p v-if="selectedClass.isActive">
              Bạn có chắc chắn muốn đóng lớp học <strong>{{ selectedClass.classCode }}</strong>?
            </p>
            <p v-else>
              Bạn có chắc chắn muốn mở lại lớp học <strong>{{ selectedClass.classCode }}</strong>?
            </p>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Hủy</button>
            <button 
              type="button" 
              :class="selectedClass && selectedClass.isActive ? 'btn btn-danger' : 'btn btn-success'"
              @click="toggleClassStatus"
            >
              {{ selectedClass && selectedClass.isActive ? 'Đóng lớp học' : 'Mở lại lớp học' }}
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
import ClassForm from '@/components/class/ClassForm.vue'

export default {
  name: 'ClassManage',
  components: {
    ClassForm
  },
  setup() {
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
    const toggleStatusModalRef = ref(null)
    
    // Bootstrap modal instances
    let scheduleModal = null
    let toggleStatusModal = null
    
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
          success.value = `Cập nhật lớp học ${classData.classCode} thành công!`
        } else {
          // Create new class
          await store.dispatch('class/addClass', classData)
          success.value = `Thêm lớp học ${classData.classCode} thành công!`
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
        error.value = `Lỗi: ${err.message || 'Đã xảy ra lỗi khi lưu lớp học'}`
      }
    }
    
    const showScheduleModal = (classItem) => {
      selectedClass.value = classItem
      if (scheduleModal) {
        scheduleModal.show()
      }
    }
    
    const confirmToggleStatus = (classItem) => {
      selectedClass.value = classItem
      if (toggleStatusModal) {
        toggleStatusModal.show()
      }
    }
    
    const toggleClassStatus = async () => {
      try {
        await store.dispatch('class/toggleClassActiveStatus', {
          classCode: selectedClass.value.classCode,
          isActive: !selectedClass.value.isActive
        })
        
        const action = selectedClass.value.isActive ? 'đóng' : 'mở lại'
        success.value = `${action} lớp học ${selectedClass.value.classCode} thành công!`
        
        if (toggleStatusModal) {
          toggleStatusModal.hide()
        }
        
        // Refresh classes data
        await store.dispatch('class/fetchClasses')
        
        // Clear success message after 5 seconds
        setTimeout(() => {
          success.value = ''
        }, 5000)
      } catch (err) {
        error.value = `Lỗi: ${err.message || `Đã xảy ra lỗi khi ${selectedClass.value.isActive ? 'đóng' : 'mở lại'} lớp học`}`
      }
    }
    
    const formatDayOfWeek = (day) => {
      const dayMapping = {
        2: 'Thứ Hai',
        3: 'Thứ Ba',
        4: 'Thứ Tư',
        5: 'Thứ Năm',
        6: 'Thứ Sáu',
        7: 'Thứ Bảy',
        8: 'Chủ Nhật'
      }
      return dayMapping[day] || `Thứ ${day}`
    }
    
    const formatSemester = (semester) => {
      if (semester === 3) return 'Học kỳ hè'
      return `Học kỳ ${semester}`
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
        
        if (document.getElementById('toggleStatusModal')) {
          toggleStatusModal = new Modal(document.getElementById('toggleStatusModal'));
        }
      } catch (err) {
        console.error('Error loading data:', err);
        error.value = `Lỗi: ${err.message || 'Đã xảy ra lỗi khi tải dữ liệu'}`;
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
      toggleStatusModalRef,
      filterClasses,
      resetFilter,
      changePage,
      showAddForm,
      showEditForm,
      cancelForm,
      saveClass,
      showScheduleModal,
      confirmToggleStatus,
      toggleClassStatus,
      formatDayOfWeek,
      formatSemester,
      getCourseInfo,
      getProgressBarClass
    }
  }
}
</script>

<style scoped>
</style>