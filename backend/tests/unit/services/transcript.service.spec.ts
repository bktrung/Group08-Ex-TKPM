import TranscriptService from '../../../src/services/transcript.service';
import * as studentRepo from '../../../src/models/repositories/student.repo';
import * as enrollmentRepo from '../../../src//models/repositories/enrollment.repo';
import * as gradeRepo from '../../../src/models/repositories/grade.repo';
import * as courseRepo from '../../../src/models/repositories/course.repo';
import { NotFoundError } from '../../../src/responses/error.responses';

jest.mock('../../../src/models/repositories/student.repo');
jest.mock('../../../src//models/repositories/enrollment.repo');
jest.mock('../../../src/models/repositories/grade.repo');
jest.mock('../../../src/models/repositories/course.repo');

describe('TranscriptService', () => {
  const mockStudent = {
    _id: 'studentObjId',
    studentId: 'SV001',
    fullName: 'Nguyen Van A',
    schoolYear: '2023',
    department: { name: 'Computer Science' },
    program: { name: 'KTPM' }
  };

  const mockCourse = {
    _id: 'courseId123',
    courseCode: 'CS101',
    name: 'Introduction to Programming',
    credits: 3
  };

  const mockEnrollment = {
    _id: 'enroll123',
    enrollmentDate: '2024-01-01T00:00:00Z',
    class: { course: mockCourse._id }
  };

  const mockGrade = {
    totalScore: 8.5,
    gradePoints: 3.5
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should generate transcript correctly', async () => {
    // Mock các repository
    (studentRepo.getStudentInfo as jest.Mock).mockResolvedValue(mockStudent);
    (studentRepo.findStudent as jest.Mock).mockResolvedValue(mockStudent);
    (enrollmentRepo.findEnrollmentsByStudent as jest.Mock).mockResolvedValue([mockEnrollment]);
    (gradeRepo.findGradeByEnrollment as jest.Mock).mockResolvedValue(mockGrade);
    (courseRepo.findCourseById as jest.Mock).mockResolvedValue(mockCourse);

    const result = await TranscriptService.generateTranscript('SV001');

    expect(result.studentInfo).toEqual({
      studentId: 'SV001',
      fullName: 'Nguyen Van A',
      schoolYear: '2023',
      department: 'Computer Science',
      program: 'KTPM'
    });

    expect(result.courses).toHaveLength(1);
    expect(result.courses[0]).toMatchObject({
      courseCode: 'CS101',
      courseName: 'Introduction to Programming',
      credits: 3,
      totalScore: 8.5,
      gradePoints: 3.5
    });

    expect(result.summary).toEqual({
      totalCredits: 3,
      gpaOutOf10: 8.5,
      gpaOutOf4: 3.5
    });
  });

  it('should throw NotFoundError if student not found', async () => {
    (studentRepo.getStudentInfo as jest.Mock).mockResolvedValue(null);

    await expect(TranscriptService.generateTranscript('SV999'))
      .rejects
      .toThrow(NotFoundError);
  });

  it('should handle student with no enrollments gracefully', async () => {
    (studentRepo.getStudentInfo as jest.Mock).mockResolvedValue(mockStudent);
    (studentRepo.findStudent as jest.Mock).mockResolvedValue(mockStudent);
    (enrollmentRepo.findEnrollmentsByStudent as jest.Mock).mockResolvedValue([]);

    const result = await TranscriptService.generateTranscript('SV001');

    expect(result.courses).toEqual([]);
    expect(result.summary.totalCredits).toBe(0);
    expect(result.summary.gpaOutOf10).toBe(0);
    expect(result.summary.gpaOutOf4).toBe(0);
  });

  it('should skip courses with missing course info or grade', async () => {
    (studentRepo.getStudentInfo as jest.Mock).mockResolvedValue(mockStudent);
    (studentRepo.findStudent as jest.Mock).mockResolvedValue(mockStudent);
    (enrollmentRepo.findEnrollmentsByStudent as jest.Mock).mockResolvedValue([mockEnrollment]);

    // Course missing
    (courseRepo.findCourseById as jest.Mock).mockResolvedValue(null);
    (gradeRepo.findGradeByEnrollment as jest.Mock).mockResolvedValue(mockGrade);

    const result = await TranscriptService.generateTranscript('SV001');
    expect(result.courses).toEqual([]);
  });
});
