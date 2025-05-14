import mongoose, { Types } from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import Class from "../../../src/models/class.model";
import {
  findClassByCode,
  createClass,
  findClassesWithOverlappingSchedule,
  findClassByCourse,
  getAllClasses
} from "../../../src/models/repositories/class.repo";
import { ISchedule } from "../../../src/models/interfaces/class.interface";

let mongoServer: MongoMemoryServer;

// Mock data
const mockCourseId = new mongoose.Types.ObjectId();

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

const mockClassData = {
  classCode: "CS101.01",
  course: mockCourseId,
  academicYear: "2023-2024",
  semester: 1,
  instructor: "Dr. Smith",
  maxCapacity: 30,
  schedule: mockSchedule,
  enrolledStudents: 0,
  isActive: true
};

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

afterEach(async () => {
  await Class.deleteMany({});
});

describe("Class Repository", () => {
  // Test 1: Creating a class
  it("should create a new class successfully", async () => {
    const newClass = await createClass(mockClassData);
    expect(newClass).toBeDefined();
    expect(newClass.classCode).toBe(mockClassData.classCode);
    expect(newClass.course.toString()).toBe(mockCourseId.toString());
    expect(newClass.schedule).toHaveLength(2);
    expect(newClass.enrolledStudents).toBe(0);
    expect(newClass.isActive).toBe(true);
  });

  // Test 2: Finding a class by code
  it("should find a class by class code", async () => {
    await Class.create(mockClassData);
    const foundClass = await findClassByCode("CS101.01");
    expect(foundClass).toBeDefined();
    expect(foundClass?.classCode).toBe("CS101.01");
    expect(foundClass?.instructor).toBe("Dr. Smith");
  });

  // Test 3: Return null when class code doesn't exist
  it("should return null when class code doesn't exist", async () => {
    const foundClass = await findClassByCode("NONEXISTENT");
    expect(foundClass).toBeNull();
  });

  // Test 4: Finding classes by course ID
  it("should find classes by course ID", async () => {
    await Class.create(mockClassData);
    await Class.create({
      ...mockClassData,
      classCode: "CS101.02",
      instructor: "Dr. Johnson"
    });
    
    const classes = await findClassByCourse(mockCourseId);
    expect(classes).toHaveLength(2);
    expect(classes[0].classCode).toBe("CS101.01");
    expect(classes[1].classCode).toBe("CS101.02");
  });

  // Test 5: Finding classes with overlapping schedules - same day and classroom
  it("should find classes with overlapping schedules on the same day and classroom", async () => {
    // Create a class first
    await Class.create(mockClassData);
    
    // Define a schedule that overlaps with the first class
    const overlappingSchedule: ISchedule[] = [
      {
        dayOfWeek: 2, // Same day as existing class (Monday)
        startPeriod: 2, // Overlaps with existing class (periods 1-3)
        endPeriod: 4,
        classroom: "A101" // Same classroom
      }
    ];
    
    const conflictingClasses = await findClassesWithOverlappingSchedule(overlappingSchedule);
    expect(conflictingClasses).toHaveLength(1);
    expect(conflictingClasses[0].classCode).toBe("CS101.01");
  });

  // Test 6: No conflict when schedules are on different days
  it("should not detect conflicts when schedules are on different days", async () => {
    await Class.create(mockClassData);
    
    // Schedule on a different day
    const nonOverlappingSchedule: ISchedule[] = [
      {
        dayOfWeek: 3, // Tuesday (different from Monday and Wednesday)
        startPeriod: 1,
        endPeriod: 3,
        classroom: "A101"
      }
    ];
    
    const conflictingClasses = await findClassesWithOverlappingSchedule(nonOverlappingSchedule);
    expect(conflictingClasses).toHaveLength(0);
  });

  // Test 7: No conflict when schedules are in different classrooms
  it("should not detect conflicts when schedules are in different classrooms", async () => {
    await Class.create(mockClassData);
    
    // Schedule in a different classroom
    const nonOverlappingSchedule: ISchedule[] = [
      {
        dayOfWeek: 2, // Same day (Monday)
        startPeriod: 1,
        endPeriod: 3,
        classroom: "C303" // Different classroom
      }
    ];
    
    const conflictingClasses = await findClassesWithOverlappingSchedule(nonOverlappingSchedule);
    expect(conflictingClasses).toHaveLength(0);
  });

  // Test 8: No conflict when time periods don't overlap
  it("should not detect conflicts when time periods don't overlap", async () => {
    await Class.create(mockClassData);
    
    // Schedule with non-overlapping time periods
    const nonOverlappingSchedule: ISchedule[] = [
      {
        dayOfWeek: 2, // Same day (Monday)
        startPeriod: 4, // After the existing class (periods 1-3)
        endPeriod: 6,
        classroom: "A101" // Same classroom
      }
    ];
    
    const conflictingClasses = await findClassesWithOverlappingSchedule(nonOverlappingSchedule);
    expect(conflictingClasses).toHaveLength(0);
  });

  // Test 9: Excluding a specific class when checking for overlaps
  it("should exclude a specific class when checking for overlapping schedules", async () => {
    const existingClass = await Class.create(mockClassData);
    
    // Check for conflicts with the same schedule, but exclude the existing class
    const conflicts = await findClassesWithOverlappingSchedule(mockSchedule, existingClass.classCode);
    expect(conflicts).toHaveLength(0);
  });

  // Test 10: Detecting overlap when new schedule completely contains existing schedule
  it("should detect overlap when new schedule completely contains existing schedule", async () => {
    await Class.create(mockClassData);
    
    // Schedule that completely contains the existing one
    const overlappingSchedule: ISchedule[] = [
      {
        dayOfWeek: 2, // Same day (Monday)
        startPeriod: 1, // Starts at the same time
        endPeriod: 5, // Ends later
        classroom: "A101" // Same classroom
      }
    ];
    
    const conflictingClasses = await findClassesWithOverlappingSchedule(overlappingSchedule);
    expect(conflictingClasses).toHaveLength(1);
  });

  // Test 11: Detecting overlap when existing schedule completely contains new schedule
  it("should detect overlap when existing schedule completely contains new schedule", async () => {
    await Class.create(mockClassData);
    
    // Schedule that is completely contained by the existing one
    const overlappingSchedule: ISchedule[] = [
      {
        dayOfWeek: 2, // Same day (Monday)
        startPeriod: 2, // Starts after existing starts
        endPeriod: 2, // Ends before existing ends
        classroom: "A101" // Same classroom
      }
    ];
    
    const conflictingClasses = await findClassesWithOverlappingSchedule(overlappingSchedule);
    expect(conflictingClasses).toHaveLength(1);
  });
});