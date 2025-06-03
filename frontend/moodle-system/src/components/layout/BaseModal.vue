<template>
  <div class="modal fade" ref="modalRef" tabindex="-1">
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">{{ title }}</h5>
          <button type="button" class="btn-close" @click="closeModal"></button>
        </div>
        <div class="modal-body">
          <input v-model="itemNameLocal" class="form-control" :placeholder="placeholderTitle" />
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" @click="closeModal">{{ $t('common.close') }}</button>
          <button type="button" class="btn btn-primary" @click="handleSubmit">{{ $t('common.save') }}</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, watch, onMounted, nextTick } from 'vue'
import { Modal } from 'bootstrap'
import { useI18n } from 'vue-i18n'

export default {
  props: {
    title: String,
    placeholderTitle: String,
    itemName: String,
    showModal: Boolean
  },
  emits: ['save', 'close'],
  setup(props, { emit }) {
    const { t } = useI18n()
    t('common.close')
    const modalRef = ref(null)
    let bootstrapModal = null
    const itemNameLocal = ref(props.itemName)

    watch(() => props.itemName, (newVal) => {
      itemNameLocal.value = newVal
    })

    onMounted(async () => {
      await nextTick()
      if (modalRef.value) {
        bootstrapModal = new Modal(modalRef.value)
      }
    })

    watch(() => props.showModal, (newVal) => {
      if (newVal && bootstrapModal) {
        bootstrapModal.show()
      }
    })

    const closeModal = () => {
      bootstrapModal.hide()
      emit('close')
    }

    const handleSubmit = () => {
      if (!itemNameLocal.value.trim()) return
      emit('save', itemNameLocal.value.trim())
      closeModal()
    }

    return { modalRef, itemNameLocal, handleSubmit, closeModal }
  }
}
</script>
