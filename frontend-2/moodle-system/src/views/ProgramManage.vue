<template>
  <div class="container-fluid px-5 mt-5">
    <h2 class="mb-4 text-center">Quản lý Chương trình đào tạo</h2>

    <div class="row mb-3">
      <div class="col-md-4">
        <button class="btn btn-success" @click="openAddProgramModal">+ Thêm Chương trình</button>
      </div>
    </div>

    <!-- Programs table -->
    <div class="table-responsive">
      <table class="table table-bordered table-striped">
        <thead class="table-primary text-center">
          <tr>
            <th>STT</th>
            <th>Chương trình đào tạo</th>
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
          <tr v-else-if="programs.length === 0" class="text-center">
            <td colspan="3">Không có chương trình đào tạo nào. Vui lòng thêm chương trình mới.</td>
          </tr>
          <tr v-for="(program, index) in programs" :key="program._id" v-else>
            <td class="text-center">{{ index + 1 }}</td>
            <td>{{ program.name }}</td>
            <td class="text-center">
              <button class="btn btn-warning btn-sm" @click="openEditProgramModal(program)">Sửa</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Program Modal (Add/Edit) -->
    <div class="modal fade" id="programModal" tabindex="-1" aria-hidden="true" ref="modalRef">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">{{ isEditing ? 'Chỉnh sửa Chương trình' : 'Thêm Chương trình' }}</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="saveProgram">
              <div class="mb-3">
                <label for="programName" class="form-label">Tên Chương trình đào tạo</label>
                <input 
                  type="text" 
                  id="programName" 
                  v-model="programName" 
                  class="form-control" 
                  required
                  @keyup.enter="saveProgram"
                >
              </div>
            </form>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Đóng</button>
            <button type="button" class="btn btn-primary" @click="saveProgram" :disabled="!programName.trim()">
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
  name: 'ProgramManage',
  setup() {
    const store = useStore()
    const programName = ref('')
    const editingProgramId = ref(null)
    const modalRef = ref(null)
    const programModal = ref(null)

    // Computed properties
    const programs = computed(() => store.state.program.programs)
    const loading = computed(() => store.state.program.loading)
    const isEditing = computed(() => Boolean(editingProgramId.value))

    // Methods
    const openAddProgramModal = () => {
      editingProgramId.value = null
      programName.value = ''
      programModal.value.show()
    }

    const openEditProgramModal = (program) => {
      editingProgramId.value = program._id
      programName.value = program.name
      programModal.value.show()
    }

    const saveProgram = async () => {
      if (!programName.value.trim()) return

      try {
        if (isEditing.value) {
          await store.dispatch('program/updateProgram', {
            id: editingProgramId.value,
            program: { name: programName.value.trim() }
          })
        } else {
          await store.dispatch('program/createProgram', {
            name: programName.value.trim()
          })
        }
        
        programModal.value.hide()
      } catch (error) {
        console.error('Error saving program:', error)
        alert(`Lỗi khi ${isEditing.value ? 'cập nhật' : 'thêm'} chương trình: ${error.message}`)
      }
    }

    // Lifecycle hooks
    onMounted(async () => {
      await store.dispatch('program/fetchPrograms')
      
      // Initialize Bootstrap modal
      const modalElement = document.getElementById('programModal')
      if (modalElement) {
        programModal.value = new Modal(modalElement)
      }
    })

    return {
      programs,
      loading,
      programName,
      isEditing,
      modalRef,
      openAddProgramModal,
      openEditProgramModal,
      saveProgram
    }
  }
}
</script>