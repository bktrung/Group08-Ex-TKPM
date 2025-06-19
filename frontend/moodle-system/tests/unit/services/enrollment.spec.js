import enrollmentService from '@/services/enrollment.js'
import apiClient from '@/services/client.js'

jest.mock('@/services/client.js')

describe('Enrollment Service', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('enrollCourse', () => {
    it('should enroll a student in a course', async () => {
      const enrollmentData = {
        studentId: 'STU001',
        classCode: 'CS101_01'
      }
      const mockResponse = { 
        data: { 
          success: true,
          metadata: { enrollment: enrollmentData }
        }
      }
      apiClient.post.mockResolvedValue(mockResponse)

      const result = await enrollmentService.enrollCourse(enrollmentData)

      expect(apiClient.post).toHaveBeenCalledWith('/v1/api/enrollment', enrollmentData)
      expect(result).toEqual(mockResponse)
    })

    it('should handle enrollment errors', async () => {
      const enrollmentData = {
        studentId: 'STU001',
        classCode: 'CS101_01'
      }
      const error = new Error('Enrollment failed')
      apiClient.post.mockRejectedValue(error)

      await expect(enrollmentService.enrollCourse(enrollmentData)).rejects.toThrow('Enrollment failed')
    })

    it('should handle invalid enrollment data', async () => {
      const mockResponse = { data: { success: true } }
      apiClient.post.mockResolvedValue(mockResponse)

      await enrollmentService.enrollCourse({})
      expect(apiClient.post).toHaveBeenCalledWith('/v1/api/enrollment', {})

      await enrollmentService.enrollCourse(null)
      expect(apiClient.post).toHaveBeenCalledWith('/v1/api/enrollment', null)
    })
  })

  describe('dropCourse', () => {
    it('should drop a student from a course', async () => {
      const dropData = {
        studentId: 'STU001',
        classCode: 'CS101_01',
        dropReason: 'Schedule conflict'
      }
      const mockResponse = { 
        data: { 
          success: true,
          metadata: { dropRecord: dropData }
        }
      }
      apiClient.post.mockResolvedValue(mockResponse)

      const result = await enrollmentService.dropCourse(dropData)

      expect(apiClient.post).toHaveBeenCalledWith('/v1/api/enrollment/drop', dropData)
      expect(result).toEqual(mockResponse)
    })

    it('should handle drop course errors', async () => {
      const dropData = {
        studentId: 'STU001',
        classCode: 'CS101_01',
        dropReason: 'Schedule conflict'
      }
      const error = new Error('Drop failed')
      apiClient.post.mockRejectedValue(error)

      await expect(enrollmentService.dropCourse(dropData)).rejects.toThrow('Drop failed')
    })

    it('should handle missing drop reason', async () => {
      const dropData = {
        studentId: 'STU001',
        classCode: 'CS101_01'
      }
      const mockResponse = { data: { success: true } }
      apiClient.post.mockResolvedValue(mockResponse)

      await enrollmentService.dropCourse(dropData)
      expect(apiClient.post).toHaveBeenCalledWith('/v1/api/enrollment/drop', dropData)
    })
  })

  describe('getTranscript', () => {
    it('should get student transcript', async () => {
      const studentId = 'STU001'
      const mockResponse = { 
        data: { 
          metadata: {
            transcript: {
              studentInfo: { studentId: 'STU001', fullName: 'John Doe' },
              courses: [
                { courseCode: 'CS101', courseName: 'Intro to CS', grade: 'A' }
              ],
              summary: {
                totalCredits: 3,
                gpaOutOf10: 8.5,
                gpaOutOf4: 3.4
              }
            }
          }
        }
      }
      apiClient.get.mockResolvedValue(mockResponse)

      const result = await enrollmentService.getTranscript(studentId)

      expect(apiClient.get).toHaveBeenCalledWith('/v1/api/transcript/STU001')
      expect(result).toEqual(mockResponse)
    })

    it('should handle transcript fetch errors', async () => {
      const studentId = 'STU001'
      const error = new Error('Transcript not found')
      apiClient.get.mockRejectedValue(error)

      await expect(enrollmentService.getTranscript(studentId)).rejects.toThrow('Transcript not found')
    })

    it('should handle empty student ID', async () => {
      const mockResponse = { data: { error: 'Invalid student ID' } }
      apiClient.get.mockResolvedValue(mockResponse)

      await enrollmentService.getTranscript('')
      expect(apiClient.get).toHaveBeenCalledWith('/v1/api/transcript/')

      await enrollmentService.getTranscript(null)
      expect(apiClient.get).toHaveBeenCalledWith('/v1/api/transcript/null')
    })
  })

  describe('getDropCourseHistory', () => {
    it('should get drop course history for a student', async () => {
      const studentId = 'STU001'
      const mockResponse = { 
        data: { 
          metadata: {
            dropHistory: [
              {
                studentId: 'STU001',
                classCode: 'CS101_01',
                dropReason: 'Schedule conflict',
                dropDate: '2024-01-15T10:00:00Z'
              }
            ]
          }
        }
      }
      apiClient.get.mockResolvedValue(mockResponse)

      const result = await enrollmentService.getDropCourseHistory(studentId)

      expect(apiClient.get).toHaveBeenCalledWith('/v1/api/enrollment/drop-history/STU001')
      expect(result).toEqual(mockResponse)
    })

    it('should handle drop history fetch errors', async () => {
      const studentId = 'STU001'
      const error = new Error('History not found')
      apiClient.get.mockRejectedValue(error)

      await expect(enrollmentService.getDropCourseHistory(studentId)).rejects.toThrow('History not found')
    })

    it('should handle empty drop history', async () => {
      const studentId = 'STU001'
      const mockResponse = { 
        data: { 
          metadata: { dropHistory: [] }
        }
      }
      apiClient.get.mockResolvedValue(mockResponse)

      const result = await enrollmentService.getDropCourseHistory(studentId)
      expect(result.data.metadata.dropHistory).toEqual([])
    })

    it('should handle invalid student ID', async () => {
      const mockResponse = { data: { error: 'Invalid student ID' } }
      apiClient.get.mockResolvedValue(mockResponse)

      await enrollmentService.getDropCourseHistory('')
      expect(apiClient.get).toHaveBeenCalledWith('/v1/api/enrollment/drop-history/')

      await enrollmentService.getDropCourseHistory(undefined)
      expect(apiClient.get).toHaveBeenCalledWith('/v1/api/enrollment/drop-history/undefined')
    })
  })

  describe('Edge cases and error handling', () => {
    it('should handle network timeouts', async () => {
      const error = { code: 'ECONNABORTED', message: 'timeout of 5000ms exceeded' }
      apiClient.post.mockRejectedValue(error)

      await expect(enrollmentService.enrollCourse({ studentId: 'STU001', classCode: 'CS101' }))
        .rejects.toMatchObject(error)
    })

    it('should handle server errors', async () => {
      const error = { 
        response: { 
          status: 500, 
          data: { message: 'Internal server error' } 
        } 
      }
      apiClient.post.mockRejectedValue(error)

      await expect(enrollmentService.enrollCourse({ studentId: 'STU001', classCode: 'CS101' }))
        .rejects.toMatchObject(error)
    })

    it('should handle malformed data', async () => {
      const mockResponse = { data: { success: true } }
      apiClient.post.mockResolvedValue(mockResponse)

      // Test with various malformed data
      await enrollmentService.enrollCourse({ studentId: 123, classCode: null })
      await enrollmentService.dropCourse({ studentId: '', classCode: undefined, dropReason: 123 })
      
      expect(apiClient.post).toHaveBeenCalledTimes(2)
    })
  })
})