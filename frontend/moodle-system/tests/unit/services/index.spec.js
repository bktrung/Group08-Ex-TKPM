// tests/unit/services/index.spec.js
import services from '@/services/index.js'

// Mock all the service modules
jest.mock('@/services/student.js', () => ({ mockStudent: true }))
jest.mock('@/services/course.js', () => ({ mockCourse: true }))
jest.mock('@/services/department.js', () => ({ mockDepartment: true }))
jest.mock('@/services/program.js', () => ({ mockProgram: true }))
jest.mock('@/services/status.type.js', () => ({ mockStatusType: true }))
jest.mock('@/services/class.js', () => ({ mockClass: true }))
jest.mock('@/services/enrollment.js', () => ({ mockEnrollment: true }))
jest.mock('@/services/geography.js', () => ({ mockGeography: true }))

describe('Services Index', () => {
  it('should export all service modules', () => {
    expect(services).toBeDefined()
    expect(typeof services).toBe('object')
  })

  it('should export student service', () => {
    expect(services.student).toBeDefined()
    expect(services.student.mockStudent).toBe(true)
  })

  it('should export course service', () => {
    expect(services.course).toBeDefined()
    expect(services.course.mockCourse).toBe(true)
  })

  it('should export department service', () => {
    expect(services.department).toBeDefined()
    expect(services.department.mockDepartment).toBe(true)
  })

  it('should export program service', () => {
    expect(services.program).toBeDefined()
    expect(services.program.mockProgram).toBe(true)
  })

  it('should export statusType service', () => {
    expect(services.statusType).toBeDefined()
    expect(services.statusType.mockStatusType).toBe(true)
  })

  it('should export statusTransition service', () => {
    expect(services.statusTransition).toBeDefined()
    expect(services.statusTransition.mockStatusTransition).toBe(true)
  })

  it('should export class service', () => {
    expect(services.class).toBeDefined()
    expect(services.class.mockClass).toBe(true)
  })

  it('should export enrollment service', () => {
    expect(services.enrollment).toBeDefined()
    expect(services.enrollment.mockEnrollment).toBe(true)
  })

  it('should export geography service', () => {
    expect(services.geography).toBeDefined()
    expect(services.geography.mockGeography).toBe(true)
  })

  it('should have all expected service properties', () => {
    const expectedServices = [
      'student',
      'course', 
      'department',
      'program',
      'statusType',
      'statusTransition',
      'class',
      'enrollment',
      'geography'
    ]

    expectedServices.forEach(serviceName => {
      expect(services).toHaveProperty(serviceName)
    })
  })

  it('should not have unexpected properties', () => {
    const serviceKeys = Object.keys(services)
    const expectedKeys = [
      'student',
      'course', 
      'department',
      'program',
      'statusType',
      'statusTransition',
      'class',
      'enrollment',
      'geography'
    ]

    expect(serviceKeys.sort()).toEqual(expectedKeys.sort())
  })

  it('should export services as an object with proper structure', () => {
    expect(services).toEqual({
      student: { mockStudent: true },
      course: { mockCourse: true },
      department: { mockDepartment: true },
      program: { mockProgram: true },
      statusType: { mockStatusType: true },
      statusTransition: { mockStatusTransition: true },
      class: { mockClass: true },
      enrollment: { mockEnrollment: true },
      geography: { mockGeography: true }
    })
  })
})