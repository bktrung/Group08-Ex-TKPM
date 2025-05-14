import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import * as classRepo from "../../../src/models/repositories/class.repo";
import * as courseRepo from "../../../src/models/repositories/course.repo";
import ClassService from "../../../src/services/class.service";
import { BadRequestError, NotFoundError } from "../../../src/responses/error.responses";
import { IClass, ISchedule } from "../../../src/models/interfaces/class.interface";
import { CreateClassDto } from "../../../src/dto/class";

// Mocking repositories
jest.mock("../../../src/models/repositories/class.repo");
jest.mock("../../../src/models/repositories/course.repo");

describe("Class Service", () => {
  const mockCourseId = new mongoose.Types.ObjectId().toString();
  
  const mockSchedule: ISchedule[] = [
    {
      dayOfWeek: 2, // Monday
      startPeriod: 1,
      endPeriod: 3,
      classroom: "A101"
    },
    {
      dayOfWeek: 4, // Wednesday
      startPeriod: 6,
      endPeriod: 8,
      classroom: "B205"
    }
  ];
  
  const mockClassData: CreateClassDto = {
    classCode: "CS101.01",
    course: mockCourseId,
    academicYear: "2023-2024",
    semester: 1,
    instructor: "Dr. Smith",
    maxCapacity: 30,
    schedule: mockSchedule
  };

  const mockClass: Partial<IClass> = {
    _id: new mongoose.Types.ObjectId(),
    classCode: "CS101.01",
    course: mockCourseId,
    academicYear: "2023-2024",
    semester: 1,
    instructor: "Dr. Smith",
    maxCapacity: 30,
    schedule: mockSchedule,
    enrolledStudents: 0,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Test 1: Adding a class successfully
  it("should add a class successfully", async () => {
    // Mock implementations
    (classRepo.findClassByCode as jest.Mock).mockResolvedValue(null);
    (courseRepo.findCourseById as jest.Mock).mockResolvedValue({ 
      _id: mockCourseId, 
      name: "Introduction to CS",
      isActive: true 
    });
    (classRepo.findClassesWithOverlappingSchedule as jest.Mock).mockResolvedValue([]);
    (classRepo.createClass as jest.Mock).mockResolvedValue(mockClass);

    // Execute
    const result = await ClassService.addClass(mockClassData);

    // Verify
    expect(classRepo.findClassByCode).toHaveBeenCalledWith("CS101.01");
    expect(courseRepo.findCourseById).toHaveBeenCalledWith(mockCourseId);
    expect(classRepo.findClassesWithOverlappingSchedule).toHaveBeenCalledWith(mockSchedule);
    expect(classRepo.createClass).toHaveBeenCalledWith(mockClassData);
    expect(result).toEqual(mockClass);
  });

  // Test 2: Prevent adding a class with an existing code
  it("should throw an error when adding a class with an existing code", async () => {
    (classRepo.findClassByCode as jest.Mock).mockResolvedValue(mockClass);

    await expect(ClassService.addClass(mockClassData))
      .rejects
      .toThrow(BadRequestError);
      
    expect(classRepo.findClassByCode).toHaveBeenCalledWith("CS101.01");
    expect(classRepo.createClass).not.toHaveBeenCalled();
  });

  // Test 3: Prevent adding a class for a non-existent course
  it("should throw an error when adding a class for a non-existent course", async () => {
    (classRepo.findClassByCode as jest.Mock).mockResolvedValue(null);
    (courseRepo.findCourseById as jest.Mock).mockResolvedValue(null);

    await expect(ClassService.addClass(mockClassData))
      .rejects
      .toThrow(BadRequestError);
      
    expect(classRepo.findClassByCode).toHaveBeenCalledWith("CS101.01");
    expect(courseRepo.findCourseById).toHaveBeenCalledWith(mockCourseId);
    expect(classRepo.createClass).not.toHaveBeenCalled();
  });

  // Test 4: Prevent adding a class for an inactive course
  it("should throw an error when adding a class for an inactive course", async () => {
    (classRepo.findClassByCode as jest.Mock).mockResolvedValue(null);
    (courseRepo.findCourseById as jest.Mock).mockResolvedValue({ 
      _id: mockCourseId, 
      name: "Introduction to CS",
      isActive: false 
    });

    await expect(ClassService.addClass(mockClassData))
      .rejects
      .toThrow(BadRequestError);
      
    expect(classRepo.findClassByCode).toHaveBeenCalledWith("CS101.01");
    expect(courseRepo.findCourseById).toHaveBeenCalledWith(mockCourseId);
    expect(classRepo.createClass).not.toHaveBeenCalled();
  });

  // Test 5: Prevent adding a class with overlapping schedules
  it("should throw an error when adding a class with overlapping schedules", async () => {
    const existingClass = { 
      classCode: "MATH101.01", 
      schedule: [{ dayOfWeek: 2, startPeriod: 2, endPeriod: 4, classroom: "A101" }] 
    };
    
    (classRepo.findClassByCode as jest.Mock).mockResolvedValue(null);
    (courseRepo.findCourseById as jest.Mock).mockResolvedValue({ 
      _id: mockCourseId, 
      name: "Introduction to CS",
      isActive: true 
    });
    (classRepo.findClassesWithOverlappingSchedule as jest.Mock).mockResolvedValue([existingClass]);

    await expect(ClassService.addClass(mockClassData))
      .rejects
      .toThrow(BadRequestError);
      
    expect(classRepo.findClassByCode).toHaveBeenCalledWith("CS101.01");
    expect(courseRepo.findCourseById).toHaveBeenCalledWith(mockCourseId);
    expect(classRepo.findClassesWithOverlappingSchedule).toHaveBeenCalledWith(mockSchedule);
    expect(classRepo.createClass).not.toHaveBeenCalled();
  });

  // Test 6: Validate schedule - start period greater than end period
  it("should validate schedule's start and end periods", async () => {
    const invalidSchedule: ISchedule[] = [
      {
        dayOfWeek: 2,
        startPeriod: 5, // Greater than end period
        endPeriod: 3,
        classroom: "A101"
      }
    ];
    
    const invalidClassData = {
      ...mockClassData,
      schedule: invalidSchedule
    };
    
    (classRepo.findClassByCode as jest.Mock).mockResolvedValue(null);
    (courseRepo.findCourseById as jest.Mock).mockResolvedValue({ 
      _id: mockCourseId, 
      name: "Introduction to CS",
      isActive: true 
    });

    await expect(ClassService.addClass(invalidClassData))
      .rejects
      .toThrow(BadRequestError);
      
    expect(classRepo.createClass).not.toHaveBeenCalled();
  });

  // Test 7: Validate schedule - internal conflicts
  it("should validate for internal schedule conflicts", async () => {
    const conflictingSchedule: ISchedule[] = [
      {
        dayOfWeek: 2,
        startPeriod: 1,
        endPeriod: 3,
        classroom: "A101"
      },
      {
        dayOfWeek: 2, // Same day
        startPeriod: 2, // Overlaps with first schedule
        endPeriod: 4,
        classroom: "A101"
      }
    ];
    
    const conflictingClassData = {
      ...mockClassData,
      schedule: conflictingSchedule
    };
    
    (classRepo.findClassByCode as jest.Mock).mockResolvedValue(null);
    (courseRepo.findCourseById as jest.Mock).mockResolvedValue({ 
      _id: mockCourseId, 
      name: "Introduction to CS",
      isActive: true 
    });

    await expect(ClassService.addClass(conflictingClassData))
      .rejects
      .toThrow(BadRequestError);
      
    expect(classRepo.createClass).not.toHaveBeenCalled();
  });

  // Test 8: Getting classes without filters
  it("should get classes without filters", async () => {
    const mockClassesData = {
      classes: [mockClass],
      pagination: {
        total: 1,
        page: 1,
        limit: 10,
        totalPages: 1
      }
    };
    
    (classRepo.getAllClasses as jest.Mock).mockResolvedValue(mockClassesData);

    const result = await ClassService.getClasses({});

    expect(classRepo.getAllClasses).toHaveBeenCalledWith(1, 10, {});
    expect(result).toEqual(mockClassesData);
  });

  // Test 9: Getting classes with course filter
  it("should get classes with course filter", async () => {
    const mockClassesData = {
      classes: [mockClass],
      pagination: {
        total: 1,
        page: 1,
        limit: 10,
        totalPages: 1
      }
    };
    
    (classRepo.getAllClasses as jest.Mock).mockResolvedValue(mockClassesData);

    const result = await ClassService.getClasses({
      courseId: mockCourseId
    });

    expect(classRepo.getAllClasses).toHaveBeenCalledWith(1, 10, {
      course: expect.any(mongoose.Types.ObjectId)
    });
    expect(result).toEqual(mockClassesData);
  });

  // Test 10: Getting classes with academic year filter
  it("should get classes with academic year filter", async () => {
    const mockClassesData = {
      classes: [mockClass],
      pagination: {
        total: 1,
        page: 1,
        limit: 10,
        totalPages: 1
      }
    };
    
    (classRepo.getAllClasses as jest.Mock).mockResolvedValue(mockClassesData);

    const result = await ClassService.getClasses({
      academicYear: "2023-2024"
    });

    expect(classRepo.getAllClasses).toHaveBeenCalledWith(1, 10, {
      academicYear: "2023-2024"
    });
    expect(result).toEqual(mockClassesData);
  });

  // Test 11: Getting classes with semester filter
  it("should get classes with semester filter", async () => {
    const mockClassesData = {
      classes: [mockClass],
      pagination: {
        total: 1,
        page: 1,
        limit: 10,
        totalPages: 1
      }
    };
    
    (classRepo.getAllClasses as jest.Mock).mockResolvedValue(mockClassesData);

    const result = await ClassService.getClasses({
      semester: "1"
    });

    expect(classRepo.getAllClasses).toHaveBeenCalledWith(1, 10, {
      semester: 1
    });
    expect(result).toEqual(mockClassesData);
  });

  // Test 12: Getting classes with pagination
  it("should get classes with pagination", async () => {
    const mockClassesData = {
      classes: [mockClass],
      pagination: {
        total: 15,
        page: 2,
        limit: 5,
        totalPages: 3
      }
    };
    
    (classRepo.getAllClasses as jest.Mock).mockResolvedValue(mockClassesData);

    const result = await ClassService.getClasses({
      page: "2",
      limit: "5"
    });

    expect(classRepo.getAllClasses).toHaveBeenCalledWith(2, 5, {});
    expect(result).toEqual(mockClassesData);
  });

  // Test 13: Throw error when adding a class with empty schedule
  it("should throw error when adding a class with empty schedule", async () => {
    const invalidClassData = {
      ...mockClassData,
      schedule: []
    };
    
    (classRepo.findClassByCode as jest.Mock).mockResolvedValue(null);
    (courseRepo.findCourseById as jest.Mock).mockResolvedValue({ 
      _id: mockCourseId, 
      name: "Introduction to CS",
      isActive: true 
    });

    await expect(ClassService.addClass(invalidClassData))
      .rejects
      .toThrow(BadRequestError);
      
    expect(classRepo.createClass).not.toHaveBeenCalled();
  });

  // Test 14: Throw error when adding a class with invalid semester
  it("should throw error when adding a class with invalid semester", async () => {
    const invalidClassData = {
      ...mockClassData,
      semester: 4 // Invalid semester, should be 1, 2, or 3
    };
    
    (classRepo.findClassByCode as jest.Mock).mockResolvedValue(null);
    (courseRepo.findCourseById as jest.Mock).mockResolvedValue({ 
      _id: mockCourseId, 
      name: "Introduction to CS",
      isActive: true 
    });
    
    // Mock validation error
    (classRepo.createClass as jest.Mock).mockRejectedValue(
      new Error("Semester must be between 1 and 3")
    );

    await expect(ClassService.addClass(invalidClassData))
      .rejects
      .toThrow();
  });

  // Test 15: Handle invalid course ID format
  it("should handle invalid course ID format", async () => {
    await expect(ClassService.getClasses({
      courseId: "invalid-id"
    }))
      .rejects
      .toThrow(BadRequestError);
    
    expect(classRepo.getAllClasses).not.toHaveBeenCalled();
  });
});