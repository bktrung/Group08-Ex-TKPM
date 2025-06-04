<template>
    <div class="modal fade" ref="modalRef" tabindex="-1">
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header bg-warning">
                    <h5 class="modal-title">{{ title }}</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" :aria-label="t('common.close')"
                        @click="closeModal"></button>
                </div>
                <div class="modal-body">
                    ⚠️ {{ message }}
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal" @click="closeModal">
                        {{ t('common.cancel') }}
                    </button>
                    <button type="button" class="btn btn-danger" @click="confirmAction">
                        {{ t('common.confirm') }}
                    </button>
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
    name: 'ConfirmModal',

    props: {
        showModal: { type: Boolean, required: true },
        title: { type: String, required: true },
        message: { type: String, required: true }
    },

    emits: ['update:showModal', 'confirm', 'close'],

    setup(props, { emit }) {
        const modalRef = ref(null)
        const { t } = useI18n()
        let bootstrapModal = null

        onMounted(async () => {
            await nextTick()

            if (modalRef.value) {
                try {
                    bootstrapModal = Modal.getOrCreateInstance(modalRef.value)
                } catch (e) {
                    console.error('Failed to initialize Bootstrap modal:', e)
                }

                modalRef.value.addEventListener('hidden.bs.modal', () => {
                    emit('update:showModal', false)
                    emit('close')
                })
            }
        })

        watch(() => props.showModal, (visible) => {
            if (bootstrapModal) {
                visible ? bootstrapModal.show() : bootstrapModal.hide()
            }
        })

        const closeModal = () => {
            if (bootstrapModal) bootstrapModal.hide()
        }

        const confirmAction = () => {
            emit('confirm')
            closeModal()
        }

        return {
            modalRef,
            closeModal,
            confirmAction,
            t
        }
    }
}
</script>
