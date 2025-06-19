import courseService from '@/services/course';
import apiClient from '@/services/client';

jest.mock('@/services/client');

describe('Course Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getCourses', () => {
    it('should fetch courses with parameters', async () => {
      const mockResponse = { data: { courses: [] } };
      apiClient.get.mockResolvedValue(mockResponse);

      const params = { departmentId: 'dept1', page: 1, limit: 10 };
      await courseService.getCourses(params);

      expect(apiClient.get).toHaveBeenCalledWith('/v1/api/courses?departmentId=dept1&page=1&limit=10');
    });

    it('should fetch courses without parameters', async () => {
      const mockResponse = { data: { courses: [] } };
      apiClient.get.mockResolvedValue(mockResponse);

      await courseService.getCourses();

      expect(apiClient.get).toHaveBeenCalledWith('/v1/api/courses');
    });

    it('should handle API errors', async () => {
      const error = new Error('API Error');
      apiClient.get.mockRejectedValue(error);

      await expect(courseService.getCourses()).rejects.toThrow('API Error');
    });
  });

  describe('createCourse', () => {
    it('should create course with validated data', async () => {
      const courseData = {
        courseCode: 'CS101',
        name: 'Computer Science',
        credits: '3',
        department: 'dept1',
        description: 'Course description',
        prerequisites: ['prereq1']
      };

      const expectedData = {
        courseCode: 'CS101',
        name: 'Computer Science',
        credits: 3,
        department: 'dept1',
        description: 'Course description',
        prerequisites: ['prereq1']
      };

      const mockResponse = { data: { course: expectedData } };
      apiClient.post.mockResolvedValue(mockResponse);

      const result = await courseService.createCourse(courseData);

      expect(apiClient.post).toHaveBeenCalledWith('/v1/api/courses', expectedData);
      expect(result).toBe(mockResponse);
    });

    it('should handle missing prerequisites', async () => {
      const courseData = {
        courseCode: 'CS101',
        name: 'Computer Science',
        credits: 3,
        department: 'dept1',
        description: 'Course description'
      };

      const expectedData = { ...courseData, prerequisites: [] };
      const mockResponse = { data: { course: expectedData } };
      apiClient.post.mockResolvedValue(mockResponse);

      await courseService.createCourse(courseData);

      expect(apiClient.post).toHaveBeenCalledWith('/v1/api/courses', expectedData);
    });
  });

  describe('updateCourse', () => {
    it('should update course with allowed fields only', async () => {
      const courseData = {
        name: 'Updated Course',
        credits: 4,
        department: 'dept2',
        description: 'Updated description',
        courseCode: 'CS102', // This should be filtered out
        id: 'course1' // This should be filtered out
      };

      const expectedData = {
        name: 'Updated Course',
        credits: 4,
        department: 'dept2',
        description: 'Updated description'
      };

      const mockResponse = { data: { course: expectedData } };
      apiClient.patch.mockResolvedValue(mockResponse);

      const result = await courseService.updateCourse('CS101', courseData);

      expect(apiClient.patch).toHaveBeenCalledWith('/v1/api/courses/CS101', expectedData);
      expect(result).toBe(mockResponse);
    });
  });

  describe('deleteCourse', () => {
    it('should delete course', async () => {
      const mockResponse = { data: { success: true } };
      apiClient.delete.mockResolvedValue(mockResponse);

      const result = await courseService.deleteCourse('CS101');

      expect(apiClient.delete).toHaveBeenCalledWith('/v1/api/courses/CS101');
      expect(result).toBe(mockResponse);
    });
  });

  describe('toggleCourseStatus', () => {
    it('should deactivate course', async () => {
      const mockResponse = { data: { success: true } };
      apiClient.delete.mockResolvedValue(mockResponse);

      const result = await courseService.toggleCourseStatus('CS101', false);

      expect(apiClient.delete).toHaveBeenCalledWith('/v1/api/courses/CS101');
      expect(result).toBe(mockResponse);
    });

    it('should throw error for activation', async () => {
      await expect(courseService.toggleCourseStatus('CS101', true))
        .rejects.toThrow('Activating course is not supported yet');
    });
  });
});