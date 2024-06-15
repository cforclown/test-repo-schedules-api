import { Environment, getEnvOrThrow, getOptionalEnv } from './environment';
import { ELogLevel } from './logger';

describe('environment', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getOptionalEnv', () => {
    it('should return value when env value set', () => {
      process.env.OPTIONAL_ENV = 'mock-optional-env-value';
      expect(getOptionalEnv('OPTIONAL_ENV', undefined)).toEqual('mock-optional-env-value');
    });

    it('should return default value when env not set', () => {
      process.env.OPTIONAL_ENV = '';
      expect(getOptionalEnv('OPTIONAL_ENV', 'mock-default-value')).toEqual('mock-default-value');
    });
  });

  describe('getEnvOrThrow', () => {
    it('should return value when env value set', () => {
      process.env.ENV_NAME = 'mock-env-value';
      expect(getEnvOrThrow('ENV_NAME')).toEqual('mock-env-value');
    });

    it('should throw an error when env value not set', () => {
      process.env.ENV_NAME = '';
      expect(() => getEnvOrThrow('ENV_NAME')).toThrow(Error);
    });
  });

  describe('Environment.getNodeEnv', () => {
    it('should successfully return environment variable value', () => {
      expect(Environment.getNodeEnv()).toBeTruthy();
    });

    it('should throw an error when environment variable not found', () => {
      process.env.NODE_ENV = ''; // it should be undefined, but somehow when you assign NODE_ENV to undefined, it will be parsed to string 'undefined'
      expect(Environment.getNodeEnv).toThrow(Error);
    });
  });

  describe('Environment.getLogLevel', () => {
    it('should successfully return environment variable value', () => {
      expect(Environment.getLogLevel()).toEqual(ELogLevel.TEST);
      process.env.LOG_LEVEL = 'error';
      expect(Environment.getLogLevel()).toEqual(ELogLevel.ERROR);
      process.env.LOG_LEVEL = 'debug';
      expect(Environment.getLogLevel()).toEqual(ELogLevel.DEBUG);
      process.env.LOG_LEVEL = 'prod';
      expect(Environment.getLogLevel()).toEqual(ELogLevel.PRODUCTION);
    });

    it('should return ELogLevel.PRODUCTION when LOG_LEVEL not set', () => {
      process.env.LOG_LEVEL = '';
      expect(Environment.getLogLevel()).toEqual(ELogLevel.PRODUCTION);
    });
  });
});
