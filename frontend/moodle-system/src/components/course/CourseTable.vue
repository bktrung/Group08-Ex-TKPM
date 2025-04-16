<template>
    <div>
        <!-- Search and filters -->
        <div class="row mb-3">
            <div class="col-md-9">
                <div class="input-group">
                    <input v-model="searchQuery" type="text" class="form-control"
                        placeholder="Tìm kiếm theo mã hoặc tên khóa học..." @keyup.enter="filterCourses">
                    <button @click="filterCourses" class="btn btn-primary">Tìm kiếm</button>
                    <button @click="resetFilter" class="btn btn-secondary">Đặt lại</button>
                </div>
            </div>
        </div>

        <!-- Courses table -->
        <div class="table-responsive">
            <table class="table table-bordered table-striped">
                <thead class="table-primary text-center">
                    <tr>
                        <th>Mã khóa học</th>
                        <th>Tên khóa học</th>
                        <th>Khoa</th>
                        <th>Tín chỉ</th>
                        <th>Môn học tiên quyết</th>
                        <th>Trạng thái</th>
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
                    <tr v-else-if="filteredCourses.length === 0" class="text-center">
                        <td colspan="7">
                            <div v-if="searchQuery">
                                Không tìm thấy khóa học phù hợp với tìm kiếm của bạn.
                            </div>
                            <div v-else>
                                Chưa có khóa học nào.
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
                            <span v-else class="text-muted">Không có</span>
                        </td>
                        <td class="text-center">
                            <span :class="course.isActive ? 'badge bg-success' : 'badge bg-danger'">
                                {{ course.isActive ? 'Đang mở' : 'Đã đóng' }}
                            </span>
                        </td>
                        <td class="text-center">
                            <button @click="viewClass(course)" class="btn btn-info btn-sm">
                                <i class="bi bi-eye"></i> Xem lớp
                            </button>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>

        <!-- Pagination -->
        <div class="d-flex justify-content-between align-items-center">
            <div>
                <span>Hiển thị {{ paginatedCourses.length }} / {{ filteredCourses.length }} khóa học</span>
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
    </div>
</template>

<script>
import { ref, computed } from 'vue'
import { useStore } from 'vuex'

export default {
    name: 'CourseTable',
    setup(props, { emit }) {
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
            emit('select-course', course)  // Phát sự kiện với khóa học đã chọn
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
