import classService from '@/services/class.js'
import apiClient from '@/services/client.js'

// Mock the API client
jest.mock('@/services/client.js', () => ({
  get: jest.fn(),
  post: jest.fn(),
  put: jest.fn(),
  delete: jest.fn()
}))

describe('class service', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('getClasses', () => {
    it('should get classes without parameters', async () => {
      const mockResponse = { data: { classes: [] } }
      apiClient.get.mockResolvedValue(mockResponse)

      const result = await classService.getClasses()

      expect(apiClient.get).toHaveBeenCalledWith('/v1/api/classes')
      expect(result).toEqual(mockResponse)
    })

    it('should get classes with parameters', async () => {
      const params = {
        academicYear: '2023-2024',
        semester: 1,
        courseId: 'course123',
        page: 1,
        limit: 10
      }
      const mockResponse = { data: { classes: [] } }
      apiClient.get.mockResolvedValue(mockResponse)

      const result = await classService.getClasses(params)

      expect(apiClient.get).toHaveBeenCalledWith('/v1/api/classes?academicYear=2023-2024&semester=1&courseId=course123&page=1&limit=10')
      expect(result).toEqual(mockResponse)
    })

    it('should filter out undefined and empty parameters', async () => {
      const params = {
        academicYear: '2023-2024',
        semester: undefined,
        courseId: '',
        page: 1
      }
      const mockResponse = { data: { classes: [] } }
      apiClient.get.mockResolvedValue(mockResponse)

      const result = await classService.getClasses(params)

      expect(apiClient.get).toHaveBeenCalledWith('/v1/api/classes?academicYear=2023-2024&page=1')
      expect(result).toEqual(mockResponse)
    })

    it('should handle empty parameters object', async () => {
      const mockResponse = { data: { classes: [] } }
      apiClient.get.mockResolvedValue(mockResponse)

      const result = await classService.getClasses({})

      expect(apiClient.get).toHaveBeenCalledWith('/v1/api/classes')
      expect(result).toEqual(mockResponse)
    })
  })

  describe('getClass', () => {
    it('should get single class by code', async () => {
      const classCode = 'CS101-01'
      const mockResponse = { data: { class: {} } }
      apiClient.get.mockResolvedValue(mockResponse)

      const result = await classService.getClass(classCode)

      expect(apiClient.get).toHaveBeenCalledWith(`/v1/api/classes/${classCode}`)
      expect(result).toEqual(mockResponse)
    })
  })

  describe('createClass', () => {
    it('should create a new class', async () => {
      const classData = {
        classCode: 'CS101-01',
        course: 'course123',
        instructor: 'John Doe',
        maxCapacity: 30,
        schedule: []
      }
      const mockResponse = { data: { newClass: classData } }
      apiClient.post.mockResolvedValue(mockResponse)

      const result = await classService.createClass(classData)

      expect(apiClient.post).toHaveBeenCalledWith('/v1/api/classes', classData)
      expect(result).toEqual(mockResponse)
    })
  })

  describe('getClassByCourseId', () => {
    it('should get classes by course ID', async () => {
      const courseId = 'course123'
      const mockResponse = { data: { classes: [] } }
      apiClient.get.mockResolvedValue(mockResponse)

      const result = await classService.getClassByCourseId(courseId)

      expect(apiClient.get).toHaveBeenCalledWith(`/v1/api/classes${courseId}`)
      expect(result).toEqual(mockResponse)
    })
  })
})