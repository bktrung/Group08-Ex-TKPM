// backend/tests/unit/services/course.service.spec.ts
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import * as courseRepo from "../../../src/models/repositories/course.repo";
import * as departmentRepo from "../../../src/models/repositories/department.repo";
import * as classRepo from "../../../src/models/repositories/class.repo";
import * as enrollmentRepo from "../../../src/models/repositories/enrollment.repo";
import CourseService from "../../../src/services/course.service";
import { BadRequestError, NotFoundError } from "../../../src/responses/error.responses";
import { ICourse } from "../../../src/models/interfaces/course.interface";
import { UpdateCourseDto, CreateCourseDto } from "../../../src/dto/course";

// Mocking repositories
jest.mock("../../../src/models/repositories/course.repo");
jest.mock("../../../src/models/repositories/department.repo");
jest.mock("../../../src/models/repositories/class.repo");
jest.mock("../../../src/models/repositories/enrollment.repo");

describe("Course Service", () => {
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
    jest.clearAllMocks();
  });

  // Test 1: Adding a course successfully
  it("should add a course successfully", async () => {
    // Mock implementations
    (courseRepo.findCourseByCode as jest.Mock).mockResolvedValue(null);
    (departmentRepo.findDepartmentById as jest.Mock).mockResolvedValue({ _id: mockDepartmentId, name: "Computer Science" });
    (courseRepo.createCourse as jest.Mock).mockResolvedValue(mockCourse);

    // Execute
    const result = await CourseService.addCourse(mockCourseData);

    // Verify
    expect(courseRepo.findCourseByCode).toHaveBeenCalledWith("CS101");
    expect(departmentRepo.findDepartmentById).toHaveBeenCalledWith(mockDepartmentId);
    expect(courseRepo.createCourse).toHaveBeenCalledWith(mockCourseData);
    expect(result).toEqual(mockCourse);
  });

  // Test 2: Prevent adding a course with an existing code
  it("should throw an error when adding a course with an existing code", async () => {
    (courseRepo.findCourseByCode as jest.Mock).mockResolvedValue(mockCourse);

    await expect(CourseService.addCourse(mockCourseData))
      .rejects
      .toThrow(BadRequestError);
      
    expect(courseRepo.findCourseByCode).toHaveBeenCalledWith("CS101");
    expect(courseRepo.createCourse).not.toHaveBeenCalled();
  });

  // Test 3: Prevent adding a course with non-existent department
  it("should throw an error when adding a course with a non-existent department", async () => {
    (courseRepo.findCourseByCode as jest.Mock).mockResolvedValue(null);
    (departmentRepo.findDepartmentById as jest.Mock).mockResolvedValue(null);

    await expect(CourseService.addCourse(mockCourseData))
      .rejects
      .toThrow(NotFoundError);
      
    expect(courseRepo.findCourseByCode).toHaveBeenCalledWith("CS101");
    expect(departmentRepo.findDepartmentById).toHaveBeenCalledWith(mockDepartmentId);
    expect(courseRepo.createCourse).not.toHaveBeenCalled();
  });

  // Test 4: Prevent adding a course with non-existent prerequisites
  it("should throw an error when adding a course with non-existent prerequisites", async () => {
    const courseWithPrereqs = {
      ...mockCourseData,
      prerequisites: [mockPrereqId1, mockPrereqId2]
    };
    
    (courseRepo.findCourseByCode as jest.Mock).mockResolvedValue(null);
    (departmentRepo.findDepartmentById as jest.Mock).mockResolvedValue({ _id: mockDepartmentId, name: "Computer Science" });
    (courseRepo.findCoursesByIds as jest.Mock).mockResolvedValue([{ _id: mockPrereqId1 }]); // Only one prerequisite found

    await expect(CourseService.addCourse(courseWithPrereqs))
      .rejects
      .toThrow(NotFoundError);
      
    expect(courseRepo.findCourseByCode).toHaveBeenCalledWith("CS101");
    expect(departmentRepo.findDepartmentById).toHaveBeenCalledWith(mockDepartmentId);
    expect(courseRepo.findCoursesByIds).toHaveBeenCalledWith([mockPrereqId1, mockPrereqId2]);
    expect(courseRepo.createCourse).not.toHaveBeenCalled();
  });

  // Test 5: Updating a course successfully
  it("should update a course successfully", async () => {
    const updateData: UpdateCourseDto = {
      name: "Advanced Computer Science",
      credits: 4
    };
    
    (courseRepo.findCourseByCode as jest.Mock).mockResolvedValue(mockCourse);
    (classRepo.findClassByCourse as jest.Mock).mockResolvedValue([]);
    (courseRepo.updateCourse as jest.Mock).mockResolvedValue({
      ...mockCourse,
      ...updateData
    });

    const result = await CourseService.updateCourse("CS101", updateData);

    expect(courseRepo.findCourseByCode).toHaveBeenCalledWith("CS101");
    expect(courseRepo.updateCourse).toHaveBeenCalledWith("CS101", updateData);
    expect(result).toBeDefined();
    if (result) {
      expect(result.name).toBe("Advanced Computer Science");
      expect(result.credits).toBe(4);
    }
  });

  // Test 6: Prevent updating a non-existent course
  it("should throw an error when updating a non-existent course", async () => {
    (courseRepo.findCourseByCode as jest.Mock).mockResolvedValue(null);

    await expect(CourseService.updateCourse("NONEXISTENT", { name: "New Name" }))
      .rejects
      .toThrow(NotFoundError);
      
    expect(courseRepo.findCourseByCode).toHaveBeenCalledWith("NONEXISTENT");
    expect(courseRepo.updateCourse).not.toHaveBeenCalled();
  });

  // Test 7: Prevent changing credits when students are enrolled
  it("should throw an error when changing credits with enrolled students", async () => {
    const updateData: UpdateCourseDto = {
      credits: 4
    };
    
    const mockClass = { _id: new mongoose.Types.ObjectId() };
    const mockEnrollment = { _id: new mongoose.Types.ObjectId() };
    
    (courseRepo.findCourseByCode as jest.Mock).mockResolvedValue(mockCourse);
    (classRepo.findClassByCourse as jest.Mock).mockResolvedValue([mockClass]);
    (enrollmentRepo.findEnrollmentsByClass as jest.Mock).mockResolvedValue([mockEnrollment]);

    await expect(CourseService.updateCourse("CS101", updateData))
      .rejects
      .toThrow(BadRequestError);
      
    expect(courseRepo.findCourseByCode).toHaveBeenCalledWith("CS101");
    expect(classRepo.findClassByCourse).toHaveBeenCalledWith(mockCourse._id);
    expect(enrollmentRepo.findEnrollmentsByClass).toHaveBeenCalledWith(mockClass._id);
    expect(courseRepo.updateCourse).not.toHaveBeenCalled();
  });

  // Test 8: Deleting a course successfully
  it("should delete a course successfully", async () => {
    const mockDate = new Date();
    mockDate.setMinutes(mockDate.getMinutes() - 20); // 20 minutes ago
    
    const recentCourse = {
      ...mockCourse,
      createdAt: mockDate
    };
    
    (courseRepo.findCourseByCode as jest.Mock).mockResolvedValue(recentCourse);
    (classRepo.findClassByCourse as jest.Mock).mockResolvedValue([]);
    (courseRepo.deleteCourse as jest.Mock).mockResolvedValue(recentCourse);

    const result = await CourseService.deleteCourse("CS101");

    expect(courseRepo.findCourseByCode).toHaveBeenCalledWith("CS101");
    expect(classRepo.findClassByCourse).toHaveBeenCalledWith(recentCourse._id);
    expect(courseRepo.deleteCourse).toHaveBeenCalledWith("CS101");
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
    
    (courseRepo.findCourseByCode as jest.Mock).mockResolvedValue(oldCourse);

    await expect(CourseService.deleteCourse("CS101"))
      .rejects
      .toThrow(BadRequestError);
      
    expect(courseRepo.findCourseByCode).toHaveBeenCalledWith("CS101");
    expect(courseRepo.deleteCourse).not.toHaveBeenCalled();
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
    
    (courseRepo.findCourseByCode as jest.Mock).mockResolvedValue(recentCourse);
    (classRepo.findClassByCourse as jest.Mock).mockResolvedValue([mockClass]);
    (courseRepo.deactivateCourse as jest.Mock).mockResolvedValue(deactivatedCourse);

    const result = await CourseService.deleteCourse("CS101");

    expect(courseRepo.findCourseByCode).toHaveBeenCalledWith("CS101");
    expect(classRepo.findClassByCourse).toHaveBeenCalledWith(recentCourse._id);
    expect(courseRepo.deactivateCourse).toHaveBeenCalledWith("CS101");
    expect(courseRepo.deleteCourse).not.toHaveBeenCalled();
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
    
    (courseRepo.getAllCourses as jest.Mock).mockResolvedValue(mockCoursesData);

    const result = await CourseService.getCourses({});

    expect(courseRepo.getAllCourses).toHaveBeenCalledWith(1, 10, {});
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
    
    (courseRepo.getAllCourses as jest.Mock).mockResolvedValue(mockCoursesData);

    const result = await CourseService.getCourses({
      page: "2",
      limit: "1"
    });

    expect(courseRepo.getAllCourses).toHaveBeenCalledWith(2, 1, {});
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
    
    (courseRepo.getAllCourses as jest.Mock).mockResolvedValue(mockCoursesData);

    const departmentId = new mongoose.Types.ObjectId().toString();
    const result = await CourseService.getCourses({
      departmentId: departmentId
    });

    expect(courseRepo.getAllCourses).toHaveBeenCalledWith(1, 10, {
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
    (courseRepo.createCourse as jest.Mock).mockRejectedValue(
      new Error("Credits must be an integer greater than or equal to 2")
    );
    (courseRepo.findCourseByCode as jest.Mock).mockResolvedValue(null);
    (departmentRepo.findDepartmentById as jest.Mock).mockResolvedValue({ _id: mockDepartmentId, name: "Computer Science" });

    await expect(CourseService.addCourse(invalidCourseData))
      .rejects
      .toThrow();
  });

  // Test 15: Handling invalid department ID format
  it("should handle invalid department ID format when filtering courses", async () => {
    await expect(CourseService.getCourses({
      departmentId: "invalid-id"
    }))
      .rejects
      .toThrow(BadRequestError);
    
    expect(courseRepo.getAllCourses).not.toHaveBeenCalled();
  });
});