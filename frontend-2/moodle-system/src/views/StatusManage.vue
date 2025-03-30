<template>
    <div class="container-fluid px-5 mt-5">
      <h2 class="mb-4 text-center">Quản lý Tình trạng sinh viên</h2>
  
      <div class="row mb-3">
        <div class="col-md-4">
          <button class="btn btn-success" @click="openAddStatusModal">+ Thêm Tình trạng</button>
        </div>
      </div>
  
      <!-- Status types table -->
      <div class="table-responsive">
        <table class="table table-bordered table-striped">
          <thead class="table-primary text-center">
            <tr>
              <th>STT</th>
              <th>Tình trạng sinh viên</th>
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
            <tr v-else-if="statusTypes.length === 0" class="text-center">
              <td colspan="3">Không có tình trạng nào. Vui lòng thêm tình trạng mới.</td>
            </tr>
            <tr v-for="(status, index) in statusTypes" :key="status._id" v-else>
              <td class="text-center">{{ index + 1 }}</td>
              <td>{{ status.type }}</td>
              <td class="text-center">
                <button class="btn btn-warning btn-sm" @click="openEditStatusModal(status)">Sửa</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
  
      <!-- Status Modal (Add/Edit) -->
      <div class="modal fade" id="statusModal" tabindex="-1" aria-hidden="true" ref="modalRef">
        <div class="modal-dialog">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">{{ isEditing ? 'Chỉnh sửa Tình trạng' : 'Thêm Tình trạng' }}</h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body">
              <form @submit.prevent="saveStatus">
                <div class="mb-3">
                  <label for="statusType" class="form-label">Tình trạng sinh viên</label>
                  <input 
                    type="text" 
                    id="statusType" 
                    v-model="statusType" 
                    class="form-control" 
                    required
                    @keyup.enter="saveStatus"
                  >
                </div>
              </form>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Đóng</button>
              <button type="button" class="btn btn-primary" @click="saveStatus" :disabled="!statusType.trim()">
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
    name: 'StatusManage',
    setup() {
      const store = useStore()
      const statusType = ref('')
      const editingStatusId = ref(null)
      const modalRef = ref(null)
      const statusModal = ref(null)
  
      // Computed properties
      const statusTypes = computed(() => store.state.status.statusTypes)
      const loading = computed(() => store.state.status.loading)
      const isEditing = computed(() => Boolean(editingStatusId.value))
  
      // Methods
      const openAddStatusModal = () => {
        editingStatusId.value = null
        statusType.value = ''
        statusModal.value.show()
      }
  
      const openEditStatusModal = (status) => {
        editingStatusId.value = status._id
        statusType.value = status.type
        statusModal.value.show()
      }
  
      const saveStatus = async () => {
        if (!statusType.value.trim()) return
  
        try {
          if (isEditing.value) {
            await store.dispatch('status/updateStatusType', {
              id: editingStatusId.value,
              statusType: { type: statusType.value.trim() }
            })
          } else {
            await store.dispatch('status/createStatusType', {
              type: statusType.value.trim()
            })
          }
          
          statusModal.value.hide()
        } catch (error) {
          console.error('Error saving status type:', error)
          alert(`Lỗi khi ${isEditing.value ? 'cập nhật' : 'thêm'} tình trạng: ${error.message}`)
        }
      }
  
      // Lifecycle hooks
      onMounted(async () => {
        await store.dispatch('status/fetchStatusTypes')
        
        // Initialize Bootstrap modal
        const modalElement = document.getElementById('statusModal')
        if (modalElement) {
          statusModal.value = new Modal(modalElement)
        }
      })
  
      return {
        statusTypes,
        loading,
        statusType,
        isEditing,
        modalRef,
        openAddStatusModal,
        openEditStatusModal,
        saveStatus
      }
    }
  }
  </script>