import { Container } from "inversify";
import { TranscriptService } from '../../../src/services/transcript.service';
import { ICourseRepository } from '../../../src/interfaces/repositories/course.repository.interface';
import { IEnrollmentRepository } from '../../../src/interfaces/repositories/enrollment.repository.interface';
import { IGradeRepository } from '../../../src/interfaces/repositories/grade.repository.interface';
import { IStudentRepository } from '../../../src/interfaces/repositories/student.repository.interface';
import { TYPES } from '../../../src/configs/di.types';
import { NotFoundError } from '../../../src/responses/error.responses';
import mongoose from 'mongoose';

describe('TranscriptService - DI Implementation', () => {
    let container: Container;
    let transcriptService: TranscriptService;
    let mockCourseRepository: jest.Mocked<ICourseRepository>;
    let mockEnrollmentRepository: jest.Mocked<IEnrollmentRepository>;
    let mockGradeRepository: jest.Mocked<IGradeRepository>;
    let mockStudentRepository: jest.Mocked<IStudentRepository>;

    const mockStudentId = new mongoose.Types.ObjectId();
    const mockCourseId = new mongoose.Types.ObjectId();
    const mockEnrollmentId = new mongoose.Types.ObjectId();

    const mockStudent = {
        _id: mockStudentId,
        studentId: "123",
        fullName: "John Doe",
        schoolYear: "2023",
        department: { name: "Computer Science" },
        program: { name: "Bachelor of Science" }
    };

    const mockCourse = {
        _id: mockCourseId,
        courseCode: "CS101",
        name: "Introduction to Programming",
        credits: 3
    };

    const mockEnrollment = {
        _id: mockEnrollmentId,
        student: mockStudentId,
        class: { course: mockCourseId },
        enrollmentDate: new Date()
    };

    const mockGrade = {
        _id: new mongoose.Types.ObjectId(),
        enrollment: mockEnrollmentId,
        totalScore: 8.5,
        gradePoints: 3.5
    };

    beforeEach(() => {
        // Create test container
        container = new Container();
        
        // Create mocked repositories
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

        mockEnrollmentRepository = {
            findEnrollment: jest.fn(),
            createEnrollment: jest.fn(),
            dropEnrollment: jest.fn(),
            getCompletedCourseIdsByStudent: jest.fn(),
            findDropHistoryByStudent: jest.fn(),
            findEnrollmentsByStudent: jest.fn(),
            findEnrollmentsByClass: jest.fn(),
        } as jest.Mocked<IEnrollmentRepository>;

        mockGradeRepository = {
            findGradeByEnrollment: jest.fn(),
            findGradeById: jest.fn(),
            getGradesByClass: jest.fn(),
            createGrade: jest.fn(),
            updateGrade: jest.fn(),
            deleteGrade: jest.fn(),
        } as jest.Mocked<IGradeRepository>;

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
            deleteStudentStatus: jest.fn(),
            countStudentsByStatus: jest.fn(),
            countTransitionsByStatus: jest.fn(),
            addStudentStatusTransition: jest.fn(),
            findStudentStatusTransition: jest.fn(),
            getTransitionRules: jest.fn(),
            deleteStudentStatusTransition: jest.fn(),
        } as jest.Mocked<IStudentRepository>;
        
        // Bind mocked repositories
        container.bind<ICourseRepository>(TYPES.CourseRepository).toConstantValue(mockCourseRepository);
        container.bind<IEnrollmentRepository>(TYPES.EnrollmentRepository).toConstantValue(mockEnrollmentRepository);
        container.bind<IGradeRepository>(TYPES.GradeRepository).toConstantValue(mockGradeRepository);
        container.bind<IStudentRepository>(TYPES.StudentRepository).toConstantValue(mockStudentRepository);
        container.bind<TranscriptService>(TYPES.TranscriptService).to(TranscriptService);
        
        // Get service instance
        transcriptService = container.get<TranscriptService>(TYPES.TranscriptService);
    });

    describe('generateTranscript', () => {
        it('should throw NotFoundError if student does not exist', async () => {
            mockStudentRepository.getStudentInfo.mockResolvedValue(null);

            await expect(transcriptService.generateTranscript('123'))
                .rejects
                .toThrow(new NotFoundError('Student not found'));

            expect(mockStudentRepository.getStudentInfo).toHaveBeenCalledWith('123');
        });

        it('should generate transcript successfully with grades', async () => {
            mockStudentRepository.getStudentInfo.mockResolvedValue(mockStudent as any);
            mockStudentRepository.findStudent.mockResolvedValue(mockStudent as any);
            mockEnrollmentRepository.findEnrollmentsByStudent.mockResolvedValue([mockEnrollment as any]);
            mockCourseRepository.findCourseById.mockResolvedValue(mockCourse as any);
            mockGradeRepository.findGradeByEnrollment.mockResolvedValue(mockGrade as any);

            const result = await transcriptService.generateTranscript('123');

            expect(result).toEqual({
                studentInfo: {
                    studentId: "123",
                    fullName: "John Doe",
                    schoolYear: "2023",
                    department: "Computer Science",
                    program: "Bachelor of Science"
                },
                courses: [{
                    courseCode: "CS101",
                    courseName: "Introduction to Programming",
                    credits: 3,
                    totalScore: 8.5,
                    gradePoints: 3.5
                }],
                summary: {
                    totalCredits: 3,
                    gpaOutOf10: 8.5,
                    gpaOutOf4: 3.5
                }
            });
        });

        it('should generate transcript with empty courses if no enrollments', async () => {
            mockStudentRepository.getStudentInfo.mockResolvedValue(mockStudent as any);
            mockStudentRepository.findStudent.mockResolvedValue(mockStudent as any);
            mockEnrollmentRepository.findEnrollmentsByStudent.mockResolvedValue([]);

            const result = await transcriptService.generateTranscript('123');

            expect(result.courses).toEqual([]);
            expect(result.summary).toEqual({
                totalCredits: 0,
                gpaOutOf10: 0,
                gpaOutOf4: 0
            });
        });
    });
});
