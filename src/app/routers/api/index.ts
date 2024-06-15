import { Router } from 'express';
import {
  AUTH_BASE_API_PATH,
  authenticateRequest,
  SCHEDULES_BASE_API_PATH,
  USERS_BASE_API_PATH
} from '@modules';
import { Environment } from '@utils';

export function ApiRouter (authRouter: Router, usersRouter: Router, schedulesRouter: Router): Router {
  const router = Router();
  const apiVersion = Environment.getApiVersion();
  router.use(authenticateRequest([
    { path: `/api/${apiVersion}/auth` },
    { path: `/api/${apiVersion}/users/avatar` }
  ]));
  router.use(`/${AUTH_BASE_API_PATH}`, authRouter);
  router.use(`/${USERS_BASE_API_PATH}`, usersRouter);
  router.use(`/${SCHEDULES_BASE_API_PATH}`, schedulesRouter);

  return router;
}
