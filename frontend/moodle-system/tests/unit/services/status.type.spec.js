import statusTypeService from '@/services/status.type';
import apiClient from '@/services/client';

jest.mock('@/services/client');

describe('Status Type Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getStatusTypes', () => {
    it('should fetch all status types', async () => {
      const mockResponse = {
        data: {
          metadata: [
            { _id: '1', type: 'Active' },
            { _id: '2', type: 'Inactive' }
          ]
        }
      };
      
      apiClient.get.mockResolvedValue(mockResponse);

      const result = await statusTypeService.getStatusTypes();

      expect(apiClient.get).toHaveBeenCalledWith('/v1/api/students/status-types');
      expect(result).toBe(mockResponse);
    });
  });

  describe('createStatusType', () => {
    it('should create new status type', async () => {
      const statusTypeData = { type: 'Pending' };
      const mockResponse = { data: { success: true } };
      
      apiClient.post.mockResolvedValue(mockResponse);

      const result = await statusTypeService.createStatusType(statusTypeData);

      expect(apiClient.post).toHaveBeenCalledWith('/v1/api/students/status-types', statusTypeData);
      expect(result).toBe(mockResponse);
    });
  });

  describe('updateStatusType', () => {
    it('should update existing status type', async () => {
      const statusTypeData = { type: 'Updated Active' };
      const mockResponse = { data: { success: true } };
      
      apiClient.put.mockResolvedValue(mockResponse);

      const result = await statusTypeService.updateStatusType('1', statusTypeData);

      expect(apiClient.put).toHaveBeenCalledWith('/v1/api/students/status-types/1', statusTypeData);
      expect(result).toBe(mockResponse);
    });
  });

  describe('deleteStatusType', () => {
    it('should delete status type', async () => {
      const mockResponse = { data: { success: true } };
      
      apiClient.delete.mockResolvedValue(mockResponse);

      const result = await statusTypeService.deleteStatusType('1');

      expect(apiClient.delete).toHaveBeenCalledWith('/v1/api/students/status-types/1');
      expect(result).toBe(mockResponse);
    });
  });
});