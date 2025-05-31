<template>
    <div>
        <!-- Classes table -->
        <div class="table-responsive">
            <table class="table table-bordered table-striped">
                <thead class="table-primary text-center">
                    <tr>
                        <th>{{ $t('class.class_code') }}</th>
                        <th>{{ $t('class.academic_year') }}</th>
                        <th>{{ $t('class.semester') }}</th>
                        <th>{{ $t('class.lecturer') }}</th>
                        <th>{{ $t('class.student_count') }}</th>
                        <th>{{ $t('class.schedule') }}</th>
                        <th>{{ $t('common.action') }}</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-if="loading" class="text-center">
                        <td colspan="7">
                            <div class="spinner-border text-primary" role="status">
                                <span class="visually-hidden">{{ $t('common.loading') }}</span>
                            </div>
                        </td>
                    </tr>
                    <tr v-else-if="paginatedClasses.length === 0" class="text-center">
                        <td colspan="7">
                            {{ t('class.no_matching_classes') }}
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
                                {{ $t('common.register') }}
                            </button>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>

        <!-- Pagination -->
        <div class="d-flex justify-content-between align-items-center">
            <div>
                <span>{{ $t('class.display_count', {
                    current: paginatedClasses.length, total: filteredClasses.length
                }) }}</span>
            </div>
            <nav>
                <ul class="pagination">
                    <li class="page-item" :class="{ disabled: currentPage === 1 }">
                        <a class="page-link" href="#" @click.prevent="changePage(currentPage - 1)">{{
                            $t('common.previous') }}</a>
                    </li>
                    <li v-for="page in totalPages" :key="page" class="page-item"
                        :class="{ active: page === currentPage }">
                        <a class="page-link" href="#" @click.prevent="changePage(page)">{{ page }}</a>
                    </li>
                    <li class="page-item" :class="{ disabled: currentPage === totalPages }">
                        <a class="page-link" href="#" @click.prevent="changePage(currentPage + 1)">{{ $t('common.next')
                        }}</a>
                    </li>
                </ul>
            </nav>
            <div>
                <select v-model="pageSize" class="form-select form-select-sm" style="width: auto;">
                    <option :value="5">5 / {{ $t('common.page') }}</option>
                    <option :value="10">10 / {{ $t('common.page') }}</option>
                    <option :value="20">20 / {{ $t('common.page') }}</option>
                </select>
            </div>
        </div>

        <!-- Schedule Modal -->
        <div class="modal fade" id="scheduleModal" tabindex="-1" ref="scheduleModalRef">
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title" v-if="selectedClass">
                            {{ $t('class.schedule') }}: {{ selectedClass.classCode }}
                        </h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body" v-if="selectedClass && selectedClass.schedule">
                        <div class="table-responsive">
                            <table class="table table-bordered">
                                <thead>
                                    <tr class="text-center">
                                        <th>{{ $t('days.day_of_week') }}</th>
                                        <th>{{ $t('class.room') }}</th>
                                        <th>{{ $t('class.start_period') }}</th>
                                        <th>{{ $t('class.end_period') }}</th>
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
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">{{ $t('common.close')
                        }}</button>
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
import { useI18n } from 'vue-i18n'

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
        const { t } = useI18n()
        const store = useStore()

        const selectedClass = ref(null)
        const error = ref('')
        const currentPage = ref(1)
        const pageSize = ref(10)
        const scheduleModalRef = ref(null)
        let scheduleModal = null

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
            return t(`days.${day}`) || `Thứ ${day}`
        }

        const formatSemester = (semester) => {
            if (semester === 3) return t('semester.summer')
            return t('semester.regular', { semester })
        }

        const getProgressBarClass = (classItem) => {
            const ratio = classItem.enrolledStudents / classItem.maxCapacity
            if (ratio >= 0.9) return 'bg-danger'
            if (ratio >= 0.75) return 'bg-warning'
            return 'bg-success'
        }

        const initializeModal = () => {
            if (scheduleModalRef.value) {
                scheduleModal = new Modal(scheduleModalRef.value)
            }
        }

        const loadClassData = async () => {
            try {
                await store.dispatch('class/fetchClasses')
            } catch (err) {
                console.error('Error loading data:', err)
                const msg = err.message || t('error.load_failed')
                error.value = `${t('error.prefix')}: ${msg}`
            }
        }

        onMounted(async () => {
            initializeModal()
            await loadClassData()
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