import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import { Container } from "inversify";
import { ClassService } from "../../../src/services/class.service";
import { BadRequestError, NotFoundError } from "../../../src/responses/error.responses";
import { IClass, ISchedule } from "../../../src/models/interfaces/class.interface";
import { CreateClassDto } from "../../../src/dto/class";
import { IClassRepository } from "../../../src/interfaces/repositories/class.repository.interface";
import { ICourseRepository } from "../../../src/interfaces/repositories/course.repository.interface";
import { TYPES } from "../../../src/configs/di.types";

describe("Class Service", () => {
  let container: Container;
  let classService: ClassService;
  let mockClassRepository: jest.Mocked<IClassRepository>;
  let mockCourseRepository: jest.Mocked<ICourseRepository>;

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
    // Create test container
    container = new Container();
    
    // Create mocked repositories
    mockClassRepository = {
      findClassByCode: jest.fn(),
      createClass: jest.fn(),
      findClassByCourse: jest.fn(),
      findClassesWithOverlappingSchedule: jest.fn(),
      getAllClasses: jest.fn(),
    } as jest.Mocked<IClassRepository>;
    
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
    
    // Bind mocked repositories
    container.bind<IClassRepository>(TYPES.ClassRepository).toConstantValue(mockClassRepository);
    container.bind<ICourseRepository>(TYPES.CourseRepository).toConstantValue(mockCourseRepository);
    container.bind<ClassService>(TYPES.ClassService).to(ClassService);
    
    // Get service instance
    classService = container.get<ClassService>(TYPES.ClassService);
  });

  // Test 1: Adding a class successfully
  it("should add a class successfully", async () => {
    // Mock implementations
    mockClassRepository.findClassByCode.mockResolvedValue(null);
    mockCourseRepository.findCourseById.mockResolvedValue({ 
      _id: mockCourseId, 
      name: "Introduction to CS",
      isActive: true 
    } as any);
    mockClassRepository.findClassesWithOverlappingSchedule.mockResolvedValue([]);
    mockClassRepository.createClass.mockResolvedValue(mockClass as IClass);

    // Execute
    const result = await classService.addClass(mockClassData);

    // Verify
    expect(mockClassRepository.findClassByCode).toHaveBeenCalledWith("CS101.01");
    expect(mockCourseRepository.findCourseById).toHaveBeenCalledWith(mockCourseId);
    expect(mockClassRepository.findClassesWithOverlappingSchedule).toHaveBeenCalledWith(mockSchedule);
    expect(mockClassRepository.createClass).toHaveBeenCalledWith(mockClassData);
    expect(result).toEqual(mockClass);
  });

  // Test 2: Prevent adding a class with an existing code
  it("should throw an error when adding a class with an existing code", async () => {
    mockClassRepository.findClassByCode.mockResolvedValue(mockClass as IClass);

    await expect(classService.addClass(mockClassData))
      .rejects
      .toThrow(BadRequestError);
      
    expect(mockClassRepository.findClassByCode).toHaveBeenCalledWith("CS101.01");
    expect(mockClassRepository.createClass).not.toHaveBeenCalled();
  });

  // Test 3: Prevent adding a class for a non-existent course
  it("should throw an error when adding a class for a non-existent course", async () => {
    mockClassRepository.findClassByCode.mockResolvedValue(null);
    mockCourseRepository.findCourseById.mockResolvedValue(null);

    await expect(classService.addClass(mockClassData))
      .rejects
      .toThrow(BadRequestError);
      
    expect(mockClassRepository.findClassByCode).toHaveBeenCalledWith("CS101.01");
    expect(mockCourseRepository.findCourseById).toHaveBeenCalledWith(mockCourseId);
    expect(mockClassRepository.createClass).not.toHaveBeenCalled();
  });

  // Test 4: Prevent adding a class for an inactive course
  it("should throw an error when adding a class for an inactive course", async () => {
    mockClassRepository.findClassByCode.mockResolvedValue(null);
    mockCourseRepository.findCourseById.mockResolvedValue({ 
      _id: mockCourseId, 
      name: "Introduction to CS",
      isActive: false 
    } as any);

    await expect(classService.addClass(mockClassData))
      .rejects
      .toThrow(BadRequestError);
      
    expect(mockClassRepository.findClassByCode).toHaveBeenCalledWith("CS101.01");
    expect(mockCourseRepository.findCourseById).toHaveBeenCalledWith(mockCourseId);
    expect(mockClassRepository.createClass).not.toHaveBeenCalled();
  });

  // Test 5: Prevent adding a class with overlapping schedules
  it("should throw an error when adding a class with overlapping schedules", async () => {
    const existingClass = { 
      classCode: "MATH101.01", 
      schedule: [{ dayOfWeek: 2, startPeriod: 2, endPeriod: 4, classroom: "A101" }] 
    };
    
    mockClassRepository.findClassByCode.mockResolvedValue(null);
    mockCourseRepository.findCourseById.mockResolvedValue({ 
      _id: mockCourseId, 
      name: "Introduction to CS",
      isActive: true 
    } as any);
    mockClassRepository.findClassesWithOverlappingSchedule.mockResolvedValue([existingClass as IClass]);

    await expect(classService.addClass(mockClassData))
      .rejects
      .toThrow(BadRequestError);
      
    expect(mockClassRepository.findClassByCode).toHaveBeenCalledWith("CS101.01");
    expect(mockCourseRepository.findCourseById).toHaveBeenCalledWith(mockCourseId);
    expect(mockClassRepository.findClassesWithOverlappingSchedule).toHaveBeenCalledWith(mockSchedule);
    expect(mockClassRepository.createClass).not.toHaveBeenCalled();
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
    
    mockClassRepository.findClassByCode.mockResolvedValue(null);
    mockCourseRepository.findCourseById.mockResolvedValue({ 
      _id: mockCourseId, 
      name: "Introduction to CS",
      isActive: true 
    } as any);

    await expect(classService.addClass(invalidClassData))
      .rejects
      .toThrow(BadRequestError);
      
    expect(mockClassRepository.createClass).not.toHaveBeenCalled();
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
    
    mockClassRepository.findClassByCode.mockResolvedValue(null);
    mockCourseRepository.findCourseById.mockResolvedValue({ 
      _id: mockCourseId, 
      name: "Introduction to CS",
      isActive: true 
    } as any);

    await expect(classService.addClass(conflictingClassData))
      .rejects
      .toThrow(BadRequestError);
      
    expect(mockClassRepository.createClass).not.toHaveBeenCalled();
  });

  // Test 8: Validate schedule - empty schedule
  it("should throw an error when adding a class with empty schedule", async () => {
    const emptyScheduleData = {
      ...mockClassData,
      schedule: []
    };
    
    mockClassRepository.findClassByCode.mockResolvedValue(null);
    mockCourseRepository.findCourseById.mockResolvedValue({ 
      _id: mockCourseId, 
      name: "Introduction to CS",
      isActive: true 
    } as any);

    await expect(classService.addClass(emptyScheduleData))
      .rejects
      .toThrow(BadRequestError);
      
    expect(mockClassRepository.createClass).not.toHaveBeenCalled();
  });

  // Test 9: Getting classes without filters
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
    
    mockClassRepository.getAllClasses.mockResolvedValue(mockClassesData);

    const result = await classService.getClasses({});

    expect(mockClassRepository.getAllClasses).toHaveBeenCalledWith(1, 10, {});
    expect(result).toEqual(mockClassesData);
  });

  // Test 10: Getting classes with course filter
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
    
    mockClassRepository.getAllClasses.mockResolvedValue(mockClassesData);

    const result = await classService.getClasses({
      courseId: mockCourseId
    });

    expect(mockClassRepository.getAllClasses).toHaveBeenCalledWith(1, 10, {
      course: expect.any(mongoose.Types.ObjectId)
    });
    expect(result).toEqual(mockClassesData);
  });

  // Test 11: Getting classes with academic year filter
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
    
    mockClassRepository.getAllClasses.mockResolvedValue(mockClassesData);

    const result = await classService.getClasses({
      academicYear: "2023-2024"
    });

    expect(mockClassRepository.getAllClasses).toHaveBeenCalledWith(1, 10, {
      academicYear: "2023-2024"
    });
    expect(result).toEqual(mockClassesData);
  });

  // Test 12: Getting classes with semester filter
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
    
    mockClassRepository.getAllClasses.mockResolvedValue(mockClassesData);

    const result = await classService.getClasses({
      semester: "1"
    });

    expect(mockClassRepository.getAllClasses).toHaveBeenCalledWith(1, 10, {
      semester: 1
    });
    expect(result).toEqual(mockClassesData);
  });

  // Test 13: Getting classes with pagination
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
    
    mockClassRepository.getAllClasses.mockResolvedValue(mockClassesData);

    const result = await classService.getClasses({
      page: "2",
      limit: "5"
    });

    expect(mockClassRepository.getAllClasses).toHaveBeenCalledWith(2, 5, {});
    expect(result).toEqual(mockClassesData);
  });

  // Test 14: Throw error when adding a class with invalid semester
  it("should throw error when adding a class with invalid semester", async () => {
    const invalidClassData = {
      ...mockClassData,
      semester: 4 // Invalid semester, should be 1, 2, or 3
    };
    
    mockClassRepository.findClassByCode.mockResolvedValue(null);
    mockCourseRepository.findCourseById.mockResolvedValue({ 
      _id: mockCourseId, 
      name: "Introduction to CS",
      isActive: true 
    } as any);
    
    // Mock validation error
    mockClassRepository.createClass.mockRejectedValue(
      new Error("Semester must be between 1 and 3")
    );

    await expect(classService.addClass(invalidClassData))
      .rejects
      .toThrow();
  });

  // Test 15: Handle invalid course ID format
  it("should handle invalid course ID format", async () => {
    await expect(classService.getClasses({
      courseId: "invalid-id"
    }))
      .rejects
      .toThrow(BadRequestError);
    
    expect(mockClassRepository.getAllClasses).not.toHaveBeenCalled();
  });
});