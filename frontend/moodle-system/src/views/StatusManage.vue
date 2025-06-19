<template>
  <div class="container-fluid px-5 mt-5">
    <h2 class="mb-4 text-center">{{ $t('sidebar.status_types') }}</h2>

    <div class="row mb-3">
      <div class="col-md-4">
        <button class="btn btn-success" @click="openAddStatusModal">+ {{ $t('common.add') }} {{
          $t('student.status.title') }}</button>
      </div>
    </div>

    <div class="table-responsive">
      <table class="table table-bordered table-striped">
        <thead class="table-primary text-center">
          <tr>
            <th>{{ $t('common.number') }}</th>
            <th>{{ $t('student.status.title') }}</th>
            <th>{{ $t('common.action') }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="loading" class="text-center">
            <td colspan="3">
              <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">{{ $t('common.loading') }}...</span>
              </div>
            </td>
          </tr>
          <tr v-else-if="statusTypes.length === 0" class="text-center">
            <td colspan="3">{{ $t('student.status.no_data') }}.</td>
          </tr>
          <tr v-for="(status, index) in statusTypes" :key="status._id" v-else>
            <td class="text-center">{{ index + 1 }}</td>
            <td>{{ status.type }}</td>
            <td class="text-center">
              <div class="d-flex justify-content-center gap-1">
                <button class="btn btn-warning btn-sm" @click="openEditStatusModal(status)">{{ $t('common.edit')
                }}</button>
                <button @click="openConfirmDeleteModal(status)" class="btn btn-danger btn-sm">{{ $t('common.delete')
                }}</button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <BaseModal :title="modalTitle" :itemName="statusType" :placeholderTitle="$t('student.status.enter')"
      :showModal="isModalOpen" @save="saveStatus" @close="isModalOpen = false" />

    <ConfirmModal :showModal="showConfirmModal" :title="$t('common.confirm_delete')"
      :message="`${$t('student.status.confirm_delete', { name: statusType })}`" @update:showModal="showConfirmModal = $event"
      @confirm="deleteStatus" />

    <!-- Error Modal -->
    <ErrorModal :showModal="showErrorModal" :title="$t('common.error')" :message="errorMessage"
      :isTranslated="isErrorTranslated" @update:showModal="showErrorModal = $event" />

  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useStore } from 'vuex'
import { useI18n } from 'vue-i18n'
import { useErrorHandler } from '@/composables/useErrorHandler'
import BaseModal from '../components/layout/BaseModal.vue'
import ErrorModal from '../components/layout/ErrorModal.vue'
import ConfirmModal from '../components/layout/ConfirmModal.vue'

export default {
  components: {
    BaseModal,
    ErrorModal,
    ConfirmModal
  },
  setup() {
    const { t } = useI18n()
    const store = useStore()
    const { errorMessage, isErrorTranslated, showErrorModal, handleError } = useErrorHandler()

    const statusType = ref('')
    const originalStatusType = ref('')
    const editingStatusId = ref(null)
    const deletingStatusId = ref(null)
    const isModalOpen = ref(false)
    const showConfirmModal = ref(false)

    const statusTypes = computed(() => store.state.status.statusTypes)
    const loading = computed(() => store.state.status.loading)
    const isEditing = computed(() => Boolean(editingStatusId.value))

    const modalTitle = computed(() => (isEditing.value ? t('common.edit') : t('common.add')))

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

    const openConfirmDeleteModal = (status) => {
      deletingStatusId.value = status._id
      statusType.value = status.type
      showConfirmModal.value = true
    }

    const saveStatus = async (name) => {
      const trimmedName = name.trim()

      if (!trimmedName || trimmedName === originalStatusType.value) {
        isModalOpen.value = false
        return
      }

      try {
        const payload = { type: trimmedName }

        if (isEditing.value) {
          await store.dispatch('status/updateStatusType', {
            id: editingStatusId.value,
            statusType: payload
          })
        } else {
          await store.dispatch('status/createStatusType', payload)
        }

        isModalOpen.value = false

      } catch (error) {
        console.error('Error saving status:', error)
        handleError(error, 'student.status.error_action')
      }
    }

    const deleteStatus = async () => {
      try {
        await store.dispatch('status/deleteStatusType', deletingStatusId.value)
        showConfirmModal.value = false
      } catch (error) {
        console.error('Error deleting status:', error)
        handleError(error, 'common.error')
      }
    }

    onMounted(async () => {
      try {
        await store.dispatch('status/fetchStatusTypes')
      } catch (error) {
        console.error('Error loading status types:', error)
        handleError(error, 'student.status.load_error')
      }
    })

    return {
      statusTypes,
      loading,
      statusType,
      modalTitle,
      isModalOpen,
      errorMessage,
      isErrorTranslated,
      showErrorModal,
      openAddStatusModal,
      openEditStatusModal,
      saveStatus,
      openConfirmDeleteModal,
      showConfirmModal,
      deleteStatus
    }
  }
}
</script>