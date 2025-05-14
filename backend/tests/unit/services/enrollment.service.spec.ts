import EnrollmentService from '../../../src/services/enrollment.service';
import { NotFoundError, BadRequestError } from '../../../src/responses/error.responses';

// Mock các module phụ trợ
jest.mock('../../../src/models/repositories/enrollment.repo.ts', () => ({
    findEnrollment: jest.fn(),
    createEnrollment: jest.fn(),
    getCompletedCourseIdsByStudent: jest.fn(),
    dropEnrollment: jest.fn(),
    findDropHistoryByStudent: jest.fn(),
}));

jest.mock('../../../src/models/repositories/student.repo.ts', () => ({
    findStudent: jest.fn(),
}));

jest.mock('../../../src/models/repositories/class.repo.ts', () => ({
    findClassByCode: jest.fn(),
}));

jest.mock('../../../src/models/repositories/course.repo.ts', () => ({
    findCourseById: jest.fn(),
    findCoursesByIds: jest.fn(),
}));

jest.mock('../../../src/models/repositories/semester.repo.ts', () => ({
    findSemester: jest.fn(),
}));

jest.mock('../../../src/utils', () => ({
    getDocumentId: jest.fn((doc: any) => doc?._id || 'mocked-id'),
}));

// Import các hàm mock để sử dụng trong test
import {
    findEnrollment,
    createEnrollment,
    getCompletedCourseIdsByStudent,
    dropEnrollment,
    findDropHistoryByStudent
} from '../../../src/models/repositories/enrollment.repo';
import { findStudent } from '../../../src/models/repositories/student.repo';
import { findClassByCode } from '../../../src/models/repositories/class.repo';
import { findCourseById, findCoursesByIds } from '../../../src/models/repositories/course.repo';
import { findSemester } from '../../../src/models/repositories/semester.repo';

describe('EnrollmentService', () => {
    describe('enrollStudent', () => {
        it('should throw NotFoundError when student does not exist', async () => {
            (findStudent as jest.Mock).mockResolvedValue(null);

            await expect(EnrollmentService.enrollStudent({ studentId: '123', classCode: 'CSE101' }))
                .rejects
                .toThrowError(new NotFoundError("Sinh viên không tồn tại"));
        });

        it('should throw NotFoundError when class does not exist', async () => {
            (findStudent as jest.Mock).mockResolvedValue({ id: '123' });
            (findClassByCode as jest.Mock).mockResolvedValue(null);

            await expect(EnrollmentService.enrollStudent({ studentId: '123', classCode: 'CSE101' }))
                .rejects
                .toThrowError(new NotFoundError("Lớp học không tồn tại"));
        });

        it('should throw BadRequestError when class is not active', async () => {
            (findStudent as jest.Mock).mockResolvedValue({ id: '123' });
            (findClassByCode as jest.Mock).mockResolvedValue({ isActive: false });

            await expect(EnrollmentService.enrollStudent({ studentId: '123', classCode: 'CSE101' }))
                .rejects
                .toThrowError(new BadRequestError("Lớp học không hoạt động"));
        });

        it('should throw BadRequestError when class is full', async () => {
            (findStudent as jest.Mock).mockResolvedValue({ id: '123' });
            (findClassByCode as jest.Mock).mockResolvedValue({ isActive: true, enrolledStudents: 30, maxCapacity: 30 });

            await expect(EnrollmentService.enrollStudent({ studentId: '123', classCode: 'CSE101' }))
                .rejects
                .toThrowError(new BadRequestError("Lớp học đã đầy"));
        });

        it('should throw BadRequestError when student is already enrolled in the class', async () => {
            (findStudent as jest.Mock).mockResolvedValue({ id: '123' });
            (findClassByCode as jest.Mock).mockResolvedValue({ isActive: true, enrolledStudents: 25, maxCapacity: 30 });
            (findEnrollment as jest.Mock).mockResolvedValue({});

            await expect(EnrollmentService.enrollStudent({ studentId: '123', classCode: 'CSE101' }))
                .rejects
                .toThrowError(new BadRequestError("Sinh viên đã đăng ký lớp học này"));
        });

        it('should throw NotFoundError when course does not exist', async () => {
            (findStudent as jest.Mock).mockResolvedValue({ id: '123' });
            (findClassByCode as jest.Mock).mockResolvedValue({ isActive: true, enrolledStudents: 25, maxCapacity: 30, course: 'courseId' });
            (findEnrollment as jest.Mock).mockResolvedValue(null);
            (findCourseById as jest.Mock).mockResolvedValue(null);


            await expect(EnrollmentService.enrollStudent({ studentId: '123', classCode: 'CSE101' }))
                .rejects
                .toThrowError(new NotFoundError("Môn học không tồn tại"));
        });

        it('should throw BadRequestError when course is not active', async () => {
            (findStudent as jest.Mock).mockResolvedValue({ id: '123' });
            (findClassByCode as jest.Mock).mockResolvedValue({ isActive: true, enrolledStudents: 25, maxCapacity: 30, course: 'courseId' });
            (findCourseById as jest.Mock).mockResolvedValue({ isActive: false });

            await expect(EnrollmentService.enrollStudent({ studentId: '123', classCode: 'CSE101' }))
                .rejects
                .toThrowError(new BadRequestError("Môn học không hoạt động"));
        });

        it('should throw BadRequestError when student has missing prerequisites', async () => {
            (findStudent as jest.Mock).mockResolvedValue({ id: '123' });
            (findClassByCode as jest.Mock).mockResolvedValue({
                isActive: true, enrolledStudents: 25, maxCapacity: 30, course: 'courseId'
            });
            (findCourseById as jest.Mock).mockResolvedValue({
                isActive: true, prerequisites: ['course1', 'course2']
            });
            (getCompletedCourseIdsByStudent as jest.Mock).mockResolvedValue(['course1']);
            (findCoursesByIds as jest.Mock).mockResolvedValue([
                { courseCode: 'course2' }
            ]);

            await expect(EnrollmentService.enrollStudent({ studentId: '123', classCode: 'CSE101' }))
                .rejects
                .toThrowError(new BadRequestError("Sinh viên chưa hoàn thành các môn học tiên quyết: course2"));
        });


        it('should enroll the student successfully', async () => {
            (findStudent as jest.Mock).mockResolvedValue({ id: '123' });
            (findClassByCode as jest.Mock).mockResolvedValue({ isActive: true, enrolledStudents: 25, maxCapacity: 30, course: 'courseId' });
            (findCourseById as jest.Mock).mockResolvedValue({ isActive: true, prerequisites: ['course1'] });
            (getCompletedCourseIdsByStudent as jest.Mock).mockResolvedValue(['course1']);
            (findEnrollment as jest.Mock).mockResolvedValue(null);
            (createEnrollment as jest.Mock).mockResolvedValue({ studentId: '123', classCode: 'CSE101' });

            const result = await EnrollmentService.enrollStudent({ studentId: '123', classCode: 'CSE101' });
            expect(result).toEqual({ studentId: '123', classCode: 'CSE101' });
        });
    });

    describe('dropStudent', () => {
        it('should throw NotFoundError when student does not exist', async () => {
            (findStudent as jest.Mock).mockResolvedValue(null);

            await expect(EnrollmentService.dropStudent('123', 'CSE101', 'Lý do cá nhân'))
                .rejects
                .toThrowError(new NotFoundError("Sinh viên không tồn tại"));
        });

        it('should throw NotFoundError when class does not exist', async () => {
            (findStudent as jest.Mock).mockResolvedValue({ id: '123' });
            (findClassByCode as jest.Mock).mockResolvedValue(null);

            await expect(EnrollmentService.dropStudent('123', 'CSE101', 'Lý do cá nhân'))
                .rejects
                .toThrowError(new NotFoundError("Lớp học không tồn tại"));
        });

        it('should throw NotFoundError when student did not enroll class', async () => {
            (findStudent as jest.Mock).mockResolvedValue({ id: '123' });
            (findClassByCode as jest.Mock).mockResolvedValue({ isActive: true, enrolledStudents: 25, maxCapacity: 30, course: 'courseId' });
            (findEnrollment as jest.Mock).mockResolvedValue(null);

            await expect(EnrollmentService.dropStudent('123', 'CSE101', 'Lý do cá nhân'))
                .rejects
                .toThrowError(new NotFoundError("Sinh viên chưa đăng ký lớp học này"));
        });
    });

    describe('getDropHistory', () => {
        it('should throw NotFoundError when student does not exist', async () => {
            (findStudent as jest.Mock).mockResolvedValue(null);

            await expect(EnrollmentService.getDropHistory('123'))
                .rejects
                .toThrowError(new NotFoundError("Sinh viên không tồn tại"));
        });

        it('should return drop history successfully', async () => {
            (findStudent as jest.Mock).mockResolvedValue({ id: '123' });
            (findDropHistoryByStudent as jest.Mock).mockResolvedValue([{ classCode: 'CSE101', dropReason: 'Lý do cá nhân' }]);

            const result = await EnrollmentService.getDropHistory('123');
            expect(result).toEqual([{ classCode: 'CSE101', dropReason: 'Lý do cá nhân' }]);
        });
    });
});
