import studentService from '@/services/student.js'
import apiClient from '@/services/client.js'

jest.mock('@/services/client.js')

describe('Student Service', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('getStudents', () => {
    it('should fetch students with default pagination', async () => {
      const mockResponse = { 
        data: { 
          metadata: {
            students: [
              { studentId: 'STU001', fullName: 'John Doe' },
              { studentId: 'STU002', fullName: 'Jane Smith' }
            ],
            pagination: { totalPages: 5, currentPage: 1 }
          }
        }
      }
      apiClient.get.mockResolvedValue(mockResponse)

      const result = await studentService.getStudents()

      expect(apiClient.get).toHaveBeenCalledWith('/v1/api/students?page=1&limit=10')
      expect(result).toEqual(mockResponse)
    })

    it('should fetch students with custom pagination', async () => {
      const mockResponse = { data: { metadata: { students: [] } } }
      apiClient.get.mockResolvedValue(mockResponse)

      await studentService.getStudents(2, 20)

      expect(apiClient.get).toHaveBeenCalledWith('/v1/api/students?page=2&limit=20')
    })

    it('should handle API errors', async () => {
      const error = new Error('Failed to fetch students')
      apiClient.get.mockRejectedValue(error)

      await expect(studentService.getStudents()).rejects.toThrow('Failed to fetch students')
    })
  })

  describe('getStudent', () => {
    it('should fetch a single student by ID', async () => {
      const mockResponse = { 
        data: { 
          metadata: {
            students: [
              { studentId: 'STU001', fullName: 'John Doe' },
              { studentId: 'STU002', fullName: 'Jane Smith' }
            ]
          }
        }
      }
      apiClient.get.mockResolvedValue(mockResponse)

      const result = await studentService.getStudent('STU001')

      expect(apiClient.get).toHaveBeenCalledWith('/v1/api/students?page=1&limit=1000')
      expect(result.data.metadata.studentId).toBe('STU001')
      expect(result.data.metadata.fullName).toBe('John Doe')
    })

    it('should throw error when student not found', async () => {
      const mockResponse = { 
        data: { 
          metadata: {
            students: [
              { studentId: 'STU002', fullName: 'Jane Smith' }
            ]
          }
        }
      }
      apiClient.get.mockResolvedValue(mockResponse)

      await expect(studentService.getStudent('STU001')).rejects.toThrow('Student not found')
    })

    it('should handle empty students list', async () => {
      const mockResponse = { 
        data: { 
          metadata: { students: [] }
        }
      }
      apiClient.get.mockResolvedValue(mockResponse)

      await expect(studentService.getStudent('STU001')).rejects.toThrow('Student not found')
    })
  })

  describe('createStudent', () => {
    it('should create a new student', async () => {
      const studentData = {
        studentId: 'STU003',
        fullName: 'Bob Johnson',
        email: 'bob@example.com'
      }
      const mockResponse = { 
        data: { 
          metadata: {
            student: studentData
          }
        }
      }
      apiClient.post.mockResolvedValue(mockResponse)

      const result = await studentService.createStudent(studentData)

      expect(apiClient.post).toHaveBeenCalledWith('/v1/api/students', studentData)
      expect(result).toEqual(mockResponse)
    })

    it('should handle creation errors', async () => {
      const studentData = { studentId: 'STU003', fullName: 'Bob Johnson' }
      const error = new Error('Creation failed')
      apiClient.post.mockRejectedValue(error)

      await expect(studentService.createStudent(studentData)).rejects.toThrow('Creation failed')
    })
  })

  describe('updateStudent', () => {
    it('should update an existing student', async () => {
      const studentId = 'STU001'
      const updateData = { fullName: 'John Updated Doe', email: 'john.updated@example.com' }
      const mockResponse = { 
        data: { 
          metadata: {
            student: { studentId, ...updateData }
          }
        }
      }
      apiClient.patch.mockResolvedValue(mockResponse)

      const result = await studentService.updateStudent(studentId, updateData)

      expect(apiClient.patch).toHaveBeenCalledWith('/v1/api/students/STU001', updateData)
      expect(result).toEqual(mockResponse)
    })

    it('should handle update errors', async () => {
      const studentId = 'STU001'
      const updateData = { fullName: 'John Updated Doe' }
      const error = new Error('Update failed')
      apiClient.patch.mockRejectedValue(error)

      await expect(studentService.updateStudent(studentId, updateData)).rejects.toThrow('Update failed')
    })
  })

  describe('deleteStudent', () => {
    it('should delete a student by ID', async () => {
      const studentId = 'STU001'
      const mockResponse = { 
        data: { 
          success: true,
          message: 'Student deleted successfully'
        }
      }
      apiClient.delete.mockResolvedValue(mockResponse)

      const result = await studentService.deleteStudent(studentId)

      expect(apiClient.delete).toHaveBeenCalledWith('/v1/api/students/STU001')
      expect(result).toEqual(mockResponse)
    })

    it('should handle deletion errors', async () => {
      const studentId = 'STU001'
      const error = new Error('Deletion failed')
      apiClient.delete.mockRejectedValue(error)

      await expect(studentService.deleteStudent(studentId)).rejects.toThrow('Deletion failed')
    })
  })

  describe('searchStudents', () => {
    it('should search students with default pagination', async () => {
      const query = 'John'
      const mockResponse = { 
        data: { 
          metadata: {
            students: [{ studentId: 'STU001', fullName: 'John Doe' }],
            pagination: { totalPages: 1, currentPage: 1 }
          }
        }
      }
      apiClient.get.mockResolvedValue(mockResponse)

      const result = await studentService.searchStudents(query)

      expect(apiClient.get).toHaveBeenCalledWith('/v1/api/students/search?q=John&page=1&limit=10')
      expect(result).toEqual(mockResponse)
    })

    it('should search students with custom pagination', async () => {
      const query = 'John'
      const mockResponse = { data: { metadata: { students: [] } } }
      apiClient.get.mockResolvedValue(mockResponse)

      await studentService.searchStudents(query, 2, 20)

      expect(apiClient.get).toHaveBeenCalledWith('/v1/api/students/search?q=John&page=2&limit=20')
    })

    it('should handle special characters in search query', async () => {
      const query = 'John & Jane'
      const mockResponse = { data: { metadata: { students: [] } } }
      apiClient.get.mockResolvedValue(mockResponse)

      await studentService.searchStudents(query)

      expect(apiClient.get).toHaveBeenCalledWith('/v1/api/students/search?q=John%20%26%20Jane&page=1&limit=10')
    })

    it('should handle search errors', async () => {
      const query = 'John'
      const error = new Error('Search failed')
      apiClient.get.mockRejectedValue(error)

      await expect(studentService.searchStudents(query)).rejects.toThrow('Search failed')
    })
  })

  describe('getStudentsByDepartment', () => {
    it('should fetch students by department with default pagination', async () => {
      const departmentId = 'DEPT001'
      const mockResponse = { 
        data: { 
          metadata: {
            students: [{ studentId: 'STU001', department: 'DEPT001' }],
            pagination: { totalPages: 1, currentPage: 1 }
          }
        }
      }
      apiClient.get.mockResolvedValue(mockResponse)

      const result = await studentService.getStudentsByDepartment(departmentId)

      expect(apiClient.get).toHaveBeenCalledWith('/v1/api/students/department/DEPT001?page=1&limit=10')
      expect(result).toEqual(mockResponse)
    })

    it('should fetch students by department with custom pagination', async () => {
      const departmentId = 'DEPT001'
      const mockResponse = { data: { metadata: { students: [] } } }
      apiClient.get.mockResolvedValue(mockResponse)

      await studentService.getStudentsByDepartment(departmentId, 3, 15)

      expect(apiClient.get).toHaveBeenCalledWith('/v1/api/students/department/DEPT001?page=3&limit=15')
    })

    it('should handle department fetch errors', async () => {
      const departmentId = 'DEPT001'
      const error = new Error('Department fetch failed')
      apiClient.get.mockRejectedValue(error)

      await expect(studentService.getStudentsByDepartment(departmentId)).rejects.toThrow('Department fetch failed')
    })
  })

  describe('exportStudents', () => {
    it('should export students in specified format', () => {
      const format = 'csv'
      const mockOpen = jest.fn()
      Object.defineProperty(window, 'open', { value: mockOpen })

      studentService.exportStudents(format)

      expect(mockOpen).toHaveBeenCalledWith('http://localhost:3456/v1/api/export/students?format=csv', '_blank')
    })

    it('should handle different export formats', () => {
      const mockOpen = jest.fn()
      Object.defineProperty(window, 'open', { value: mockOpen })

      studentService.exportStudents('json')
      expect(mockOpen).toHaveBeenCalledWith('http://localhost:3456/v1/api/export/students?format=json', '_blank')

      studentService.exportStudents('excel')
      expect(mockOpen).toHaveBeenCalledWith('http://localhost:3456/v1/api/export/students?format=excel', '_blank')
    })
  })

  describe('importStudents', () => {
    it('should import students from form data', async () => {
      const formData = new FormData()
      formData.append('file', new File(['test'], 'students.csv'))
      
      const mockResponse = { 
        data: { 
          success: true,
          message: 'Import successful'
        }
      }
      apiClient.post.mockResolvedValue(mockResponse)

      const result = await studentService.importStudents(formData)

      expect(apiClient.post).toHaveBeenCalledWith('/v1/api/import/students', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      expect(result).toEqual(mockResponse)
    })

    it('should handle import errors', async () => {
      const formData = new FormData()
      const error = new Error('Import failed')
      apiClient.post.mockRejectedValue(error)

      await expect(studentService.importStudents(formData)).rejects.toThrow('Import failed')
    })

    it('should handle empty form data', async () => {
      const formData = new FormData()
      const mockResponse = { data: { success: true } }
      apiClient.post.mockResolvedValue(mockResponse)

      await studentService.importStudents(formData)
      expect(apiClient.post).toHaveBeenCalledWith('/v1/api/import/students', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
    })
  })
})