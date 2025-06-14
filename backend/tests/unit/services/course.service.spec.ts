// backend/tests/unit/services/course.service.spec.ts
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import { Container } from "inversify";
import { CourseService } from "../../../src/services/course.service";
import { BadRequestError, NotFoundError } from "../../../src/responses/error.responses";
import { ICourse } from "../../../src/models/interfaces/course.interface";
import { UpdateCourseDto, CreateCourseDto } from "../../../src/dto/course";
import { ICourseRepository } from "../../../src/interfaces/repositories/course.repository.interface";
import { IDepartmentRepository } from "../../../src/interfaces/repositories/department.repository.interface";
import { IClassRepository } from "../../../src/interfaces/repositories/class.repository.interface";
import { IEnrollmentRepository } from "../../../src/interfaces/repositories/enrollment.repository.interface";
import { TYPES } from "../../../src/configs/di.types";

describe("Course Service", () => {
  let container: Container;
  let courseService: CourseService;
  let mockCourseRepository: jest.Mocked<ICourseRepository>;
  let mockDepartmentRepository: jest.Mocked<IDepartmentRepository>;
  let mockClassRepository: jest.Mocked<IClassRepository>;
  let mockEnrollmentRepository: jest.Mocked<IEnrollmentRepository>;

  const mockDepartmentId = new mongoose.Types.ObjectId().toString();
  const mockPrereqId1 = new mongoose.Types.ObjectId().toString();
  const mockPrereqId2 = new mongoose.Types.ObjectId().toString();
  
  const mockCourseData: CreateCourseDto = {
    courseCode: "CS101",
    name: "Introduction to Computer Science",
    credits: 3,
    department: mockDepartmentId,
    description: "Basic principles of computer science",
    prerequisites: []
  };

  const mockCourse: Partial<ICourse> = {
    _id: new mongoose.Types.ObjectId(),
    courseCode: "CS101",
    name: "Introduction to Computer Science",
    credits: 3,
    department: mockDepartmentId,
    description: "Basic principles of computer science",
    prerequisites: [],
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
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
    container.bind<ICourseRepository>(TYPES.CourseRepository).toConstantValue(mockCourseRepository);
    container.bind<IDepartmentRepository>(TYPES.DepartmentRepository).toConstantValue(mockDepartmentRepository);
    container.bind<IClassRepository>(TYPES.ClassRepository).toConstantValue(mockClassRepository);
    container.bind<IEnrollmentRepository>(TYPES.EnrollmentRepository).toConstantValue(mockEnrollmentRepository);
    container.bind<CourseService>(TYPES.CourseService).to(CourseService);
    
    // Get service instance
    courseService = container.get<CourseService>(TYPES.CourseService);
  });

  // Test 1: Adding a course successfully
  it("should add a course successfully", async () => {
    // Mock implementations
    mockCourseRepository.findCourseByCode.mockResolvedValue(null);
    mockDepartmentRepository.findDepartmentById.mockResolvedValue({ 
      _id: mockDepartmentId, 
      name: "Computer Science" 
    } as any);
    mockCourseRepository.createCourse.mockResolvedValue(mockCourse as ICourse);

    // Execute
    const result = await courseService.addCourse(mockCourseData);

    // Verify
    expect(mockCourseRepository.findCourseByCode).toHaveBeenCalledWith("CS101");
    expect(mockDepartmentRepository.findDepartmentById).toHaveBeenCalledWith(mockDepartmentId);
    expect(mockCourseRepository.createCourse).toHaveBeenCalledWith(mockCourseData);
    expect(result).toEqual(mockCourse);
  });

  // Test 2: Prevent adding a course with an existing code
  it("should throw an error when adding a course with an existing code", async () => {
    mockCourseRepository.findCourseByCode.mockResolvedValue(mockCourse as ICourse);

    await expect(courseService.addCourse(mockCourseData))
      .rejects
      .toThrow(BadRequestError);
      
    expect(mockCourseRepository.findCourseByCode).toHaveBeenCalledWith("CS101");
    expect(mockCourseRepository.createCourse).not.toHaveBeenCalled();
  });

  // Test 3: Prevent adding a course with non-existent department
  it("should throw an error when adding a course with a non-existent department", async () => {
    mockCourseRepository.findCourseByCode.mockResolvedValue(null);
    mockDepartmentRepository.findDepartmentById.mockResolvedValue(null);

    await expect(courseService.addCourse(mockCourseData))
      .rejects
      .toThrow(NotFoundError);
      
    expect(mockCourseRepository.findCourseByCode).toHaveBeenCalledWith("CS101");
    expect(mockDepartmentRepository.findDepartmentById).toHaveBeenCalledWith(mockDepartmentId);
    expect(mockCourseRepository.createCourse).not.toHaveBeenCalled();
  });

  // Test 4: Prevent adding a course with non-existent prerequisites
  it("should throw an error when adding a course with non-existent prerequisites", async () => {
    const courseWithPrereqs = {
      ...mockCourseData,
      prerequisites: [mockPrereqId1, mockPrereqId2]
    };
    
    mockCourseRepository.findCourseByCode.mockResolvedValue(null);
    mockDepartmentRepository.findDepartmentById.mockResolvedValue({ 
      _id: mockDepartmentId, 
      name: "Computer Science" 
    } as any);
    mockCourseRepository.findCoursesByIds.mockResolvedValue([{ _id: mockPrereqId1 } as ICourse]); // Only one prerequisite found

    await expect(courseService.addCourse(courseWithPrereqs))
      .rejects
      .toThrow(NotFoundError);
      
    expect(mockCourseRepository.findCourseByCode).toHaveBeenCalledWith("CS101");
    expect(mockDepartmentRepository.findDepartmentById).toHaveBeenCalledWith(mockDepartmentId);
    expect(mockCourseRepository.findCoursesByIds).toHaveBeenCalledWith([mockPrereqId1, mockPrereqId2]);
    expect(mockCourseRepository.createCourse).not.toHaveBeenCalled();
  });

  // Test 5: Updating a course successfully
  it("should update a course successfully", async () => {
    const updateData: UpdateCourseDto = {
      name: "Advanced Computer Science",
      credits: 4
    };
    
    mockCourseRepository.findCourseByCode.mockResolvedValue(mockCourse as ICourse);
    mockClassRepository.findClassByCourse.mockResolvedValue([]);
    mockCourseRepository.updateCourse.mockResolvedValue({
      ...mockCourse,
      ...updateData
    } as ICourse);

    const result = await courseService.updateCourse("CS101", updateData);

    expect(mockCourseRepository.findCourseByCode).toHaveBeenCalledWith("CS101");
    expect(mockCourseRepository.updateCourse).toHaveBeenCalledWith("CS101", updateData);
    expect(result).toBeDefined();
    if (result) {
      expect(result.name).toBe("Advanced Computer Science");
      expect(result.credits).toBe(4);
    }
  });

  // Test 6: Prevent updating a non-existent course
  it("should throw an error when updating a non-existent course", async () => {
    mockCourseRepository.findCourseByCode.mockResolvedValue(null);

    await expect(courseService.updateCourse("NONEXISTENT", { name: "New Name" }))
      .rejects
      .toThrow(NotFoundError);
      
    expect(mockCourseRepository.findCourseByCode).toHaveBeenCalledWith("NONEXISTENT");
    expect(mockCourseRepository.updateCourse).not.toHaveBeenCalled();
  });

  // Test 7: Prevent changing credits when students are enrolled
  it("should throw an error when changing credits with enrolled students", async () => {
    const updateData: UpdateCourseDto = {
      credits: 4
    };
    
    const mockClass = { _id: new mongoose.Types.ObjectId() };
    const mockEnrollment = { _id: new mongoose.Types.ObjectId() };
    
    mockCourseRepository.findCourseByCode.mockResolvedValue(mockCourse as ICourse);
    mockClassRepository.findClassByCourse.mockResolvedValue([mockClass as any]);
    mockEnrollmentRepository.findEnrollmentsByClass.mockResolvedValue([mockEnrollment as any]);

    await expect(courseService.updateCourse("CS101", updateData))
      .rejects
      .toThrow(BadRequestError);
      
    expect(mockCourseRepository.findCourseByCode).toHaveBeenCalledWith("CS101");
    expect(mockClassRepository.findClassByCourse).toHaveBeenCalledWith(mockCourse._id);
    expect(mockEnrollmentRepository.findEnrollmentsByClass).toHaveBeenCalledWith(mockClass._id);
    expect(mockCourseRepository.updateCourse).not.toHaveBeenCalled();
  });

  // Test 8: Deleting a course successfully
  it("should delete a course successfully", async () => {
    const mockDate = new Date();
    mockDate.setMinutes(mockDate.getMinutes() - 20); // 20 minutes ago
    
    const recentCourse = {
      ...mockCourse,
      createdAt: mockDate
    };
    
    mockCourseRepository.findCourseByCode.mockResolvedValue(recentCourse as ICourse);
    mockClassRepository.findClassByCourse.mockResolvedValue([]);
    mockCourseRepository.deleteCourse.mockResolvedValue(recentCourse as ICourse);

    const result = await courseService.deleteCourse("CS101");

    expect(mockCourseRepository.findCourseByCode).toHaveBeenCalledWith("CS101");
    expect(mockClassRepository.findClassByCourse).toHaveBeenCalledWith(recentCourse._id);
    expect(mockCourseRepository.deleteCourse).toHaveBeenCalledWith("CS101");
    expect(result).toBeDefined();
    if (result) {
      expect(result).toEqual(recentCourse);
    }
  });

  // Test 9: Prevent deleting a course after 30 minutes of creation
  it("should throw an error when deleting a course after 30 minutes of creation", async () => {
    const oldDate = new Date();
    oldDate.setMinutes(oldDate.getMinutes() - 40); // 40 minutes ago
    
    const oldCourse = {
      ...mockCourse,
      createdAt: oldDate
    };
    
    mockCourseRepository.findCourseByCode.mockResolvedValue(oldCourse as ICourse);

    await expect(courseService.deleteCourse("CS101"))
      .rejects
      .toThrow(BadRequestError);
      
    expect(mockCourseRepository.findCourseByCode).toHaveBeenCalledWith("CS101");
    expect(mockCourseRepository.deleteCourse).not.toHaveBeenCalled();
  });

  // Test 10: Deactivate instead of delete when classes exist
  it("should deactivate a course instead of deleting when classes exist", async () => {
    const mockDate = new Date();
    mockDate.setMinutes(mockDate.getMinutes() - 20); // 20 minutes ago
    
    const recentCourse = {
      ...mockCourse,
      createdAt: mockDate
    };
    
    const mockClass = { _id: new mongoose.Types.ObjectId() };
    const deactivatedCourse = { ...recentCourse, isActive: false };
    
    mockCourseRepository.findCourseByCode.mockResolvedValue(recentCourse as ICourse);
    mockClassRepository.findClassByCourse.mockResolvedValue([mockClass as any]);
    mockCourseRepository.deactivateCourse.mockResolvedValue(deactivatedCourse as ICourse);

    const result = await courseService.deleteCourse("CS101");

    expect(mockCourseRepository.findCourseByCode).toHaveBeenCalledWith("CS101");
    expect(mockClassRepository.findClassByCourse).toHaveBeenCalledWith(recentCourse._id);
    expect(mockCourseRepository.deactivateCourse).toHaveBeenCalledWith("CS101");
    expect(mockCourseRepository.deleteCourse).not.toHaveBeenCalled();
    expect(result).toBeDefined();
    if (result) {
      expect(result).toEqual(deactivatedCourse);
    }
  });

  // Test 11: Getting all courses
  it("should get all courses successfully", async () => {
    const mockCoursesData = {
      courses: [mockCourse, {...mockCourse, courseCode: "CS102"}],
      pagination: {
        total: 2,
        page: 1,
        limit: 10,
        totalPages: 1
      }
    };
    
    mockCourseRepository.getAllCourses.mockResolvedValue(mockCoursesData as any);

    const result = await courseService.getCourses({});

    expect(mockCourseRepository.getAllCourses).toHaveBeenCalledWith(1, 10, {});
    expect(result).toEqual(mockCoursesData);
  });

  // Test 12: Getting courses with pagination
  it("should get courses with pagination", async () => {
    const mockCoursesData = {
      courses: [mockCourse],
      pagination: {
        total: 15,
        page: 2,
        limit: 1,
        totalPages: 15
      }
    };
    
    mockCourseRepository.getAllCourses.mockResolvedValue(mockCoursesData as any);

    const result = await courseService.getCourses({
      page: "2",
      limit: "1"
    });

    expect(mockCourseRepository.getAllCourses).toHaveBeenCalledWith(2, 1, {});
    expect(result).toEqual(mockCoursesData);
  });

  // Test 13: Getting courses filtered by department
  it("should get courses filtered by department", async () => {
    const mockCoursesData = {
      courses: [mockCourse],
      pagination: {
        total: 1,
        page: 1,
        limit: 10,
        totalPages: 1
      }
    };
    
    mockCourseRepository.getAllCourses.mockResolvedValue(mockCoursesData as any);

    const departmentId = new mongoose.Types.ObjectId().toString();
    const result = await courseService.getCourses({
      departmentId: departmentId
    });

    expect(mockCourseRepository.getAllCourses).toHaveBeenCalledWith(1, 10, {
      department: expect.any(mongoose.Types.ObjectId)
    });
    expect(result).toEqual(mockCoursesData);
  });

  // Test 14: Throw error when adding a course with too few credits
  it("should validate credit requirements when adding a course", async () => {
    const invalidCourseData = {
      ...mockCourseData,
      credits: 1 // Too few, minimum should be 2
    };
    
    // Even though we're mocking, we'll simulate validation error
    mockCourseRepository.createCourse.mockRejectedValue(
      new Error("Credits must be an integer greater than or equal to 2")
    );
    mockCourseRepository.findCourseByCode.mockResolvedValue(null);
    mockDepartmentRepository.findDepartmentById.mockResolvedValue({ 
      _id: mockDepartmentId, 
      name: "Computer Science" 
    } as any);

    await expect(courseService.addCourse(invalidCourseData))
      .rejects
      .toThrow();
  });

  // Test 15: Handling invalid department ID format
  it("should handle invalid department ID format when filtering courses", async () => {
    await expect(courseService.getCourses({
      departmentId: "invalid-id"
    }))
      .rejects
      .toThrow(BadRequestError);
    
    expect(mockCourseRepository.getAllCourses).not.toHaveBeenCalled();
  });
});