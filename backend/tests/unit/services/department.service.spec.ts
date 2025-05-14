import { BadRequestError, NotFoundError } from  '../../../src/responses/error.responses';
import DepartmentService from '../../../src/services/department.service';
import * as departmentRepo from '../../../src/models/repositories/department.repo';

// Mocking các hàm trong repository
jest.mock('../../../src/models/repositories/department.repo');

describe('DepartmentService', () => {
  
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('addDepartment', () => {
    it('should throw BadRequestError if department already exists', async () => {
      const departmentName = 'Khoa Công nghệ thông tin';

      // Mocking findDepartmentByName để trả về department đã tồn tại
      (departmentRepo.findDepartmentByName as jest.Mock).mockResolvedValue({});

      await expect(DepartmentService.addDepartment(departmentName)).rejects.toThrowError(
        new BadRequestError('Khoa đã tồn tại')
      );
    });

    it('should add department successfully if it does not exist', async () => {
      const departmentName = 'Khoa Công nghệ thông tin';

      // Mocking findDepartmentByName để trả về null (không có department)
      (departmentRepo.findDepartmentByName as jest.Mock).mockResolvedValue(null);

      // Mocking addDepartment để trả về một department mới được thêm
      const newDepartment = { id: '1', name: departmentName };
      (departmentRepo.addDepartment as jest.Mock).mockResolvedValue(newDepartment);

      const result = await DepartmentService.addDepartment(departmentName);
      expect(result).toEqual(newDepartment);
    });
  });

  describe('updateDepartment', () => {
    it('should throw BadRequestError if department already exists', async () => {
      const departmentId = '1';
      const departmentName = 'Khoa Công nghệ thông tin';

      // Mocking findDepartmentByName để trả về department đã tồn tại
      (departmentRepo.findDepartmentByName as jest.Mock).mockResolvedValue({});

      await expect(DepartmentService.updateDepartment(departmentId, departmentName)).rejects.toThrowError(
        new BadRequestError('Khoa đã tồn tại')
      );
    });

    it('should throw NotFoundError if department does not exist for update', async () => {
      const departmentId = '1';
      const departmentName = 'Khoa Công nghệ thông tin';

      // Mocking findDepartmentByName để trả về null (không có department)
      (departmentRepo.findDepartmentByName as jest.Mock).mockResolvedValue(null);

      // Mocking updateDepartment để trả về null (không cập nhật được)
      (departmentRepo.updateDepartment as jest.Mock).mockResolvedValue(null);

      await expect(DepartmentService.updateDepartment(departmentId, departmentName)).rejects.toThrowError(
        new NotFoundError('Không tìm thấy khoa')
      );
    });

    it('should update department successfully', async () => {
      const departmentId = '1';
      const departmentName = 'Khoa Công nghệ thông tin';

      // Mocking findDepartmentByName để trả về null (không có department)
      (departmentRepo.findDepartmentByName as jest.Mock).mockResolvedValue(null);

      // Mocking updateDepartment để trả về department đã được cập nhật
      const updatedDepartment = { id: departmentId, name: departmentName };
      (departmentRepo.updateDepartment as jest.Mock).mockResolvedValue(updatedDepartment);

      const result = await DepartmentService.updateDepartment(departmentId, departmentName);
      expect(result).toEqual(updatedDepartment);
    });
  });

  describe('getDepartments', () => {
    it('should return list of departments', async () => {
      // Mocking getDepartments để trả về danh sách departments
      const departments = [
        { id: '1', name: 'Khoa Công nghệ thông tin' },
        { id: '2', name: 'Khoa Kinh tế' }
      ];
      (departmentRepo.getDepartments as jest.Mock).mockResolvedValue(departments);

      const result = await DepartmentService.getDepartments();
      expect(result).toEqual(departments);
    });
  });

});
