import { createRouter, createWebHistory } from 'vue-router'

import StudentList from '@/views/StudentList.vue'
import AddStudent from '@/views/AddStudent.vue'
import EditStudent from '@/views/EditStudent.vue'
import DepartmentManage from '@/views/DepartmentManage.vue'
import ProgramManage from '@/views/ProgramManage.vue'
import StatusManage from '@/views/StatusManage.vue'
import StatusTransition from '@/views/StatusTransition.vue'
import AcademicAffairsRegistration from '@/views/AcademicAffairsRegistration.vue'
import CourseManage from '@/views/CourseManage.vue'
import ClassManage from '@/views/ClassManage.vue'
import RegisterCourse from '@/views/RegisterCourse.vue'
import DropCourse from '@/views/DropCourse.vue'
import GradeTable from '@/views/GradeTable.vue'

const routes = [
  {
    path: '/',
    name: 'StudentList',
    component: StudentList
  },
  {
    path: '/students/add',
    name: 'AddStudent',
    component: AddStudent
  },
  {
    path: '/students/edit/:id',
    name: 'EditStudent',
    component: EditStudent,
    props: true
  },
  {
    path: '/departments',
    name: 'DepartmentManage',
    component: DepartmentManage
  },
  {
    path: '/programs',
    name: 'ProgramManage',
    component: ProgramManage
  },
  {
    path: '/status-types',
    name: 'StatusManage',
    component: StatusManage
  },
  {
    path: '/status-transitions',
    name: 'StatusTransition',
    component: StatusTransition
  },
  {
    path: '/academic-affairs-registration',
    name: 'AcademicAffairsRegistration',
    component: AcademicAffairsRegistration
  },
  
  {
    path: '/courses',
    name: 'CourseManage',
    component: CourseManage
  },
  {
    path: '/classes',
    name: 'ClassManage',
    component: ClassManage
  },
  {
    path: '/register-course',
    name: 'RegisterCourse',
    component: RegisterCourse,
  },
  {
    path: '/drop-course',
    name: 'dropCourse',
    component: DropCourse,
  },
  {
    path: '/grade-table',
    name: 'GradeTable',
    component: GradeTable
  }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

export default router