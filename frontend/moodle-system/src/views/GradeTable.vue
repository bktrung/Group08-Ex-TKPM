<template>
    <div class="transcript-generator">
        <h2>{{ $t('student.grade.table') }}</h2>

        <div class="form-group">
            <label for="studentId">{{ $t('student.enter_student_id') }}:</label>
            <input v-model="studentId" type="text" id="studentId" class="form-control" :placeholder="$t('student.enter_student_id')" />
        </div>

        <button @click="generateTranscript" class="btn btn-primary">{{ $t('student.grade.create') }}</button>
        <button v-if="pdfGenerated" @click="downloadPDF" class="btn btn-success">{{ $t(common.download) }} PDF</button>

        <!-- Nội dung để render thành PDF -->
        <div id="pdf-content" style="margin-top: 20px; background: white; padding: 20px;">
            <div v-if="transcriptData">
                <h3>{{ $t('stundent.student_info')}}</h3>
                <p>{{ $t('student.student_id') }}: {{ transcriptData.metadata.transcript.studentInfo.studentId }}</p>
                <p>{{ $t('student.name') }}: {{ transcriptData.metadata.transcript.studentInfo.fullName }}</p>
                <p>{{ $t('student.department') }}: {{ transcriptData.metadata.transcript.studentInfo.department }}</p>
                <p>{{ $t('student.program') }}: {{ transcriptData.metadata.transcript.studentInfo.program }}</p>

                <h4>{{ $t('student.subject')}}</h4>
                <ul>
                    <li v-for="(course, index) in transcriptData.metadata.transcript.courses" :key="index">
                        {{ course.name }} - {{ $t('student.grade.title') }}: {{ course.grade }}
                    </li>
                </ul>

                <h4>{{ $t('student.grade.summary.title') }}</h4>
                <p>{{ $t('student.grade.summary.totalCredits') }}: {{ transcriptData.metadata.transcript.summary.totalCredits }}</p>
                <p>{{ $t('student.grade.summary.gpaOutOf10') }}: {{ transcriptData.metadata.transcript.summary.gpaOutOf10 }}</p>
                <p>{{ $t('student.grade.summary.gpaOutOf4') }}: {{ transcriptData.metadata.transcript.summary.gpaOutOf4 }}</p>
            </div>
        </div>

        <!-- Modal lỗi -->
        <div class="modal fade" id="errorModal" tabindex="-1" aria-labelledby="errorModalLabel" aria-hidden="true">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header bg-danger text-white">
                        <h5 class="modal-title" id="errorModalLabel">{{ $t('common.failed') }}</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" :aria-label="$t('common.close')"></button>
                    </div>
                    <div class="modal-body">
                        ❌ {{ errorMessage }}
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-danger" data-bs-dismiss="modal">OK</button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import { ref, nextTick } from 'vue'
import { useStore } from 'vuex'
import { jsPDF } from 'jspdf'
import html2canvas from 'html2canvas'
import { Modal } from 'bootstrap'
import { useI18n } from 'vue-i18n'

export default {
    name: 'CreateTranscript',
    setup() {
        const { t } = useI18n()
        const store = useStore()

        const studentId = ref('')
        const transcriptData = ref(null)
        const pdfDoc = ref(null)
        const pdfGenerated = ref(false)
        let errorMessage = ref('')

        const showModal = (id) => {
            const modal = new Modal(document.getElementById(id))
            modal.show()
        }

        const generateTranscript = async () => {
            if (!studentId.value) {
                errorMessage.value = t('student.enter_student_id');
                showModal('errorModal');
                return;
            }

            transcriptData.value = await store.dispatch('transcript/getTranscript', studentId.value);

            const error = store.state.transcript.error;

            if (error) {
                pdfGenerated.value = false;
                errorMessage.value = error;
                showModal('errorModal'); 
            }

            if (transcriptData.value && !error) {
                await nextTick();

                const element = document.getElementById('pdf-content');
                const canvas = await html2canvas(element, { scale: 2 });
                const imgData = canvas.toDataURL('image/png');

                const pdf = new jsPDF('p', 'mm', 'a4');
                const pageWidth = pdf.internal.pageSize.getWidth();
                const imgProps = pdf.getImageProperties(imgData);
                const imgHeight = (imgProps.height * pageWidth) / imgProps.width;

                pdf.addImage(imgData, 'PNG', 0, 0, pageWidth, imgHeight);
                pdfDoc.value = pdf;
                pdfGenerated.value = true;
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
            errorMessage,
            generateTranscript,
            downloadPDF,
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