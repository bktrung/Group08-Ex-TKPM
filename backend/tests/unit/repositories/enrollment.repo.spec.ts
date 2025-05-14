// enrollment.model.spec.ts
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import EnrollmentModel from "../../../src/models/enrollment.model";
import { EnrollmentStatus } from "../../../src/models/interfaces/enrollment.interface";

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
    await EnrollmentModel.deleteMany({});
});

describe("Enrollment Model", () => {

    it("should create a new enrollment with default status", async () => {
        const enrollment = await EnrollmentModel.create({
            student: new mongoose.Types.ObjectId(),
            class: new mongoose.Types.ObjectId()
        });

        expect(enrollment).toBeDefined();
        expect(enrollment.status).toBe(EnrollmentStatus.ACTIVE);
        expect(enrollment.enrollmentDate).toBeInstanceOf(Date);
    });

    it("should set status to DROPPED and save dropReason", async () => {
        const dropDate = new Date();
        const enrollment = await EnrollmentModel.create({
            student: new mongoose.Types.ObjectId(),
            class: new mongoose.Types.ObjectId(),
            status: EnrollmentStatus.DROPPED,
            dropDate,
            dropReason: "Dropped due to personal reasons"
        });

        expect(enrollment.status).toBe(EnrollmentStatus.DROPPED);
        expect(enrollment.dropReason).toBe("Dropped due to personal reasons");
        expect(enrollment.dropDate).toEqual(dropDate);
    });

    it("should fail validation if student or class is missing", async () => {
        try {
            await EnrollmentModel.create({}); // missing required fields
        } catch (err: any) {
            expect(err).toBeDefined();
            expect(err.errors.student).toBeDefined();
            expect(err.errors.class).toBeDefined();
        }
    });
});
