import express from 'express';
import { HttpStatusCode } from 'axios';
import passport from 'passport';
import { dro, Environment, RequestHandler, validateBody } from '@utils';
import { AuthController, LoginPayloadSchema, RefreshTokenPayloadSchema, RegisterPayloadSchema } from '.';

export const AUTH_ROUTER_INSTANCE_NAME = 'authRouter';
export const AUTH_BASE_API_PATH = 'auth';

export function AuthRouter (authController: AuthController): express.Router {
  const router = express.Router();
  const apiVersion = Environment.getApiVersion();
  /**
   * @swagger
   * /auth/login:
   *      post:
   *          tags:
   *              - Authentication
   *          description: Login
   *          responses:
   *              '200':
   *                  description: Login Success
   *          requestBody:
   *              required: true
   *              content:
   *                  application/json:
   *                      schema:
   *                          $ref: '#/components/schemas/login'
   */
  router.post(
    '/login',
    passport.authenticate('local', {
      successRedirect: `/api/${apiVersion}/auth/login/verify`,
      failureRedirect: `/api/${apiVersion}/auth/login/error`,
      failureMessage: true
    })
  );

  router.post('/login/test', validateBody(LoginPayloadSchema), RequestHandler(authController.login));
  router.get('/login/verify', RequestHandler(authController.verify));
  router.get('/login/error', async (req, res) => {
    res.status(HttpStatusCode.NotFound).send(dro.error('The email and/or password that you have entered is incorrect'));
  });

  /**
   * @swagger
   * /auth/register:
   *      post:
   *          tags:
   *              - Authentication
   *          description: Register
   *          responses:
   *              '200':
   *                  description: Register success
   *          requestBody:
   *              required: true
   *              content:
   *                  application/json:
   *                      schema:
   *                          $ref: '#/components/schemas/register'
   */
  router.post('/register', validateBody(RegisterPayloadSchema), RequestHandler(authController.register));

  /**
   * @swagger
   * /auth/refresh:
   *      post:
   *          tags:
   *              - Authentication
   *          description: Refresh Token
   *          responses:
   *              '200':
   *                  description: Access token has been refreshed
   *          requestBody:
   *              required: true
   *              content:
   *                  application/json:
   *                      schema:
   *                          $ref: '#/components/schemas/refreshToken'
   */
  router.post('/refresh', validateBody(RefreshTokenPayloadSchema), RequestHandler(authController.refresh));

  /**
   * @swagger
   * /auth/logout:
   *      delete:
   *          tags:
   *              - Authentication
   *          description: Logout success
   *          responses:
   *              '200':
   *                  description: Logout Success
   *          security:
   *              - Bearer: []
   */
  router.delete('/logout', RequestHandler(async () => Promise.resolve(true)));

  /**
   * @swagger
   * /auth/validate:
   *      put:
   *          tags:
   *              - Authentication
   *          description: Validate access token
   *          responses:
   *              '200':
   *                  description: Access token valid
   *          requestBody:
   *              required: true
   *              content:
   *                  application/json:
   *                      schema:
   *                          $ref: '#/components/schemas/refreshToken'
   */
  router.put('/validate', validateBody(RefreshTokenPayloadSchema), RequestHandler(authController.validate));

  return router;
}
