/* eslint-disable import/named */
import { NextFunction, Request, Response } from 'express';
import { HttpStatusCode, Method } from 'axios';
import { JsonWebTokenError, NotBeforeError, TokenExpiredError, verify } from 'jsonwebtoken';
import { dro, ELogLevel, Environment, Logger } from '@utils';

export interface IExcludePath {
  path: string;
  method?: Method;
}

export function authenticateRequest (excludePaths: IExcludePath[]) {
  return (req: Request, res: Response, next: NextFunction): any => {
    try {
      for (const excludePath of excludePaths) {
        if (
          req.originalUrl.includes(excludePath.path) &&
          (!excludePath.method || (excludePath.method === req.method))
        ) {
          return next();
        }
      }
      if (!req.headers.authorization) {
        return res.status(HttpStatusCode.Unauthorized).send(dro.error('Unauthorized'));
      }

      const [, token] = req.headers.authorization.split(' ');
      const user = verify(token, Environment.getAccessTokenSecret());
      if (!user) {
        return res.status(HttpStatusCode.Unauthorized).send(dro.error('Invalid access token'));
      }

      req.user = user;

      next();
    } catch (err) {
      if (err instanceof TokenExpiredError || err instanceof JsonWebTokenError || err instanceof NotBeforeError) {
        Logger.error(err.message);
        return res.status(HttpStatusCode.Unauthorized).send(dro.error(err.message));
      }
      if (err instanceof Error) {
        Logger.error(err.message, ELogLevel.ERROR);
        return res.status(HttpStatusCode.InternalServerError).send(dro.error(err.message));
      }
    }
  };
}
