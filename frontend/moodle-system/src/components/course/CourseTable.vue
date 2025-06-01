<template>
    <div>
        <!-- Search and filters -->
        <div class="row mb-3">
            <div class="col-md-9">
                <div class="input-group">
                    <input v-model="searchQuery" type="text" class="form-control"
                        :placeholder="$t('course.search_placeholder')" @keyup.enter="filterCourses">
                    <button @click="filterCourses" class="btn btn-primary">{{ $t('common.search') }}</button>
                    <button @click="resetFilter" class="btn btn-secondary">{{ $t('common.reset') }}</button>
                </div>
            </div>
        </div>

        <!-- Courses table -->
        <div class="table-responsive">
            <table class="table table-bordered table-striped">
                <thead class="table-primary text-center">
                    <tr>
                        <th>{{ $t('course.course_code') }}</th>
                        <th>{{ $t('course.name') }}</th>
                        <th>{{ $t('course.department') }}</th>
                        <th>{{ $t('course.credits') }}</th>
                        <th>{{ $t('course.prerequisite') }}</th>
                        <th>{{ $t('common.status') }}</th>
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
                    <tr v-else-if="filteredCourses.length === 0" class="text-center">
                        <td colspan="7">
                            <div v-if="searchQuery">
                                {{ $t('course.no_search_result') }}
                            </div>
                            <div v-else>
                                {{ $t('course.no_data') }}
                            </div>
                        </td>
                    </tr>
                    <tr v-for="course in paginatedCourses" :key="course.courseCode" v-else>
                        <td>{{ course.courseCode }}</td>
                        <td>{{ course.name }}</td>
                        <td>{{ getDepartmentName(course.department) }}</td>
                        <td class="text-center">{{ course.credits }}</td>
                        <td>
                            <div v-if="course.prerequisites && course.prerequisites.length > 0">
                                <div v-for="(prereq, index) in getPrerequisiteNames(course.prerequisites)" :key="index">
                                    {{ prereq }}
                                </div>
                            </div>
                            <span v-else class="text-muted">{{ $t('common.none') }}</span>
                        </td>
                        <td class="text-center">
                            <span :class="course.isActive ? 'badge bg-success' : 'badge bg-danger'">
                                {{ course.isActive ? $t('course.status.active') : $t('course.status.inactive') }}
                            </span>
                        </td>
                        <td class="text-center">
                            <button @click="viewClass(course)" class="btn btn-info btn-sm">
                                <i class="bi bi-eye"></i> {{ $t('course.view_class') }}
                            </button>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>

        <!-- Pagination -->
        <div class="d-flex justify-content-between align-items-center">
            <div>
                <span>
                    {{ $t('course.display_count', { current: paginatedCourses.length, total: filteredCourses.length })
                    }}
                </span>
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
    </div>
</template>

<script>
import { ref, computed } from 'vue'
import { useStore } from 'vuex'
// import { useI18n } from 'vue-i18n'

export default {
    name: 'CourseTable',
    setup(props, { emit }) {
        // const { t } = useI18n()
        const store = useStore()
        const searchQuery = ref('')
        const currentPage = ref(1)
        const pageSize = ref(10)

        const courses = computed(() => {
            const coursesData = store.state.course.courses
            return Array.isArray(coursesData) ? coursesData : []
        })

        const loading = computed(() => store.state.course.loading)

        const filteredCourses = computed(() => {
            if (!searchQuery.value) return courses.value
            const query = searchQuery.value.toLowerCase()
            return courses.value.filter(course =>
                course.courseCode.toLowerCase().includes(query) ||
                course.name.toLowerCase().includes(query)
            )
        })

        const totalPages = computed(() => {
            return Math.ceil(filteredCourses.value.length / pageSize.value) || 1
        })

        const paginatedCourses = computed(() => {
            const start = (currentPage.value - 1) * pageSize.value
            const end = start + pageSize.value
            return filteredCourses.value.slice(start, end)
        })

        const filterCourses = () => {
            currentPage.value = 1
        }

        const resetFilter = () => {
            searchQuery.value = ''
            currentPage.value = 1
        }

        const changePage = (page) => {
            if (page >= 1 && page <= totalPages.value) {
                currentPage.value = page
            }
        }

        const getDepartmentName = (departmentId) => {
            if (!departmentId) return 'N/A'
            if (typeof departmentId === 'object' && departmentId.name) {
                return departmentId.name
            }
            const department = store.getters['department/getDepartmentById'](
                typeof departmentId === 'object' ? departmentId._id : departmentId
            )
            return department ? department.name : 'N/A'
        }

        const getPrerequisiteNames = (prerequisites) => {
            if (!prerequisites || !Array.isArray(prerequisites) || prerequisites.length === 0) {
                return []
            }
            return prerequisites.map(prereq => {
                if (typeof prereq === 'object' && prereq.courseCode && prereq.name) {
                    return `${prereq.courseCode} - ${prereq.name}`
                }
                const course = courses.value.find(c =>
                    c._id === (typeof prereq === 'object' ? prereq._id : prereq)
                )
                return course ? `${course.courseCode} - ${course.name}` : 'N/A'
            })
        }

        const viewClass = (course) => {
            emit('select-course', course)  
        }

        return {
            searchQuery,
            currentPage,
            pageSize,
            courses,
            loading,
            filteredCourses,
            paginatedCourses,
            totalPages,
            filterCourses,
            resetFilter,
            changePage,
            getDepartmentName,
            getPrerequisiteNames,
            viewClass
        }
    }
}
</script>
