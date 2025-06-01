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
              <button class="btn btn-warning btn-sm" @click="openEditProgramModal(program)">{{ $t('common.edit')
                }}</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <BaseModal :title="modalTitle" :placeholderTitle="$t('program.enter')" :itemName="programName"
      :showModal="isModalOpen" @save="saveProgram" @close="isModalOpen = false" />
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useStore } from 'vuex'
import BaseModal from '../components/layout/BaseModal.vue'
import { useI18n } from 'vue-i18n'

export default {
  components: { BaseModal },
  setup() {
    const { t } = useI18n()
    const store = useStore()
    const programName = ref('')
    const originalProgramName = ref('')
    const editingProgramId = ref(null)
    const isModalOpen = ref(false)

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

    const saveProgram = async (name) => {
      if (!name.trim()) return
      if (name.trim() === originalProgramName.value) {
        isModalOpen.value = false
        return
      }

      try {
        if (isEditing.value) {
          await store.dispatch('program/updateProgram', {
            id: editingProgramId.value,
            program: { name: name.trim() }
          })
        } else {
          await store.dispatch('program/createProgram', { name: name.trim() })
        }
        isModalOpen.value = false
      } catch (error) {
        console.error('Error saving program:', error)
        alert(t('common.error_action', {
          action: isEditing.value ? t('common.edit') : t('common.add'),
          target: t('program.title'),
          message: error.message
        }))
      }
    }

    onMounted(async () => {
      await store.dispatch('program/fetchPrograms')
    })

    return {
      programs,
      loading,
      programName,
      modalTitle,
      isModalOpen,
      openAddProgramModal,
      openEditProgramModal,
      saveProgram
    }
  }
}
</script>
