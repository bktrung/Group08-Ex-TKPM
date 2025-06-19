import studentApi from '@/services/student';
import apiClient from '@/services/client';

jest.mock('@/services/client');

describe('Student Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getStudents', () => {
    it('should fetch students with pagination', async () => {
      const mockResponse = { data: { students: [] } };
      apiClient.get.mockResolvedValue(mockResponse);

      const result = await studentApi.getStudents(1, 10);

      expect(apiClient.get).toHaveBeenCalledWith('/v1/api/students?page=1&limit=10');
      expect(result).toBe(mockResponse);
    });

    it('should use default pagination values', async () => {
      const mockResponse = { data: { students: [] } };
      apiClient.get.mockResolvedValue(mockResponse);

      await studentApi.getStudents();

      expect(apiClient.get).toHaveBeenCalledWith('/v1/api/students?page=1&limit=10');
    });
  });

  describe('getStudent', () => {
    it('should find student by ID', async () => {
      const mockStudents = [
        { studentId: '123', name: 'John' },
        { studentId: '456', name: 'Jane' }
      ];
      const mockResponse = {
        data: { metadata: { students: mockStudents } }
      };
      apiClient.get.mockResolvedValue(mockResponse);

      const result = await studentApi.getStudent('123');

      expect(result.data.metadata.studentId).toBe('123');
    });

    it('should throw error when student not found', async () => {
      const mockResponse = {
        data: { metadata: { students: [] } }
      };
      apiClient.get.mockResolvedValue(mockResponse);

      await expect(studentApi.getStudent('999')).rejects.toThrow('Student not found');
    });
  });

  describe('createStudent', () => {
    it('should create a new student', async () => {
      const studentData = { name: 'John Doe', email: 'john@example.com' };
      const mockResponse = { data: { student: studentData } };
      apiClient.post.mockResolvedValue(mockResponse);

      const result = await studentApi.createStudent(studentData);

      expect(apiClient.post).toHaveBeenCalledWith('/v1/api/students', studentData);
      expect(result).toBe(mockResponse);
    });
  });

  describe('updateStudent', () => {
    it('should update existing student', async () => {
      const studentData = { name: 'John Updated' };
      const mockResponse = { data: { student: studentData } };
      apiClient.patch.mockResolvedValue(mockResponse);

      const result = await studentApi.updateStudent('123', studentData);

      expect(apiClient.patch).toHaveBeenCalledWith('/v1/api/students/123', studentData);
      expect(result).toBe(mockResponse);
    });
  });

  describe('deleteStudent', () => {
    it('should delete student', async () => {
      const mockResponse = { data: { success: true } };
      apiClient.delete.mockResolvedValue(mockResponse);

      const result = await studentApi.deleteStudent('123');

      expect(apiClient.delete).toHaveBeenCalledWith('/v1/api/students/123');
      expect(result).toBe(mockResponse);
    });
  });

  describe('searchStudents', () => {
    it('should search students with query and pagination', async () => {
      const mockResponse = { data: { students: [] } };
      apiClient.get.mockResolvedValue(mockResponse);

      await studentApi.searchStudents('john', 1, 10);

      expect(apiClient.get).toHaveBeenCalledWith('/v1/api/students/search?q=john&page=1&limit=10');
    });

    it('should encode search query', async () => {
      const mockResponse = { data: { students: [] } };
      apiClient.get.mockResolvedValue(mockResponse);

      await studentApi.searchStudents('john doe');

      expect(apiClient.get).toHaveBeenCalledWith('/v1/api/students/search?q=john%20doe&page=1&limit=10');
    });
  });

  describe('getStudentsByDepartment', () => {
    it('should fetch students by department', async () => {
      const mockResponse = { data: { students: [] } };
      apiClient.get.mockResolvedValue(mockResponse);

      await studentApi.getStudentsByDepartment('dept123', 1, 10);

      expect(apiClient.get).toHaveBeenCalledWith('/v1/api/students/department/dept123?page=1&limit=10');
    });
  });

  describe('exportStudents', () => {
    it('should open export URL in new window', () => {
      const mockOpen = jest.fn();
      global.window.open = mockOpen;

      studentApi.exportStudents('csv');

      expect(mockOpen).toHaveBeenCalledWith(
        expect.stringContaining('/v1/api/export/students?format=csv'),
        '_blank'
      );
    });
  });

  describe('importStudents', () => {
    it('should import students with form data', async () => {
      const formData = new FormData();
      const mockResponse = { data: { success: true } };
      apiClient.post.mockResolvedValue(mockResponse);

      const result = await studentApi.importStudents(formData);

      expect(apiClient.post).toHaveBeenCalledWith('/v1/api/import/students', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      expect(result).toBe(mockResponse);
    });
  });
});