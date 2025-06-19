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

        <!-- Improved PDF Content Design -->
        <div id="pdf-content" class="pdf-content">
            <div v-if="transcriptData" class="transcript-document">
                <!-- Header Section with Logo/Letterhead -->
                <div class="document-header">
                    <div class="header-logo">
                        <div class="logo-placeholder">🎓</div>
                    </div>
                    <div class="header-title">
                        <h1>BẢNG ĐIỂM HỌC TẬP</h1>
                        <h2>ACADEMIC TRANSCRIPT</h2>
                        <div class="header-line"></div>
                    </div>
                </div>

                <!-- Student Information Section -->
                <div class="student-info-section">
                    <h3 class="section-title">{{ $t('student.student_info') }}</h3>
                    <div class="info-table">
                        <div class="info-row">
                            <div class="info-label">{{ $t('student.student_id') }}:</div>
                            <div class="info-value">{{ transcriptData.metadata.transcript.studentInfo.studentId }}</div>
                        </div>
                        <div class="info-row">
                            <div class="info-label">{{ $t('student.name') }}:</div>
                            <div class="info-value">{{ transcriptData.metadata.transcript.studentInfo.fullName }}</div>
                        </div>
                        <div class="info-row">
                            <div class="info-label">{{ $t('student.department') }}:</div>
                            <div class="info-value">{{ transcriptData.metadata.transcript.studentInfo.department }}</div>
                        </div>
                        <div class="info-row">
                            <div class="info-label">{{ $t('student.program') }}:</div>
                            <div class="info-value">{{ transcriptData.metadata.transcript.studentInfo.program }}</div>
                        </div>
                    </div>
                </div>

                <!-- Courses Section -->
                <div class="courses-section">
                    <h3 class="section-title">{{ $t('student.subject') }}</h3>
                    <table class="courses-table">
                        <thead>
                            <tr>
                                <th class="course-header">STT</th>
                                <th class="course-header course-name-header">Tên môn học / Course Name</th>
                                <th class="course-header">Điểm / Grade</th>
                                <th class="course-header">Xếp loại / Classification</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="(course, index) in transcriptData.metadata.transcript.courses" :key="index" class="course-row">
                                <td class="course-cell course-index">{{ index + 1 }}</td>
                                <td class="course-cell course-name">{{ course.courseName }}</td>
                                <td class="course-cell course-score">{{ course.totalScore }}</td>
                                <td class="course-cell course-grade">{{ getGradeClassification(course.totalScore) }}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <!-- Summary Section -->
                <div class="summary-section">
                    <h3 class="section-title">{{ $t('student.grade.summary.title') }}</h3>
                    <div class="summary-grid">
                        <div class="summary-item">
                            <div class="summary-label">{{ $t('student.grade.summary.totalCredits') }}</div>
                            <div class="summary-value">{{ transcriptData.metadata.transcript.summary.totalCredits }}</div>
                        </div>
                        <div class="summary-item">
                            <div class="summary-label">{{ $t('student.grade.summary.gpaOutOf10') }}</div>
                            <div class="summary-value">{{ transcriptData.metadata.transcript.summary.gpaOutOf10 }}/10</div>
                        </div>
                        <div class="summary-item">
                            <div class="summary-label">{{ $t('student.grade.summary.gpaOutOf4') }}</div>
                            <div class="summary-value">{{ transcriptData.metadata.transcript.summary.gpaOutOf4 }}/4</div>
                        </div>
                        <div class="summary-item">
                            <div class="summary-label">Xếp loại tốt nghiệp</div>
                            <div class="summary-value">{{ getOverallClassification(transcriptData.metadata.transcript.summary.gpaOutOf10) }}</div>
                        </div>
                    </div>
                </div>

                <!-- Footer Section -->
                <div class="document-footer">
                    <div class="footer-date">
                        <strong>Ngày in: {{ getCurrentDate() }}</strong>
                    </div>
                    <div class="footer-signatures">
                        <div class="signature-block">
                            <div class="signature-title">Sinh viên</div>
                            <div class="signature-name">(Ký tên)</div>
                            <div class="signature-line"></div>
                            <div class="signature-student">{{ transcriptData.metadata.transcript.studentInfo.fullName }}</div>
                        </div>
                        <div class="signature-block">
                            <div class="signature-title">Phòng Đào tạo</div>
                            <div class="signature-name">(Ký tên và đóng dấu)</div>
                            <div class="signature-line"></div>
                        </div>
                    </div>
                </div>
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
                    const canvas = await html2canvas(element, { 
                        scale: 2,
                        useCORS: true,
                        backgroundColor: '#ffffff'
                    })
                    const imgData = canvas.toDataURL('image/png')

                    const pdf = new jsPDF('p', 'mm', 'a4')
                    const pageWidth = pdf.internal.pageSize.getWidth()
                    const pageHeight = pdf.internal.pageSize.getHeight()
                    const imgProps = pdf.getImageProperties(imgData)

                    // Add margins and fit to page
                    const margin = 10
                    const availableWidth = pageWidth - (margin * 2)
                    const availableHeight = pageHeight - (margin * 2)
                    
                    let finalWidth = availableWidth
                    let finalHeight = (imgProps.height * availableWidth) / imgProps.width
                    
                    if (finalHeight > availableHeight) {
                        finalHeight = availableHeight
                        finalWidth = (imgProps.width * availableHeight) / imgProps.height
                    }

                    const xOffset = (pageWidth - finalWidth) / 2
                    const yOffset = margin

                    pdf.addImage(imgData, 'PNG', xOffset, yOffset, finalWidth, finalHeight)
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

        const getGradeClassification = (score) => {
            if (score >= 9.0) return 'Xuất sắc'
            if (score >= 8.0) return 'Giỏi'
            if (score >= 7.0) return 'Khá'
            if (score >= 5.5) return 'Trung bình'
            if (score >= 4.0) return 'Yếu'
            return 'Kém'
        }

        const getOverallClassification = (gpa) => {
            if (gpa >= 9.0) return 'Xuất sắc'
            if (gpa >= 8.0) return 'Giỏi'
            if (gpa >= 7.0) return 'Khá'
            if (gpa >= 5.5) return 'Trung bình'
            return 'Yếu'
        }

        const getCurrentDate = () => {
            return new Date().toLocaleDateString('vi-VN', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            })
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
            downloadPDF,
            getGradeClassification,
            getOverallClassification,
            getCurrentDate
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

/* PDF Content Styles - Hidden from screen view but visible in PDF */
.pdf-content {
    position: absolute;
    left: -9999px;
    top: -9999px;
    width: 210mm; /* A4 width */
    background: white;
    font-family: 'Times New Roman', serif;
}

/* Document Layout */
.transcript-document {
    padding: 15mm;
    min-height: 297mm; /* A4 height */
    background: white;
    color: #000;
    line-height: 1.4;
}

/* Header Section */
.document-header {
    text-align: center;
    margin-bottom: 25px;
    border-bottom: 3px solid #2c5aa0;
    padding-bottom: 15px;
}

.header-logo {
    margin-bottom: 10px;
}

.logo-placeholder {
    font-size: 48px;
    color: #2c5aa0;
}

.header-title h1 {
    font-size: 24px;
    font-weight: bold;
    color: #2c5aa0;
    margin: 5px 0;
    letter-spacing: 2px;
}

.header-title h2 {
    font-size: 16px;
    color: #666;
    margin: 5px 0;
    font-style: italic;
}

.header-line {
    width: 80px;
    height: 3px;
    background: #2c5aa0;
    margin: 10px auto;
}

/* Student Information Section */
.student-info-section {
    margin-bottom: 25px;
    background: #f8f9fa;
    padding: 15px;
    border-left: 4px solid #2c5aa0;
}

.section-title {
    font-size: 18px;
    font-weight: bold;
    color: #2c5aa0;
    margin-bottom: 15px;
    text-transform: uppercase;
    letter-spacing: 1px;
}

.info-table {
    display: table;
    width: 100%;
}

.info-row {
    display: table-row;
    margin-bottom: 8px;
}

.info-label {
    display: table-cell;
    width: 30%;
    font-weight: bold;
    color: #333;
    padding: 5px 15px 5px 0;
    vertical-align: top;
}

.info-value {
    display: table-cell;
    padding: 5px 0;
    color: #000;
    border-bottom: 1px dotted #ccc;
}

/* Courses Section */
.courses-section {
    margin-bottom: 25px;
}

.courses-table {
    width: 100%;
    border-collapse: collapse;
    border: 2px solid #2c5aa0;
    margin-top: 10px;
}

.course-header {
    background: #2c5aa0;
    color: white;
    padding: 12px 8px;
    text-align: center;
    font-weight: bold;
    font-size: 12px;
    border: 1px solid #1e3a8a;
}

.course-name-header {
    text-align: left;
    width: 50%;
}

.course-row:nth-child(even) {
    background: #f8f9fa;
}

.course-row:hover {
    background: #e3f2fd;
}

.course-cell {
    padding: 10px 8px;
    border: 1px solid #ddd;
    font-size: 11px;
}

.course-index {
    text-align: center;
    font-weight: bold;
    width: 8%;
}

.course-name {
    text-align: left;
    width: 50%;
    font-weight: 500;
}

.course-score {
    text-align: center;
    font-weight: bold;
    color: #2c5aa0;
    width: 15%;
}

.course-grade {
    text-align: center;
    font-weight: bold;
    width: 27%;
}

/* Summary Section */
.summary-section {
    margin-bottom: 30px;
    background: #f0f7ff;
    padding: 15px;
    border: 2px solid #2c5aa0;
}

.summary-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 15px;
    margin-top: 10px;
}

.summary-item {
    background: white;
    padding: 12px;
    border-left: 4px solid #2c5aa0;
    border-radius: 4px;
}

.summary-label {
    font-size: 11px;
    color: #666;
    font-weight: bold;
    margin-bottom: 5px;
    text-transform: uppercase;
}

.summary-value {
    font-size: 16px;
    font-weight: bold;
    color: #2c5aa0;
}

/* Footer Section */
.document-footer {
    margin-top: 40px;
    border-top: 2px solid #2c5aa0;
    padding-top: 20px;
}

.footer-date {
    text-align: center;
    margin-bottom: 30px;
    font-size: 12px;
}

.footer-signatures {
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
}

.signature-block {
    text-align: center;
    width: 45%;
}

.signature-title {
    font-weight: bold;
    margin-bottom: 5px;
    font-size: 12px;
    color: #2c5aa0;
}

.signature-name {
    font-style: italic;
    margin-bottom: 50px;
    font-size: 11px;
    color: #666;
}

.signature-line {
    width: 100%;
    height: 1px;
    border-bottom: 1px solid #000;
    margin-bottom: 5px;
}

.signature-student {
    font-weight: bold;
    font-size: 12px;
}

/* Print Styles */
@media print {
    .pdf-content {
        position: static !important;
        left: auto !important;
        top: auto !important;
    }
    
    .transcript-generator > *:not(.pdf-content) {
        display: none !important;
    }
}

/* Show PDF content when generating (for html2canvas) */
.transcript-generator:has(#pdf-content) .pdf-content {
    position: static;
    left: auto;
    top: auto;
    margin-top: 20px;
}
</style>