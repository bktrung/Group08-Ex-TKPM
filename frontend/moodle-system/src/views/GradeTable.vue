<template>
    <div class="transcript-generator">
        <h2>{{ $t('student.grade.table') }}</h2>

        <div class="form-group">
            <label for="studentId">{{ $t('student.enter_student_id') }}:</label>
            <input v-model="studentId" type="text" id="studentId" class="form-control"
                :placeholder="$t('student.enter_student_id')" />
        </div>

        <button @click="generateTranscript" class="btn btn-primary" :disabled="loading">
            <span v-if="loading" class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
            {{ $t('student.grade.create') }}
        </button>
        <button v-if="pdfGenerated" @click="downloadPDF" class="btn btn-success">{{ $t('common.download') }} PDF</button>

        <div id="pdf-content" style="margin-top: 20px; background: white; padding: 20px;">
            <div v-if="transcriptData">
                <h3>{{ $t('student.student_info') }}</h3>
                <p>{{ $t('student.student_id') }}: {{ transcriptData.metadata.transcript.studentInfo.studentId }}</p>
                <p>{{ $t('student.name') }}: {{ transcriptData.metadata.transcript.studentInfo.fullName }}</p>
                <p>{{ $t('student.department') }}: {{ transcriptData.metadata.transcript.studentInfo.department }}</p>
                <p>{{ $t('student.program') }}: {{ transcriptData.metadata.transcript.studentInfo.program }}</p>

                <h4>{{ $t('student.subject') }}</h4>
                <ul>
                    <li v-for="(course, index) in transcriptData.metadata.transcript.courses" :key="index">
                        {{ course.courseName }} - {{ $t('student.grade.title') }}: {{ course.totalScore }}
                    </li>
                </ul>

                <h4>{{ $t('student.grade.summary.title') }}</h4>
                <p>{{ $t('student.grade.summary.totalCredits') }}: {{
                    transcriptData.metadata.transcript.summary.totalCredits }}</p>
                <p>{{ $t('student.grade.summary.gpaOutOf10') }}: {{
                    transcriptData.metadata.transcript.summary.gpaOutOf10 }}</p>
                <p>{{ $t('student.grade.summary.gpaOutOf4') }}: {{ transcriptData.metadata.transcript.summary.gpaOutOf4
                    }}</p>
            </div>
        </div>

        <!-- Error Modal -->
        <ErrorModal 
            :showModal="showErrorModal" 
            :title="$t('common.error')" 
            :message="errorMessage"
            :isTranslated="isErrorTranslated"
            @update:showModal="showErrorModal = $event" 
        />

    </div>
</template>

<script>
import { ref, nextTick, computed } from 'vue'
import { useStore } from 'vuex'
import { jsPDF } from 'jspdf'
import html2canvas from 'html2canvas'
import { useI18n } from 'vue-i18n'
import { useErrorHandler } from '@/composables/useErrorHandler'
import ErrorModal from '@/components/layout/ErrorModal.vue'

export default {
    name: 'GradeTable',
    components: {
        ErrorModal
    },
    setup() {
        const { t } = useI18n()
        const store = useStore()
        const { errorMessage, isErrorTranslated, showErrorModal, handleError } = useErrorHandler()

        const studentId = ref('')
        const transcriptData = ref(null)
        const pdfDoc = ref(null)
        const pdfGenerated = ref(false)
        
        const loading = computed(() => store.state.transcript.loading)

        const generateTranscript = async () => {
            if (!studentId.value.trim()) {
                handleError({ message: t('student.enter_student_id') }, 'student.enter_student_id')
                return
            }

            try {
                transcriptData.value = await store.dispatch('transcript/getTranscript', studentId.value)

                const error = store.state.transcript.error
                if (error) {
                    pdfGenerated.value = false
                    handleError({ 
                        response: { data: { message: error } }
                    }, 'student.grade.error')
                    return
                }

                if (transcriptData.value && !error) {
                    await nextTick()

                    const element = document.getElementById('pdf-content')
                    const canvas = await html2canvas(element, { scale: 2 })
                    const imgData = canvas.toDataURL('image/png')

                    const pdf = new jsPDF('p', 'mm', 'a4')
                    const pageWidth = pdf.internal.pageSize.getWidth()
                    const imgProps = pdf.getImageProperties(imgData)
                    const imgHeight = (imgProps.height * pageWidth) / imgProps.width

                    pdf.addImage(imgData, 'PNG', 0, 0, pageWidth, imgHeight)
                    pdfDoc.value = pdf
                    pdfGenerated.value = true
                }
            } catch (err) {
                handleError(err, 'student.grade.error')
            }
        }

        const downloadPDF = () => {
            if (pdfDoc.value) {
                pdfDoc.value.save(`bang_diem_${studentId.value}.pdf`)
            }
        }

        return {
            studentId,
            transcriptData,
            pdfGenerated,
            loading,
            errorMessage,
            isErrorTranslated,
            showErrorModal,
            generateTranscript,
            downloadPDF
        }
    }
}
</script>

<style scoped>
.transcript-generator {
    max-width: 600px;
    margin: 0 auto;
    padding: 20px;
    background-color: #f5f5f5;
}

.form-group {
    margin-bottom: 20px;
}

button {
    margin-top: 10px;
    margin-right: 10px;
}
</style>