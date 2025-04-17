import mongoose, { Types } from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import Department from "../../../src/models/department.model";
import {
  addDepartment,
  findDepartmentByName,
  findDepartmentById,
  getDepartments,
} from "../../../src/models/repositories/department.repo";

let mongoServer: MongoMemoryServer;

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
  await Department.deleteMany({});
});

describe("Department Repository", () => {
  it("should add a new department", async () => {
    const department = await addDepartment("Computer Science");
    expect(department).toBeDefined();
    expect(department.name).toBe("Computer Science");
  });

  it("should find department by name", async () => {
    await addDepartment("Mathematics");
    const found = await findDepartmentByName("Mathematics");
    expect(found).toBeDefined();
    expect(found?.name).toBe("Mathematics");
  });

  it("should find department by id", async () => {
    const department = await addDepartment("Physics");
    const found = await findDepartmentById(department._id as Types.ObjectId); // Ép kiểu _id
    expect(found).toBeDefined();
    expect(found?.name).toBe("Physics");
  });


  it("should return list of all departments", async () => {
    await addDepartment("Economics");
    await addDepartment("History");
    const departments = await getDepartments();
    expect(departments.length).toBe(2);
    const names = departments.map(d => d.name);
    expect(names).toContain("Economics");
    expect(names).toContain("History");
  });
});
