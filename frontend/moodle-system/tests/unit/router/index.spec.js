import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock all the view components
vi.mock('@/views/StudentList.vue', () => ({
  default: { name: 'StudentList' }
}))

vi.mock('@/views/AddStudent.vue', () => ({
  default: { name: 'AddStudent' }
}))

vi.mock('@/views/EditStudent.vue', () => ({
  default: { name: 'EditStudent' }
}))

vi.mock('@/views/DepartmentManage.vue', () => ({
  default: { name: 'DepartmentManage' }
}))

vi.mock('@/views/ProgramManage.vue', () => ({
  default: { name: 'ProgramManage' }
}))

vi.mock('@/views/StatusManage.vue', () => ({
  default: { name: 'StatusManage' }
}))

vi.mock('@/views/StatusTransition.vue', () => ({
  default: { name: 'StatusTransition' }
}))

vi.mock('@/views/AcademicAffairsRegistration.vue', () => ({
  default: { name: 'AcademicAffairsRegistration' }
}))

vi.mock('@/views/CourseManage.vue', () => ({
  default: { name: 'CourseManage' }
}))

vi.mock('@/views/ClassManage.vue', () => ({
  default: { name: 'ClassManage' }
}))

vi.mock('@/views/RegisterCourse.vue', () => ({
  default: { name: 'RegisterCourse' }
}))

vi.mock('@/views/DropCourse.vue', () => ({
  default: { name: 'DropCourse' }
}))

vi.mock('@/views/GradeTable.vue', () => ({
  default: { name: 'GradeTable' }
}))

// Mock vue-router
const mockCreateRouter = vi.fn()
const mockCreateWebHistory = vi.fn()

vi.mock('vue-router', () => ({
  createRouter: mockCreateRouter,
  createWebHistory: mockCreateWebHistory
}))

describe('Vue Router Configuration', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockCreateWebHistory.mockReturnValue('mock-history')
    mockCreateRouter.mockReturnValue({
      push: vi.fn(),
      replace: vi.fn(),
      currentRoute: { value: { path: '/' } }
    })
  })

  it('should create router with correct configuration', async () => {
    await import('@/router/index.js')

    expect(mockCreateWebHistory).toHaveBeenCalledWith(process.env.BASE_URL)
    expect(mockCreateRouter).toHaveBeenCalledWith({
      history: 'mock-history',
      routes: expect.arrayContaining([
        expect.objectContaining({
          path: '/',
          name: 'StudentList',
          component: expect.any(Object)
        })
      ])
    })
  })

  it('should have all required routes defined', async () => {
    await import('@/router/index.js')

    const routerCall = mockCreateRouter.mock.calls[0]
    const routes = routerCall[0].routes

    const expectedRoutes = [
      { path: '/', name: 'StudentList' },
      { path: '/students/add', name: 'AddStudent' },
      { path: '/students/edit/:id', name: 'EditStudent' },
      { path: '/departments', name: 'DepartmentManage' },
      { path: '/programs', name: 'ProgramManage' },
      { path: '/status-types', name: 'StatusManage' },
      { path: '/status-transitions', name: 'StatusTransition' },
      { path: '/academic-affairs-registration', name: 'AcademicAffairsRegistration' },
      { path: '/courses', name: 'CourseManage' },
      { path: '/classes', name: 'ClassManage' },
      { path: '/register-course', name: 'RegisterCourse' },
      { path: '/drop-course', name: 'dropCourse' },
      { path: '/grade-table', name: 'GradeTable' }
    ]

    expectedRoutes.forEach(expectedRoute => {
      const foundRoute = routes.find(route => 
        route.path === expectedRoute.path && route.name === expectedRoute.name
      )
      expect(foundRoute).toBeDefined()
    })
  })

  it('should have correct StudentList route configuration', async () => {
    await import('@/router/index.js')

    const routerCall = mockCreateRouter.mock.calls[0]
    const routes = routerCall[0].routes
    const studentListRoute = routes.find(route => route.name === 'StudentList')

    expect(studentListRoute).toEqual({
      path: '/',
      name: 'StudentList',
      component: expect.any(Object)
    })
  })

  it('should have correct AddStudent route configuration', async () => {
    await import('@/router/index.js')

    const routerCall = mockCreateRouter.mock.calls[0]
    const routes = routerCall[0].routes
    const addStudentRoute = routes.find(route => route.name === 'AddStudent')

    expect(addStudentRoute).toEqual({
      path: '/students/add',
      name: 'AddStudent',
      component: expect.any(Object)
    })
  })

  it('should have correct EditStudent route configuration with props', async () => {
    await import('@/router/index.js')

    const routerCall = mockCreateRouter.mock.calls[0]
    const routes = routerCall[0].routes
    const editStudentRoute = routes.find(route => route.name === 'EditStudent')

    expect(editStudentRoute).toEqual({
      path: '/students/edit/:id',
      name: 'EditStudent',
      component: expect.any(Object),
      props: true
    })
  })

  it('should have all management routes configured', async () => {
    await import('@/router/index.js')

    const routerCall = mockCreateRouter.mock.calls[0]
    const routes = routerCall[0].routes

    const managementRoutes = [
      'DepartmentManage',
      'ProgramManage', 
      'StatusManage',
      'StatusTransition',
      'CourseManage',
      'ClassManage'
    ]

    managementRoutes.forEach(routeName => {
      const route = routes.find(r => r.name === routeName)
      expect(route).toBeDefined()
      expect(route.component).toBeDefined()
    })
  })

  it('should have academic affairs registration route', async () => {
    await import('@/router/index.js')

    const routerCall = mockCreateRouter.mock.calls[0]
    const routes = routerCall[0].routes
    const aarRoute = routes.find(route => route.name === 'AcademicAffairsRegistration')

    expect(aarRoute).toEqual({
      path: '/academic-affairs-registration',
      name: 'AcademicAffairsRegistration',
      component: expect.any(Object)
    })
  })

  it('should have course registration routes', async () => {
    await import('@/router/index.js')

    const routerCall = mockCreateRouter.mock.calls[0]
    const routes = routerCall[0].routes

    const registerRoute = routes.find(route => route.name === 'RegisterCourse')
    const dropRoute = routes.find(route => route.name === 'dropCourse')

    expect(registerRoute).toEqual({
      path: '/register-course',
      name: 'RegisterCourse',
      component: expect.any(Object)
    })

    expect(dropRoute).toEqual({
      path: '/drop-course', 
      name: 'dropCourse',
      component: expect.any(Object)
    })
  })

  it('should have grade table route', async () => {
    await import('@/router/index.js')

    const routerCall = mockCreateRouter.mock.calls[0]
    const routes = routerCall[0].routes
    const gradeRoute = routes.find(route => route.name === 'GradeTable')

    expect(gradeRoute).toEqual({
      path: '/grade-table',
      name: 'GradeTable',
      component: expect.any(Object)
    })
  })

  it('should use web history mode', async () => {
    await import('@/router/index.js')

    expect(mockCreateWebHistory).toHaveBeenCalledWith(process.env.BASE_URL)
  })

  it('should export the router instance', async () => {
    const routerModule = await import('@/router/index.js')
    
    expect(routerModule.default).toBeDefined()
    expect(mockCreateRouter).toHaveBeenCalled()
  })

  it('should have correct total number of routes', async () => {
    await import('@/router/index.js')

    const routerCall = mockCreateRouter.mock.calls[0]
    const routes = routerCall[0].routes

    expect(routes).toHaveLength(13)
  })

  it('should have unique route names', async () => {
    await import('@/router/index.js')

    const routerCall = mockCreateRouter.mock.calls[0]
    const routes = routerCall[0].routes
    const routeNames = routes.map(route => route.name)
    const uniqueNames = [...new Set(routeNames)]

    expect(routeNames).toHaveLength(uniqueNames.length)
  })

  it('should have unique route paths', async () => {
    await import('@/router/index.js')

    const routerCall = mockCreateRouter.mock.calls[0]
    const routes = routerCall[0].routes
    const routePaths = routes.map(route => route.path)
    const uniquePaths = [...new Set(routePaths)]

    expect(routePaths).toHaveLength(uniquePaths.length)
  })
})