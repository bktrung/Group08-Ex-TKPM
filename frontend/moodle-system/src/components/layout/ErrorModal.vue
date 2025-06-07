<template>
    <div class="modal fade" ref="modalRef" tabindex="-1">
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header bg-danger text-white">
                    <h5 class="modal-title">{{ title }}</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" :aria-label="t('common.close')"
                        @click="closeModal"></button>
                </div>
                <div class="modal-body">
                    ❌ {{ displayMessage }}
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-danger" data-bs-dismiss="modal" @click="closeModal">
                        OK
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import { ref, watch, onMounted, nextTick, computed } from 'vue'
import { Modal } from 'bootstrap'
import { useI18n } from 'vue-i18n'

export default {
    name: 'ErrorModal',
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
        isTranslated: {
            type: Boolean,
            default: false
        }
    },
    emits: ['update:showModal', 'close'],

    setup(props, { emit }) {
        const modalRef = ref(null)
        let bootstrapModal = null
        const { t } = useI18n()

        const displayMessage = computed(() => {
            if (props.isTranslated) {
                return props.message
            }
            try {
                const translated = t(props.message)
                return translated !== props.message ? translated : props.message
            } catch {
                return props.message
            }
        })

        onMounted(async () => {
            await nextTick()
            if (modalRef.value) {
                bootstrapModal = new Modal(modalRef.value)
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
            emit('update:showModal', false)
            emit('close')
        }

        return {
            modalRef,
            closeModal,
            displayMessage,
            t
        }
    },
}
</script>