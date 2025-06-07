import { Container } from "inversify";
import { EnrollmentService } from '../../../src/services/enrollment.service';
import { IEnrollmentRepository } from '../../../src/interfaces/repositories/enrollment.repository.interface';
import { IStudentRepository } from '../../../src/interfaces/repositories/student.repository.interface';
import { IClassRepository } from '../../../src/interfaces/repositories/class.repository.interface';
import { ICourseRepository } from '../../../src/interfaces/repositories/course.repository.interface';
import { ISemesterRepository } from '../../../src/interfaces/repositories/semester.repository.interface';
import { TYPES } from '../../../src/configs/di.types';
import { NotFoundError, BadRequestError } from '../../../src/responses/error.responses';
import { enrollStudentDto } from '../../../src/dto/enrollment';
import mongoose from 'mongoose';

describe('EnrollmentService - DI Implementation', () => {
    let container: Container;
    let enrollmentService: EnrollmentService;
    let mockEnrollmentRepository: jest.Mocked<IEnrollmentRepository>;
    let mockStudentRepository: jest.Mocked<IStudentRepository>;
    let mockClassRepository: jest.Mocked<IClassRepository>;
    let mockCourseRepository: jest.Mocked<ICourseRepository>;
    let mockSemesterRepository: jest.Mocked<ISemesterRepository>;

    const mockStudentId = new mongoose.Types.ObjectId();
    const mockClassId = new mongoose.Types.ObjectId();
    const mockCourseId = new mongoose.Types.ObjectId();

    const mockStudent = {
        _id: mockStudentId,
        studentId: "STU001",
        fullName: "John Doe"
    };

    const mockClass = {
        _id: mockClassId,
        classCode: "CS101-01",
        course: mockCourseId,
        isActive: true,
        enrolledStudents: 25,
        maxCapacity: 30,
        academicYear: 2023,
        semester: 1
    };

    const mockCourse = {
        _id: mockCourseId,
        courseCode: "CS101",
        name: "Introduction to Computer Science",
        isActive: true,
        prerequisites: []
    };

    beforeEach(() => {
        // Create test container
        container = new Container();
        
        // Create mocked repositories
        mockEnrollmentRepository = {
            findEnrollment: jest.fn(),
            createEnrollment: jest.fn(),
            dropEnrollment: jest.fn(),
            getCompletedCourseIdsByStudent: jest.fn(),
            findDropHistoryByStudent: jest.fn(),
            findEnrollmentsByStudent: jest.fn(),
            findEnrollmentsByClass: jest.fn(),
        } as jest.Mocked<IEnrollmentRepository>;

        mockStudentRepository = {
            findStudent: jest.fn(),
            addStudent: jest.fn(),
            updateStudent: jest.fn(),
            deleteStudent: jest.fn(),
            searchStudents: jest.fn(),
            getAllStudents: jest.fn(),
            getStudentInfo: jest.fn(),
            findStudentStatus: jest.fn(),
            findStudentStatusById: jest.fn(),
            addStudentStatus: jest.fn(),
            updateStudentStatus: jest.fn(),
            getStudentStatus: jest.fn(),
            addStudentStatusTransition: jest.fn(),
            findStudentStatusTransition: jest.fn(),
            getTransitionRules: jest.fn(),
            deleteStudentStatusTransition: jest.fn(),
        } as jest.Mocked<IStudentRepository>;

        mockClassRepository = {
            createClass: jest.fn(),
            findClassByCode: jest.fn(),
            findClassByCourse: jest.fn(),
            findClassesWithOverlappingSchedule: jest.fn(),
            getAllClasses: jest.fn(),
        } as jest.Mocked<IClassRepository>;

        mockCourseRepository = {
            findCourseById: jest.fn(),
            findCourseByCode: jest.fn(),
            createCourse: jest.fn(),
            findCoursesByIds: jest.fn(),
            updateCourse: jest.fn(),
            deactivateCourse: jest.fn(),
            deleteCourse: jest.fn(),
            getAllCourses: jest.fn(),
        } as jest.Mocked<ICourseRepository>;

        mockSemesterRepository = {
            createSemester: jest.fn(),
            findSemester: jest.fn(),
        } as jest.Mocked<ISemesterRepository>;
        
        // Bind mocked repositories
        container.bind<IEnrollmentRepository>(TYPES.EnrollmentRepository).toConstantValue(mockEnrollmentRepository);
        container.bind<IStudentRepository>(TYPES.StudentRepository).toConstantValue(mockStudentRepository);
        container.bind<IClassRepository>(TYPES.ClassRepository).toConstantValue(mockClassRepository);
        container.bind<ICourseRepository>(TYPES.CourseRepository).toConstantValue(mockCourseRepository);
        container.bind<ISemesterRepository>(TYPES.SemesterRepository).toConstantValue(mockSemesterRepository);
        container.bind<EnrollmentService>(TYPES.EnrollmentService).to(EnrollmentService);
        
        // Get service instance
        enrollmentService = container.get<EnrollmentService>(TYPES.EnrollmentService);
    });

    describe('enrollStudent', () => {
        const enrollmentData: enrollStudentDto = {
            studentId: "STU001",
            classCode: "CS101-01"
        };

        it('should throw NotFoundError when student does not exist', async () => {
            mockStudentRepository.findStudent.mockResolvedValue(null);

            await expect(enrollmentService.enrollStudent(enrollmentData))
                .rejects
                .toThrow(new NotFoundError("Student does not exist"));

            expect(mockStudentRepository.findStudent).toHaveBeenCalledWith({ studentId: "STU001" });
        });

        it('should throw NotFoundError when class does not exist', async () => {
            mockStudentRepository.findStudent.mockResolvedValue(mockStudent as any);
            mockClassRepository.findClassByCode.mockResolvedValue(null);

            await expect(enrollmentService.enrollStudent(enrollmentData))
                .rejects
                .toThrow(new NotFoundError("Class does not exist"));

            expect(mockClassRepository.findClassByCode).toHaveBeenCalledWith("CS101-01");
        });

        it('should throw BadRequestError when class is not active', async () => {
            mockStudentRepository.findStudent.mockResolvedValue(mockStudent as any);
            mockClassRepository.findClassByCode.mockResolvedValue({ ...mockClass, isActive: false } as any);

            await expect(enrollmentService.enrollStudent(enrollmentData))
                .rejects
                .toThrow(new BadRequestError("Class is not active"));
        });

        it('should throw BadRequestError when class is full', async () => {
            mockStudentRepository.findStudent.mockResolvedValue(mockStudent as any);
            mockClassRepository.findClassByCode.mockResolvedValue({ 
                ...mockClass, 
                enrolledStudents: 30, 
                maxCapacity: 30 
            } as any);

            await expect(enrollmentService.enrollStudent(enrollmentData))
                .rejects
                .toThrow(new BadRequestError("Class is full"));
        });

        it('should throw BadRequestError when student is already enrolled', async () => {
            mockStudentRepository.findStudent.mockResolvedValue(mockStudent as any);
            mockClassRepository.findClassByCode.mockResolvedValue(mockClass as any);
            mockEnrollmentRepository.findEnrollment.mockResolvedValue({} as any);

            await expect(enrollmentService.enrollStudent(enrollmentData))
                .rejects
                .toThrow(new BadRequestError("Student already enrolled in this class"));
        });

        it('should enroll student successfully', async () => {
            const mockEnrollment = { _id: new mongoose.Types.ObjectId(), student: mockStudentId, class: mockClassId };
            
            mockStudentRepository.findStudent.mockResolvedValue(mockStudent as any);
            mockClassRepository.findClassByCode.mockResolvedValue(mockClass as any);
            mockEnrollmentRepository.findEnrollment.mockResolvedValue(null);
            mockCourseRepository.findCourseById.mockResolvedValue(mockCourse as any);
            mockEnrollmentRepository.getCompletedCourseIdsByStudent.mockResolvedValue([]);
            mockEnrollmentRepository.createEnrollment.mockResolvedValue(mockEnrollment as any);

            const result = await enrollmentService.enrollStudent(enrollmentData);

            expect(mockEnrollmentRepository.createEnrollment).toHaveBeenCalledWith({
                student: mockStudentId,
                class: mockClassId
            });
            expect(result).toEqual(mockEnrollment);
        });
    });

    describe('dropStudent', () => {
        it('should throw NotFoundError when student does not exist', async () => {
            mockStudentRepository.findStudent.mockResolvedValue(null);

            await expect(enrollmentService.dropStudent('STU001', 'CS101-01', 'Personal reason'))
                .rejects
                .toThrow(new NotFoundError("Student does not exist"));
        });

        it('should throw NotFoundError when enrollment does not exist', async () => {
            mockStudentRepository.findStudent.mockResolvedValue(mockStudent as any);
            mockClassRepository.findClassByCode.mockResolvedValue(mockClass as any);
            mockEnrollmentRepository.findEnrollment.mockResolvedValue(null);

            await expect(enrollmentService.dropStudent('STU001', 'CS101-01', 'Personal reason'))
                .rejects
                .toThrow(new NotFoundError("Student has not enrolled in this class"));
        });
    });

    describe('getDropHistory', () => {
        it('should throw NotFoundError when student does not exist', async () => {
            mockStudentRepository.findStudent.mockResolvedValue(null);

            await expect(enrollmentService.getDropHistory('STU001'))
                .rejects
                .toThrow(new NotFoundError("Student does not exist"));
        });

        it('should return drop history successfully', async () => {
            const mockDropHistory = [{ classCode: 'CS101-01', dropReason: 'Personal reason' }];
            
            mockStudentRepository.findStudent.mockResolvedValue(mockStudent as any);
            mockEnrollmentRepository.findDropHistoryByStudent.mockResolvedValue(mockDropHistory);

            const result = await enrollmentService.getDropHistory('STU001');

            expect(result).toEqual(mockDropHistory);
        });
    });
}); 