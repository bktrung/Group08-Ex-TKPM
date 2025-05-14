import GradeService from '../../../src/services/grade.service';
import { NotFoundError, BadRequestError } from '../../../src/responses/error.responses';
import * as gradeRepo from '../../../src/models/repositories/grade.repo';
import * as studentRepo from '../../../src/models/repositories/student.repo';
import * as classRepo from '../../../src/models/repositories/class.repo';
import * as enrollmentRepo from '../../../src/models/repositories/enrollment.repo';

// Mock các hàm phụ thuộc
jest.mock('../../../src/models/repositories/grade.repo');
jest.mock('../../../src/models/repositories/student.repo');
jest.mock('../../../src/models/repositories/class.repo');
jest.mock('../../../src/models/repositories/enrollment.repo');

describe('GradeService', () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createGrade', () => {

    it('should throw NotFoundError if student does not exist', async () => {
      const gradeData = { studentId: '123', classCode: 'CS101', midtermScore: 5, finalScore: 6, totalScore: 7 };

      // Mocking findStudent để trả về null (sinh viên không tồn tại)
      (studentRepo.findStudent as jest.Mock).mockResolvedValue(null);

      await expect(GradeService.createGrade(gradeData)).rejects.toThrowError(
        new NotFoundError('Student not found')
      );
    });

    it('should throw NotFoundError if class does not exist', async () => {
      const gradeData = { studentId: '123', classCode: 'CS101', midtermScore: 5, finalScore: 6, totalScore: 7 };

      // Mocking findStudent để trả về sinh viên hợp lệ
      (studentRepo.findStudent as jest.Mock).mockResolvedValue({ id: '123' });

      // Mocking findClassByCode để trả về null (lớp không tồn tại)
      (classRepo.findClassByCode as jest.Mock).mockResolvedValue(null);

      await expect(GradeService.createGrade(gradeData)).rejects.toThrowError(
        new NotFoundError('Class not found')
      );
    });

    it('should throw BadRequestError if student is not enrolled in the class', async () => {
      const gradeData = { studentId: '123', classCode: 'CS101', midtermScore: 5, finalScore: 6, totalScore: 7 };

      // Mocking findStudent để trả về sinh viên hợp lệ
      (studentRepo.findStudent as jest.Mock).mockResolvedValue({ id: '123' });

      // Mocking findClassByCode để trả về lớp hợp lệ
      (classRepo.findClassByCode as jest.Mock).mockResolvedValue({ code: 'CS101' });

      // Mocking findEnrollment để trả về null (sinh viên không đăng ký lớp này)
      (enrollmentRepo.findEnrollment as jest.Mock).mockResolvedValue(null);

      await expect(GradeService.createGrade(gradeData)).rejects.toThrowError(
        new BadRequestError('Student is not enrolled in this class')
      );
    });

    it('should throw BadRequestError if grade already exists', async () => {
      const gradeData = { studentId: '123', classCode: 'CS101', midtermScore: 5, finalScore: 6, totalScore: 7 };

      // Mocking findStudent để trả về sinh viên hợp lệ
      (studentRepo.findStudent as jest.Mock).mockResolvedValue({ id: '123' });

      // Mocking findClassByCode để trả về lớp hợp lệ
      (classRepo.findClassByCode as jest.Mock).mockResolvedValue({ code: 'CS101' });

      // Mocking findEnrollment để trả về một enrollment hợp lệ
      (enrollmentRepo.findEnrollment as jest.Mock).mockResolvedValue({ enrollmentId: 'enroll123' });

      // Mocking findGradeByEnrollment để trả về grade đã tồn tại
      (gradeRepo.findGradeByEnrollment as jest.Mock).mockResolvedValue({});

      await expect(GradeService.createGrade(gradeData)).rejects.toThrowError(
        new BadRequestError('Grade already exists for this enrollment')
      );
    });

    it('should throw BadRequestError if totalScore is not between 0 and 10', async () => {
      const gradeData = { studentId: '123', classCode: 'CS101', midtermScore: 5, finalScore: 6, totalScore: 11 };

      // Mocking findStudent để trả về sinh viên hợp lệ
      (studentRepo.findStudent as jest.Mock).mockResolvedValue({ id: '123' });

      // Mocking findClassByCode để trả về lớp hợp lệ
      (classRepo.findClassByCode as jest.Mock).mockResolvedValue({ code: 'CS101' });

        // Mocking findGradeByEnrollment để trả về grade đã tồn tại
      (gradeRepo.findGradeByEnrollment as jest.Mock).mockResolvedValue(null);

      // Mocking findEnrollment để trả về enrollment hợp lệ
      (enrollmentRepo.findEnrollment as jest.Mock).mockResolvedValue({ enrollmentId: 'enroll123' });

      await expect(GradeService.createGrade(gradeData)).rejects.toThrowError(
        new BadRequestError('Total score must be between 0 and 10')
      );
    });

    it('should create grade successfully', async () => {
      const gradeData = { studentId: '123', classCode: 'CS101', midtermScore: 5, finalScore: 6, totalScore: 7 };

      // Mocking findStudent để trả về sinh viên hợp lệ
      (studentRepo.findStudent as jest.Mock).mockResolvedValue({ id: '123' });

      // Mocking findClassByCode để trả về lớp hợp lệ
      (classRepo.findClassByCode as jest.Mock).mockResolvedValue({ code: 'CS101' });

      // Mocking findEnrollment để trả về enrollment hợp lệ
      (enrollmentRepo.findEnrollment as jest.Mock).mockResolvedValue({ enrollmentId: 'enroll123' });

      // Mocking findGradeByEnrollment để trả về null (không có grade)
      (gradeRepo.findGradeByEnrollment as jest.Mock).mockResolvedValue(null);

      // Mocking createGrade để trả về grade mới tạo
      const newGrade = { enrollment: 'enroll123', midtermScore: 5, finalScore: 6, totalScore: 7, letterGrade: 'B', gradePoints: 3.0 };
      (gradeRepo.createGrade as jest.Mock).mockResolvedValue(newGrade);

      const result = await GradeService.createGrade(gradeData);
      expect(result).toEqual(newGrade);
    });

  });

});
