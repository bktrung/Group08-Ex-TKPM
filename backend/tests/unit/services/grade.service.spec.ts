import { Container } from "inversify";
import { GradeService } from '../../../src/services/grade.service';
import { IGradeRepository } from '../../../src/interfaces/repositories/grade.repository.interface';
import { IStudentRepository } from '../../../src/interfaces/repositories/student.repository.interface';
import { IClassRepository } from '../../../src/interfaces/repositories/class.repository.interface';
import { IEnrollmentRepository } from '../../../src/interfaces/repositories/enrollment.repository.interface';
import { TYPES } from '../../../src/configs/di.types';
import { NotFoundError, BadRequestError } from '../../../src/responses/error.responses';
import mongoose from 'mongoose';

describe('GradeService - DI Implementation', () => {
    let container: Container;
    let gradeService: GradeService;
    let mockGradeRepository: jest.Mocked<IGradeRepository>;
    let mockStudentRepository: jest.Mocked<IStudentRepository>;
    let mockClassRepository: jest.Mocked<IClassRepository>;
    let mockEnrollmentRepository: jest.Mocked<IEnrollmentRepository>;

    const mockStudentId = new mongoose.Types.ObjectId();
    const mockClassId = new mongoose.Types.ObjectId();
    const mockEnrollmentId = new mongoose.Types.ObjectId();

    const mockStudent = {
        _id: mockStudentId,
        studentId: "123",
        fullName: "John Doe"
    };

    const mockClass = {
        _id: mockClassId,
        classCode: "CS101",
        course: new mongoose.Types.ObjectId()
    };

    const mockEnrollment = {
        _id: mockEnrollmentId,
        student: mockStudentId,
        class: mockClassId
    };

    beforeEach(() => {
        // Create test container
        container = new Container();
        
        // Create mocked repositories
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

        mockClassRepository = {
            createClass: jest.fn(),
            findClassByCode: jest.fn(),
            findClassByCourse: jest.fn(),
            findClassesWithOverlappingSchedule: jest.fn(),
            getAllClasses: jest.fn(),
            updateClassByCode: jest.fn(),
            deleteClassByCode: jest.fn(),
        } as jest.Mocked<IClassRepository>;

        mockEnrollmentRepository = {
            findEnrollment: jest.fn(),
            createEnrollment: jest.fn(),
            dropEnrollment: jest.fn(),
            getCompletedCourseIdsByStudent: jest.fn(),
            findDropHistoryByStudent: jest.fn(),
            findEnrollmentsByStudent: jest.fn(),
            findEnrollmentsByClass: jest.fn(),
        } as jest.Mocked<IEnrollmentRepository>;
        
        // Bind mocked repositories
        container.bind<IGradeRepository>(TYPES.GradeRepository).toConstantValue(mockGradeRepository);
        container.bind<IStudentRepository>(TYPES.StudentRepository).toConstantValue(mockStudentRepository);
        container.bind<IClassRepository>(TYPES.ClassRepository).toConstantValue(mockClassRepository);
        container.bind<IEnrollmentRepository>(TYPES.EnrollmentRepository).toConstantValue(mockEnrollmentRepository);
        container.bind<GradeService>(TYPES.GradeService).to(GradeService);
        
        // Get service instance
        gradeService = container.get<GradeService>(TYPES.GradeService);
    });

    describe('createGrade', () => {
        const gradeData = { 
            studentId: '123', 
            classCode: 'CS101', 
            midtermScore: 5, 
            finalScore: 6, 
            totalScore: 7 
        };

        it('should throw NotFoundError if student does not exist', async () => {
            mockStudentRepository.findStudent.mockResolvedValue(null);

            await expect(gradeService.createGrade(gradeData))
                .rejects
                .toThrow(new NotFoundError('Student not found'));

            expect(mockStudentRepository.findStudent).toHaveBeenCalledWith({ studentId: '123' });
        });

        it('should throw NotFoundError if class does not exist', async () => {
            mockStudentRepository.findStudent.mockResolvedValue(mockStudent as any);
            mockClassRepository.findClassByCode.mockResolvedValue(null);

            await expect(gradeService.createGrade(gradeData))
                .rejects
                .toThrow(new NotFoundError('Class not found'));

            expect(mockClassRepository.findClassByCode).toHaveBeenCalledWith('CS101');
        });

        it('should throw BadRequestError if student is not enrolled in the class', async () => {
            mockStudentRepository.findStudent.mockResolvedValue(mockStudent as any);
            mockClassRepository.findClassByCode.mockResolvedValue(mockClass as any);
            mockEnrollmentRepository.findEnrollment.mockResolvedValue(null);

            await expect(gradeService.createGrade(gradeData))
                .rejects
                .toThrow(new BadRequestError('Student is not enrolled in this class'));
        });

        it('should throw BadRequestError if grade already exists', async () => {
            mockStudentRepository.findStudent.mockResolvedValue(mockStudent as any);
            mockClassRepository.findClassByCode.mockResolvedValue(mockClass as any);
            mockEnrollmentRepository.findEnrollment.mockResolvedValue(mockEnrollment as any);
            mockGradeRepository.findGradeByEnrollment.mockResolvedValue({} as any);

            await expect(gradeService.createGrade(gradeData))
                .rejects
                .toThrow(new BadRequestError('Grade already exists for this enrollment'));
        });

        it('should throw BadRequestError if totalScore is not between 0 and 10', async () => {
            const invalidGradeData = { ...gradeData, totalScore: 11 };
            
            mockStudentRepository.findStudent.mockResolvedValue(mockStudent as any);
            mockClassRepository.findClassByCode.mockResolvedValue(mockClass as any);
            mockEnrollmentRepository.findEnrollment.mockResolvedValue(mockEnrollment as any);
            mockGradeRepository.findGradeByEnrollment.mockResolvedValue(null);

            await expect(gradeService.createGrade(invalidGradeData))
                .rejects
                .toThrow(new BadRequestError('Total score must be between 0 and 10'));
        });

        it('should create grade successfully', async () => {
            const newGrade = { 
                _id: new mongoose.Types.ObjectId(),
                enrollment: mockEnrollmentId, 
                midtermScore: 5, 
                finalScore: 6, 
                totalScore: 7, 
                letterGrade: 'B', 
                gradePoints: 3.0 
            };
            
            mockStudentRepository.findStudent.mockResolvedValue(mockStudent as any);
            mockClassRepository.findClassByCode.mockResolvedValue(mockClass as any);
            mockEnrollmentRepository.findEnrollment.mockResolvedValue(mockEnrollment as any);
            mockGradeRepository.findGradeByEnrollment.mockResolvedValue(null);
            mockGradeRepository.createGrade.mockResolvedValue(newGrade as any);

            const result = await gradeService.createGrade(gradeData);

            expect(mockGradeRepository.createGrade).toHaveBeenCalledWith(expect.objectContaining({
                enrollment: mockEnrollmentId,
                midtermScore: 5,
                finalScore: 6,
                totalScore: 7,
                letterGrade: 'B',
                gradePoints: 3.0
            }));
            expect(result).toEqual(newGrade);
        });
    });

    describe('getGradesByClass', () => {
        const mockGrades = [
            { _id: new mongoose.Types.ObjectId(), totalScore: 8.5, letterGrade: 'B+' },
            { _id: new mongoose.Types.ObjectId(), totalScore: 9.2, letterGrade: 'A' }
        ];

        it('should get all grades for a class successfully', async () => {
            mockClassRepository.findClassByCode.mockResolvedValue(mockClass as any);
            mockGradeRepository.getGradesByClass.mockResolvedValue(mockGrades as any);

            const result = await gradeService.getGradesByClass('CS101');

            expect(mockClassRepository.findClassByCode).toHaveBeenCalledWith('CS101');
            expect(mockGradeRepository.getGradesByClass).toHaveBeenCalledWith(mockClassId);
            expect(result).toEqual(mockGrades);
        });

        it('should throw NotFoundError if class does not exist', async () => {
            mockClassRepository.findClassByCode.mockResolvedValue(null);

            await expect(gradeService.getGradesByClass('INVALID'))
                .rejects
                .toThrow('Class not found');
        });
    });

    describe('getGradeByStudentAndClass', () => {
        const mockGrade = { _id: new mongoose.Types.ObjectId(), totalScore: 8.5, letterGrade: 'B+' };

        it('should get grade for specific student and class successfully', async () => {
            mockStudentRepository.findStudent.mockResolvedValue(mockStudent as any);
            mockClassRepository.findClassByCode.mockResolvedValue(mockClass as any);
            mockEnrollmentRepository.findEnrollment.mockResolvedValue(mockEnrollment as any);
            mockGradeRepository.findGradeByEnrollment.mockResolvedValue(mockGrade as any);

            const result = await gradeService.getGradeByStudentAndClass('123', 'CS101');

            expect(mockStudentRepository.findStudent).toHaveBeenCalledWith({ studentId: '123' });
            expect(mockClassRepository.findClassByCode).toHaveBeenCalledWith('CS101');
            expect(mockEnrollmentRepository.findEnrollment).toHaveBeenCalledWith(mockStudentId, mockClassId);
            expect(mockGradeRepository.findGradeByEnrollment).toHaveBeenCalledWith(mockEnrollmentId);
            expect(result).toEqual(mockGrade);
        });

        it('should throw NotFoundError if student does not exist', async () => {
            mockStudentRepository.findStudent.mockResolvedValue(null);

            await expect(gradeService.getGradeByStudentAndClass('INVALID', 'CS101'))
                .rejects
                .toThrow('Student not found');
        });

        it('should throw NotFoundError if grade not found', async () => {
            mockStudentRepository.findStudent.mockResolvedValue(mockStudent as any);
            mockClassRepository.findClassByCode.mockResolvedValue(mockClass as any);
            mockEnrollmentRepository.findEnrollment.mockResolvedValue(mockEnrollment as any);
            mockGradeRepository.findGradeByEnrollment.mockResolvedValue(null);

            await expect(gradeService.getGradeByStudentAndClass('123', 'CS101'))
                .rejects
                .toThrow('Grade not found for this student in this class');
        });
    });

    describe('updateGrade', () => {
        const gradeId = new mongoose.Types.ObjectId().toString();
        const mockGrade = { _id: gradeId, totalScore: 7.5, letterGrade: 'B' };
        const updateData = { totalScore: 8.5 };

        it('should update grade successfully with recalculated letter grade', async () => {
            const updatedGrade = { ...mockGrade, totalScore: 8.5, letterGrade: 'B+', gradePoints: 3.5 };
            
            mockGradeRepository.findGradeById.mockResolvedValue(mockGrade as any);
            mockGradeRepository.updateGrade.mockResolvedValue(updatedGrade as any);

            const result = await gradeService.updateGrade(gradeId, updateData);

            expect(mockGradeRepository.findGradeById).toHaveBeenCalledWith(gradeId);
            expect(mockGradeRepository.updateGrade).toHaveBeenCalledWith(gradeId, {
                totalScore: 8.5,
                letterGrade: 'B+',
                gradePoints: 3.5
            });
            expect(result).toEqual(updatedGrade);
        });

        it('should throw NotFoundError if grade does not exist', async () => {
            mockGradeRepository.findGradeById.mockResolvedValue(null);

            await expect(gradeService.updateGrade(gradeId, updateData))
                .rejects
                .toThrow('Grade not found');
        });

        it('should throw BadRequestError for invalid score range', async () => {
            mockGradeRepository.findGradeById.mockResolvedValue(mockGrade as any);

            await expect(gradeService.updateGrade(gradeId, { totalScore: 15 }))
                .rejects
                .toThrow('Total score must be between 0 and 10');
        });
    });

    describe('deleteGrade', () => {
        const gradeId = new mongoose.Types.ObjectId().toString();
        const mockGrade = { _id: gradeId, totalScore: 7.5, letterGrade: 'B' };

        it('should delete grade successfully', async () => {
            mockGradeRepository.findGradeById.mockResolvedValue(mockGrade as any);
            mockGradeRepository.deleteGrade.mockResolvedValue(mockGrade as any);

            const result = await gradeService.deleteGrade(gradeId);

            expect(mockGradeRepository.findGradeById).toHaveBeenCalledWith(gradeId);
            expect(mockGradeRepository.deleteGrade).toHaveBeenCalledWith(gradeId);
            expect(result).toEqual(mockGrade);
        });

        it('should throw NotFoundError if grade does not exist', async () => {
            mockGradeRepository.findGradeById.mockResolvedValue(null);

            await expect(gradeService.deleteGrade(gradeId))
                .rejects
                .toThrow('Grade not found');
        });

        it('should throw NotFoundError if grade not found during deletion', async () => {
            mockGradeRepository.findGradeById.mockResolvedValue(mockGrade as any);
            mockGradeRepository.deleteGrade.mockResolvedValue(null);

            await expect(gradeService.deleteGrade(gradeId))
                .rejects
                .toThrow('Grade not found during deletion');
        });
    });
});
