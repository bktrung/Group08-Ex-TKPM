import fs from 'fs';
import path from 'path';
import { EventEmitter } from 'events';
import Logger from '../services/logger.service';

export interface AppConfig {
	allowedEmailDomains: string[];
	phoneFormats: Record<string, string>;
	[key: string]: any;
}

class ConfigService extends EventEmitter {
	private configPath: string;
	private config: AppConfig;

	constructor(configPath?: string) {
		super();
		this.configPath = configPath || path.resolve(__dirname, '../../rule_config.json');
		this.config = this.loadConfig();
		this.watchConfig();
	}

	private loadConfig(): AppConfig {
		try {
			const configFile = fs.readFileSync(this.configPath, 'utf8');
			const config = JSON.parse(configFile);
			console.log('Configuration loaded successfully');
			Logger.info('[CONFIGURATION] Configuration loaded successfully');
			return config;
		} catch (error: Error | any) {
			console.error('Failed to load configuration');
			Logger.error('[CONFIGURATION] Failed to load configuration:', { error: error.message });
			// Return a default config if the file can't be loaded
			return {
				allowedEmailDomains: [],
				phoneFormats: {}
			};
		}
	}

	private watchConfig() {
		let debounceTimer: NodeJS.Timeout | null = null;
		const DEBOUNCE_DELAY = 5000; // 5 seconds in milliseconds

		try {
			const watcher = fs.watch(this.configPath, (eventType) => {
				if (eventType === 'change') {
					// Clear any existing timer
					if (debounceTimer) {
						clearTimeout(debounceTimer);
						debounceTimer = null;
					}

					// Set a new timer
					debounceTimer = setTimeout(() => {
						this.config = this.loadConfig();
						this.emit('configChanged', this.config);
						debounceTimer = null;
					}, DEBOUNCE_DELAY);
				}
			});

			// Handle watcher errors
			watcher.on('error', (error) => {
				Logger.error('[CONFIGURATION] Config file watcher error:', error);
			});

			// Clean up watcher and any pending timers on process exit
			process.on('exit', () => {
				if (debounceTimer) {
					clearTimeout(debounceTimer);
				}
				watcher.close();
			});
		} catch (error: Error | any) {
			Logger.error('[CONFIGURATION] Failed to watch configuration file:', { error: error.message });
		}
	}

	get<T = any>(key: keyof AppConfig): T {
		return this.config[key] as unknown as T;
	}

	getConfig(): AppConfig {
		return { ...this.config };
	}
}

const configService = new ConfigService();
export default configService;