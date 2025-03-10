import { set, connect, ConnectOptions } from "mongoose";
import dbConfig from "../configs/config.mongodb";

const { db: { host, port, name } } = dbConfig;

const connectString: string = `mongodb://${host}:${port}/${name}`;

class Database {
	private static instance: Database | null = null;

	constructor() {
		this._connect();
	}

	private _connect(_type: string = "mongodb"): void {
		set("debug", true);
		set("debug", { color: true });

		const options: ConnectOptions = {
			maxPoolSize: 5,
		};

		connect(connectString, options)
			.then(() => {
				console.log(`Connected to ${connectString}`);
			})
			.catch((err: Error) => {
				console.error("Database connection error:", err);
				process.exit(1); // Exit process if connection fails
			});
	}

	public static getInstance(): Database {
		if (!Database.instance) {
			Database.instance = new Database();
		}
		return Database.instance;
	}
}

const db: Database = Database.getInstance();
export default db;