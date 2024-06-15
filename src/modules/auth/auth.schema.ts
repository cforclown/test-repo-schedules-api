import Joi from 'joi';
import { IUser } from '@modules';

export interface IUserContext {
  user: IUser;
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface ILoginReq {
  username: string;
  password: string;
}

export interface IRegisterUserReq {
  username: string;
  email: string;
  fullname: string;
  password: string;
  confirmPassword: string;
}

export interface IRefreshTokenReq {
  refreshToken: string;
}

export const LoginPayloadSchema = Joi.object<ILoginReq>({
  username: Joi.alternatives().try(Joi.string(), Joi.string().email()).required(),
  password: Joi.string().required()
});

/**
 * NOTE!
 *
 * usersname RULEs ->
 * - Only contains alphanumeric characters, underscore and dot.
 * - Underscore and dot can't be at the end or start of a username (e.g _username / username_ / .username / username.).
 * - Underscore and dot can't be next to each other (e.g user_.name).
 * - Underscore or dot can't be used multiple times in a row (e.g user__name / user..name).
 * - Number of characters must be between 6 to 24.
 *
 * password RULEs ->
 * - Password must contain one digit from 0 to 9
 * - one lowercase letter,
 * - one uppercase letter,
 * - no space
 * - it must be 8-24 characters long.
 * - Usage of special character is optional.
 */
export const RegisterPayloadSchema = Joi.object<IRegisterUserReq>({
  username: Joi.string().regex(/^(?=[a-zA-Z0-9._]{6,24}$)(?!.*[_.]{2})[^_.].*[^_.]$/).required(),
  email: Joi.string().email().required(),
  fullname: Joi.string().required(),
  password: Joi.string().regex(/^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?!.* ).{8,24}$/).required(),
  confirmPassword: Joi.any()
    .valid(Joi.ref('password'))
    .required()
    .options({
      messages: { 'any.only': '{{#label}} does not match' }
    })
});

export const RefreshTokenPayloadSchema = Joi.object({
  refreshToken: Joi.string().required()
});

export const AuthSwaggerSchemas = {
  login: {
    type: 'object',
    properties: {
      username: { type: 'string', required: true },
      password: { type: 'string', required: true }
    }
  },
  register: {
    type: 'object',
    properties: {
      username: { type: 'string', required: true },
      email: { type: 'string', required: true },
      fullname: { type: 'string', required: true },
      password: { type: 'string', required: true },
      confirmPassword: { type: 'string', required: true }
    }
  },
  refreshToken: {
    type: 'object',
    properties: {
      refreshToken: { type: 'string', required: true }
    }
  }
};
