import services from '@/services/index.js'

describe('services index', () => {
  it('should export all service modules', () => {
    expect(services).toHaveProperty('student')
    expect(services).toHaveProperty('course')
    expect(services).toHaveProperty('department')
    expect(services).toHaveProperty('program')
    expect(services).toHaveProperty('statusType')
    expect(services).toHaveProperty('statusTransition')
    expect(services).toHaveProperty('class')
    expect(services).toHaveProperty('enrollment')
    expect(services).toHaveProperty('geography')
  })

  it('should have all required service methods', () => {
    // Student service methods
    expect(services.student).toHaveProperty('getStudents')
    expect(services.student).toHaveProperty('createStudent')
    expect(services.student).toHaveProperty('updateStudent')
    expect(services.student).toHaveProperty('deleteStudent')

    // Course service methods
    expect(services.course).toHaveProperty('getCourses')
    expect(services.course).toHaveProperty('createCourse')
    expect(services.course).toHaveProperty('updateCourse')
    expect(services.course).toHaveProperty('deleteCourse')

    // Department service methods
    expect(services.department).toHaveProperty('getDepartments')
    expect(services.department).toHaveProperty('createDepartment')
    expect(services.department).toHaveProperty('updateDepartment')
    expect(services.department).toHaveProperty('deleteDepartment')

    // Class service methods
    expect(services.class).toHaveProperty('getClasses')
    expect(services.class).toHaveProperty('createClass')
    expect(services.class).toHaveProperty('updateClass')

    // Enrollment service methods
    expect(services.enrollment).toHaveProperty('enrollCourse')
    expect(services.enrollment).toHaveProperty('dropCourse')
    expect(services.enrollment).toHaveProperty('getTranscript')
  })

  it('should export service objects that are functions or objects', () => {
    Object.values(services).forEach(service => {
      expect(typeof service).toBe('object')
      expect(service).not.toBeNull()
    })
  })
})