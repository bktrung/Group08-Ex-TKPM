import programService from '@/services/program';
import apiClient from '@/services/client';

jest.mock('@/services/client');

describe('Program Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getPrograms', () => {
    it('should fetch all programs', async () => {
      const mockResponse = {
        data: {
          metadata: {
            programs: [
              { _id: '1', name: 'Bachelor' },
              { _id: '2', name: 'Master' }
            ]
          }
        }
      };
      
      apiClient.get.mockResolvedValue(mockResponse);

      const result = await programService.getPrograms();

      expect(apiClient.get).toHaveBeenCalledWith('/v1/api/programs');
      expect(result).toBe(mockResponse);
    });
  });

  describe('createProgram', () => {
    it('should create new program', async () => {
      const programData = { name: 'PhD' };
      const mockResponse = { data: { success: true } };
      
      apiClient.post.mockResolvedValue(mockResponse);

      const result = await programService.createProgram(programData);

      expect(apiClient.post).toHaveBeenCalledWith('/v1/api/programs', programData);
      expect(result).toBe(mockResponse);
    });
  });

  describe('updateProgram', () => {
    it('should update existing program', async () => {
      const programData = { name: 'Updated PhD' };
      const mockResponse = { data: { success: true } };
      
      apiClient.patch.mockResolvedValue(mockResponse);

      const result = await programService.updateProgram('1', programData);

      expect(apiClient.patch).toHaveBeenCalledWith('/v1/api/programs/1', programData);
      expect(result).toBe(mockResponse);
    });
  });

  describe('deleteProgram', () => {
    it('should delete program', async () => {
      const mockResponse = { data: { success: true } };
      
      apiClient.delete.mockResolvedValue(mockResponse);

      const result = await programService.deleteProgram('1');

      expect(apiClient.delete).toHaveBeenCalledWith('/v1/api/programs/1');
      expect(result).toBe(mockResponse);
    });
  });
});