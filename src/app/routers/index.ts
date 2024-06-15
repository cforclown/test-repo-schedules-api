import { Router } from 'express';
import { Environment } from '@utils';

export function MainRouter (apiRouter: Router): Router {
  const router = Router();
  router.use(`/api/${Environment.getApiVersion()}`, apiRouter);

  return router;
}
