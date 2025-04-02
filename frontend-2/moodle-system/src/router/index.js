import { createRouter, createWebHistory } from 'vue-router'

import StudentList from '@/views/StudentList.vue'
import AddStudent from '@/views/AddStudent.vue'
import EditStudent from '@/views/EditStudent.vue'
import DepartmentManage from '@/views/DepartmentManage.vue'
import ProgramManage from '@/views/ProgramManage.vue'
import StatusManage from '@/views/StatusManage.vue'
import StatusTransition from '@/views/StatusTransition.vue'

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
  }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

export default router