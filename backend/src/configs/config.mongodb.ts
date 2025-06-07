interface DbConfig {
	host: string;
	port: number | string;
	name: string;
}

interface EnvConfig {
	db: DbConfig;
}

interface Config {
	[key: string]: EnvConfig;
}

const dev: EnvConfig = {
	db: {
		host: process.env.DB_HOST || "localhost",
		port: process.env.DB_PORT || 27017,
		name: process.env.DB_NAME || "qlsv",
	},
};

const pro = {
	db: {
		host: process.env.DB_HOST || "localhost",
		port: process.env.DB_PORT || 27017,
		name: process.env.DB_NAME || "qlsv",
	},
}

const config: Config = {dev, pro, development: dev, production: pro};

// Normalize environment name to handle different variations
const normalizeEnv = (env: string): string => {
	const normalized = env.toLowerCase();
	if (normalized === 'development' || normalized === 'dev') {
		return 'dev';
	}
	if (normalized === 'production' || normalized === 'prod') {
		return 'pro';
	}
	return 'dev'; // default to dev
};

const env: string = normalizeEnv(process.env.NODE_ENV || "dev");

console.log(`Using environment: ${env} (from NODE_ENV: ${process.env.NODE_ENV})`);

if (!config[env]) {
	throw new Error(`Environment ${env} is not supported`);
}

export default config[env];