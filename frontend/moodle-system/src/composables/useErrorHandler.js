import { ref } from 'vue'
import { useI18n } from 'vue-i18n'

export function useErrorHandler() {
    const { t } = useI18n()
    const errorMessage = ref('')
    const isErrorTranslated = ref(false)
    const showErrorModal = ref(false)

    const handleError = (error, fallbackKey = 'common.error') => {
        if (error.response?.data?.message) {
            errorMessage.value = error.response.data.message
            isErrorTranslated.value = true
        } else if (error.response?.data?.errors) {
            const errors = Object.values(error.response.data.errors)
            errorMessage.value = errors.join(', ')
            isErrorTranslated.value = true
        } else {
            errorMessage.value = error.message || t(fallbackKey)
            isErrorTranslated.value = false
        }
        showErrorModal.value = true
    }

    const clearError = () => {
        errorMessage.value = ''
        isErrorTranslated.value = false
        showErrorModal.value = false
    }

    return {
        errorMessage,
        isErrorTranslated,
        showErrorModal,
        handleError,
        clearError
    }
}