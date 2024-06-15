import express from 'express';
import { AuthService, IUserContext } from '.';
import { IUser } from '..';
import { Environment, RestApiException } from '@utils';
import { verify } from 'jsonwebtoken';
import { HttpStatusCode } from 'axios';

export class AuthController {
  public static readonly INSTANCE_NAME = 'authController';

  private readonly authService: AuthService;

  constructor (authService: AuthService) {
    this.authService = authService;

    this.login = this.login.bind(this);
    this.verify = this.verify.bind(this);
    this.register = this.register.bind(this);
    this.refresh = this.refresh.bind(this);
    this.validate = this.validate.bind(this);
  }

  async login ({ body }: express.Request): Promise<IUserContext> {
    return this.authService.login(body);
  }

  async register ({ body }: express.Request): Promise<IUserContext> {
    return this.authService.register(body);
  }

  async verify ({ user }: express.Request): Promise<IUserContext> {
    return this.authService.verify(user as IUser);
  }

  async refresh ({ body }: express.Request): Promise<IUserContext> {
    return this.authService.refresh(body.refreshToken);
  }

  async validate (req: express.Request): Promise<boolean | IUserContext> {
    const { headers: { authorization } } = req;
    if (!authorization) {
      throw new RestApiException('No authorization found', HttpStatusCode.Unauthorized);
    }

    const [, token] = authorization.split(' ');
    const user = verify(token, Environment.getAccessTokenSecret());
    if (!user) {
      return this.refresh(req);
    }

    return true;
  }
}
