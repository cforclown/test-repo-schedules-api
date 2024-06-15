import { Schema, ValidationOptions } from 'joi';
import { NextFunction, Request, Response } from 'express';
import { HttpStatusCode } from 'axios';
import { dro } from './dro';

export function validateDto ({
  source,
  schema,
  validateOptions,
  replaceSource
}: { source: 'body' | 'params' | 'query', schema: Schema, validateOptions?: ValidationOptions, replaceSource?: boolean; }) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const { error, value } = schema.validate(req[source], validateOptions);
    if (error) {
      res.status(HttpStatusCode.BadRequest).send(dro.error(error.message));
      return;
    }

    if (replaceSource) {
      req[source] = value;
    }

    return next();
  };
}

export const validateBody = (schema: Schema, validateOptions?: ValidationOptions): (req: Request, res: Response, next: NextFunction) => void => validateDto({
  source: 'body',
  schema,
  validateOptions,
  replaceSource: true
});

export const validateParams = (schema: Schema): (req: Request, res: Response, next: NextFunction) => void => validateDto({
  source: 'params',
  schema
});

export const validateQuery = (schema: Schema): (req: Request, res: Response, next: NextFunction) => void => validateDto({
  source: 'query',
  schema
});
