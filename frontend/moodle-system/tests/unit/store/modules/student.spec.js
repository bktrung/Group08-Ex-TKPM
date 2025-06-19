import studentModule from '@/store/modules/student.js'
import api from '@/services/index.js'

// Mock the API
jest.mock('@/services/index.js', () => ({
  student: {
    getStudents: jest.fn(),
    getStudent: jest.fn(),
    createStudent: jest.fn(),
    updateStudent: jest.fn(),
    deleteStudent: jest.fn(),
    searchStudents: jest.fn(),
    getStudentsByDepartment: jest.fn(),
    exportStudents: jest.fn(),
    importStudents: jest.fn()
  }
}))

describe('student store module', () => {
  let store

  beforeEach(() => {
    store = {
      state: { ...studentModule.state },
      commit: jest.fn(),
      dispatch: jest.fn()
    }
    jest.clearAllMocks()
  })

  describe('mutations', () => {
    it('should set students', () => {
      const students = [{ studentId: '123', name: 'John' }]
      studentModule.mutations.SET_STUDENTS(store.state, students)
      expect(store.state.students).toEqual(students)
    })

    it('should set pagination', () => {
      const pagination = { currentPage: 2, totalPages: 5 }
      studentModule.mutations.SET_PAGINATION(store.state, pagination)
      expect(store.state.currentPage).toBe(2)
      expect(store.state.totalPages).toBe(5)
    })

    it('should set selected student', () => {
      const student = { studentId: '123', name: 'John' }
      studentModule.mutations.SET_SELECTED_STUDENT(store.state, student)
      expect(store.state.selectedStudent).toEqual(student)
    })

    it('should set search mode', () => {
      studentModule.mutations.SET_SEARCH_MODE(store.state, true)
      expect(store.state.isSearchMode).toBe(true)
    })

    it('should set search query', () => {
      const query = 'John Doe'
      studentModule.mutations.SET_SEARCH_QUERY(store.state, query)
      expect(store.state.searchQuery).toBe(query)
    })

    it('should set selected department', () => {
      const departmentId = 'dept123'
      studentModule.mutations.SET_SELECTED_DEPARTMENT(store.state, departmentId)
      expect(store.state.selectedDepartment).toBe(departmentId)
    })

    it('should set loading state', () => {
      studentModule.mutations.SET_LOADING(store.state, true)
      expect(store.state.loading).toBe(true)
    })

    it('should set error state', () => {
      const error = 'Test error'
      studentModule.mutations.SET_ERROR(store.state, error)
      expect(store.state.error).toBe(error)
    })
  })

  describe('actions', () => {
    it('should fetch students successfully', async () => {
      const students = [{ studentId: '123', name: 'John' }]
      const mockResponse = {
        data: {
          metadata: {
            students,
            pagination: { totalPages: 3 }
          }
        }
      }
      
      api.student.getStudents.mockResolvedValue(mockResponse)
      
      await studentModule.actions.fetchStudents(store, { page: 1, limit: 10 })
      
      expect(store.commit).toHaveBeenCalledWith('SET_LOADING', true)
      expect(store.commit).toHaveBeenCalledWith('SET_STUDENTS', students)
      expect(store.commit).toHaveBeenCalledWith('SET_PAGINATION', {
        currentPage: 1,
        totalPages: 3
      })
      expect(store.commit).toHaveBeenCalledWith('SET_SEARCH_MODE', false)
      expect(store.commit).toHaveBeenCalledWith('SET_LOADING', false)
    })

    it('should handle fetch students error', async () => {
      const error = new Error('Fetch failed')
      api.student.getStudents.mockRejectedValue(error)
      
      await studentModule.actions.fetchStudents(store, { page: 1, limit: 10 })
      
      expect(store.commit).toHaveBeenCalledWith('SET_ERROR', 'Fetch failed')
    })

    it('should fetch single student successfully', async () => {
      const student = { studentId: '123', name: 'John' }
      const mockResponse = {
        data: {
          metadata: student
        }
      }
      
      api.student.getStudent.mockResolvedValue(mockResponse)
      
      await studentModule.actions.fetchStudent(store, '123')
      
      expect(store.commit).toHaveBeenCalledWith('SET_SELECTED_STUDENT', student)
    })

    it('should handle fetch single student error', async () => {
      const error = new Error('Student not found')
      api.student.getStudent.mockRejectedValue(error)
      
      await expect(studentModule.actions.fetchStudent(store, '123')).rejects.toThrow()
      
      expect(store.commit).toHaveBeenCalledWith('SET_ERROR', 'Student not found')
    })

    it('should create student successfully', async () => {
      const student = { studentId: '123', name: 'John' }
      
      api.student.createStudent.mockResolvedValue({})
      
      await studentModule.actions.createStudent(store, student)
      
      expect(api.student.createStudent).toHaveBeenCalledWith(student)
    })

    it('should handle create student error', async () => {
      const error = new Error('Create failed')
      api.student.createStudent.mockRejectedValue(error)
      
      await expect(studentModule.actions.createStudent(store, {})).rejects.toThrow()
      
      expect(store.commit).toHaveBeenCalledWith('SET_ERROR', 'Create failed')
    })

    it('should update student successfully', async () => {
      const id = '123'
      const student = { name: 'Updated John' }
      
      api.student.updateStudent.mockResolvedValue({})
      
      await studentModule.actions.updateStudent(store, { id, student })
      
      expect(api.student.updateStudent).toHaveBeenCalledWith(id, student)
    })

    it('should handle update student error', async () => {
      const error = new Error('Update failed')
      api.student.updateStudent.mockRejectedValue(error)
      
      await expect(studentModule.actions.updateStudent(store, { id: '123', student: {} })).rejects.toThrow()
      
      expect(store.commit).toHaveBeenCalledWith('SET_ERROR', 'Update failed')
    })

    it('should delete student successfully', async () => {
      const id = '123'
      
      api.student.deleteStudent.mockResolvedValue({})
      
      await studentModule.actions.deleteStudent(store, id)
      
      expect(api.student.deleteStudent).toHaveBeenCalledWith(id)
    })

    it('should handle delete student error', async () => {
      const error = new Error('Delete failed')
      api.student.deleteStudent.mockRejectedValue(error)
      
      await expect(studentModule.actions.deleteStudent(store, '123')).rejects.toThrow()
      
      expect(store.commit).toHaveBeenCalledWith('SET_ERROR', 'Delete failed')
    })

    it('should search students by query only', async () => {
      const students = [{ studentId: '123', name: 'John' }]
      const mockResponse = {
        data: {
          metadata: {
            students,
            pagination: { totalPages: 2 }
          }
        }
      }
      
      api.student.searchStudents.mockResolvedValue(mockResponse)
      
      await studentModule.actions.searchStudents(store, { 
        query: 'John', 
        departmentId: '', 
        page: 1, 
        limit: 10 
      })
      
      expect(api.student.searchStudents).toHaveBeenCalledWith('John', 1, 10)
      expect(store.commit).toHaveBeenCalledWith('SET_STUDENTS', students)
      expect(store.commit).toHaveBeenCalledWith('SET_SEARCH_MODE', true)
    })

    it('should search students by department only', async () => {
      const students = [{ studentId: '123', name: 'John' }]
      const mockResponse = {
        data: {
          metadata: {
            students,
            pagination: { totalPages: 2 }
          }
        }
      }
      
      api.student.getStudentsByDepartment.mockResolvedValue(mockResponse)
      
      await studentModule.actions.searchStudents(store, { 
        query: '', 
        departmentId: 'dept123', 
        page: 1, 
        limit: 10 
      })
      
      expect(api.student.getStudentsByDepartment).toHaveBeenCalledWith('dept123', 1, 10)
    })

    it('should search students by both query and department', async () => {
      const deptStudents = [
        { studentId: '123', fullName: 'John Doe' },
        { studentId: '124', fullName: 'Jane Smith' }
      ]
      const mockResponse = {
        data: {
          metadata: {
            students: deptStudents
          }
        }
      }
      
      api.student.getStudentsByDepartment.mockResolvedValue(mockResponse)
      
      await studentModule.actions.searchStudents(store, { 
        query: 'John', 
        departmentId: 'dept123', 
        page: 1, 
        limit: 10 
      })
      
      expect(store.commit).toHaveBeenCalledWith('SET_STUDENTS', [deptStudents[0]])
      expect(store.commit).toHaveBeenCalledWith('SET_PAGINATION', { currentPage: 1, totalPages: 1 })
    })

    it('should fetch all students when no search criteria', async () => {
      await studentModule.actions.searchStudents(store, { 
        query: '', 
        departmentId: '', 
        page: 1, 
        limit: 10 
      })
      
      expect(store.dispatch).toHaveBeenCalledWith('student/fetchStudents', { page: 1, limit: 10 })
    })

    it('should export students', () => {
      const format = 'csv'
      const result = studentModule.actions.exportStudents({}, format)
      
      expect(api.student.exportStudents).toHaveBeenCalledWith(format)
      expect(result).toEqual(expect.any(Object))
    })

    it('should import students successfully', async () => {
      const formData = new FormData()
      
      api.student.importStudents.mockResolvedValue({})
      
      await studentModule.actions.importStudents(store, formData)
      
      expect(api.student.importStudents).toHaveBeenCalledWith(formData)
    })

    it('should handle import students error', async () => {
      const error = new Error('Import failed')
      api.student.importStudents.mockRejectedValue(error)
      
      await expect(studentModule.actions.importStudents(store, new FormData())).rejects.toThrow()
      
      expect(store.commit).toHaveBeenCalledWith('SET_ERROR', 'Import failed')
    })
  })

  describe('getters', () => {
    beforeEach(() => {
      store.state.students = [
        { studentId: '123', name: 'John' },
        { studentId: '124', name: 'Jane' }
      ]
    })

    it('should get student by ID', () => {
      const student = studentModule.getters.getStudentById(store.state)('123')
      expect(student.name).toBe('John')
    })

    it('should return undefined for non-existent student', () => {
      const student = studentModule.getters.getStudentById(store.state)('999')
      expect(student).toBeUndefined()
    })
  })
})