import mongoose from "mongoose";
import { Container } from "inversify";
import { SemesterService } from "../../../src/services/semester.service";
import { ISemester } from "../../../src/models/interfaces/semester.interface";
import { ISemesterRepository } from "../../../src/interfaces/repositories/semester.repository.interface";
import { IClassRepository } from "../../../src/interfaces/repositories/class.repository.interface";
import { CreateSemesterDto } from "../../../src/dto/semester";
import { TYPES } from "../../../src/configs/di.types";

describe("Semester Service", () => {
  let container: Container;
  let semesterService: SemesterService;
  let mockSemesterRepository: jest.Mocked<ISemesterRepository>;
  let mockClassRepository: jest.Mocked<IClassRepository>;

  const mockSemester: Partial<ISemester> = {
    _id: new mongoose.Types.ObjectId(),
    academicYear: "2024-2025",
    semester: 1,
    registrationStartDate: new Date("2024-08-01"),
    registrationEndDate: new Date("2024-08-15"),
    dropDeadline: new Date("2024-09-30"),
    semesterStartDate: new Date("2024-09-01"),
    semesterEndDate: new Date("2024-12-31"),
    isActive: true
  };

  const mockCreateSemesterDto: CreateSemesterDto = {
    academicYear: "2024-2025",
    semester: 1,
    registrationStartDate: new Date("2024-08-01"),
    registrationEndDate: new Date("2024-08-15"),
    dropDeadline: new Date("2024-09-30"),
    semesterStartDate: new Date("2024-09-01"),
    semesterEndDate: new Date("2024-12-31")
  };

  beforeEach(() => {
    // Create test container
    container = new Container();
    
    // Create mocked repositories
    mockSemesterRepository = {
      createSemester: jest.fn(),
      findSemester: jest.fn(),
      findSemesterById: jest.fn(),
      updateSemester: jest.fn(),
      deleteSemester: jest.fn(),
      getAllSemesters: jest.fn(),
    } as jest.Mocked<ISemesterRepository>;

    mockClassRepository = {
      createClass: jest.fn(),
      findClassByCode: jest.fn(),
      findClassByCourse: jest.fn(),
      findClassesWithOverlappingSchedule: jest.fn(),
      getAllClasses: jest.fn(),
    } as jest.Mocked<IClassRepository>;
    
    // Bind mocked repositories
    container.bind<ISemesterRepository>(TYPES.SemesterRepository).toConstantValue(mockSemesterRepository);
    container.bind<IClassRepository>(TYPES.ClassRepository).toConstantValue(mockClassRepository);
    container.bind<SemesterService>(TYPES.SemesterService).to(SemesterService);
    
    // Get service instance
    semesterService = container.get<SemesterService>(TYPES.SemesterService);
  });

  describe('createSemester', () => {
    it('should create semester successfully when no duplicate exists', async () => {
      // Mock no existing semester found
      mockSemesterRepository.findSemester.mockResolvedValue(null);
      // Mock repository to return created semester
      mockSemesterRepository.createSemester.mockResolvedValue(mockSemester as ISemester);

      const result = await semesterService.createSemester(mockCreateSemesterDto);
      
      expect(mockSemesterRepository.findSemester).toHaveBeenCalledWith("2024-2025", 1);
      expect(mockSemesterRepository.createSemester).toHaveBeenCalledWith(mockCreateSemesterDto);
      expect(result).toEqual(mockSemester);
    });

    it('should throw BadRequestError when duplicate semester exists', async () => {
      // Mock existing semester found
      mockSemesterRepository.findSemester.mockResolvedValue(mockSemester as ISemester);

      await expect(semesterService.createSemester(mockCreateSemesterDto))
        .rejects
        .toThrow('A semester with this academic year and semester number already exists');
      
      expect(mockSemesterRepository.findSemester).toHaveBeenCalledWith("2024-2025", 1);
      expect(mockSemesterRepository.createSemester).not.toHaveBeenCalled();
    });

    it('should handle repository errors', async () => {
      // Mock no existing semester
      mockSemesterRepository.findSemester.mockResolvedValue(null);
      const error = new Error('Database error');
      mockSemesterRepository.createSemester.mockRejectedValue(error);

      await expect(semesterService.createSemester(mockCreateSemesterDto))
        .rejects
        .toThrow('Database error');
      
      expect(mockSemesterRepository.createSemester).toHaveBeenCalledWith(mockCreateSemesterDto);
    });

    it('should pass through all semester data correctly', async () => {
      const customSemesterData: CreateSemesterDto = {
        academicYear: "2025-2026",
        semester: 2,
        registrationStartDate: new Date("2025-01-01"),
        registrationEndDate: new Date("2025-01-15"),
        dropDeadline: new Date("2025-02-28"),
        semesterStartDate: new Date("2025-02-01"),
        semesterEndDate: new Date("2025-05-31")
      };

      const expectedResult = { ...mockSemester, ...customSemesterData };
      // Mock no existing semester
      mockSemesterRepository.findSemester.mockResolvedValue(null);
      mockSemesterRepository.createSemester.mockResolvedValue(expectedResult as ISemester);

      const result = await semesterService.createSemester(customSemesterData);
      
      expect(mockSemesterRepository.findSemester).toHaveBeenCalledWith("2025-2026", 2);
      expect(mockSemesterRepository.createSemester).toHaveBeenCalledWith(customSemesterData);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('deleteSemester', () => {
    const semesterId = new mongoose.Types.ObjectId().toString();

    it('should delete semester successfully when no classes exist', async () => {
      // Mock existing semester found
      mockSemesterRepository.findSemesterById.mockResolvedValue(mockSemester as ISemester);
      // Mock no classes in semester
      mockClassRepository.getAllClasses.mockResolvedValue({ 
        data: [], 
        pagination: { page: 1, limit: 1, total: 0, totalPages: 0 } 
      } as any);
      // Mock successful deletion
      mockSemesterRepository.deleteSemester.mockResolvedValue(mockSemester as ISemester);

      const result = await semesterService.deleteSemester(semesterId);

      expect(mockSemesterRepository.findSemesterById).toHaveBeenCalledWith(semesterId);
      expect(mockClassRepository.getAllClasses).toHaveBeenCalledWith(1, 1, {
        academicYear: "2024-2025",
        semester: 1
      });
      expect(mockSemesterRepository.deleteSemester).toHaveBeenCalledWith(semesterId);
      expect(result).toEqual(mockSemester);
    });

    it('should throw NotFoundError when semester does not exist', async () => {
      mockSemesterRepository.findSemesterById.mockResolvedValue(null);

      await expect(semesterService.deleteSemester(semesterId))
        .rejects
        .toThrow('Semester not found');

      expect(mockSemesterRepository.findSemesterById).toHaveBeenCalledWith(semesterId);
      expect(mockClassRepository.getAllClasses).not.toHaveBeenCalled();
      expect(mockSemesterRepository.deleteSemester).not.toHaveBeenCalled();
    });

    it('should throw BadRequestError when classes exist in semester', async () => {
      // Mock existing semester found
      mockSemesterRepository.findSemesterById.mockResolvedValue(mockSemester as ISemester);
      // Mock classes exist in semester
      mockClassRepository.getAllClasses.mockResolvedValue({ 
        data: [{ _id: new mongoose.Types.ObjectId(), classCode: 'CS101-01' }], 
        pagination: { page: 1, limit: 1, total: 1, totalPages: 1 } 
      } as any);

      await expect(semesterService.deleteSemester(semesterId))
        .rejects
        .toThrow('Cannot delete semester when classes exist for this semester');

      expect(mockSemesterRepository.findSemesterById).toHaveBeenCalledWith(semesterId);
      expect(mockClassRepository.getAllClasses).toHaveBeenCalledWith(1, 1, {
        academicYear: "2024-2025",
        semester: 1
      });
      expect(mockSemesterRepository.deleteSemester).not.toHaveBeenCalled();
    });

    it('should throw NotFoundError when semester not found during deletion', async () => {
      // Mock existing semester found initially
      mockSemesterRepository.findSemesterById.mockResolvedValue(mockSemester as ISemester);
      // Mock no classes in semester
      mockClassRepository.getAllClasses.mockResolvedValue({ 
        data: [], 
        pagination: { page: 1, limit: 1, total: 0, totalPages: 0 } 
      } as any);
      // Mock deletion returns null (semester not found during deletion)
      mockSemesterRepository.deleteSemester.mockResolvedValue(null);

      await expect(semesterService.deleteSemester(semesterId))
        .rejects
        .toThrow('Semester not found during deletion');

      expect(mockSemesterRepository.deleteSemester).toHaveBeenCalledWith(semesterId);
    });

    it('should handle errors when checking classes and proceed with deletion', async () => {
      // Mock existing semester found
      mockSemesterRepository.findSemesterById.mockResolvedValue(mockSemester as ISemester);
      // Mock error when checking classes (not BadRequestError)
      mockClassRepository.getAllClasses.mockRejectedValue(new Error('Database connection error'));
      // Mock successful deletion
      mockSemesterRepository.deleteSemester.mockResolvedValue(mockSemester as ISemester);

      // Spy on console.warn to verify it's called
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});

      const result = await semesterService.deleteSemester(semesterId);

      expect(consoleSpy).toHaveBeenCalledWith('Error checking classes in semester:', expect.any(Error));
      expect(mockSemesterRepository.deleteSemester).toHaveBeenCalledWith(semesterId);
      expect(result).toEqual(mockSemester);

      // Restore console.warn
      consoleSpy.mockRestore();
    });
  });
}); 