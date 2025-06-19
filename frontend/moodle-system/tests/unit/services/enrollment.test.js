import enrollmentService from '@/services/enrollment';
import apiClient from '@/services/client';

jest.mock('@/services/client');

describe('Enrollment Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('enrollCourse', () => {
    it('should enroll student in course', async () => {
      const enrollmentData = {
        studentId: '12345678',
        classCode: 'CS101-01'
      };
      
      const mockResponse = { data: { success: true } };
      apiClient.post.mockResolvedValue(mockResponse);

      const result = await enrollmentService.enrollCourse(enrollmentData);

      expect(apiClient.post).toHaveBeenCalledWith('/v1/api/enrollment', enrollmentData);
      expect(result).toBe(mockResponse);
    });
  });

  describe('dropCourse', () => {
    it('should drop student from course', async () => {
      const dropData = {
        studentId: '12345678',
        classCode: 'CS101-01',
        dropReason: 'Schedule conflict'
      };
      
      const mockResponse = { data: { success: true } };
      apiClient.post.mockResolvedValue(mockResponse);

      const result = await enrollmentService.dropCourse(dropData);

      expect(apiClient.post).toHaveBeenCalledWith('/v1/api/enrollment/drop', dropData);
      expect(result).toBe(mockResponse);
    });
  });

  describe('getTranscript', () => {
    it('should fetch student transcript', async () => {
      const studentId = '12345678';
      const mockResponse = {
        data: {
          studentInfo: { studentId, fullName: 'John Doe' },
          courses: []
        }
      };
      
      apiClient.get.mockResolvedValue(mockResponse);

      const result = await enrollmentService.getTranscript(studentId);

      expect(apiClient.get).toHaveBeenCalledWith(`/v1/api/transcript/${studentId}`);
      expect(result).toBe(mockResponse);
    });
  });

  describe('getDropCourseHistory', () => {
    it('should fetch drop course history', async () => {
      const studentId = '12345678';
      const mockResponse = {
        data: {
          metadata: {
            dropHistory: [
              {
                student: { studentId, fullName: 'John Doe' },
                class: { classCode: 'CS101-01' },
                dropReason: 'Schedule conflict',
                dropDate: '2023-10-15'
              }
            ]
          }
        }
      };
      
      apiClient.get.mockResolvedValue(mockResponse);

      const result = await enrollmentService.getDropCourseHistory(studentId);

      expect(apiClient.get).toHaveBeenCalledWith(`/v1/api/enrollment/drop-history/${studentId}`);
      expect(result).toBe(mockResponse);
    });
  });
});