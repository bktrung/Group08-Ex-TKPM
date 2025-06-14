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
              <button class="btn btn-warning btn-sm" @click="openEditStatusModal(status)">{{ $t('common.edit')
              }}</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <BaseModal :title="modalTitle" :itemName="statusType" :placeholderTitle="$t('student.status.enter')"
      :showModal="isModalOpen" @save="saveStatus" @close="isModalOpen = false" />

    <ErrorModal :showModal="showErrorModal" :title="$t('common.error')" :message="errorMessage"
      :isTranslated="isErrorTranslated" @update:showModal="showErrorModal = $event" />

  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useStore } from 'vuex'
import BaseModal from '../components/layout/BaseModal.vue'
import ErrorModal from '../components/layout/ErrorModal.vue'
import { useI18n } from 'vue-i18n'

export default {
  components: {
    BaseModal,
    ErrorModal
  },
  setup() {
    const { t } = useI18n()
    const store = useStore()
    const statusType = ref('')
    const originalStatusType = ref('')
    const editingStatusId = ref(null)
    const isModalOpen = ref(false)

    const statusTypes = computed(() => store.state.status.statusTypes)
    const loading = computed(() => store.state.status.loading)
    const isEditing = computed(() => Boolean(editingStatusId.value))

    const showErrorModal = ref(false)
    const errorMessage = ref('')

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

    const saveStatus = async (name) => {
      const trimmedName = name.trim();

      if (!trimmedName || trimmedName === originalStatusType.value) {
        isModalOpen.value = false;
        return;
      }

      try {
        const payload = { type: trimmedName };

        if (isEditing.value) {
          await store.dispatch('status/updateStatusType', {
            id: editingStatusId.value,
            statusType: payload
          });
        } else {
          await store.dispatch('status/createStatusType', payload);
        }

        isModalOpen.value = false;

      } catch (error) {
        errorMessage.value = store.state.status?.error || error.message || t('common.error_occurred');
        showErrorModal.value = true;
      }
    };

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
      saveStatus,
      showErrorModal,
      errorMessage
    }
  }
}
</script>
