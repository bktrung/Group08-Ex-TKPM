<template>
    <div>
        <!-- Classes table -->
        <div class="table-responsive">
            <table class="table table-bordered table-striped">
                <thead class="table-primary text-center">
                    <tr>
                        <th>Mã lớp</th>
                        <th>Năm học</th>
                        <th>Học kỳ</th>
                        <th>Giảng viên</th>
                        <th>Sĩ số</th>
                        <th>Lịch học</th>
                        <th>Hành động</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-if="loading" class="text-center">
                        <td colspan="7">
                            <div class="spinner-border text-primary" role="status">
                                <span class="visually-hidden">Loading...</span>
                            </div>
                        </td>
                    </tr>
                    <tr v-else-if="paginatedClasses.length === 0" class="text-center">
                        <td colspan="7">
                            Không có lớp học nào phù hợp.
                        </td>
                    </tr>
                    <tr v-for="classItem in paginatedClasses" :key="classItem._id">
                        <td>{{ classItem.classCode }}</td>
                        <td class="text-center">{{ classItem.academicYear }}</td>
                        <td class="text-center">{{ formatSemester(classItem.semester) }}</td>
                        <td>{{ classItem.instructor }}</td>
                        <td class="text-center">
                            {{ classItem.enrolledStudents }} / {{ classItem.maxCapacity }}
                            <div class="progress" style="height: 5px;">
                                <div class="progress-bar" :class="getProgressBarClass(classItem)"
                                    :style="`width: ${(classItem.enrolledStudents / classItem.maxCapacity) * 100}%`">
                                </div>
                            </div>
                        </td>
                        <td>
                            <button class="btn btn-sm btn-outline-primary" @click="showScheduleModal(classItem)">
                                Xem lịch học
                            </button>
                        </td>
                        <td class="text-center">
                            <button class="btn btn-sm btn-outline-success" @click="register(classItem)">
                                Đăng ký
                            </button>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>

        <!-- Pagination -->
        <div class="d-flex justify-content-between align-items-center">
            <div>
                <span>Hiển thị {{ paginatedClasses.length }} / {{ filteredClasses.length }} lớp học</span>
            </div>
            <nav>
                <ul class="pagination">
                    <li class="page-item" :class="{ disabled: currentPage === 1 }">
                        <a class="page-link" href="#" @click.prevent="changePage(currentPage - 1)">Trước</a>
                    </li>
                    <li v-for="page in totalPages" :key="page" class="page-item"
                        :class="{ active: page === currentPage }">
                        <a class="page-link" href="#" @click.prevent="changePage(page)">{{ page }}</a>
                    </li>
                    <li class="page-item" :class="{ disabled: currentPage === totalPages }">
                        <a class="page-link" href="#" @click.prevent="changePage(currentPage + 1)">Sau</a>
                    </li>
                </ul>
            </nav>
            <div>
                <select v-model="pageSize" class="form-select form-select-sm" style="width: auto;">
                    <option :value="5">5 / trang</option>
                    <option :value="10">10 / trang</option>
                    <option :value="20">20 / trang</option>
                </select>
            </div>
        </div>

        <!-- Schedule Modal -->
        <div class="modal fade" id="scheduleModal" tabindex="-1" ref="scheduleModalRef">
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title" v-if="selectedClass">
                            Lịch học: {{ selectedClass.classCode }}
                        </h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body" v-if="selectedClass && selectedClass.schedule">
                        <div class="table-responsive">
                            <table class="table table-bordered">
                                <thead>
                                    <tr class="text-center">
                                        <th>Thứ</th>
                                        <th>Phòng học</th>
                                        <th>Tiết bắt đầu</th>
                                        <th>Tiết kết thúc</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr v-for="(schedule, index) in selectedClass.schedule" :key="index">
                                        <td class="text-center">{{ formatDayOfWeek(schedule.dayOfWeek) }}</td>
                                        <td>{{ schedule.classroom }}</td>
                                        <td class="text-center">{{ schedule.startPeriod }}</td>
                                        <td class="text-center">{{ schedule.endPeriod }}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Đóng</button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useStore } from 'vuex'
import { Modal } from 'bootstrap'

export default {
    name: 'ClassTable',
    props: {
        courseId: {
            type: String,
            required: true
        }
    },
    emits: ['register'],
    setup(props, { emit }) {
        const store = useStore()

        // State
        const selectedClass = ref(null)
        const error = ref('')
        const currentPage = ref(1)
        const pageSize = ref(10)
        const scheduleModalRef = ref(null)
        let scheduleModal = null

        // Computed properties
        const classes = computed(() => store.state.class.classes)

        const filteredClasses = computed(() => {
            return classes.value.filter(classItem => {
                return classItem.course._id === props.courseId
            })
        })

        const totalPages = computed(() => {
            return Math.ceil(filteredClasses.value.length / pageSize.value) || 1
        })

        const paginatedClasses = computed(() => {
            const start = (currentPage.value - 1) * pageSize.value
            const end = start + pageSize.value
            return filteredClasses.value.slice(start, end)
        })

        const loading = computed(() => store.state.classes?.loading || false)

        // Methods
        const changePage = (page) => {
            if (page >= 1 && page <= totalPages.value) {
                currentPage.value = page
            }
        }

        const showScheduleModal = (classItem) => {
            selectedClass.value = classItem
            if (scheduleModal) {
                scheduleModal.show()
            }
        }

        const register = (classItem) => {
            emit('register', classItem.classCode)
        }

        const formatDayOfWeek = (day) => {
            const dayMapping = {
                2: 'Thứ Hai',
                3: 'Thứ Ba',
                4: 'Thứ Tư',
                5: 'Thứ Năm',
                6: 'Thứ Sáu',
                7: 'Thứ Bảy',
                8: 'Chủ Nhật'
            }
            return dayMapping[day] || `Thứ ${day}`
        }

        const formatSemester = (semester) => {
            if (semester === 3) return 'Học kỳ hè'
            return `Học kỳ ${semester}`
        }

        const getProgressBarClass = (classItem) => {
            const ratio = classItem.enrolledStudents / classItem.maxCapacity
            if (ratio >= 0.9) return 'bg-danger'
            if (ratio >= 0.75) return 'bg-warning'
            return 'bg-success'
        }

        // Lifecycle
        onMounted(async () => {
            try {
                if (scheduleModalRef.value) {
                    scheduleModal = new Modal(scheduleModalRef.value)
                }

                await store.dispatch('class/fetchClasses')
            } catch (err) {
                error.value = `Lỗi: ${err.message || 'Đã xảy ra lỗi khi tải dữ liệu'}`
                console.error('Error loading data:', err)
            }
        })

        return {
            selectedClass,
            error,
            currentPage,
            pageSize,
            scheduleModalRef,
            classes,
            filteredClasses,
            paginatedClasses,
            totalPages,
            loading,
            changePage,
            showScheduleModal,
            register,
            formatDayOfWeek,
            formatSemester,
            getProgressBarClass
        }
    }
}
</script>