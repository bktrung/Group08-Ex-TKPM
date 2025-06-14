import mongoose from "mongoose";
import { Container } from "inversify";
import { ProgramService } from "../../../src/services/program.service";
import { BadRequestError, NotFoundError } from "../../../src/responses/error.responses";
import { IProgram } from "../../../src/models/interfaces/program.interface";
import { IProgramRepository } from "../../../src/interfaces/repositories/program.repository.interface";
import { TYPES } from "../../../src/configs/di.types";

describe("Program Service", () => {
  let container: Container;
  let programService: ProgramService;
  let mockProgramRepository: jest.Mocked<IProgramRepository>;

  const mockProgramId = new mongoose.Types.ObjectId().toString();
  
  const mockProgram: Partial<IProgram> = {
    _id: new mongoose.Types.ObjectId(),
    name: "Công nghệ thông tin"
  };

  beforeEach(() => {
    // Create test container
    container = new Container();
    
    // Create mocked repository
    mockProgramRepository = {
      findProgramById: jest.fn(),
      findProgramByName: jest.fn(),
      addProgram: jest.fn(),
      updateProgram: jest.fn(),
      getPrograms: jest.fn(),
      deleteProgram: jest.fn(),
      countStudentsByProgram: jest.fn(),
    } as jest.Mocked<IProgramRepository>;
    
    // Bind mocked repository
    container.bind<IProgramRepository>(TYPES.ProgramRepository).toConstantValue(mockProgramRepository);
    container.bind<ProgramService>(TYPES.ProgramService).to(ProgramService);
    
    // Get service instance
    programService = container.get<ProgramService>(TYPES.ProgramService);
  });

  describe('addProgram', () => {
    it('should throw BadRequestError if program already exists', async () => {
      const programName = 'Công nghệ thông tin';

      // Mock findProgramByName to return existing program
      mockProgramRepository.findProgramByName.mockResolvedValue(mockProgram as IProgram);

      await expect(programService.addProgram(programName))
        .rejects
        .toThrow(BadRequestError);
      
      expect(mockProgramRepository.findProgramByName).toHaveBeenCalledWith(programName);
      expect(mockProgramRepository.addProgram).not.toHaveBeenCalled();
    });

    it('should add program successfully if it does not exist', async () => {
      const programName = 'Kỹ thuật phần mềm';

      // Mock findProgramByName to return null (no existing program)
      mockProgramRepository.findProgramByName.mockResolvedValue(null);
      mockProgramRepository.addProgram.mockResolvedValue(mockProgram as IProgram);

      const result = await programService.addProgram(programName);
      
      expect(mockProgramRepository.findProgramByName).toHaveBeenCalledWith(programName);
      expect(mockProgramRepository.addProgram).toHaveBeenCalledWith(programName);
      expect(result).toEqual(mockProgram);
    });
  });

  describe('updateProgram', () => {
    it('should throw BadRequestError if program name already exists', async () => {
      const programId = mockProgramId;
      const programName = 'Công nghệ thông tin';

      // Mock findProgramByName to return existing program with same name
      mockProgramRepository.findProgramByName.mockResolvedValue(mockProgram as IProgram);

      await expect(programService.updateProgram(programId, programName))
        .rejects
        .toThrow(BadRequestError);
      
      expect(mockProgramRepository.findProgramByName).toHaveBeenCalledWith(programName);
      expect(mockProgramRepository.updateProgram).not.toHaveBeenCalled();
    });

    it('should throw NotFoundError if program does not exist for update', async () => {
      const programId = mockProgramId;
      const programName = 'Kỹ thuật phần mềm';

      // Mock findProgramByName to return null (no existing program with same name)
      mockProgramRepository.findProgramByName.mockResolvedValue(null);
      // Mock updateProgram to return null (program not found)
      mockProgramRepository.updateProgram.mockResolvedValue(null);

      await expect(programService.updateProgram(programId, programName))
        .rejects
        .toThrow(NotFoundError);
      
      expect(mockProgramRepository.findProgramByName).toHaveBeenCalledWith(programName);
      expect(mockProgramRepository.updateProgram).toHaveBeenCalledWith(programId, programName);
    });

    it('should update program successfully', async () => {
      const programId = mockProgramId;
      const programName = 'Khoa học máy tính';
      const updatedProgram = { ...mockProgram, name: programName };

      // Mock findProgramByName to return null (no existing program with same name)
      mockProgramRepository.findProgramByName.mockResolvedValue(null);
      mockProgramRepository.updateProgram.mockResolvedValue(updatedProgram as IProgram);

      const result = await programService.updateProgram(programId, programName);
      
      expect(mockProgramRepository.findProgramByName).toHaveBeenCalledWith(programName);
      expect(mockProgramRepository.updateProgram).toHaveBeenCalledWith(programId, programName);
      expect(result).toEqual(updatedProgram);
    });
  });

  describe('getPrograms', () => {
    it('should return list of programs', async () => {
      const programs = [
        { ...mockProgram, name: 'Công nghệ thông tin' },
        { ...mockProgram, name: 'Kỹ thuật phần mềm', _id: new mongoose.Types.ObjectId() }
      ];
      
      mockProgramRepository.getPrograms.mockResolvedValue(programs as IProgram[]);

      const result = await programService.getPrograms();
      
      expect(mockProgramRepository.getPrograms).toHaveBeenCalled();
      expect(result).toEqual(programs);
    });

    it('should return empty array when no programs exist', async () => {
      mockProgramRepository.getPrograms.mockResolvedValue([]);

      const result = await programService.getPrograms();
      
      expect(mockProgramRepository.getPrograms).toHaveBeenCalled();
      expect(result).toEqual([]);
    });
  });

  describe('deleteProgram', () => {
    it('should delete program successfully when no students are assigned', async () => {
      const programId = mockProgramId;

      mockProgramRepository.findProgramById.mockResolvedValue(mockProgram as IProgram);
      mockProgramRepository.countStudentsByProgram.mockResolvedValue(0);
      mockProgramRepository.deleteProgram.mockResolvedValue(mockProgram as IProgram);

      const result = await programService.deleteProgram(programId);

      expect(mockProgramRepository.findProgramById).toHaveBeenCalledWith(programId);
      expect(mockProgramRepository.countStudentsByProgram).toHaveBeenCalledWith(programId);
      expect(mockProgramRepository.deleteProgram).toHaveBeenCalledWith(programId);
      expect(result).toEqual(mockProgram);
    });

    it('should throw NotFoundError if program does not exist', async () => {
      const programId = mockProgramId;

      mockProgramRepository.findProgramById.mockResolvedValue(null);

      await expect(programService.deleteProgram(programId))
        .rejects
        .toThrow(NotFoundError);
      
      expect(mockProgramRepository.findProgramById).toHaveBeenCalledWith(programId);
      expect(mockProgramRepository.countStudentsByProgram).not.toHaveBeenCalled();
      expect(mockProgramRepository.deleteProgram).not.toHaveBeenCalled();
    });

    it('should throw BadRequestError if students are assigned to program', async () => {
      const programId = mockProgramId;

      mockProgramRepository.findProgramById.mockResolvedValue(mockProgram as IProgram);
      mockProgramRepository.countStudentsByProgram.mockResolvedValue(5);

      await expect(programService.deleteProgram(programId))
        .rejects
        .toThrow(BadRequestError);
      
      expect(mockProgramRepository.findProgramById).toHaveBeenCalledWith(programId);
      expect(mockProgramRepository.countStudentsByProgram).toHaveBeenCalledWith(programId);
      expect(mockProgramRepository.deleteProgram).not.toHaveBeenCalled();
    });

    it('should throw NotFoundError if deletion fails', async () => {
      const programId = mockProgramId;

      mockProgramRepository.findProgramById.mockResolvedValue(mockProgram as IProgram);
      mockProgramRepository.countStudentsByProgram.mockResolvedValue(0);
      mockProgramRepository.deleteProgram.mockResolvedValue(null);

      await expect(programService.deleteProgram(programId))
        .rejects
        .toThrow(NotFoundError);
      
      expect(mockProgramRepository.findProgramById).toHaveBeenCalledWith(programId);
      expect(mockProgramRepository.countStudentsByProgram).toHaveBeenCalledWith(programId);
      expect(mockProgramRepository.deleteProgram).toHaveBeenCalledWith(programId);
    });
  });

  describe('edge cases', () => {
    it('should handle empty program name in addProgram', async () => {
      const programName = '';

      mockProgramRepository.findProgramByName.mockResolvedValue(null);
      mockProgramRepository.addProgram.mockResolvedValue(mockProgram as IProgram);

      const result = await programService.addProgram(programName);
      
      expect(mockProgramRepository.findProgramByName).toHaveBeenCalledWith(programName);
      expect(mockProgramRepository.addProgram).toHaveBeenCalledWith(programName);
      expect(result).toEqual(mockProgram);
    });

    it('should handle invalid ObjectId in updateProgram', async () => {
      const invalidProgramId = 'invalid-id';
      const programName = 'Valid Program Name';

      mockProgramRepository.findProgramByName.mockResolvedValue(null);
      mockProgramRepository.updateProgram.mockResolvedValue(null);

      await expect(programService.updateProgram(invalidProgramId, programName))
        .rejects
        .toThrow(NotFoundError);
      
      expect(mockProgramRepository.findProgramByName).toHaveBeenCalledWith(programName);
      expect(mockProgramRepository.updateProgram).toHaveBeenCalledWith(invalidProgramId, programName);
    });
  });
}); 