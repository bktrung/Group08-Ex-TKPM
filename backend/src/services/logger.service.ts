import fs from 'fs';
import path from 'path';
import { format } from 'date-fns';

class Logger {
	private logDir: string;

	constructor() {
		this.logDir = path.join(process.cwd(), 'logs');
		this.ensureLogDirectory();
	}

	private ensureLogDirectory(): void {
		if (!fs.existsSync(this.logDir)) {
			fs.mkdirSync(this.logDir, { recursive: true });
		}

		// Create subdirectories for different log types, for now dont need 'warn' and 'debug'
		const dirs = ['info', 'error'];
		dirs.forEach(dir => {
			const dirPath = path.join(this.logDir, dir);
			if (!fs.existsSync(dirPath)) {
				fs.mkdirSync(dirPath, { recursive: true });
			}
		});
	}

	private getLogFilePath(level: string): string {
		const today = format(new Date(), 'yyyy-MM-dd');
		return path.join(this.logDir, level.toLowerCase(), `${today}.log`);
	}

	private formatMessage(level: string, message: string, meta?: any): string {
		const timestamp = format(new Date(), 'yyyy-MM-dd HH:mm:ss');
		let logEntry = `[${timestamp}][${level.toUpperCase()}] ${message}`;

		if (meta) {
			try {
				const metaString = JSON.stringify(meta);
				logEntry += ` ${metaString}`;
			} catch (error) {
				logEntry += ` [Error serializing metadata]`;
			}
		}

		return logEntry + '\n';
	}

	private writeLog(level: string, message: string, meta?: any): void {
		try {
			const logFilePath = this.getLogFilePath(level);
			const logEntry = this.formatMessage(level, message, meta);

			// Write to console in development
			if (process.env.NODE_ENV !== 'pro') {
				console.log(logEntry);
			}

			// For critical errors, use synchronous file writes to ensure they're logged
			// Why? Because if the application throw an error like init db error, the application will be stopped
			// So, if we use async it add our write task to a task queue, and wait for it turn
			// But the process will stopped, so the task will never be done
			if (level === 'error') {
				try {
					// Synchronous write for error logs to ensure they're written
					fs.appendFileSync(logFilePath, logEntry);
				} catch (fsError) {
					console.error(`Failed to write error log synchronously:`, fsError);

					// Try async as fallback
					fs.appendFile(logFilePath, logEntry, (err) => {
						if (err) {
							console.error(`Also failed async error log:`, err);
						}
					});
				}
			} else {
				// Use async for non-error logs
				fs.appendFile(logFilePath, logEntry, (err) => {
					if (err) {
						console.error(`Error writing to ${level} log file:`, err);
					}
				});
			}
		} catch (error) {
			// Last-resort error handling
			console.error(`Critical logger failure for ${level}:`, error);
		}
	}

	// Public logging methods
	public info(message: string, meta?: any): void {
		this.writeLog('info', message, meta);
	}

	public error(message: string, meta?: any): void {
		this.writeLog('error', message, meta);
	}

	public warn(message: string, meta?: any): void {
		this.writeLog('warn', message, meta);
	}

	public debug(message: string, meta?: any): void {
		if (process.env.NODE_ENV !== 'pro') {
			this.writeLog('debug', message, meta);
		}
	}
}

export default new Logger();