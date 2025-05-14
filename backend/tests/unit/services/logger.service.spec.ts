import fs from 'fs';
import path from 'path';
import Logger from '../../../src/services/logger.service'; // adjust path if needed

jest.mock('fs');
jest.spyOn(console, 'log').mockImplementation(() => {});
jest.spyOn(console, 'error').mockImplementation(() => {});

// Cast fs functions to jest.Mock
const mockAppendFile = fs.appendFile as unknown as jest.Mock;
const mockAppendFileSync = fs.appendFileSync as jest.Mock;
const mockMkdirSync = fs.mkdirSync as jest.Mock;
const mockExistsSync = fs.existsSync as jest.Mock;

describe('Logger', () => {
	beforeEach(() => {
		jest.clearAllMocks();
		process.env.NODE_ENV = 'test'; // default test env
		mockExistsSync.mockReturnValue(true); // simulate dirs exist
	});

	it('should write info log asynchronously', () => {
		Logger.info('This is info log', { user: 'admin' });

		expect(mockAppendFile).toHaveBeenCalled();
		const [filePath, content] = mockAppendFile.mock.calls[0];
		expect(filePath).toContain('info');
		expect(content).toContain('[INFO]');
		expect(content).toContain('This is info log');
	});

	it('should write error log synchronously', () => {
		Logger.error('Critical error occurred', { code: 500 });

		expect(mockAppendFileSync).toHaveBeenCalled();
		const [filePath, content] = mockAppendFileSync.mock.calls[0];
		expect(filePath).toContain('error');
		expect(content).toContain('[ERROR]');
		expect(content).toContain('Critical error occurred');
	});

	it('should fallback to async if sync write fails', () => {
		mockAppendFileSync.mockImplementation(() => {
			throw new Error('Disk full');
		});

		Logger.error('Fallback test');

		expect(mockAppendFileSync).toHaveBeenCalled();
		expect(mockAppendFile).toHaveBeenCalled();
	});

	it('should log warn and debug only in non-production', () => {
		process.env.NODE_ENV = 'development';

		Logger.warn('This is a warning');
		Logger.debug('Debug message');

		expect(mockAppendFile).toHaveBeenCalledTimes(2);
		expect(mockAppendFile.mock.calls[0][1]).toContain('[WARN]');
		expect(mockAppendFile.mock.calls[1][1]).toContain('[DEBUG]');
	});

	it('should not write debug log in production', () => {
		process.env.NODE_ENV = 'pro';

		Logger.debug('This should not be logged');

		expect(mockAppendFile).not.toHaveBeenCalled();
	});
});
