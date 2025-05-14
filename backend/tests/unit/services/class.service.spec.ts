import ClassService from '../../../src/services/class.service';
import * as classRepo from '../../../src//models/repositories/class.repo';
import * as courseRepo from '../../../src//models/repositories/course.repo';
import { BadRequestError } from '../../../src/responses/error.responses';

jest.mock('../../../src/models/repositories/class.repo');
jest.mock('../../../src/models/repositories/course.repo');

describe('ClassService', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('addClass', () => {
        const baseClassData = {
            classCode: 'CLC101',
            course: 'course123',
            academicYear: '2024-2025',
            semester: 1,
            instructor: 'GV123',
            maxCapacity: 60,
            schedule: [
                { dayOfWeek: 1, startPeriod: 1, endPeriod: 3, classroom: '101' },
                { dayOfWeek: 3, startPeriod: 4, endPeriod: 6, classroom: '102' },
            ],
        };

        it('should throw error if class code already exists', async () => {
            (classRepo.findClassByCode as jest.Mock).mockResolvedValue({});

            await expect(ClassService.addClass(baseClassData)).rejects.toThrow(BadRequestError);
        });

        it('should throw error if course does not exist', async () => {
            (classRepo.findClassByCode as jest.Mock).mockResolvedValue(null);
            (courseRepo.findCourseById as jest.Mock).mockResolvedValue(null);

            await expect(ClassService.addClass(baseClassData)).rejects.toThrow('Môn học không tồn tại');
        });

        it('should throw error if course is inactive', async () => {
            (classRepo.findClassByCode as jest.Mock).mockResolvedValue(null);
            (courseRepo.findCourseById as jest.Mock).mockResolvedValue({ isActive: false });

            await expect(ClassService.addClass(baseClassData)).rejects.toThrow('Môn học này đã ngừng mở lớp');
        });

        it('should throw error if schedule is empty', async () => {
            const classData = { ...baseClassData, schedule: [] };
            (classRepo.findClassByCode as jest.Mock).mockResolvedValue(null);
            (courseRepo.findCourseById as jest.Mock).mockResolvedValue({ isActive: true });

            await expect(ClassService.addClass(classData)).rejects.toThrow('Lớp học phải có ít nhất một lịch học');
        });

        it('should throw error if internal schedule has overlap', async () => {
            const classData = {
                ...baseClassData,
                schedule: [
                    { dayOfWeek: 2, startPeriod: 1, endPeriod: 5, classroom: '101' },
                    { dayOfWeek: 2, startPeriod: 3, endPeriod: 6, classroom: '101' },
                ],
            };
            (classRepo.findClassByCode as jest.Mock).mockResolvedValue(null);
            (courseRepo.findCourseById as jest.Mock).mockResolvedValue({ isActive: true });

            await expect(ClassService.addClass(classData)).rejects.toThrow('Lịch học bị trùng');
        });

        it('should throw error if classroom is already booked', async () => {
            const overlapping = [
                {
                    classCode: 'CS101',
                    schedule: [{ dayOfWeek: 1, startPeriod: 2, endPeriod: 4, classroom: '101' }],
                },
            ];

            (classRepo.findClassByCode as jest.Mock).mockResolvedValue(null);
            (courseRepo.findCourseById as jest.Mock).mockResolvedValue({ isActive: true });
            (classRepo.findClassesWithOverlappingSchedule as jest.Mock).mockResolvedValue(overlapping);

            await expect(ClassService.addClass(baseClassData)).rejects.toThrow('Phòng 101 đã được sử dụng');
        });

        it('should create class successfully', async () => {
            (classRepo.findClassByCode as jest.Mock).mockResolvedValue(null);
            (courseRepo.findCourseById as jest.Mock).mockResolvedValue({ isActive: true });
            (classRepo.findClassesWithOverlappingSchedule as jest.Mock).mockResolvedValue([]);
            (classRepo.createClass as jest.Mock).mockResolvedValue({ _id: 'abc123', ...baseClassData });

            const result = await ClassService.addClass(baseClassData);
            expect(result.classCode).toBe('CLC101');
        });
    });

    describe('getClasses', () => {
        it('should throw error if courseId is invalid', async () => {
            await expect(ClassService.getClasses({ courseId: 'invalid-id' }))
                .rejects.toThrow('Invalid course ID format');
        });

        it('should throw error if semester is invalid', async () => {
            await expect(ClassService.getClasses({ semester: 'invalid' }))
                .rejects.toThrow('Invalid semester value. Must be 1, 2, or 3.');
        });

        it('should return paginated classes', async () => {
            const mockClasses = [{ classCode: 'ABC123' }];
            (classRepo.getAllClasses as jest.Mock).mockResolvedValue(mockClasses);

            const result = await ClassService.getClasses({ page: '1', limit: '10' });
            expect(result).toEqual(mockClasses);
        });
    });
});
