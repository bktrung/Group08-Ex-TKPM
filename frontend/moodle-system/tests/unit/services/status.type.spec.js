import statusTypeService from '@/services/status.type.js'
import apiClient from '@/services/client.js'

jest.mock('@/services/client.js')

describe('Status Type Service', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('getStatusTypes', () => {
    it('should fetch all status types', async () => {
      const mockResponse = { 
        data: { 
          metadata: [
            { _id: '1', type: 'Active' },
            { _id: '2', type: 'Inactive' },
            { _id: '3', type: 'Suspended' },
            { _id: '4', type: 'Graduated' }
          ]
        }
      }
      apiClient.get.mockResolvedValue(mockResponse)

      const result = await statusTypeService.getStatusTypes()

      expect(apiClient.get).toHaveBeenCalledWith('/v1/api/students/status-types')
      expect(result).toEqual(mockResponse)
    })

    it('should handle empty status types response', async () => {
      const mockResponse = { 
        data: { metadata: [] }
      }
      apiClient.get.mockResolvedValue(mockResponse)

      const result = await statusTypeService.getStatusTypes()
      expect(result.data.metadata).toEqual([])
    })

    it('should handle API errors', async () => {
      const error = new Error('Failed to fetch status types')
      apiClient.get.mockRejectedValue(error)

      await expect(statusTypeService.getStatusTypes()).rejects.toThrow('Failed to fetch status types')
    })

    it('should handle malformed response', async () => {
      const mockResponse = { data: null }
      apiClient.get.mockResolvedValue(mockResponse)

      const result = await statusTypeService.getStatusTypes()
      expect(result).toEqual(mockResponse)
    })
  })

  describe('createStatusType', () => {
    it('should create a new status type', async () => {
      const statusTypeData = { type: 'Probation' }
      const mockResponse = { 
        data: { 
          metadata: {
            statusType: { _id: '5', type: 'Probation' }
          }
        }
      }
      apiClient.post.mockResolvedValue(mockResponse)

      const result = await statusTypeService.createStatusType(statusTypeData)

      expect(apiClient.post).toHaveBeenCalledWith('/v1/api/students/status-types', statusTypeData)
      expect(result).toEqual(mockResponse)
    })

    it('should handle creation with empty type', async () => {
      const statusTypeData = { type: '' }
      const mockResponse = { data: { success: true } }
      apiClient.post.mockResolvedValue(mockResponse)

      await statusTypeService.createStatusType(statusTypeData)
      expect(apiClient.post).toHaveBeenCalledWith('/v1/api/students/status-types', statusTypeData)
    })

    it('should handle creation with additional fields', async () => {
      const statusTypeData = { 
        type: 'Probation',
        description: 'Student on academic probation',
        isActive: true
      }
      const mockResponse = { data: { success: true } }
      apiClient.post.mockResolvedValue(mockResponse)

      await statusTypeService.createStatusType(statusTypeData)
      expect(apiClient.post).toHaveBeenCalledWith('/v1/api/students/status-types', statusTypeData)
    })

    it('should handle creation errors', async () => {
      const statusTypeData = { type: 'Probation' }
      const error = new Error('Creation failed')
      apiClient.post.mockRejectedValue(error)

      await expect(statusTypeService.createStatusType(statusTypeData)).rejects.toThrow('Creation failed')
    })

    it('should handle null/undefined status type data', async () => {
      const mockResponse = { data: { success: true } }
      apiClient.post.mockResolvedValue(mockResponse)

      await statusTypeService.createStatusType(null)
      expect(apiClient.post).toHaveBeenCalledWith('/v1/api/students/status-types', null)

      await statusTypeService.createStatusType(undefined)
      expect(apiClient.post).toHaveBeenCalledWith('/v1/api/students/status-types', undefined)
    })
  })

  describe('updateStatusType', () => {
    it('should update an existing status type', async () => {
      const statusTypeId = '123'
      const updateData = { type: 'Updated Active' }
      const mockResponse = { 
        data: { 
          metadata: {
            statusType: { _id: '123', type: 'Updated Active' }
          }
        }
      }
      apiClient.put.mockResolvedValue(mockResponse)

      const result = await statusTypeService.updateStatusType(statusTypeId, updateData)

      expect(apiClient.put).toHaveBeenCalledWith('/v1/api/students/status-types/123', updateData)
      expect(result).toEqual(mockResponse)
    })

    it('should handle update with multiple fields', async () => {
      const statusTypeId = '123'
      const updateData = { 
        type: 'Updated Active',
        description: 'Updated description',
        isActive: false
      }
      const mockResponse = { data: { success: true } }
      apiClient.put.mockResolvedValue(mockResponse)

      await statusTypeService.updateStatusType(statusTypeId, updateData)
      expect(apiClient.put).toHaveBeenCalledWith('/v1/api/students/status-types/123', updateData)
    })

    it('should handle update errors', async () => {
      const statusTypeId = '123'
      const updateData = { type: 'Updated Active' }
      const error = new Error('Update failed')
      apiClient.put.mockRejectedValue(error)

      await expect(statusTypeService.updateStatusType(statusTypeId, updateData)).rejects.toThrow('Update failed')
    })

    it('should handle empty update data', async () => {
      const statusTypeId = '123'
      const updateData = {}
      const mockResponse = { data: { success: true } }
      apiClient.put.mockResolvedValue(mockResponse)

      await statusTypeService.updateStatusType(statusTypeId, updateData)
      expect(apiClient.put).toHaveBeenCalledWith('/v1/api/students/status-types/123', {})
    })

    it('should handle invalid status type ID', async () => {
      const updateData = { type: 'Updated type' }
      const mockResponse = { data: { success: true } }
      apiClient.put.mockResolvedValue(mockResponse)

      await statusTypeService.updateStatusType('', updateData)
      expect(apiClient.put).toHaveBeenCalledWith('/v1/api/students/status-types/', updateData)

      await statusTypeService.updateStatusType(null, updateData)
      expect(apiClient.put).toHaveBeenCalledWith('/v1/api/students/status-types/null', updateData)
    })
  })

  describe('deleteStatusType', () => {
    it('should delete a status type by id', async () => {
      const statusTypeId = '123'
      const mockResponse = { 
        data: { 
          success: true,
          message: 'Status type deleted successfully'
        }
      }
      apiClient.delete.mockResolvedValue(mockResponse)

      const result = await statusTypeService.deleteStatusType(statusTypeId)

      expect(apiClient.delete).toHaveBeenCalledWith('/v1/api/students/status-types/123')
      expect(result).toEqual(mockResponse)
    })

    it('should handle deletion errors', async () => {
      const statusTypeId = '123'
      const error = new Error('Deletion failed')
      apiClient.delete.mockRejectedValue(error)

      await expect(statusTypeService.deleteStatusType(statusTypeId)).rejects.toThrow('Deletion failed')
    })

    it('should handle invalid status type ID', async () => {
      const mockResponse = { data: { error: 'Invalid status type ID' } }
      apiClient.delete.mockResolvedValue(mockResponse)

      await statusTypeService.deleteStatusType('')
      expect(apiClient.delete).toHaveBeenCalledWith('/v1/api/students/status-types/')

      await statusTypeService.deleteStatusType(null)
      expect(apiClient.delete).toHaveBeenCalledWith('/v1/api/students/status-types/null')

      await statusTypeService.deleteStatusType(undefined)
      expect(apiClient.delete).toHaveBeenCalledWith('/v1/api/students/status-types/undefined')
    })
  })

  describe('Error handling and edge cases', () => {
    it('should handle network errors', async () => {
      const networkError = { 
        code: 'NETWORK_ERROR',
        message: 'Network Error' 
      }
      apiClient.get.mockRejectedValue(networkError)

      await expect(statusTypeService.getStatusTypes()).rejects.toMatchObject(networkError)
    })

    it('should handle timeout errors', async () => {
      const timeoutError = { 
        code: 'ECONNABORTED',
        message: 'timeout of 5000ms exceeded' 
      }
      apiClient.post.mockRejectedValue(timeoutError)

      await expect(statusTypeService.createStatusType({ type: 'Test' }))
        .rejects.toMatchObject(timeoutError)
    })

    it('should handle server errors', async () => {
      const serverError = { 
        response: { 
          status: 500, 
          data: { message: 'Internal Server Error' } 
        } 
      }
      apiClient.put.mockRejectedValue(serverError)

      await expect(statusTypeService.updateStatusType('123', { type: 'Test' }))
        .rejects.toMatchObject(serverError)
    })

    it('should handle validation errors', async () => {
      const validationError = { 
        response: { 
          status: 400, 
          data: { 
            message: 'Validation failed',
            errors: ['Type is required'] 
          } 
        } 
      }
      apiClient.post.mockRejectedValue(validationError)

      await expect(statusTypeService.createStatusType({ type: '' }))
        .rejects.toMatchObject(validationError)
    })

    it('should handle duplicate status type errors', async () => {
      const duplicateError = { 
        response: { 
          status: 409, 
          data: { 
            message: 'Status type already exists'
          } 
        } 
      }
      apiClient.post.mockRejectedValue(duplicateError)

      await expect(statusTypeService.createStatusType({ type: 'Active' }))
        .rejects.toMatchObject(duplicateError)
    })

    it('should handle special characters in status types', async () => {
      const statusTypeData = { type: 'On-Hold/Suspended' }
      const mockResponse = { data: { success: true } }
      apiClient.post.mockResolvedValue(mockResponse)

      await statusTypeService.createStatusType(statusTypeData)
      expect(apiClient.post).toHaveBeenCalledWith('/v1/api/students/status-types', statusTypeData)
    })

    it('should handle very long status type names', async () => {
      const statusTypeData = { type: 'A'.repeat(1000) }
      const mockResponse = { data: { success: true } }
      apiClient.post.mockResolvedValue(mockResponse)

      await statusTypeService.createStatusType(statusTypeData)
      expect(apiClient.post).toHaveBeenCalledWith('/v1/api/students/status-types', statusTypeData)
    })

    it('should handle unicode characters in status types', async () => {
      const statusTypeData = { type: 'Đang học' }
      const mockResponse = { data: { success: true } }
      apiClient.post.mockResolvedValue(mockResponse)

      await statusTypeService.createStatusType(statusTypeData)
      expect(apiClient.post).toHaveBeenCalledWith('/v1/api/students/status-types', statusTypeData)
    })
  })
})