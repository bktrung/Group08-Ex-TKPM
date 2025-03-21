import { set, connect, connection, ConnectOptions } from "mongoose";
import dbConfig from "../configs/config.mongodb";
import Logger from "../services/logger.service";

const { db: { host, port, name } } = dbConfig;

const connectString: string = `mongodb://${host}:${port}/${name}`;

class Database {
	private static instance: Database | null = null;

	constructor() {
		this._connect();
		this.registerConnectionEventHandlers();
	}

	private _connect(_type: string = "mongodb"): void {
		if (process.env.NODE_ENV === "dev") {
			set("debug", true);
			set("debug", { color: true });
		}

		const options: ConnectOptions = {
			maxPoolSize: 5,
		};

		// Log connection attempt
		Logger.info(`[DATABASE] Attempting to connect to MongoDB: ${host}:${port}/${name}`);

		connect(connectString, options)
			.then(() => {
				console.log(`Connected to ${connectString}`);
				Logger.info(`[DATABASE] Successfully connected to MongoDB: ${host}:${port}/${name}`);
			})
			.catch((err: Error) => {
				console.error("Database connection error:", err);
				throw new Error("Database connection error: " + err.message);
			});
	}

	private registerConnectionEventHandlers(): void {
		// Handle disconnection events
		connection.on('disconnected', () => {
			Logger.info(`[DATABASE] Disconnected from MongoDB: ${host}:${port}/${name}`);
		});

		// Handle reconnection events
		connection.on('reconnected', () => {
			Logger.info(`[DATABASE] Reconnected to MongoDB: ${host}:${port}/${name}`);
		});

		// Handle connection errors (different from initial connection failures)
		connection.on('error', (err) => {
			Logger.error(`[DATABASE] Connection error`, {
				error: err.message,
				host,
				port,
				database: name
			});
		});

		// Handle when connection enters connecting state
		connection.on('connecting', () => {
			Logger.info(`[DATABASE] Connecting to MongoDB: ${host}:${port}/${name}`);
		});

		// Handle when connection becomes fully connected and ready
		connection.on('connected', () => {
			Logger.info(`[DATABASE] Connected to MongoDB: ${host}:${port}/${name}`);
		});

		// Log when connection is fully open and ready
		connection.once('open', () => {
			Logger.info(`[DATABASE] Connection open and ready for operations`);
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