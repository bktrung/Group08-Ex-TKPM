import { ref } from 'vue'
import { useI18n } from 'vue-i18n'

export function useErrorHandler() {
    const { t } = useI18n()
    const errorMessage = ref('')
    const isErrorTranslated = ref(false)
    const showErrorModal = ref(false)

    const handleError = (error, fallbackKey = 'common.error') => {
        const errorMsg = error.response?.data?.message || error.message
        
        // Handle course deletion error
        if (errorMsg?.includes('Cannot delete course after 30 minutes')) {
            const minutesMatch = errorMsg.match(/created (\d+) minutes ago/)
            const minutes = minutesMatch ? minutesMatch[1] : 'nhiều'
            
            errorMessage.value = `Không thể xóa khóa học sau 30 phút từ khi tạo. Khóa học đã được tạo ${minutes} phút trước.`
            isErrorTranslated.value = false
            showErrorModal.value = true
            return
        }

        // Handle file upload error
        if (errorMsg?.includes('Only json, csv, xml, xlsx files are allowed')) {
            errorMessage.value = 'Chỉ cho phép tải lên các tệp json, csv, xml, xlsx'
            isErrorTranslated.value = false
            showErrorModal.value = true
            return
        }

        // Handle file upload error (alternative message)
        if (errorMsg?.includes('File upload error')) {
            errorMessage.value = 'Lỗi tải lên tệp: Chỉ cho phép các tệp json, csv, xml, xlsx'
            isErrorTranslated.value = false
            showErrorModal.value = true
            return
        }

        // Handle student ID already exists error
        if (errorMsg?.includes('Student ID already exists')) {
            errorMessage.value = 'Mã sinh viên đã tồn tại'
            isErrorTranslated.value = false
            showErrorModal.value = true
            return
        }

        // Handle course code already exists error
        if (errorMsg?.includes('Course code already exists')) {
            errorMessage.value = 'Mã khóa học đã tồn tại'
            isErrorTranslated.value = false
            showErrorModal.value = true
            return
        }

        // Handle validation errors
        if (errorMsg?.includes('validation failed') || errorMsg?.includes('Validation error')) {
            errorMessage.value = 'Dữ liệu không hợp lệ. Vui lòng kiểm tra lại.'
            isErrorTranslated.value = false
            showErrorModal.value = true
            return
        }

        // Normal handling for other errors
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