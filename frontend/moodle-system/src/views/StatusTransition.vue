<template>
    <div class="container-fluid px-5 mt-5">
      <h2 class="mb-4 text-center">{{ $t('statusTransitionRule.title') }}</h2>
  
      <div class="row mb-4">
        <div class="col-md-12">
          <div class="card">
            <div class="card-header bg-primary text-white">
              <h5 class="mb-0">{{ $t('statusTransitionRule.addNew') }}</h5>
            </div>
            <div class="card-body">
              <form @submit.prevent="addTransition">
                <div class="row">
                  <div class="col-md-5">
                    <div class="form-group">
                      <label for="fromStatus">{{ $t('statusTransitionRule.fromStatus') }}:</label>
                      <select class="form-select" id="fromStatus" v-model="fromStatusId" required>
                        <option value="">-- {{ $t('common.choose') }} {{ $t('student.status.title') }} --</option>
                        <option v-for="status in statusTypes" :key="status._id" :value="status._id">
                          {{ status.type }}
                        </option>
                      </select>
                    </div>
                  </div>
                  <div class="col-md-5">
                    <div class="form-group">
                      <label for="toStatus">{{ $t('statusTransitionRule.toStatus') }}:</label>
                      <select class="form-select" id="toStatus" v-model="toStatusId" required>
                        <option value="">-- {{ $t('common.choose') }} {{ $t('student.status.title') }} --</option>
                        <option v-for="status in statusTypes" :key="status._id" :value="status._id" 
                                :disabled="status._id === fromStatusId">
                          {{ status.type }}
                        </option>
                      </select>
                    </div>
                  </div>
                  <div class="col-md-2 d-flex align-items-end">
                    <button type="submit" class="btn btn-primary w-100" 
                            :disabled="!fromStatusId || !toStatusId || loading">
                      <span v-if="loading" class="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
                      {{ $t('statusTransitionRule.addRule') }} 
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
  
      <div class="alert alert-info mb-4">
        <i class="bi bi-info-circle-fill me-2"></i>
        {{ $t('statusTransitionRule.info') }} 
      </div>
  
      <div class="row" v-if="loading && !statusTransitions.length">
        <div class="col-12 text-center py-5">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">L{{ $t('common.loading') }}...</span>
          </div>
        </div>
      </div>
  
      <div class="row" v-else-if="!statusTransitions.length">
        <div class="col-12">
          <div class="alert alert-warning text-center">
            {{ $t('statusTransitionRule.noRules') }} 
          </div>
        </div>
      </div>
  
      <div class="row" v-else>
        <div class="col-md-4" v-for="rule in statusTransitions" :key="rule.fromStatusId">
          <div class="card transition-card">
            <div class="card-header bg-info text-white">
              <h5 class="mb-0">{{ $t('common.from') }}: {{ rule.fromStatus }}</h5>
            </div>
            <div class="card-body">
              <h6>{{ $t('statusTransitionRule.canTransitionTo') }}:</h6>
              <div class="destinations mt-2">
                <span v-for="destination in rule.toStatus" :key="destination._id" class="destination-status">
                  {{ destination.type }}
                  <i class="bi bi-x-circle remove-btn" @click="confirmDeleteTransition(rule.fromStatusId, destination._id, rule.fromStatus, destination.type)"></i>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
  
      <!-- Toast notification -->
      <div class="position-fixed bottom-0 end-0 p-3" style="z-index: 11">
        <div id="toast" class="toast" :class="toastClass" role="alert" aria-live="assertive" aria-atomic="true" ref="toastRef">
          <div class="toast-header" :class="toastHeaderClass">
            <strong class="me-auto">{{ toastTitle }}</strong>
            <button type="button" class="btn-close" data-bs-dismiss="toast" :aria-label="$t('common.close')"></button>
          </div>
          <div class="toast-body">
            {{ toastMessage }}
          </div>
        </div>
      </div>
  
      <!-- Delete confirmation modal -->
      <div class="modal fade" id="confirmDeleteModal" tabindex="-1" aria-hidden="true" ref="deleteModalRef">
        <div class="modal-dialog">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">{{ $t('common.confirm_delete') }}</h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal" :aria-label="$t('common.close')"></button>
            </div>
            <div class="modal-body">
              <p>{{ $t('statusTransitionRule.deleteConfirmText') }}</p>
              <p>{{ $t('common.from') }} <strong>{{ deleteFromStatus }}</strong>  {{ $t('common.to_lowercase') }} <strong>{{ deleteToStatus }}</strong></p>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">{{ $t('common.cancel') }}</button>
              <button type="button" class="btn btn-danger" @click="deleteTransition" :disabled="loading">
                <span v-if="loading" class="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
                {{ $t('common.delete') }}
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
import { Modal, Toast } from 'bootstrap'
import { useI18n } from 'vue-i18n'

export default {
  name: 'StatusTransition',
  setup() {
    const { t } = useI18n()
    console.log(t)
    const store = useStore()
    const fromStatusId = ref('')
    const toStatusId = ref('')
    const deleteModalRef = ref(null)
    const toastRef = ref(null)
    const deleteModal = ref(null)
    const toast = ref(null)
    
    const deleteTransitionData = ref({
      fromStatusId: null,
      toStatusId: null
    })
    const deleteFromStatus = ref('')
    const deleteToStatus = ref('')
    
    const toastTitle = ref(t('common.notification'))
    const toastMessage = ref('')
    const toastType = ref('info')

    const statusTypes = computed(() => store.state.status.statusTypes)
    const statusTransitions = computed(() => store.state.status.statusTransitions)
    const loading = computed(() => store.state.status.loading)
    
    const toastClass = computed(() => {
      return { 'show': toastType.value !== '' && toastMessage.value !== '' }
    })
    
    const toastHeaderClass = computed(() => {
      switch (toastType.value) {
        case 'success': return 'bg-success text-white'
        case 'error': return 'bg-danger text-white'
        default: return 'bg-info text-white'
      }
    })

    const addTransition = async () => {
      if (!fromStatusId.value || !toStatusId.value) return
      
      try {
        await store.dispatch('status/createStatusTransition', {
          fromStatus: fromStatusId.value,
          toStatus: toStatusId.value
        })
        
        fromStatusId.value = ''
        toStatusId.value = ''
        
        showToast(t('common.success'), t('statusTransitionRule.toast.addSuccess'), 'success')
      } catch (error) {
        console.error('Error adding transition rule:', error)
        showToast(t('common.error'), t('transitionRule.toast.addError', { error: error.message }), 'error')
      }
    }
    
    const confirmDeleteTransition = (fromId, toId, fromName, toName) => {
      deleteTransitionData.value = {
        fromStatusId: fromId,
        toStatusId: toId
      }
      deleteFromStatus.value = fromName
      deleteToStatus.value = toName
      
      deleteModal.value.show()
    }
    
    const deleteTransition = async () => {
      try {
        await store.dispatch('status/deleteStatusTransition', {
          fromStatus: deleteTransitionData.value.fromStatusId,
          toStatus: deleteTransitionData.value.toStatusId
        })
        
        deleteModal.value.hide()
        showToast(t('common.success'), t('statusTransitionRule.toast.deleteSuccess'), 'success')
      } catch (error) {
        console.error('Error deleting transition rule:', error)
        showToast(t('common.error'), t('transitionRule.toast.deleteError', { error: error.message }), 'error')
      }
    }
    
    const showToast = (title, message, type = 'info') => {
      if (!message) return;
      
      toastTitle.value = title || t('common.notification');
      toastMessage.value = message;
      toastType.value = type;
      
      if (toast.value) {
        toast.value.show();
      }
    }

    onMounted(async () => {
      await Promise.all([
        store.dispatch('status/fetchStatusTypes'),
        store.dispatch('status/fetchStatusTransitions')
      ])
      
      const modalElement = document.getElementById('confirmDeleteModal')
      if (modalElement) {
        deleteModal.value = new Modal(modalElement)
      }
      
      const toastElement = document.getElementById('toast')
      if (toastElement) {
        toast.value = new Toast(toastElement, { delay: 3000 })
      }
    })

    return {
      statusTypes,
      statusTransitions,
      loading,
      fromStatusId,
      toStatusId,
      deleteModalRef,
      toastRef,
      deleteFromStatus,
      deleteToStatus,
      toastTitle,
      toastMessage,
      toastClass,
      toastHeaderClass,
      addTransition,
      confirmDeleteTransition,
      deleteTransition
    }
  }
}
</script>

<style scoped>
.destination-status {
  margin: 5px;
  padding: 8px 15px;
  display: inline-block;
  border-radius: 20px;
  background-color: #e9ecef;
}

.destination-status .remove-btn {
  margin-left: 8px;
  cursor: pointer;
  color: #dc3545;
}

.remove-btn:hover {
  color: #bb2d3b;
}

.transition-card {
  margin-bottom: 20px;
}
</style>