import mongoose, { Schema, model, Document } from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import { getAllDocuments, flattenObject, getDocumentId } from "../../../src/utils";
import { Types } from "mongoose";

// ----- Dummy schema for testing -----
interface IUser extends Document {
    name: string;
    profile: {
        age: number;
        address: {
            city: string;
        };
    };
}

const UserSchema = new Schema<IUser>({
    name: String,
    profile: {
        age: Number,
        address: {
            city: String,
        },
    },
});

const UserModel = model<IUser>("User", UserSchema);

// ----- Setup in-memory MongoDB -----
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
    await UserModel.deleteMany({});
});

// ----- Tests for getAllDocuments -----
describe("getAllDocuments", () => {
    it("should return paginated users with correct metadata", async () => {
        await UserModel.insertMany([
            { name: "Alice", profile: { age: 25, address: { city: "Hanoi" } } },
            { name: "Bob", profile: { age: 30, address: { city: "HCMC" } } },
            { name: "Charlie", profile: { age: 22, address: { city: "Hue" } } },
        ]);

        const result = await getAllDocuments(UserModel, {
            limit: 2,
            page: 1,
            sort: "ctime",
            filter: {},
        });

        expect(result.pagination.total).toBe(3);
        expect(result.pagination.limit).toBe(2);
        expect(result.pagination.page).toBe(1);
        expect(result.pagination.totalPages).toBe(2);
        expect(result.users).toHaveLength(2);
    });

    it("should populate fields when specified", async () => {
        await UserModel.create({
            name: "Alice",
            profile: { age: 25, address: { city: "Hanoi" } },
        });

        const result = await getAllDocuments(UserModel, {
            limit: 10,
            page: 1,
            sort: "ctime",
            filter: {},
            populate: [],
            select: "name",
        });

        expect(result.users[0]).toHaveProperty("name");
        expect(result.users[0]).not.toHaveProperty("profile");
    });
});

// ----- Tests for flattenObject -----
describe("flattenObject", () => {
    it("should flatten nested objects to dot notation keys", () => {
        const nested = {
            name: "Alice",
            profile: {
                age: 25,
                address: {
                    city: "Hanoi",
                },
            },
        };

        const result = flattenObject(nested);
        expect(result).toContain("name");
        expect(result).toContain("profile.age");
        expect(result).toContain("profile.address.city");
    });

    it("should handle empty objects", () => {
        const result = flattenObject({});
        expect(result).toEqual([]);
    });
});

// ----- Tests for getDocumentId -----
describe("getDocumentId", () => {
    it("should return ObjectId from document", () => {
        const id = new Types.ObjectId();
        const mockDoc = { _id: id };
        const result = getDocumentId(mockDoc);
        expect(result).toEqual(id);
    });

    it("should return empty string if input is null", () => {
        const result = getDocumentId(null);
        expect(result).toBe("");
    });
});
