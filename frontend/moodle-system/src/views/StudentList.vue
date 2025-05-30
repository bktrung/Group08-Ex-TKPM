<template>
  <div class="container-fluid px-5 mt-5">
    <h2 class="mb-4 text-center">{{ $t('student.management') }}</h2>

    <!-- Search and filters -->
    <div class="row mb-3">
      <div class="col-md-8">
        <div class="row">
          <div class="col-md-4 mb-2">
            <select v-model="selectedDepartment" class="form-select" @change="search">
              <option value="">{{ $t('student.all_deparments') }}...</option>
              <option v-for="dept in departments" :key="dept._id" :value="dept._id">
                {{ dept.name }}
              </option>
            </select>
          </div>
          <div class="col-md-8">
            <div class="input-group">
              <input v-model="searchQuery" type="text" class="form-control" :placeholder="$t('common.search')"
                @keyup.enter="search">
              <button @click="search" class="btn btn-primary">{{ $t('common.search') }}</button>
              <button @click="resetSearch" class="btn btn-secondary">{{ $t('common.reset') }}</button>
            </div>
          </div>
        </div>
      </div>
      <div class="col-md-4 text-end">
        <router-link to="/students/add" class="btn btn-success">+ {{ $t('common.add') }} {{ $t('student.title')
          }}</router-link>
      </div>
    </div>

    <!-- Student table -->
    <div class="table-responsive">
      <table class="table table-bordered table-striped">
        <thead class="table-primary text-center">
          <tr>
            <th>{{ $t('student.student_id') }}</th>
            <th>{{ $t('student.name') }}</th>
            <th>{{ $t('student.dob') }}</th>
            <th>{{ $t('student.gender') }}</th>
            <th>{{ $t('student.department') }}</th>
            <th>{{ $t('student.course') }}</th>
            <th>{{ $t('student.program') }}</th>
            <th>{{ $t('student.address') }}</th>
            <th>{{ $t('student.email') }}</th>
            <th>{{ $t('student.phone') }}</th>
            <th>{{ $t('student.status.title') }}</th>
            <th>{{ $t('common.action') }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="loading" class="text-center">
            <td colspan="12">
              <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">{{ $t('common.loading') }}...</span>
              </div>
            </td>
          </tr>
          <tr v-else-if="students.length === 0" class="text-center">
            <td colspan="12">
              <div v-if="searchQuery || selectedDepartment">
                {{ $t('common.no_result') }}
              </div>
              <div v-else-if="initialDataLoaded">
                {{ $t('student.no_data') }}.
              </div>
              <div v-else>
                <div class="spinner-border text-primary" role="status">
                  <span class="visually-hidden">{{ $t('common.loading') }}...</span>
                </div>
              </div>
            </td>
          </tr>
          <tr v-for="student in students" :key="student.studentId" v-else>
            <td>{{ student.studentId }}</td>
            <td>{{ student.fullName }}</td>
            <td>{{ formatDate(student.dateOfBirth) }}</td>
            <td>{{ student.gender }}</td>
            <td>{{ getDepartmentName(student.department) }}</td>
            <td>{{ student.schoolYear }}</td>
            <td>{{ getProgramName(student.program) }}</td>
            <td>{{ formatAddress(student.mailingAddress) }}</td>
            <td>{{ student.email }}</td>
            <td>{{ student.phoneNumber }}</td>
            <td>{{ getStatusName(student.status) }}</td>
            <td class="text-center">
              <div class="d-flex justify-content-center gap-1">
                <router-link :to="`/students/edit/${student.studentId}`"
                  class="btn btn-warning btn-sm">{{ $t('common.edit') }}</router-link>
                <button @click="confirmDelete(student)" class="btn btn-danger btn-sm">{{ $t('common.delete') }}</button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Pagination -->
    <nav>
      <ul class="pagination justify-content-center">
        <li class="page-item" :class="{ disabled: currentPage === 1 }">
          <a class="page-link" href="#" @click.prevent="changePage(currentPage - 1)">{{ $t('common.previous') }}</a>
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
          <a class="page-link" href="#" @click.prevent="changePage(currentPage + 1)">{{ $t('common.next') }}</a>
        </li>
      </ul>
    </nav>

    <StudentImportExport />

    <div class="modal fade" id="confirmDeleteModal" tabindex="-1" aria-hidden="true" ref="deleteModal">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">{{ $t('common.confirm_delete') }}</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body" v-if="studentToDelete">
            <p>{{ $t('student.delete.confirm') }} <strong>{{ studentToDelete.fullName }}</strong>?</p>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">{{ $t('common.cancel') }}</button>
            <button @click="deleteStudent" type="button" class="btn btn-danger">{{ $t('common.delete') }}</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { useStore } from 'vuex'
import { Modal } from 'bootstrap'
import { useI18n } from 'vue-i18n'
import { ref, computed, onMounted } from 'vue'
import StudentImportExport from '@/components/student/ImportExport.vue'


export default {
  name: 'StudentList',
  components: {
    StudentImportExport
  },
  setup() {
    const { t } = useI18n()
    console.log(t)
    const initialDataLoaded = ref(false);
    const store = useStore()
    const searchQuery = ref('')
    const selectedDepartment = ref('')
    const studentToDelete = ref(null)
    const deleteModal = ref(null)
    const modalRef = ref(null)

    // Computed properties
    const students = computed(() => store.state.student.students)
    const loading = computed(() => store.state.student.loading)
    const currentPage = computed(() => store.state.student.currentPage)
    const totalPages = computed(() => store.state.student.totalPages)
    const departments = computed(() => store.state.department.departments)

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

    const loadData = async () => {
      await Promise.all([
        store.dispatch('student/fetchStudents', { page: currentPage.value }),
        store.dispatch('department/fetchDepartments')
      ]);
      initialDataLoaded.value = true;
    };

    const search = async () => {
      await store.dispatch('student/searchStudents', {
        query: searchQuery.value,
        departmentId: selectedDepartment.value,
        page: 1
      })
    }

    const resetSearch = async () => {
      searchQuery.value = ''
      selectedDepartment.value = ''
      await loadData()
    }

    const changePage = async (page) => {
      if (page >= 1 && page <= totalPages.value) {
        if (searchQuery.value || selectedDepartment.value) {
          await store.dispatch('student/searchStudents', {
            query: searchQuery.value,
            departmentId: selectedDepartment.value,
            page
          })
        } else {
          await store.dispatch('student/fetchStudents', { page })
        }
      }
    }

    const confirmDelete = (student) => {
      studentToDelete.value = student
      deleteModal.value.show()
    }

    const deleteStudent = async () => {
      if (studentToDelete.value) {
        try {
          await store.dispatch('student/deleteStudent', studentToDelete.value.studentId)
          deleteModal.value.hide()

          // Refresh data after deletion
          if (store.state.student.isSearchMode) {
            await search()
          } else {
            await loadData()
          }
        } catch (error) {
          console.error('Error deleting student:', error)
          alert('Lỗi khi xóa sinh viên: ' + error.message)
        }
      }
    }

    const formatDate = (dateString) => {
      if (!dateString) return ''
      return new Date(dateString).toLocaleDateString('vi-VN')
    }

    const formatAddress = (address) => {
      if (!address) return ''
      let parts = []
      if (address.houseNumberStreet) parts.push(address.houseNumberStreet)
      if (address.wardCommune) parts.push(address.wardCommune)
      if (address.districtCounty) parts.push(address.districtCounty)
      if (address.provinceCity) parts.push(address.provinceCity)
      return parts.join(', ')
    }

    const getDepartmentName = (department) => {
      if (!department) return ''
      if (typeof department === 'object') return department.name
      return store.getters['department/getDepartmentName'](department) || department
    }

    const getProgramName = (program) => {
      if (!program) return ''
      if (typeof program === 'object') return program.name
      return store.getters['program/getProgramName'](program) || program
    }

    const getStatusName = (status) => {
      if (!status) return ''
      if (typeof status === 'object') return status.type
      return store.getters['status/getStatusTypeName'](status) || status
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
      students,
      loading,
      currentPage,
      totalPages,
      departments,
      startPage,
      endPage,
      paginationPages,
      searchQuery,
      selectedDepartment,
      studentToDelete,
      modalRef,
      search,
      resetSearch,
      changePage,
      confirmDelete,
      deleteStudent,
      formatDate,
      formatAddress,
      getDepartmentName,
      getProgramName,
      getStatusName,
      initialDataLoaded
    }
  }
}
</script>