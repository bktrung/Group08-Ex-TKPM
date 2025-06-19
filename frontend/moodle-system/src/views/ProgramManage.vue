<template>
  <div class="container-fluid px-5 mt-5">
    <h2 class="mb-4 text-center">{{ $t('program.management') }}</h2>

    <div class="row mb-3">
      <div class="col-md-4">
        <button class="btn btn-success" @click="openAddProgramModal">+ {{ $t('common.add') }} {{ $t('program.title')
        }}</button>
      </div>
    </div>

    <div class="table-responsive">
      <table class="table table-bordered table-striped">
        <thead class="table-primary text-center">
          <tr>
            <th>{{ $t('common.number') }}</th>
            <th>{{ $t('program.name') }}</th>
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
          <tr v-else-if="programs.length === 0" class="text-center">
            <td colspan="3">{{ $t('program.no_data') }}.</td>
          </tr>
          <tr v-for="(program, index) in programs" :key="program._id" v-else>
            <td class="text-center">{{ index + 1 }}</td>
            <td>{{ program.name }}</td>
            <td class="text-center">
              <div class="d-flex justify-content-center gap-1">
                <button class="btn btn-warning btn-sm" @click="openEditProgramModal(program)">{{ $t('common.edit')
                }}</button>
                <button @click="openConfirmDeleteModal(program)" class="btn btn-danger btn-sm">{{ $t('common.delete')
                }}</button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <BaseModal :title="modalTitle" :placeholderTitle="$t('program.enter')" :itemName="programName"
      :showModal="isModalOpen" @save="saveProgram" @close="isModalOpen = false" />

    <ConfirmModal :showModal="showConfirmModal" :title="$t('common.confirm_delete')"
      :message="`${$t('program.confirm_delete', { name: programName })}`" @update:showModal="showConfirmModal = $event"
      @confirm="deleteProgram" />

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

    const programName = ref('')
    const originalProgramName = ref('')
    const editingProgramId = ref(null)
    const deletingProgramId = ref(null)
    const isModalOpen = ref(false)
    const showConfirmModal = ref(false)

    const programs = computed(() => store.state.program.programs)
    const loading = computed(() => store.state.program.loading)
    const isEditing = computed(() => Boolean(editingProgramId.value))

    const modalTitle = computed(() => (isEditing.value ? t('common.edit') : t('common.add')))

    const openAddProgramModal = () => {
      editingProgramId.value = null
      programName.value = ''
      isModalOpen.value = true
    }

    const openEditProgramModal = (program) => {
      editingProgramId.value = program._id
      programName.value = program.name
      originalProgramName.value = program.name
      isModalOpen.value = true
    }

    const openConfirmDeleteModal = (program) => {
      programName.value = program.name
      deletingProgramId.value = program._id
      showConfirmModal.value = true
    }

    const saveProgram = async (name) => {
      const trimmedName = name.trim()

      if (!trimmedName || trimmedName === originalProgramName.value) {
        isModalOpen.value = false
        return
      }

      try {
        const payload = { name: trimmedName }

        if (isEditing.value) {
          await store.dispatch('program/updateProgram', {
            id: editingProgramId.value,
            program: payload
          })
        } else {
          await store.dispatch('program/createProgram', payload)
        }

        isModalOpen.value = false

      } catch (error) {
        console.error('Error saving program:', error)
        handleError(error, 'program.save_error')
      }
    }

    const deleteProgram = async () => {
      try {
        await store.dispatch('program/deleteProgram', deletingProgramId.value);
        showConfirmModal.value = false
      } catch (error) {
        console.error('Error deleting program:', error)
        handleError(error, 'common.error')
      }
    };

    onMounted(async () => {
      try {
        await store.dispatch('program/fetchPrograms')
      } catch (error) {
        console.error('Error loading programs:', error)
        handleError(error, 'program.load_error')
      }
    })

    return {
      programs,
      loading,
      programName,
      modalTitle,
      isModalOpen,
      errorMessage,
      isErrorTranslated,
      showErrorModal,
      openAddProgramModal,
      openEditProgramModal,
      saveProgram,
      openConfirmDeleteModal,
      showConfirmModal,
      deleteProgram
    }
  }
}
</script>