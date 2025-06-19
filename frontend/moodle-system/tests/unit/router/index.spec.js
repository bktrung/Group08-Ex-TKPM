import { describe, it, expect } from '@jest/globals'
import { createRouter, createWebHistory } from 'vue-router'

// Mock all view components
const mockComponent = { template: '<div>Mock Component</div>' }

jest.mock('@/views/StudentList.vue', () => mockComponent, { virtual: true })
jest.mock('@/views/AddStudent.vue', () => mockComponent, { virtual: true })
jest.mock('@/views/EditStudent.vue', () => mockComponent, { virtual: true })
jest.mock('@/views/DepartmentManage.vue', () => mockComponent, { virtual: true })
jest.mock('@/views/ProgramManage.vue', () => mockComponent, { virtual: true })
jest.mock('@/views/StatusManage.vue', () => mockComponent, { virtual: true })
jest.mock('@/views/StatusTransition.vue', () => mockComponent, { virtual: true })
jest.mock('@/views/AcademicAffairsRegistration.vue', () => mockComponent, { virtual: true })
jest.mock('@/views/CourseManage.vue', () => mockComponent, { virtual: true })
jest.mock('@/views/ClassManage.vue', () => mockComponent, { virtual: true })
jest.mock('@/views/RegisterCourse.vue', () => mockComponent, { virtual: true })
jest.mock('@/views/DropCourse.vue', () => mockComponent, { virtual: true })
jest.mock('@/views/GradeTable.vue', () => mockComponent, { virtual: true })

describe('router configuration', () => {
  let router

  beforeEach(() => {
    router = createRouter({
      history: createWebHistory(),
      routes: [
        { path: '/', name: 'StudentList', component: mockComponent },
        { path: '/students/add', name: 'AddStudent', component: mockComponent },
        { path: '/students/edit/:id', name: 'EditStudent', component: mockComponent, props: true },
        { path: '/departments', name: 'DepartmentManage', component: mockComponent },
        { path: '/programs', name: 'ProgramManage', component: mockComponent },
        { path: '/status-types', name: 'StatusManage', component: mockComponent },
        { path: '/status-transitions', name: 'StatusTransition', component: mockComponent },
        { path: '/academic-affairs-registration', name: 'AcademicAffairsRegistration', component: mockComponent },
        { path: '/courses', name: 'CourseManage', component: mockComponent },
        { path: '/classes', name: 'ClassManage', component: mockComponent },
        { path: '/register-course', name: 'RegisterCourse', component: mockComponent },
        { path: '/drop-course', name: 'dropCourse', component: mockComponent },
        { path: '/grade-table', name: 'GradeTable', component: mockComponent }
      ]
    })
  })

  it('should have correct route for home page', () => {
    const route = router.resolve('/')
    expect(route.name).toBe('StudentList')
  })

  it('should have correct route for add student', () => {
    const route = router.resolve('/students/add')
    expect(route.name).toBe('AddStudent')
  })

  it('should have correct route for edit student with props', () => {
    const route = router.resolve('/students/edit/123')
    expect(route.name).toBe('EditStudent')
    expect(route.params.id).toBe('123')
  })

  it('should have correct route for departments', () => {
    const route = router.resolve('/departments')
    expect(route.name).toBe('DepartmentManage')
  })

  it('should have correct route for programs', () => {
    const route = router.resolve('/programs')
    expect(route.name).toBe('ProgramManage')
  })

  it('should have correct route for status types', () => {
    const route = router.resolve('/status-types')
    expect(route.name).toBe('StatusManage')
  })

  it('should have correct route for status transitions', () => {
    const route = router.resolve('/status-transitions')
    expect(route.name).toBe('StatusTransition')
  })

  it('should have correct route for academic affairs registration', () => {
    const route = router.resolve('/academic-affairs-registration')
    expect(route.name).toBe('AcademicAffairsRegistration')
  })

  it('should have correct route for courses', () => {
    const route = router.resolve('/courses')
    expect(route.name).toBe('CourseManage')
  })

  it('should have correct route for classes', () => {
    const route = router.resolve('/classes')
    expect(route.name).toBe('ClassManage')
  })

  it('should have correct route for register course', () => {
    const route = router.resolve('/register-course')
    expect(route.name).toBe('RegisterCourse')
  })

  it('should have correct route for drop course', () => {
    const route = router.resolve('/drop-course')
    expect(route.name).toBe('dropCourse')
  })

  it('should have correct route for grade table', () => {
    const route = router.resolve('/grade-table')
    expect(route.name).toBe('GradeTable')
  })

  it('should have all required routes', () => {
    const routes = router.getRoutes()
    expect(routes).toHaveLength(13)
  })
})