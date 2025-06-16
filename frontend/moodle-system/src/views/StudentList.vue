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
                <router-link :to="`/students/edit/${student.studentId}`" class="btn btn-warning btn-sm">{{
                  $t('common.edit') }}</router-link>
                <button @click="confirmDelete(student)" class="btn btn-danger btn-sm">{{ $t('common.delete') }}</button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Pagination -->
    <BasePagination :currentPage="currentPage" :totalPages="totalPages" :maxVisible="5" @change="changePage" />
    
    <StudentImportExport />

    <ConfirmModal :showModal="showConfirmModal" :title="$t('common.confirm_delete')"
      :message="`${$t('student.delete.confirm')} ${studentToDelete?.fullName}?`" 
      @update:showModal="showConfirmModal = $event" @confirm="deleteStudent" />

    <!-- Success Modal -->
    <SuccessModal 
      :showModal="showSuccessModal" 
      :title="$t('common.success')" 
      :message="successMessage"
      @update:showModal="showSuccessModal = $event" 
    />

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
import { useStore } from 'vuex'
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useErrorHandler } from '@/composables/useErrorHandler'
import StudentImportExport from '@/components/student/ImportExport.vue'
import ConfirmModal from '@/components/layout/ConfirmModal.vue'
import BasePagination from '@/components/layout/BasePagination.vue'
import SuccessModal from '@/components/layout/SuccessModal.vue'
import ErrorModal from '@/components/layout/ErrorModal.vue'

export default {
  name: 'StudentList',
  components: {
    StudentImportExport,
    ConfirmModal,
    BasePagination,
    SuccessModal,
    ErrorModal
  },

  setup() {
    const { t } = useI18n()
    const store = useStore()
    const { errorMessage, isErrorTranslated, showErrorModal, handleError } = useErrorHandler()
    
    const initialDataLoaded = ref(false)
    const searchQuery = ref('')
    const selectedDepartment = ref('')
    const studentToDelete = ref(null)
    const successMessage = ref('')

    const students = computed(() => store.state.student.students)
    const loading = computed(() => store.state.student.loading)
    const currentPage = computed(() => store.state.student.currentPage)
    const totalPages = computed(() => store.state.student.totalPages)
    const departments = computed(() => store.state.department.departments)

    const showConfirmModal = ref(false)
    const showSuccessModal = ref(false)

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
      try {
        await Promise.all([
          store.dispatch('student/fetchStudents', { page: currentPage.value }),
          store.dispatch('department/fetchDepartments')
        ])
        initialDataLoaded.value = true
      } catch (error) {
        console.error('Error loading data:', error)
        handleError(error, 'common.loading_error')
      }
    }

    const search = async () => {
      try {
        await store.dispatch('student/searchStudents', {
          query: searchQuery.value,
          departmentId: selectedDepartment.value,
          page: 1
        })
      } catch (error) {
        console.error('Error searching students:', error)
        handleError(error, 'student.search_error')
      }
    }

    const resetSearch = async () => {
      searchQuery.value = ''
      selectedDepartment.value = ''
      await loadData()
    }

    const changePage = async (page) => {
      if (page >= 1 && page <= totalPages.value) {
        try {
          if (searchQuery.value || selectedDepartment.value) {
            await store.dispatch('student/searchStudents', {
              query: searchQuery.value,
              departmentId: selectedDepartment.value,
              page
            })
          } else {
            await store.dispatch('student/fetchStudents', { page })
          }
        } catch (error) {
          console.error('Error changing page:', error)
          handleError(error, 'student.pagination_error')
        }
      }
    }

    const confirmDelete = (student) => {
      studentToDelete.value = student
      showConfirmModal.value = true
    }

    const deleteStudent = async () => {
      if (studentToDelete.value) {
        try {
          await store.dispatch('student/deleteStudent', studentToDelete.value.studentId)
          showConfirmModal.value = false
          
          successMessage.value = t('student.delete.success', { name: studentToDelete.value.fullName })
          showSuccessModal.value = true

          // Refresh the data
          if (store.state.student.isSearchMode) {
            await search()
          } else {
            await loadData()
          }
        } catch (error) {
          console.error('Error deleting student:', error)
          handleError(error, 'student.delete.error')
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

    onMounted(async () => {
      await loadData()
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
      initialDataLoaded,
      showConfirmModal,
      showSuccessModal,
      successMessage,
      errorMessage,
      isErrorTranslated,
      showErrorModal,
      search,
      resetSearch,
      changePage,
      confirmDelete,
      deleteStudent,
      formatDate,
      formatAddress,
      getDepartmentName,
      getProgramName,
      getStatusName
    }
  }
}
</script>