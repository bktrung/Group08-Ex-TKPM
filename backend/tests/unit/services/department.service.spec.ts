import mongoose from "mongoose";
import { Container } from "inversify";
import { DepartmentService } from "../../../src/services/department.service";
import { BadRequestError, NotFoundError } from "../../../src/responses/error.responses";
import { IDepartment } from "../../../src/models/interfaces/department.interface";
import { IDepartmentRepository } from "../../../src/interfaces/repositories/department.repository.interface";
import { TYPES } from "../../../src/configs/di.types";

describe("Department Service", () => {
  let container: Container;
  let departmentService: DepartmentService;
  let mockDepartmentRepository: jest.Mocked<IDepartmentRepository>;

  const mockDepartmentId = new mongoose.Types.ObjectId().toString();
  
  const mockDepartment: Partial<IDepartment> = {
    _id: new mongoose.Types.ObjectId(),
    name: "Khoa Công nghệ thông tin"
  };

  beforeEach(() => {
    // Create test container
    container = new Container();
    
    // Create mocked repository
    mockDepartmentRepository = {
      findDepartmentById: jest.fn(),
      findDepartmentByName: jest.fn(),
      addDepartment: jest.fn(),
      updateDepartment: jest.fn(),
      getDepartments: jest.fn(),
      deleteDepartment: jest.fn(),
      countStudentsByDepartment: jest.fn(),
      countCoursesByDepartment: jest.fn(),
    } as jest.Mocked<IDepartmentRepository>;
    
    // Bind mocked repository
    container.bind<IDepartmentRepository>(TYPES.DepartmentRepository).toConstantValue(mockDepartmentRepository);
    container.bind<DepartmentService>(TYPES.DepartmentService).to(DepartmentService);
    
    // Get service instance
    departmentService = container.get<DepartmentService>(TYPES.DepartmentService);
  });

  describe('addDepartment', () => {
    it('should throw BadRequestError if department already exists', async () => {
      const departmentName = 'Khoa Công nghệ thông tin';

      // Mock findDepartmentByName to return existing department
      mockDepartmentRepository.findDepartmentByName.mockResolvedValue(mockDepartment as IDepartment);

      await expect(departmentService.addDepartment(departmentName))
        .rejects
        .toThrow(BadRequestError);
      
      expect(mockDepartmentRepository.findDepartmentByName).toHaveBeenCalledWith(departmentName);
      expect(mockDepartmentRepository.addDepartment).not.toHaveBeenCalled();
    });

    it('should add department successfully if it does not exist', async () => {
      const departmentName = 'Khoa Công nghệ thông tin';

      // Mock findDepartmentByName to return null (no existing department)
      mockDepartmentRepository.findDepartmentByName.mockResolvedValue(null);
      mockDepartmentRepository.addDepartment.mockResolvedValue(mockDepartment as IDepartment);

      const result = await departmentService.addDepartment(departmentName);
      
      expect(mockDepartmentRepository.findDepartmentByName).toHaveBeenCalledWith(departmentName);
      expect(mockDepartmentRepository.addDepartment).toHaveBeenCalledWith(departmentName);
      expect(result).toEqual(mockDepartment);
    });
  });

  describe('updateDepartment', () => {
    it('should throw BadRequestError if department name already exists', async () => {
      const departmentId = mockDepartmentId;
      const departmentName = 'Khoa Công nghệ thông tin';

      // Mock findDepartmentByName to return existing department with same name
      mockDepartmentRepository.findDepartmentByName.mockResolvedValue(mockDepartment as IDepartment);

      await expect(departmentService.updateDepartment(departmentId, departmentName))
        .rejects
        .toThrow(BadRequestError);
      
      expect(mockDepartmentRepository.findDepartmentByName).toHaveBeenCalledWith(departmentName);
      expect(mockDepartmentRepository.updateDepartment).not.toHaveBeenCalled();
    });

    it('should throw NotFoundError if department does not exist for update', async () => {
      const departmentId = mockDepartmentId;
      const departmentName = 'Khoa Công nghệ thông tin';

      // Mock findDepartmentByName to return null (no existing department with same name)
      mockDepartmentRepository.findDepartmentByName.mockResolvedValue(null);
      // Mock updateDepartment to return null (department not found)
      mockDepartmentRepository.updateDepartment.mockResolvedValue(null);

      await expect(departmentService.updateDepartment(departmentId, departmentName))
        .rejects
        .toThrow(NotFoundError);
      
      expect(mockDepartmentRepository.findDepartmentByName).toHaveBeenCalledWith(departmentName);
      expect(mockDepartmentRepository.updateDepartment).toHaveBeenCalledWith(departmentId, departmentName);
    });

    it('should update department successfully', async () => {
      const departmentId = mockDepartmentId;
      const departmentName = 'Khoa Kỹ thuật phần mềm';
      const updatedDepartment = { ...mockDepartment, name: departmentName };

      // Mock findDepartmentByName to return null (no existing department with same name)
      mockDepartmentRepository.findDepartmentByName.mockResolvedValue(null);
      mockDepartmentRepository.updateDepartment.mockResolvedValue(updatedDepartment as IDepartment);

      const result = await departmentService.updateDepartment(departmentId, departmentName);
      
      expect(mockDepartmentRepository.findDepartmentByName).toHaveBeenCalledWith(departmentName);
      expect(mockDepartmentRepository.updateDepartment).toHaveBeenCalledWith(departmentId, departmentName);
      expect(result).toEqual(updatedDepartment);
    });
  });

  describe('getDepartments', () => {
    it('should return list of departments', async () => {
      const departments = [
        { ...mockDepartment, name: 'Khoa Công nghệ thông tin' },
        { ...mockDepartment, name: 'Khoa Kinh tế', _id: new mongoose.Types.ObjectId() }
      ];
      
      mockDepartmentRepository.getDepartments.mockResolvedValue(departments as IDepartment[]);

      const result = await departmentService.getDepartments();
      
      expect(mockDepartmentRepository.getDepartments).toHaveBeenCalled();
      expect(result).toEqual(departments);
    });

    it('should return empty array when no departments exist', async () => {
      mockDepartmentRepository.getDepartments.mockResolvedValue([]);

      const result = await departmentService.getDepartments();
      
      expect(mockDepartmentRepository.getDepartments).toHaveBeenCalled();
      expect(result).toEqual([]);
    });
  });

  describe('deleteDepartment', () => {
    it('should throw NotFoundError if department does not exist', async () => {
      const departmentId = mockDepartmentId;

      // Mock findDepartmentById to return null (department not found)
      mockDepartmentRepository.findDepartmentById.mockResolvedValue(null);

      await expect(departmentService.deleteDepartment(departmentId))
        .rejects
        .toThrow(NotFoundError);
      
      expect(mockDepartmentRepository.findDepartmentById).toHaveBeenCalledWith(departmentId);
      expect(mockDepartmentRepository.countStudentsByDepartment).not.toHaveBeenCalled();
      expect(mockDepartmentRepository.countCoursesByDepartment).not.toHaveBeenCalled();
      expect(mockDepartmentRepository.deleteDepartment).not.toHaveBeenCalled();
    });

    it('should throw BadRequestError if department has students', async () => {
      const departmentId = mockDepartmentId;

      // Mock findDepartmentById to return existing department
      mockDepartmentRepository.findDepartmentById.mockResolvedValue(mockDepartment as IDepartment);
      // Mock countStudentsByDepartment to return > 0
      mockDepartmentRepository.countStudentsByDepartment.mockResolvedValue(5);

      await expect(departmentService.deleteDepartment(departmentId))
        .rejects
        .toThrow(new BadRequestError('Cannot delete department with assigned students'));
      
      expect(mockDepartmentRepository.findDepartmentById).toHaveBeenCalledWith(departmentId);
      expect(mockDepartmentRepository.countStudentsByDepartment).toHaveBeenCalledWith(departmentId);
      expect(mockDepartmentRepository.countCoursesByDepartment).not.toHaveBeenCalled();
      expect(mockDepartmentRepository.deleteDepartment).not.toHaveBeenCalled();
    });

    it('should throw BadRequestError if department has courses', async () => {
      const departmentId = mockDepartmentId;

      // Mock findDepartmentById to return existing department
      mockDepartmentRepository.findDepartmentById.mockResolvedValue(mockDepartment as IDepartment);
      // Mock countStudentsByDepartment to return 0
      mockDepartmentRepository.countStudentsByDepartment.mockResolvedValue(0);
      // Mock countCoursesByDepartment to return > 0
      mockDepartmentRepository.countCoursesByDepartment.mockResolvedValue(3);

      await expect(departmentService.deleteDepartment(departmentId))
        .rejects
        .toThrow(new BadRequestError('Cannot delete department with assigned courses'));
      
      expect(mockDepartmentRepository.findDepartmentById).toHaveBeenCalledWith(departmentId);
      expect(mockDepartmentRepository.countStudentsByDepartment).toHaveBeenCalledWith(departmentId);
      expect(mockDepartmentRepository.countCoursesByDepartment).toHaveBeenCalledWith(departmentId);
      expect(mockDepartmentRepository.deleteDepartment).not.toHaveBeenCalled();
    });

    it('should throw BadRequestError if department has both students and courses', async () => {
      const departmentId = mockDepartmentId;

      // Mock findDepartmentById to return existing department
      mockDepartmentRepository.findDepartmentById.mockResolvedValue(mockDepartment as IDepartment);
      // Mock countStudentsByDepartment to return > 0
      mockDepartmentRepository.countStudentsByDepartment.mockResolvedValue(2);

      await expect(departmentService.deleteDepartment(departmentId))
        .rejects
        .toThrow(new BadRequestError('Cannot delete department with assigned students'));
      
      expect(mockDepartmentRepository.findDepartmentById).toHaveBeenCalledWith(departmentId);
      expect(mockDepartmentRepository.countStudentsByDepartment).toHaveBeenCalledWith(departmentId);
      // Should not check courses if students exist (early return)
      expect(mockDepartmentRepository.countCoursesByDepartment).not.toHaveBeenCalled();
      expect(mockDepartmentRepository.deleteDepartment).not.toHaveBeenCalled();
    });

    it('should throw NotFoundError if department not found during deletion', async () => {
      const departmentId = mockDepartmentId;

      // Mock findDepartmentById to return existing department
      mockDepartmentRepository.findDepartmentById.mockResolvedValue(mockDepartment as IDepartment);
      // Mock counts to return 0 (no dependencies)
      mockDepartmentRepository.countStudentsByDepartment.mockResolvedValue(0);
      mockDepartmentRepository.countCoursesByDepartment.mockResolvedValue(0);
      // Mock deleteDepartment to return null (not found during deletion)
      mockDepartmentRepository.deleteDepartment.mockResolvedValue(null);

      await expect(departmentService.deleteDepartment(departmentId))
        .rejects
        .toThrow(new NotFoundError('Department not found during deletion'));
      
      expect(mockDepartmentRepository.findDepartmentById).toHaveBeenCalledWith(departmentId);
      expect(mockDepartmentRepository.countStudentsByDepartment).toHaveBeenCalledWith(departmentId);
      expect(mockDepartmentRepository.countCoursesByDepartment).toHaveBeenCalledWith(departmentId);
      expect(mockDepartmentRepository.deleteDepartment).toHaveBeenCalledWith(departmentId);
    });

    it('should delete department successfully when no dependencies exist', async () => {
      const departmentId = mockDepartmentId;
      const deletedDepartment = { ...mockDepartment };

      // Mock findDepartmentById to return existing department
      mockDepartmentRepository.findDepartmentById.mockResolvedValue(mockDepartment as IDepartment);
      // Mock counts to return 0 (no dependencies)
      mockDepartmentRepository.countStudentsByDepartment.mockResolvedValue(0);
      mockDepartmentRepository.countCoursesByDepartment.mockResolvedValue(0);
      // Mock deleteDepartment to return deleted department
      mockDepartmentRepository.deleteDepartment.mockResolvedValue(deletedDepartment as IDepartment);

      const result = await departmentService.deleteDepartment(departmentId);
      
      expect(mockDepartmentRepository.findDepartmentById).toHaveBeenCalledWith(departmentId);
      expect(mockDepartmentRepository.countStudentsByDepartment).toHaveBeenCalledWith(departmentId);
      expect(mockDepartmentRepository.countCoursesByDepartment).toHaveBeenCalledWith(departmentId);
      expect(mockDepartmentRepository.deleteDepartment).toHaveBeenCalledWith(departmentId);
      expect(result).toEqual(deletedDepartment);
    });
  });
});
