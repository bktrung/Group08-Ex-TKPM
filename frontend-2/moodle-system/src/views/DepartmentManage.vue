<template>
    <div class="container-fluid px-5 mt-5">
      <h2 class="mb-4 text-center">Quản lý Khoa</h2>
  
      <div class="row mb-3">
        <div class="col-md-4">
          <button class="btn btn-success" @click="openAddDepartmentModal">+ Thêm Khoa</button>
        </div>
      </div>
  
      <div class="table-responsive">
        <table class="table table-bordered table-striped">
          <thead class="table-primary text-center">
            <tr>
              <th>STT</th>
              <th>Tên Khoa</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="loading" class="text-center">
              <td colspan="3">
                <div class="spinner-border text-primary" role="status">
                  <span class="visually-hidden">Loading...</span>
                </div>
              </td>
            </tr>
            <tr v-else-if="departments.length === 0" class="text-center">
              <td colspan="3">Không có khoa nào. Vui lòng thêm khoa mới.</td>
            </tr>
            <tr v-for="(department, index) in departments" :key="department._id" v-else>
              <td class="text-center">{{ index + 1 }}</td>
              <td>{{ department.name }}</td>
              <td class="text-center">
                <button class="btn btn-warning btn-sm" @click="openEditDepartmentModal(department)">Sửa</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
  
      <div class="modal fade" id="departmentModal" tabindex="-1" aria-hidden="true" ref="modalRef">
        <div class="modal-dialog">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">{{ isEditing ? 'Chỉnh sửa Khoa' : 'Thêm Khoa' }}</h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body">
              <form @submit.prevent="saveDepartment">
                <div class="mb-3">
                  <label for="departmentName" class="form-label">Tên Khoa</label>
                  <input 
                    type="text" 
                    id="departmentName" 
                    v-model="departmentName" 
                    class="form-control" 
                    required
                    @keyup.enter="saveDepartment"
                  >
                </div>
              </form>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Đóng</button>
              <button type="button" class="btn btn-primary" @click="saveDepartment" :disabled="!departmentName.trim()">
                Lưu
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
    name: 'DepartmentManage',
    setup() {
      const store = useStore()
      const departmentName = ref('')
      const editingDepartmentId = ref(null)
      const modalRef = ref(null)
      const departmentModal = ref(null)
  
      // Computed properties
      const departments = computed(() => store.state.department.departments)
      const loading = computed(() => store.state.department.loading)
      const isEditing = computed(() => Boolean(editingDepartmentId.value))
  
      // Methods
      const openAddDepartmentModal = () => {
        editingDepartmentId.value = null
        departmentName.value = ''
        departmentModal.value.show()
      }
  
      const openEditDepartmentModal = (department) => {
        editingDepartmentId.value = department._id
        departmentName.value = department.name
        departmentModal.value.show()
      }
  
      const saveDepartment = async () => {
        if (!departmentName.value.trim()) return
  
        try {
          if (isEditing.value) {
            await store.dispatch('department/updateDepartment', {
              id: editingDepartmentId.value,
              department: { name: departmentName.value.trim() }
            })
          } else {
            await store.dispatch('department/createDepartment', {
              name: departmentName.value.trim()
            })
          }
          
          departmentModal.value.hide()
        } catch (error) {
          console.error('Error saving department:', error)
          alert(`Lỗi khi ${isEditing.value ? 'cập nhật' : 'thêm'} khoa: ${error.message}`)
        }
      }
  
      // Lifecycle hooks
      onMounted(async () => {
        await store.dispatch('department/fetchDepartments')
        
        // Initialize Bootstrap modal
        const modalElement = document.getElementById('departmentModal')
        if (modalElement) {
          departmentModal.value = new Modal(modalElement)
        }
      })
  
      return {
        departments,
        loading,
        departmentName,
        isEditing,
        modalRef,
        openAddDepartmentModal,
        openEditDepartmentModal,
        saveDepartment
      }
    }
  }
  </script>