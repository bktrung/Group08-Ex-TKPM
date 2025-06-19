import statusTransitionService from '@/services/status.transition';
import apiClient from '@/services/client';

jest.mock('@/services/client');

describe('Status Transition Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getStatusTransitions', () => {
    it('should fetch all status transitions', async () => {
      const mockResponse = {
        data: {
          metadata: [
            {
              fromStatusId: 'status1',
              toStatus: [{ _id: 'status2', type: 'Inactive' }]
            }
          ]
        }
      };
      
      apiClient.get.mockResolvedValue(mockResponse);

      const result = await statusTransitionService.getStatusTransitions();

      expect(apiClient.get).toHaveBeenCalledWith('/v1/api/students/status-transitions');
      expect(result).toBe(mockResponse);
    });
  });

  describe('createStatusTransition', () => {
    it('should create new status transition', async () => {
      const transitionData = {
        fromStatus: 'status1',
        toStatus: 'status2'
      };
      const mockResponse = { data: { success: true } };
      
      apiClient.post.mockResolvedValue(mockResponse);

      const result = await statusTransitionService.createStatusTransition(transitionData);

      expect(apiClient.post).toHaveBeenCalledWith('/v1/api/students/status-transitions', transitionData);
      expect(result).toBe(mockResponse);
    });
  });

  describe('deleteStatusTransition', () => {
    it('should delete status transition', async () => {
      const transitionData = {
        fromStatus: 'status1',
        toStatus: 'status2'
      };
      const mockResponse = { data: { success: true } };
      
      apiClient.delete.mockResolvedValue(mockResponse);

      const result = await statusTransitionService.deleteStatusTransition(transitionData);

      expect(apiClient.delete).toHaveBeenCalledWith('/v1/api/students/status-transitions', { data: transitionData });
      expect(result).toBe(mockResponse);
    });
  });
});