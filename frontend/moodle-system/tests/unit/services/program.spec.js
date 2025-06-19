import programService from '@/services/program.js'
import apiClient from '@/services/client.js'

jest.mock('@/services/client.js')

describe('Program Service', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('getPrograms', () => {
    it('should fetch all programs', async () => {
      const mockResponse = { 
        data: { 
          metadata: {
            programs: [
              { _id: '1', name: 'Computer Science' },
              { _id: '2', name: 'Software Engineering' },
              { _id: '3', name: 'Information Technology' }
            ]
          }
        }
      }
      apiClient.get.mockResolvedValue(mockResponse)

      const result = await programService.getPrograms()

      expect(apiClient.get).toHaveBeenCalledWith('/v1/api/programs')
      expect(result).toEqual(mockResponse)
    })

    it('should handle empty programs response', async () => {
      const mockResponse = { 
        data: { 
          metadata: { programs: [] }
        }
      }
      apiClient.get.mockResolvedValue(mockResponse)

      const result = await programService.getPrograms()
      expect(result.data.metadata.programs).toEqual([])
    })

    it('should handle API errors', async () => {
      const error = new Error('Failed to fetch programs')
      apiClient.get.mockRejectedValue(error)

      await expect(programService.getPrograms()).rejects.toThrow('Failed to fetch programs')
    })

    it('should handle malformed response', async () => {
      const mockResponse = { data: null }
      apiClient.get.mockResolvedValue(mockResponse)

      const result = await programService.getPrograms()
      expect(result).toEqual(mockResponse)
    })
  })

  describe('createProgram', () => {
    it('should create a new program', async () => {
      const programData = { name: 'Data Science' }
      const mockResponse = { 
        data: { 
          metadata: {
            program: { _id: '4', name: 'Data Science' }
          }
        }
      }
      apiClient.post.mockResolvedValue(mockResponse)

      const result = await programService.createProgram(programData)

      expect(apiClient.post).toHaveBeenCalledWith('/v1/api/programs', programData)
      expect(result).toEqual(mockResponse)
    })

    it('should handle creation with empty name', async () => {
      const programData = { name: '' }
      const mockResponse = { data: { success: true } }
      apiClient.post.mockResolvedValue(mockResponse)

      await programService.createProgram(programData)
      expect(apiClient.post).toHaveBeenCalledWith('/v1/api/programs', programData)
    })

    it('should handle creation with additional fields', async () => {
      const programData = { 
        name: 'Data Science',
        description: 'Advanced data science program',
        duration: 4
      }
      const mockResponse = { data: { success: true } }
      apiClient.post.mockResolvedValue(mockResponse)

      await programService.createProgram(programData)
      expect(apiClient.post).toHaveBeenCalledWith('/v1/api/programs', programData)
    })

    it('should handle creation errors', async () => {
      const programData = { name: 'Data Science' }
      const error = new Error('Creation failed')
      apiClient.post.mockRejectedValue(error)

      await expect(programService.createProgram(programData)).rejects.toThrow('Creation failed')
    })

    it('should handle null/undefined program data', async () => {
      const mockResponse = { data: { success: true } }
      apiClient.post.mockResolvedValue(mockResponse)

      await programService.createProgram(null)
      expect(apiClient.post).toHaveBeenCalledWith('/v1/api/programs', null)

      await programService.createProgram(undefined)
      expect(apiClient.post).toHaveBeenCalledWith('/v1/api/programs', undefined)
    })
  })

  describe('updateProgram', () => {
    it('should update an existing program', async () => {
      const programId = '123'
      const updateData = { name: 'Updated Computer Science' }
      const mockResponse = { 
        data: { 
          metadata: {
            program: { _id: '123', name: 'Updated Computer Science' }
          }
        }
      }
      apiClient.patch.mockResolvedValue(mockResponse)

      const result = await programService.updateProgram(programId, updateData)

      expect(apiClient.patch).toHaveBeenCalledWith('/v1/api/programs/123', updateData)
      expect(result).toEqual(mockResponse)
    })

    it('should handle update with multiple fields', async () => {
      const programId = '123'
      const updateData = { 
        name: 'Updated Computer Science',
        description: 'Updated description',
        duration: 5
      }
      const mockResponse = { data: { success: true } }
      apiClient.patch.mockResolvedValue(mockResponse)

      await programService.updateProgram(programId, updateData)
      expect(apiClient.patch).toHaveBeenCalledWith('/v1/api/programs/123', updateData)
    })

    it('should handle update errors', async () => {
      const programId = '123'
      const updateData = { name: 'Updated Computer Science' }
      const error = new Error('Update failed')
      apiClient.patch.mockRejectedValue(error)

      await expect(programService.updateProgram(programId, updateData)).rejects.toThrow('Update failed')
    })

    it('should handle empty update data', async () => {
      const programId = '123'
      const updateData = {}
      const mockResponse = { data: { success: true } }
      apiClient.patch.mockResolvedValue(mockResponse)

      await programService.updateProgram(programId, updateData)
      expect(apiClient.patch).toHaveBeenCalledWith('/v1/api/programs/123', {})
    })

    it('should handle invalid program ID', async () => {
      const updateData = { name: 'Updated name' }
      const mockResponse = { data: { success: true } }
      apiClient.patch.mockResolvedValue(mockResponse)

      await programService.updateProgram('', updateData)
      expect(apiClient.patch).toHaveBeenCalledWith('/v1/api/programs/', updateData)

      await programService.updateProgram(null, updateData)
      expect(apiClient.patch).toHaveBeenCalledWith('/v1/api/programs/null', updateData)
    })
  })

  describe('deleteProgram', () => {
    it('should delete a program by id', async () => {
      const programId = '123'
      const mockResponse = { 
        data: { 
          success: true,
          message: 'Program deleted successfully'
        }
      }
      apiClient.delete.mockResolvedValue(mockResponse)

      const result = await programService.deleteProgram(programId)

      expect(apiClient.delete).toHaveBeenCalledWith('/v1/api/programs/123')
      expect(result).toEqual(mockResponse)
    })

    it('should handle deletion errors', async () => {
      const programId = '123'
      const error = new Error('Deletion failed')
      apiClient.delete.mockRejectedValue(error)

      await expect(programService.deleteProgram(programId)).rejects.toThrow('Deletion failed')
    })

    it('should handle invalid program ID', async () => {
      const mockResponse = { data: { error: 'Invalid program ID' } }
      apiClient.delete.mockResolvedValue(mockResponse)

      await programService.deleteProgram('')
      expect(apiClient.delete).toHaveBeenCalledWith('/v1/api/programs/')

      await programService.deleteProgram(null)
      expect(apiClient.delete).toHaveBeenCalledWith('/v1/api/programs/null')

      await programService.deleteProgram(undefined)
      expect(apiClient.delete).toHaveBeenCalledWith('/v1/api/programs/undefined')
    })
  })

  describe('Error handling and edge cases', () => {
    it('should handle network errors', async () => {
      const networkError = { 
        code: 'NETWORK_ERROR',
        message: 'Network Error' 
      }
      apiClient.get.mockRejectedValue(networkError)

      await expect(programService.getPrograms()).rejects.toMatchObject(networkError)
    })

    it('should handle timeout errors', async () => {
      const timeoutError = { 
        code: 'ECONNABORTED',
        message: 'timeout of 5000ms exceeded' 
      }
      apiClient.post.mockRejectedValue(timeoutError)

      await expect(programService.createProgram({ name: 'Test' }))
        .rejects.toMatchObject(timeoutError)
    })

    it('should handle server errors', async () => {
      const serverError = { 
        response: { 
          status: 500, 
          data: { message: 'Internal Server Error' } 
        } 
      }
      apiClient.patch.mockRejectedValue(serverError)

      await expect(programService.updateProgram('123', { name: 'Test' }))
        .rejects.toMatchObject(serverError)
    })

    it('should handle validation errors', async () => {
      const validationError = { 
        response: { 
          status: 400, 
          data: { 
            message: 'Validation failed',
            errors: ['Name is required'] 
          } 
        } 
      }
      apiClient.post.mockRejectedValue(validationError)

      await expect(programService.createProgram({ name: '' }))
        .rejects.toMatchObject(validationError)
    })

    it('should handle special characters in program names', async () => {
      const programData = { name: 'Computer Science & Engineering' }
      const mockResponse = { data: { success: true } }
      apiClient.post.mockResolvedValue(mockResponse)

      await programService.createProgram(programData)
      expect(apiClient.post).toHaveBeenCalledWith('/v1/api/programs', programData)
    })

    it('should handle very long program names', async () => {
      const programData = { name: 'A'.repeat(1000) }
      const mockResponse = { data: { success: true } }
      apiClient.post.mockResolvedValue(mockResponse)

      await programService.createProgram(programData)
      expect(apiClient.post).toHaveBeenCalledWith('/v1/api/programs', programData)
    })
  })
})