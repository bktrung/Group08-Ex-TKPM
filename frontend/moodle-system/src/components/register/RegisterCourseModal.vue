<template>
    <div ref="modalRef" class="modal fade" tabindex="-1" aria-labelledby="modalLabel" aria-hidden="true">
        <div class="modal-dialog modal-lg">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" id="modalLabel">Đăng ký môn học</h5>
                    <button type="button" class="btn-close" @click="closeModal" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                    <!-- Tìm kiếm sinh viên -->
                    <div class="mb-3">
                        <label class="form-label">Tên hoặc MSSV</label>
                        <input type="text" class="form-control" v-model="studentQuery"
                            placeholder="Nhập tên hoặc MSSV...">
                    </div>

                    <!-- Dropdown chọn môn học -->
                    <div class="mb-3">
                        <label class="form-label">Chọn môn học</label>
                        <select class="form-select" v-model="selectedCourse" @change="loadClasses">
                            <option value="" disabled>-- Chọn môn học --</option>
                            <option v-for="course in courses" :value="course._id" :key="course._id">
                                {{ course.name }}
                            </option>
                        </select>
                    </div>

                    <!-- Danh sách lớp -->
                    <div v-if="classes.length">
                        <h6>Danh sách lớp của môn học</h6>
                        <table class="table table-bordered mt-2">
                            <thead>
                                <tr>
                                    <th>Mã lớp</th>
                                    <th>Giảng viên</th>
                                    <th>Số lượng</th>
                                    <th>Hành động</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr v-for="cls in classes" :key="cls.id">
                                    <td>{{ cls.code }}</td>
                                    <td>{{ cls.teacher }}</td>
                                    <td>{{ cls.current }}/{{ cls.max }}</td>
                                    <td>
                                        <button class="btn btn-primary btn-sm" @click="register(cls)">Đăng ký</button>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-secondary" @click="closeModal">Đóng</button>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import { ref, watch, computed, onMounted, nextTick } from 'vue'
import { useStore } from 'vuex'
import { Modal } from 'bootstrap'

export default {
    props: {
        showModal: Boolean
    },
    emits: ['close', 'save'],
    setup(props, { emit }) {
        const store = useStore()

        const modalRef = ref(null)
        let bootstrapModal = null
        const studentQuery = ref('')
        const selectedCourse = ref('')

        const courses = computed(() => store.state.course.courses)

        console.log('Courses:', courses.value)

        const classes = ref([])

        // Lấy danh sách lớp theo môn học
        const loadClasses = () => {
            classes.value = [
                { id: 'L01', code: 'CS101-L01', teacher: 'Thầy Nam', current: 25, max: 30 },
                { id: 'L02', code: 'CS101-L02', teacher: 'Cô Mai', current: 30, max: 30 }
            ]
        }

        // Đăng ký lớp cho sinh viên
        const register = (cls) => {

            if (studentQuery.value.trim() === '') {
                alert('Vui lòng chọn sinh viên trước khi đăng ký lớp.')
                return
            }

            try {

                // await store.dispatch('enrollments/postEnrollments', {
                //     studentId: studentQuery.value,
                //     classId: cls.id
                // })

                alert(`Đã đăng ký lớp ${cls.code} cho sinh viên ${studentQuery.value}`)
                emit('save', studentQuery.value, cls) // Thực hiện save sự kiện
                closeModal()
        }

        onMounted(async () => {
            await store.dispatch('course/fetchCourses')
        })

        // Đóng modal
        const closeModal = () => {
            if (bootstrapModal) {
                bootstrapModal.hide()
            }
            emit('close')
        }

        // Khởi tạo và theo dõi modal
        onMounted(async () => {
            await nextTick()
            if (modalRef.value) {
                bootstrapModal = new Modal(modalRef.value)
            }
        })

        watch(() => props.showModal, (newVal) => {
            if (newVal && bootstrapModal) {
                bootstrapModal.show()
            }
        })

        return { modalRef, studentQuery, selectedCourse, courses, classes, loadClasses, register, closeModal }
    }
}
</script>