import { ref } from 'vue'
import { useI18n } from 'vue-i18n'

export function useErrorHandler() {
    const { t } = useI18n()
    const errorMessage = ref('')
    const isErrorTranslated = ref(false)
    const showErrorModal = ref(false)

    const handleError = (error, fallbackKey = 'common.error') => {
        let errorMsg = ''
        
        if (error.response?.data?.message) {
            errorMsg = error.response.data.message
            isErrorTranslated.value = true
        } 
        else if (error.message) {
            errorMsg = error.message
            isErrorTranslated.value = false
        }
        else {
            errorMsg = t(fallbackKey)
            isErrorTranslated.value = false
        }

        if (errorMsg?.includes('Cannot delete course after 30 minutes')) {
            const minutesMatch = errorMsg.match(/created (\d+) minutes ago/)
            const minutes = minutesMatch ? minutesMatch[1] : 'nhiều'
            
            if (isErrorTranslated.value) {
                errorMessage.value = errorMsg
            } else {
                errorMessage.value = `Không thể xóa khóa học sau 30 phút từ khi tạo. Khóa học đã được tạo ${minutes} phút trước.`
                isErrorTranslated.value = false
            }
            showErrorModal.value = true
            return
        }

        if (errorMsg?.includes('Email must belong to one of the accepted domains') || 
            errorMsg?.includes('Email phải thuộc một trong những miền được chấp nhận')) {
            errorMessage.value = errorMsg
            isErrorTranslated.value = true
            showErrorModal.value = true
            return
        }

        if (isErrorTranslated.value) {
            errorMessage.value = errorMsg
        } else {
            try {
                const translated = t(errorMsg)
                errorMessage.value = translated !== errorMsg ? translated : errorMsg
            } catch {
                errorMessage.value = errorMsg
            }
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