<template>
    <div class="container py-4">
        <h3>Hủy đăng kí môn học</h3>

        <!-- Form input -->
        <div class="mb-3">
            <label class="form-label">Mã số sinh viên (MSSV)</label>
            <input v-model="studentId" class="form-control" placeholder="Nhập MSSV" />
        </div>

        <div class="mb-3">
            <label class="form-label">Mã lớp</label>
            <input v-model="classCode" class="form-control" placeholder="Nhập mã lớp" />
        </div>

        <div class="mb-3">
            <label class="form-label">Lý do xóa</label>
            <textarea v-model="reason" class="form-control" rows="3" placeholder="Nhập lý do hủy"></textarea>
        </div>

        <!-- Delete button -->
        <button class="btn btn-danger" @click="confirmDelete">Xóa</button>

        <!-- Confirm delete modal -->
        <div class="modal fade" ref="confirmModalRef" tabindex="-1">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Xác nhận hủy</h5>
                        <button type="button" class="btn-close" @click="hideConfirmModal"></button>
                    </div>
                    <div class="modal-body">
                        <p>Bạn có chắc chắn muốn xóa sinh viên {{ studentId }} khỏi lớp {{ classCode }} không?</p>
                        <p><strong>Lý do:</strong> {{ reason }}</p>
                    </div>
                    <div class="modal-footer">
                        <button class="btn btn-secondary" @click="hideConfirmModal">Hủy</button>
                        <button class="btn btn-danger" @click="performDelete">Xác nhận</button>
                    </div>
                </div>
            </div>
        </div>

        <!-- Modal Thành Công -->
        <div class="modal fade" id="successModal" tabindex="-1" aria-hidden="true">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header bg-success text-white">
                        <h5 class="modal-title">Hủy thành công</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Đóng"></button>
                    </div>
                    <div class="modal-body">
                        ✅ Đã xóa sinh viên {{ studentId }} khỏi lớp {{ classCode }} thành công.
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-success" data-bs-dismiss="modal"
                            @click="goBack">OK</button>
                    </div>
                </div>
            </div>
        </div>

        <!-- Modal Thất Bại -->
        <div class="modal fade" id="errorModal" tabindex="-1" aria-hidden="true">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header bg-danger text-white">
                        <h5 class="modal-title">Hủy thất bại</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Đóng"></button>
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
            <label class="form-label">Tìm lịch sử theo MSSV</label>
            <div class="input-group">
                <input v-model="searchMSSV" class="form-control" placeholder="Nhập MSSV để lọc" />
                <button class="btn btn-primary" @click="loadHistory">Tìm kiếm</button>
            </div>
        </div>
        <!-- Drop history table -->
        <div v-if="dropHistory && dropHistory.length > 0" class="table-responsive">
            <table class="table table-bordered table-hover">
                <thead class="table-light">
                    <tr>
                        <th>MSSV</th>
                        <th>Họ tên</th>
                        <th>Mã lớp</th>
                        <th>Lý do</th>
                        <th>Ngày đăng kí</th>
                        <th>Ngày hủy</th>
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
        <div v-else class="text-muted">Không có lịch sử hủy nào.</div>
    </div>
</template>

<script setup>
import { ref, nextTick, onMounted } from 'vue'
import { Modal } from 'bootstrap'
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'

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

onMounted(async () => {
    await nextTick()
    confirmModal = new Modal(confirmModalRef.value)
})

const confirmDelete = () => {
    dropError.value = ''
    if (!studentId.value.trim() || !classCode.value.trim() || !reason.value.trim()) {
        dropError.value = 'Vui lòng nhập đầy đủ thông tin.'
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
        dropError.value = 'Không thể tải lịch sử hủy.'
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
        dropError.value = err.message || 'Lỗi không xác định.'
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