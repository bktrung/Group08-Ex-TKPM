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

const config: Config = {dev, pro};
const env: string = (process.env.NODE_ENV || "dev")

if (!config[env]) {
	throw new Error(`Environment ${env} is not supported`);
}

export default config[env];