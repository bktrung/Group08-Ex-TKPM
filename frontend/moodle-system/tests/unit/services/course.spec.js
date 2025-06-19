import courseService from '@/services/course.js'
import apiClient from '@/services/client.js'

jest.mock('@/services/client.js')

describe('Course Service', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('getCourses', () => {
    it('should fetch courses without parameters', async () => {
      const mockResponse = { data: { courses: [] } }
      apiClient.get.mockResolvedValue(mockResponse)

      const result = await courseService.getCourses()

      expect(apiClient.get).toHaveBeenCalledWith('/v1/api/courses')
      expect(result).toEqual(mockResponse)
    })

    it('should fetch courses with department filter', async () => {
      const mockResponse = { data: { courses: [] } }
      apiClient.get.mockResolvedValue(mockResponse)

      await courseService.getCourses({ departmentId: 'dept123' })

      expect(apiClient.get).toHaveBeenCalledWith('/v1/api/courses?departmentId=dept123')
    })

    it('should fetch courses with pagination', async () => {
      const mockResponse = { data: { courses: [] } }
      apiClient.get.mockResolvedValue(mockResponse)

      await courseService.getCourses({ page: 2, limit: 20 })

      expect(apiClient.get).toHaveBeenCalledWith('/v1/api/courses?page=2&limit=20')
    })

    it('should fetch courses with all parameters', async () => {
      const mockResponse = { data: { courses: [] } }
      apiClient.get.mockResolvedValue(mockResponse)

      await courseService.getCourses({ 
        departmentId: 'dept123', 
        page: 2, 
        limit: 20 
      })

      expect(apiClient.get).toHaveBeenCalledWith('/v1/api/courses?departmentId=dept123&page=2&limit=20')
    })

    it('should handle API errors', async () => {
      const error = new Error('API Error')
      apiClient.get.mockRejectedValue(error)
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation()

      await expect(courseService.getCourses()).rejects.toThrow('API Error')
      expect(consoleSpy).toHaveBeenCalledWith('Error in API getCourses:', error)
      
      consoleSpy.mockRestore()
    })
  })

  describe('getCourse', () => {
    it('should fetch a single course by code', async () => {
      const mockResponse = { data: { course: {} } }
      apiClient.get.mockResolvedValue(mockResponse)

      const result = await courseService.getCourse('CS101')

      expect(apiClient.get).toHaveBeenCalledWith('/v1/api/courses/CS101')
      expect(result).toEqual(mockResponse)
    })
  })

  describe('createCourse', () => {
    it('should create a course with valid data', async () => {
      const courseData = {
        courseCode: 'CS101',
        name: 'Computer Science 101',
        credits: 3,
        department: 'dept123',
        description: 'Introduction to CS',
        prerequisites: ['CS001']
      }
      const mockResponse = { data: { course: courseData } }
      apiClient.post.mockResolvedValue(mockResponse)

      const result = await courseService.createCourse(courseData)

      expect(apiClient.post).toHaveBeenCalledWith('/v1/api/courses', {
        courseCode: 'CS101',
        name: 'Computer Science 101',
        credits: 3,
        department: 'dept123',
        description: 'Introduction to CS',
        prerequisites: ['CS001']
      })
      expect(result).toEqual(mockResponse)
    })

    it('should convert credits to number', async () => {
      const courseData = {
        courseCode: 'CS101',
        name: 'Computer Science 101',
        credits: '3',
        department: 'dept123',
        description: 'Introduction to CS',
        prerequisites: []
      }
      const mockResponse = { data: { course: {} } }
      apiClient.post.mockResolvedValue(mockResponse)

      await courseService.createCourse(courseData)

      expect(apiClient.post).toHaveBeenCalledWith('/v1/api/courses', {
        courseCode: 'CS101',
        name: 'Computer Science 101',
        credits: 3,
        department: 'dept123',
        description: 'Introduction to CS',
        prerequisites: []
      })
    })

    it('should handle missing prerequisites', async () => {
      const courseData = {
        courseCode: 'CS101',
        name: 'Computer Science 101',
        credits: 3,
        department: 'dept123',
        description: 'Introduction to CS'
      }
      const mockResponse = { data: { course: {} } }
      apiClient.post.mockResolvedValue(mockResponse)

      await courseService.createCourse(courseData)

      expect(apiClient.post).toHaveBeenCalledWith('/v1/api/courses', {
        courseCode: 'CS101',
        name: 'Computer Science 101',
        credits: 3,
        department: 'dept123',
        description: 'Introduction to CS',
        prerequisites: []
      })
    })

    it('should handle non-array prerequisites', async () => {
      const courseData = {
        courseCode: 'CS101',
        name: 'Computer Science 101',
        credits: 3,
        department: 'dept123',
        description: 'Introduction to CS',
        prerequisites: 'CS001'
      }
      const mockResponse = { data: { course: {} } }
      apiClient.post.mockResolvedValue(mockResponse)

      await courseService.createCourse(courseData)

      expect(apiClient.post).toHaveBeenCalledWith('/v1/api/courses', {
        courseCode: 'CS101',
        name: 'Computer Science 101',
        credits: 3,
        department: 'dept123',
        description: 'Introduction to CS',
        prerequisites: []
      })
    })
  })

  describe('updateCourse', () => {
    it('should update a course with allowed fields only', async () => {
      const updateData = {
        name: 'Updated Course Name',
        credits: 4,
        department: 'newDept',
        description: 'Updated description',
        courseCode: 'CS102', // Should be filtered out
        invalidField: 'should not be included'
      }
      const mockResponse = { data: { course: {} } }
      apiClient.patch.mockResolvedValue(mockResponse)

      const result = await courseService.updateCourse('CS101', updateData)

      expect(apiClient.patch).toHaveBeenCalledWith('/v1/api/courses/CS101', {
        name: 'Updated Course Name',
        credits: 4,
        department: 'newDept',
        description: 'Updated description'
      })
      expect(result).toEqual(mockResponse)
    })

    it('should handle empty update data', async () => {
      const mockResponse = { data: { course: {} } }
      apiClient.patch.mockResolvedValue(mockResponse)

      const result = await courseService.updateCourse('CS101', {})

      expect(apiClient.patch).toHaveBeenCalledWith('/v1/api/courses/CS101', {})
      expect(result).toEqual(mockResponse)
    })

    it('should only include fields that exist in data', async () => {
      const updateData = {
        name: 'Updated Course Name',
        credits: 4
      }
      const mockResponse = { data: { course: {} } }
      apiClient.patch.mockResolvedValue(mockResponse)

      await courseService.updateCourse('CS101', updateData)

      expect(apiClient.patch).toHaveBeenCalledWith('/v1/api/courses/CS101', {
        name: 'Updated Course Name',
        credits: 4
      })
    })
  })

  describe('deleteCourse', () => {
    it('should delete a course by code', async () => {
      const mockResponse = { data: { deleted: true } }
      apiClient.delete.mockResolvedValue(mockResponse)

      const result = await courseService.deleteCourse('CS101')

      expect(apiClient.delete).toHaveBeenCalledWith('/v1/api/courses/CS101')
      expect(result).toEqual(mockResponse)
    })
  })

  describe('toggleCourseStatus', () => {
    it('should delete course when isActive is false', async () => {
      const mockResponse = { data: { deleted: true } }
      apiClient.delete.mockResolvedValue(mockResponse)

      const result = await courseService.toggleCourseStatus('CS101', false)

      expect(apiClient.delete).toHaveBeenCalledWith('/v1/api/courses/CS101')
      expect(result).toEqual(mockResponse)
    })

    it('should throw error when trying to activate course', async () => {
      await expect(courseService.toggleCourseStatus('CS101', true))
        .rejects.toThrow('Activating course is not supported yet')
    })
  })
})