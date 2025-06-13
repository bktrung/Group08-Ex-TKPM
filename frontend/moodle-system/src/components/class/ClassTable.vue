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
                            {{ $t('class.no_matching_classes') }}
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
                                {{ $t('class.view_schedule') }}
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
        <BasePagination v-model="currentPage" :pageSize="pageSize" :totalItems="filteredClasses.length"
            :currentItems="paginatedClasses.length" @update:pageSize="pageSize = $event" />

        <!-- Schedule Modal -->
        <ScheduleModal v-model:visible="isScheduleModalVisible" :selectedClass="selectedClass" />

    </div>
</template>

<script>
import { useStore } from 'vuex'
import { useI18n } from 'vue-i18n'
import { ref, computed, onMounted } from 'vue'
import ScheduleModal from '@/components/layout/ScheduleModal.vue'
import BasePagination from '@/components/layout/DefaultPagination.vue'

export default {
    name: 'ClassTable',
    components: {
        BasePagination,
        ScheduleModal
    },
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
        const isScheduleModalVisible = ref(false)

        const classes = computed(() => store.state.class.classes)

        const filteredClasses = computed(() => {
            return (classes.value || []).filter(classItem => {
                return (
                    classItem &&
                    classItem.course &&
                    classItem.course._id === props.courseId
                )
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
            isScheduleModalVisible.value = true
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

        onMounted(async () => {
            try {
                await store.dispatch('class/fetchClasses')
            } catch (err) {
                console.error('Error loading data:', err);
                const msg = err.message || t('error.load_failed')
                error.value = `${t('error.prefix')}: ${msg}`
            }
        })

        return {
            selectedClass,
            error,
            currentPage,
            pageSize,
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
            getProgressBarClass,
            isScheduleModalVisible
        }
    }
}
</script>