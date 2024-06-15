import { config } from './env-config';
import { Logger } from './logger';

const mockDotenvConfig = jest.fn();
jest.mock('dotenv', () => ({
  config: (args: Record<string, any>): void => mockDotenvConfig(args)
}));

const mockFsExistsSync = jest.fn();
jest.mock('fs', () => ({
  existsSync: (filename: string): void => mockFsExistsSync(filename)
}));

describe('env-config', () => {
  const mockEnvFiles = [
    '.env',
    '.env.test',
    '.env.local',
    '.env.dev',
    '.env.development',
    '.env.sit',
    '.env.staging',
    '.env.prod',
    '.env.production'
  ];
  mockFsExistsSync.mockImplementation((filename: string) => mockEnvFiles.includes(filename));
  const spyOnLoggerWarning = jest.spyOn(Logger, 'warn');

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should throw error when NODE_ENV value is invalid', () => {
    process.env.NODE_ENV = 'invalid env value';
    expect(config).toThrow(Error);
  });

  it('should call dotenv config without providing NODE_ENV value', () => {
    process.env.NODE_ENV = '';
    config();
    expect(mockDotenvConfig).toHaveBeenCalledWith(undefined);
  });

  it('should call dotenv config with correct path for test NODE_ENV', () => {
    process.env.NODE_ENV = 'test';
    config();
    expect(mockDotenvConfig).toHaveBeenCalled();
    expect(mockDotenvConfig.mock.calls[0][0]).toEqual({ path: '.env.test' });
  });

  it('should call dotenv config with correct path for dev NODE_ENV', () => {
    process.env.NODE_ENV = 'dev';
    config();
    expect(mockDotenvConfig).toHaveBeenCalled();
    expect(mockDotenvConfig.mock.calls[0][0]).toEqual({ path: '.env.dev' });
  });

  it('should call dotenv config with correct path for dev NODE_ENV when only alias env filename exists', () => {
    const mockExistsFile = ['.env.local'];
    mockFsExistsSync.mockImplementationOnce((filename: string) => mockExistsFile.includes(filename));

    config();
    expect(mockDotenvConfig).toHaveBeenCalled();
    expect(mockDotenvConfig.mock.calls[0][0]).toEqual({ path: '.env.local' });
  });

  it('should throw error when .env file is not found and NODE_ENV is empty', () => {
    const mockExistsFile: string[] = [];
    mockFsExistsSync.mockImplementationOnce((filename: string) => mockExistsFile.includes(filename));

    process.env.NODE_ENV = '';
    expect(config).toThrow(Error('No env file found!'));
  });

  it('should call dotenvConfig without path specified with warning message', () => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    mockFsExistsSync.mockImplementationOnce((_: string) => undefined);

    process.env.NODE_ENV = 'sit';
    config();
    expect(mockDotenvConfig).toHaveBeenCalledWith({ path: undefined });
    expect(spyOnLoggerWarning).toHaveBeenCalled();
  });
});
