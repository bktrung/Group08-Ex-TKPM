<template>
    <div class="container py-4">
        <h3 class="pb-3">{{ $t('enrollment.drop.title') }}</h3>

        <!-- Form input -->
        <div class="mb-3">
            <label class="form-label">{{ $t('student.student_id') }}</label>
            <input v-model="studentId" class="form-control" :placeholder="$t('student.enter_student_id')" />
        </div>

        <div class="mb-3">
            <label class="form-label">{{ $t('class.class_code') }}</label>
            <input v-model="classCode" class="form-control" :placeholder="$t('enrollment.enter_class_code')" />
        </div>

        <div class="mb-3">
            <label class="form-label">{{ $t('enrollment.drop.reason') }}</label>
            <textarea v-model="reason" class="form-control" rows="3"
                :placeholder="$t('enrollment.drop.enter_reason')"></textarea>
        </div>

        <!-- Delete button -->
        <button class="btn btn-danger" @click="confirmDelete">{{ $t('common.delete') }}</button>

        <!-- Confirm delete modal -->
        <div class="modal fade" ref="confirmModalRef" tabindex="-1">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">{{ $t('common.confirm_cancel') }}</h5>
                        <button type="button" class="btn-close" @click="hideConfirmModal"></button>
                    </div>
                    <div class="modal-body">
                        <p>{{ $t('enrollment.drop.confirmation', { studentId, classCode }) }}</p>
                        <p><strong>{{ $t('common.reason') }}:</strong> {{ reason }}</p>
                    </div>
                    <div class="modal-footer">
                        <button class="btn btn-secondary" @click="hideConfirmModal">{{ $t('common.cancel') }}</button>
                        <button class="btn btn-danger" @click="performDelete">{{ $t('common.confirm') }}</button>
                    </div>
                </div>
            </div>
        </div>

        <!-- Modal Success -->
        <div class="modal fade" id="successModal" tabindex="-1" aria-hidden="true">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header bg-success text-white">
                        <h5 class="modal-title">{{ $t('common.cancel_success') }}</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" :aria-label="$t('common.close')"></button>
                    </div>
                    <div class="modal-body">
                        ✅ {{ $t('enrollment.drop.confirm_success', { studentId, classCode }) }}
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-success" data-bs-dismiss="modal"
                            @click="goBack">OK</button>
                    </div>
                </div>
            </div>
        </div>

        <!-- Modal Failed -->
        <div class="modal fade" id="errorModal" tabindex="-1" aria-hidden="true">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header bg-danger text-white">
                        <h5 class="modal-title">{{ $t('common.cancel_failed') }}</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"
                            :aria-label="$t('common.close')"></button>
                    </div>
                    <div class="modal-body">
                        ❌ {{ dropError }}
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-danger" data-bs-dismiss="modal">OK</button>
                    </div>
                </div>
            </div>
        </div>

        <!-- Filter MSSV -->
        <div class="mt-5 mb-3">
            <label class="form-label">{{ $t('enrollment.drop.history.search_by_id') }}</label>
            <div class="input-group">
                <input v-model="searchMSSV" class="form-control" :placeholder="$t('student.enter_student_id')" />
                <button class="btn btn-primary" @click="loadHistory">{{ $t('common.search') }}</button>
            </div>
        </div>
        <!-- Drop history table -->
        <div v-if="dropHistory && dropHistory.length > 0" class="table-responsive">
            <table class="table table-bordered table-hover">
                <thead class="table-light">
                    <tr>
                        <th>{{ $t('student.student_id') }}</th>
                        <th>{{ $t('student.name') }}</th>
                        <th>{{ $t('class.class_code') }}</th>
                        <th>{{ $t('common.reason') }}</th>
                        <th>{{ $t('enrollment.registered_date') }}</th>
                        <th>{{ $t('enrollment.dropped_date') }}</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="entry in dropHistory" :key="entry._id">
                        <td>{{ entry.student.studentId }}</td>
                        <td>{{ entry.student.fullName }}</td>
                        <td>{{ entry.class.classCode }}</td>
                        <td>{{ entry.dropReason }}</td>
                        <td>{{ formatDate(entry.enrollmentDate) }}</td>
                        <td>{{ formatDate(entry.dropDate) }}</td>
                    </tr>
                </tbody>
            </table>
        </div>
        <div v-else class="text-muted">{{ $t('enrollment.drop.history.no_data') }}</div>
    </div>
</template>

<script setup>
import { ref, nextTick, onMounted } from 'vue'
import { Modal } from 'bootstrap'
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'

const store = useStore()
const router = useRouter()

const studentId = ref('')
const classCode = ref('')
const reason = ref('')
const dropError = ref('')

const confirmModalRef = ref(null)
let confirmModal = null

const dropHistory = ref([])
const searchMSSV = ref('')

const { t } = useI18n()

console.log(t)

onMounted(async () => {
    await nextTick()
    confirmModal = new Modal(confirmModalRef.value)
})

const confirmDelete = () => {
    dropError.value = ''
    if (!studentId.value.trim() || !classCode.value.trim() || !reason.value.trim()) {
        dropError.value = t('common.fill_all_required')
        showModal('errorModal')
        return
    }
    confirmModal.show()
}

const loadHistory = async () => {
    try {
        await store.dispatch('enrollment/getDropHistory', searchMSSV.value)
        dropHistory.value = store.state.enrollment.history || []
        console.log(dropHistory.value)

        const error = store.state.enrollment.historyError
        if (error) {
            dropHistory.value = []
            dropError.value = error
            showModal('errorModal')
        } else {
            dropError.value = ''
        }

    } catch (err) {
        dropError.value = t('enrollment.drop.istory.loading_error')
        showModal('errorModal')
    }
}

const hideConfirmModal = () => {
    confirmModal?.hide()
}

const showModal = async (id) => {
    await nextTick()
    const modal = new Modal(document.getElementById(id))
    modal.show()
}

const goBack = () => {
    router.back()
}

const resetForm = () => {
    studentId.value = ''
    classCode.value = ''
    reason.value = ''
}

const performDelete = async () => {
    hideConfirmModal()
    try {
        await store.dispatch('enrollment/dropEnrollment', {
            studentId: studentId.value,
            classCode: classCode.value,
            dropReason: reason.value
        })

        const error = store.state.enrollment.error
        if (error) {
            dropError.value = error
            showModal('errorModal')
        } else {
            resetForm()
            showModal('successModal')
        }
    } catch (err) {
        dropError.value = err.message || t('common.undefined_error')
        showModal('errorModal')
    }
}

const formatDate = (isoString) => {
    const d = new Date(isoString)
    return d.toLocaleString('vi-VN')
}
</script>

<style scoped>
textarea {
    resize: none;
}
</style>