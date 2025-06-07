import mongoose from "mongoose";
import { Container } from "inversify";
import { SemesterService } from "../../../src/services/semester.service";
import { ISemester } from "../../../src/models/interfaces/semester.interface";
import { ISemesterRepository } from "../../../src/interfaces/repositories/semester.repository.interface";
import { CreateSemesterDto } from "../../../src/dto/semester";
import { TYPES } from "../../../src/configs/di.types";

describe("Semester Service", () => {
  let container: Container;
  let semesterService: SemesterService;
  let mockSemesterRepository: jest.Mocked<ISemesterRepository>;

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
    
    // Create mocked repository
    mockSemesterRepository = {
      createSemester: jest.fn(),
      findSemester: jest.fn(),
    } as jest.Mocked<ISemesterRepository>;
    
    // Bind mocked repository
    container.bind<ISemesterRepository>(TYPES.SemesterRepository).toConstantValue(mockSemesterRepository);
    container.bind<SemesterService>(TYPES.SemesterService).to(SemesterService);
    
    // Get service instance
    semesterService = container.get<SemesterService>(TYPES.SemesterService);
  });

  describe('createSemester', () => {
    it('should create semester successfully', async () => {
      // Mock repository to return created semester
      mockSemesterRepository.createSemester.mockResolvedValue(mockSemester as ISemester);

      const result = await semesterService.createSemester(mockCreateSemesterDto);
      
      expect(mockSemesterRepository.createSemester).toHaveBeenCalledWith(mockCreateSemesterDto);
      expect(result).toEqual(mockSemester);
    });

    it('should handle repository errors', async () => {
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
      mockSemesterRepository.createSemester.mockResolvedValue(expectedResult as ISemester);

      const result = await semesterService.createSemester(customSemesterData);
      
      expect(mockSemesterRepository.createSemester).toHaveBeenCalledWith(customSemesterData);
      expect(result).toEqual(expectedResult);
    });
  });
}); 