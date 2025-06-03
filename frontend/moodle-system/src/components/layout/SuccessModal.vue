<template>
    <div class="modal fade" ref="modalRef" tabindex="-1">
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header bg-success text-white">
                    <h5 class="modal-title">{{ title }}</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" :aria-label="t('common.close')"
                        @click="closeModal"></button>
                </div>
                <div class="modal-body">
                    ✅ {{ message }}
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-success" data-bs-dismiss="modal" @click="handleConfirm">
                        OK
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
    name: 'SuccessModal',

    props: {
        showModal: {
            type: Boolean,
            required: true,
        },
        title: {
            type: String,
            required: true,
        },
        message: {
            type: String,
            required: true,
        },
    },

    emits: ['close', 'confirm', 'update:showModal'],

    setup(props, { emit }) {
        const modalRef = ref(null)
        let bootstrapModal = null
        const { t } = useI18n()

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

        watch(
            () => props.showModal,
            (visible) => {
                if (bootstrapModal) {
                    visible ? bootstrapModal.show() : bootstrapModal.hide()
                }
            }
        )

        const closeModal = () => {
            if (bootstrapModal) {
                bootstrapModal.hide()
            }
        }

        const handleConfirm = () => {
            emit('confirm')
            closeModal()
        }

        return {
            modalRef,
            closeModal,
            handleConfirm,
            t,
        }
    },
}
</script>
