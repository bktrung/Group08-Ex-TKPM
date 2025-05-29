<template>
  <div class="container-fluid px-5 mt-5">
    <h2 class="mb-4 text-center">{{ $t('department.management') }}</h2>

    <div class="row mb-3">
      <div class="col-md-4">
        <button class="btn btn-success" @click="openAddDepartmentModal">+ {{ $t('department.add') }}</button>
      </div>
    </div>

    <div class="table-responsive">
      <table class="table table-bordered table-striped">
        <thead class="table-primary text-center">
          <tr>
            <th>{{ $t('common.number') }}</th>
            <th>{{ $t('department.name') }}</th>
            <th>{{ $t('common.action') }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="loading" class="text-center">
            <td colspan="3">
              <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">{{ $t('common.loading') }}</span>
              </div>
            </td>
          </tr>
          <tr v-else-if="departments.length === 0" class="text-center">
            <td colspan="3">{{ $t('department.no_data') }}</td>
          </tr>
          <tr v-for="(department, index) in departments" :key="department._id" v-else>
            <td class="text-center">{{ index + 1 }}</td>
            <td>{{ department.name }}</td>
            <td class="text-center">
              <button class="btn btn-warning btn-sm" @click="openEditDepartmentModal(department)">{{ $t('common.edit')
                }}</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <BaseModal :title="modalTitle" :placeholderTitle="$t('department.enter')" :itemName="departmentName"
      :showModal="isModalOpen" @save="saveDepartment" @close="isModalOpen = false" />
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useStore } from 'vuex'
import BaseModal from '../components/layout/BaseModal.vue'

export default {
  watch: {
  },
  components: { BaseModal },
  setup() {

    const { t } = useI18n()
    console.log(t('department.add_department'))
    const store = useStore()
    const departmentName = ref('')
    const originalDepartmentName = ref('')
    const editingDepartmentId = ref(null)
    const isModalOpen = ref(false)

    const departments = computed(() => store.state.department.departments)
    const loading = computed(() => store.state.department.loading)
    const isEditing = computed(() => Boolean(editingDepartmentId.value))

    const modalTitle = computed(() => (isEditing.value ? t('common.edit') : t('common.add')))

    const openAddDepartmentModal = () => {
      editingDepartmentId.value = null
      departmentName.value = ''
      isModalOpen.value = true
    }

    const openEditDepartmentModal = (department) => {
      editingDepartmentId.value = department._id
      departmentName.value = department.name
      originalDepartmentName.value = department.name
      isModalOpen.value = true
    }

    const saveDepartment = async (name) => {
      if (!name.trim()) return
      if (name.trim() === originalDepartmentName.value) {
        isModalOpen.value = false
        return
      }

      try {
        if (isEditing.value) {
          await store.dispatch('department/updateDepartment', {
            id: editingDepartmentId.value,
            department: { name: name.trim() }
          })
        } else {
          await store.dispatch('department/createDepartment', { name: name.trim() })
        }
        isModalOpen.value = false
      } catch (error) {
        console.error('Error saving department:', error)
        alert(t('common.error_action', {
          action: isEditing.value ? t('common.edit') : t('common.add'),
          target: t('common.department'),
          message: error.message
        }))
      }
    }

    onMounted(async () => {
      await store.dispatch('department/fetchDepartments')
    })

    return {
      departments,
      loading,
      departmentName,
      modalTitle,
      isModalOpen,
      openAddDepartmentModal,
      openEditDepartmentModal,
      saveDepartment
    }
  }
}
</script>
