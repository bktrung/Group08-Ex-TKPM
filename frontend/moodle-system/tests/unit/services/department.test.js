import departmentService from '@/services/department';
import apiClient from '@/services/client';

jest.mock('@/services/client');

describe('Department Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

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
      };
      
      apiClient.get.mockResolvedValue(mockResponse);

      const result = await departmentService.getDepartments();

      expect(apiClient.get).toHaveBeenCalledWith('/v1/api/departments');
      expect(result).toBe(mockResponse);
    });
  });

  describe('createDepartment', () => {
    it('should create new department', async () => {
      const departmentData = { name: 'Physics' };
      const mockResponse = { data: { success: true } };
      
      apiClient.post.mockResolvedValue(mockResponse);

      const result = await departmentService.createDepartment(departmentData);

      expect(apiClient.post).toHaveBeenCalledWith('/v1/api/departments', departmentData);
      expect(result).toBe(mockResponse);
    });
  });

  describe('updateDepartment', () => {
    it('should update existing department', async () => {
      const departmentData = { name: 'Updated Physics' };
      const mockResponse = { data: { success: true } };
      
      apiClient.patch.mockResolvedValue(mockResponse);

      const result = await departmentService.updateDepartment('1', departmentData);

      expect(apiClient.patch).toHaveBeenCalledWith('/v1/api/departments/1', departmentData);
      expect(result).toBe(mockResponse);
    });
  });

  describe('deleteDepartment', () => {
    it('should delete department', async () => {
      const mockResponse = { data: { success: true } };
      
      apiClient.delete.mockResolvedValue(mockResponse);

      const result = await departmentService.deleteDepartment('1');

      expect(apiClient.delete).toHaveBeenCalledWith('/v1/api/departments/1');
      expect(result).toBe(mockResponse);
    });
  });
});