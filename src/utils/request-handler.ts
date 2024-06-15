import { NextFunction, Request, Response } from 'express';
import { HttpStatusCode } from 'axios';
import { dro } from './dro';
import { RestApiException } from './exceptions';
import { Logger } from './logger';

export function RequestHandler (event: (req: Request, res: Response, next: NextFunction) => Promise<any>) {
  return async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    try {
      const data = await event(req, res, next);
      res.send(dro.response(data));
    } catch (err) {
      if (err instanceof RestApiException) {
        return res.status(err.httpCode).send(dro.error(err.message));
      }

      if (err instanceof Error) {
        Logger.exception(err);
        return res.status(HttpStatusCode.InternalServerError).send(dro.error(err.message));
      }

      return res.status(HttpStatusCode.InternalServerError).send(dro.error('Unknown error'));
    }
  };
}
