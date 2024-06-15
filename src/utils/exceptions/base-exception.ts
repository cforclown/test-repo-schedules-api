import { ELogLevel, Logger } from '../logger';

export enum EExceptionCodes {
  Validation='Validation',
  RestAPI='RestAPI'
}

export abstract class BaseException extends Error {
  public readonly exceptionCode: string;

  constructor (exceptionCode: EExceptionCodes, message?: string) {
    super(message);
    this.exceptionCode = exceptionCode;

    Logger.error(`[${this.exceptionCode}] ${this.message ? this.message : 'UNKNOWN ERROR'}`, ELogLevel.ERROR);
  }
}
