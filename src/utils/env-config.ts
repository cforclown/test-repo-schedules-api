import { existsSync } from 'fs';
import { config as dotenvConfig } from 'dotenv';
import { ELogLevel, Logger } from './logger';

const devEnvAliases = ['local', 'dev', 'development'];

export const prodEnvAliases = ['prod', 'production', 'release'];

export const isProduction = (env: string): boolean => prodEnvAliases.includes(env);

const envNames = ['test', ...devEnvAliases, 'sit', 'staging', ...prodEnvAliases] as const;

export type EnvNames = typeof envNames[number];

const getEnvFilename = (env: EnvNames): string | undefined => {
  let filename = `.env.${env}`;
  if (existsSync(filename)) {
    return filename;
  }

  if (devEnvAliases.includes(env)) {
    for (const devEnv of devEnvAliases) {
      filename = `.env.${devEnv}`;
      if (existsSync(filename)) {
        return filename;
      }
    }
  } else if (prodEnvAliases.includes(env)) {
    for (const prodEnv of prodEnvAliases) {
      filename = `.env.${prodEnv}`;
      if (existsSync(filename)) {
        return filename;
      }
    }
  }

  return undefined;
};

export const config = (): any => {
  // if NODE_ENV not set, check .env file, if not exists throw error
  if (!process.env.NODE_ENV) {
    if (!existsSync('.env')) {
      throw new Error('No env file found!');
    }

    return dotenvConfig();
  }

  if (!envNames.includes(process.env.NODE_ENV)) {
    throw new Error(`NODE_ENV value should be one of ${envNames.map(e => `'${e}'`).join(', ')}`);
  }

  const envFilename = getEnvFilename(process.env.NODE_ENV);
  if (!envFilename) {
    Logger.warn(
      `[WARNING] NODE_ENV specified (${process.env.NODE_ENV} but env file not found.\n Ignore this warning if intended`,
      ELogLevel.DEBUG
    );
  }

  dotenvConfig({ path: envFilename });
};
