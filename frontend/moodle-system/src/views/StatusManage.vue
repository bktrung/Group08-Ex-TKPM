<template>
  <div class="container-fluid px-5 mt-5">
    <h2 class="mb-4 text-center">Quản lý Tình trạng sinh viên</h2>

    <div class="row mb-3">
      <div class="col-md-4">
        <button class="btn btn-success" @click="openAddStatusModal">+ Thêm Tình trạng</button>
      </div>
    </div>

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

    <BaseModal
      :title="modalTitle"
      :itemName="statusType"
      placeholderTitle = "Nhập tình trạng"
      :showModal="isModalOpen"
      @save="saveStatus"
      @close="isModalOpen = false"
    />
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useStore } from 'vuex'
import BaseModal from '../components/layout/BaseModal.vue'

export default {
  components: { BaseModal },
  setup() {
    const store = useStore()
    const statusType = ref('')
    const originalStatusType = ref('')
    const editingStatusId = ref(null)
    const isModalOpen = ref(false)

    const statusTypes = computed(() => store.state.status.statusTypes)
    const loading = computed(() => store.state.status.loading)
    const isEditing = computed(() => Boolean(editingStatusId.value))

    const modalTitle = computed(() => (isEditing.value ? 'Chỉnh sửa Tình trạng' : 'Thêm Tình trạng'))

    const openAddStatusModal = () => {
      editingStatusId.value = null
      statusType.value = ''
      isModalOpen.value = true
    }

    const openEditStatusModal = (status) => {
      editingStatusId.value = status._id
      statusType.value = status.type
      originalStatusType.value = status.type
      isModalOpen.value = true
    }

    const saveStatus = async (name) => {
      if (!name.trim()) return
      if (name.trim() === originalStatusType.value) {
        isModalOpen.value = false
        return
      }

      try {
        if (isEditing.value) {
          await store.dispatch('status/updateStatusType', {
            id: editingStatusId.value,
            statusType: { type: name.trim() }
          })
        } else {
          await store.dispatch('status/createStatusType', { type: name.trim() })
        }
        isModalOpen.value = false
      } catch (error) {
        console.error('Error saving status type:', error)
        alert(`Lỗi khi ${isEditing.value ? 'cập nhật' : 'thêm'} tình trạng: ${error.message}`)
      }
    }

    onMounted(async () => {
      await store.dispatch('status/fetchStatusTypes')
    })

    return {
      statusTypes,
      loading,
      statusType,
      modalTitle,
      isModalOpen,
      openAddStatusModal,
      openEditStatusModal,
      saveStatus
    }
  }
}
</script>
