import departmentService from '@/services/department.js'
import apiClient from '@/services/client.js'

jest.mock('@/services/client.js')

describe('Department Service', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('getDepartments', () => {
    it('should fetch all departments', async () => {
      const mockResponse = { 
        data: { 
          metadata: { 
            departments: [
              { _id: '1', name: 'Computer Science' },
              { _id: '2', name: 'Mathematics' }
            ]
          }
        }
      }
      apiClient.get.mockResolvedValue(mockResponse)

      const result = await departmentService.getDepartments()

      expect(apiClient.get).toHaveBeenCalledWith('/v1/api/departments')
      expect(result).toEqual(mockResponse)
    })

    it('should handle API errors', async () => {
      const error = new Error('API Error')
      apiClient.get.mockRejectedValue(error)

      await expect(departmentService.getDepartments()).rejects.toThrow('API Error')
    })
  })

  describe('createDepartment', () => {
    it('should create a new department', async () => {
      const departmentData = { name: 'Physics' }
      const mockResponse = { 
        data: { 
          metadata: { 
            department: { _id: '3', name: 'Physics' }
          }
        }
      }
      apiClient.post.mockResolvedValue(mockResponse)

      const result = await departmentService.createDepartment(departmentData)

      expect(apiClient.post).toHaveBeenCalledWith('/v1/api/departments', departmentData)
      expect(result).toEqual(mockResponse)
    })

    it('should handle creation errors', async () => {
      const departmentData = { name: 'Physics' }
      const error = new Error('Creation failed')
      apiClient.post.mockRejectedValue(error)

      await expect(departmentService.createDepartment(departmentData)).rejects.toThrow('Creation failed')
    })
  })

  describe('updateDepartment', () => {
    it('should update an existing department', async () => {
      const departmentId = '123'
      const updateData = { name: 'Updated Physics' }
      const mockResponse = { 
        data: { 
          metadata: { 
            department: { _id: '123', name: 'Updated Physics' }
          }
        }
      }
      apiClient.patch.mockResolvedValue(mockResponse)

      const result = await departmentService.updateDepartment(departmentId, updateData)

      expect(apiClient.patch).toHaveBeenCalledWith('/v1/api/departments/123', updateData)
      expect(result).toEqual(mockResponse)
    })

    it('should handle update errors', async () => {
      const departmentId = '123'
      const updateData = { name: 'Updated Physics' }
      const error = new Error('Update failed')
      apiClient.patch.mockRejectedValue(error)

      await expect(departmentService.updateDepartment(departmentId, updateData)).rejects.toThrow('Update failed')
    })
  })

  describe('deleteDepartment', () => {
    it('should delete a department by id', async () => {
      const departmentId = '123'
      const mockResponse = { 
        data: { 
          success: true,
          message: 'Department deleted successfully'
        }
      }
      apiClient.delete.mockResolvedValue(mockResponse)

      const result = await departmentService.deleteDepartment(departmentId)

      expect(apiClient.delete).toHaveBeenCalledWith('/v1/api/departments/123')
      expect(result).toEqual(mockResponse)
    })

    it('should handle deletion errors', async () => {
      const departmentId = '123'
      const error = new Error('Deletion failed')
      apiClient.delete.mockRejectedValue(error)

      await expect(departmentService.deleteDepartment(departmentId)).rejects.toThrow('Deletion failed')
    })
  })

  describe('Edge cases', () => {
    it('should handle null or undefined department data', async () => {
      const mockResponse = { data: { success: true } }
      apiClient.post.mockResolvedValue(mockResponse)

      await departmentService.createDepartment(null)
      expect(apiClient.post).toHaveBeenCalledWith('/v1/api/departments', null)

      await departmentService.createDepartment(undefined)
      expect(apiClient.post).toHaveBeenCalledWith('/v1/api/departments', undefined)
    })

    it('should handle empty department data', async () => {
      const mockResponse = { data: { success: true } }
      apiClient.post.mockResolvedValue(mockResponse)

      await departmentService.createDepartment({})
      expect(apiClient.post).toHaveBeenCalledWith('/v1/api/departments', {})
    })

    it('should handle special characters in department names', async () => {
      const departmentData = { name: 'Physics & Chemistry' }
      const mockResponse = { data: { success: true } }
      apiClient.post.mockResolvedValue(mockResponse)

      await departmentService.createDepartment(departmentData)
      expect(apiClient.post).toHaveBeenCalledWith('/v1/api/departments', departmentData)
    })
  })
})