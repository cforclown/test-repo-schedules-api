import { ELogLevel } from './logger';
import { EnvNames } from './env-config';

export function getEnvOrThrow (varName: string): string {
  const value = process.env[varName];
  if (!value) {
    throw new Error(`Environment variable ${varName} not set!`);
  }
  return value;
}

export function getOptionalEnv <T> (varName: string, defaultValue: T): string | T {
  const value = process.env[varName];
  if (!value) {
    return defaultValue;
  }
  return value;
}

export const Environment = {
  getNodeEnv: (): EnvNames => getEnvOrThrow('NODE_ENV'),

  getLogLevel: (): ELogLevel => {
    const logLevel = getOptionalEnv('LOG_LEVEL', 'prod');
    if (!logLevel) {
      return ELogLevel.PRODUCTION;
    }

    switch (logLevel) {
      case 'test':
        return ELogLevel.TEST;
      case 'error':
        return ELogLevel.ERROR;
      case 'debug':
        return ELogLevel.DEBUG;
      case 'prod':
        return ELogLevel.PRODUCTION;
      default:
        return ELogLevel.PRODUCTION;
    }
  },

  getPort: (): string => getEnvOrThrow('PORT'),
  getAllowedOrigins: (): string[] => {
    const appHost = getEnvOrThrow('ALLOWED_ORIGINS');
    return appHost.split(',').filter(h => !!h);
  },
  getApiVersion: (): string => getOptionalEnv('API_VERSION', 'v1'),

  getDBConnectionString: (): string => {
    const dbHost = getEnvOrThrow('DB_HOST');
    const dbPort = getOptionalEnv('DB_PORT', undefined);
    const dbUsername = getOptionalEnv('DB_USERNAME', undefined);
    const dbPassword = getOptionalEnv('DB_PASSWORD', undefined);
    return `mongodb://${dbUsername && dbPassword ? `${dbUsername}:${dbPassword}@` : ''}${dbHost}${dbPort ? `:${dbPort}` : ''}`;
  },
  getDbName: (): string => getEnvOrThrow('DB_NAME'),

  getSessionSecret: (): string => getOptionalEnv('SESSION_SECRET', 'session-secret'),

  getAccessTokenSecret: (): string => getEnvOrThrow('ACCESS_TOKEN_SECRET'),
  getRefreshTokenSecret: (): string => getEnvOrThrow('REFRESH_TOKEN_SECRET'),
  getAccessTokenExpIn: (): number => {
    const accessTokenExpIn = getOptionalEnv('ACCESS_TOKEN_EXP_IN', 7200);
    return typeof accessTokenExpIn === 'string' ? parseInt(accessTokenExpIn) : accessTokenExpIn;
  },
  getRefreshTokenExpIn: (): string => '7d',

  getEncryptionAlgorithm: (): string => getOptionalEnv('ENCRYPTION_ALGORITHM', 'aes-256-cbc'),
  getEncryptionKey: (): string => getEnvOrThrow('ENCRYPTION_KEY')
};
