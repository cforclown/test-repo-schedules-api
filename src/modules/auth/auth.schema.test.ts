import { validateSchema, ValidationException } from '@utils';
import { ILoginReq, LoginPayloadSchema, RefreshTokenPayloadSchema } from '.';

describe('auth-data-transfer-object', () => {
  const loginPayload: ILoginReq = {
    username: 'username',
    password: 'password'
  };

  describe('LoginPayloadSchema', () => {
    it('should return value when schema is valid', () => {
      const result = validateSchema({ schema: LoginPayloadSchema, payload: loginPayload });
      expect(result).toEqual(loginPayload);
    });

    it('should throw validation exception when password not provided', () => {
      expect(() => validateSchema({
        schema: LoginPayloadSchema,
        payload: {
          username: 'username'
        }
      })).toThrow(ValidationException);
    });

    it('should throw validation exception when password not provided', () => {
      expect(() => validateSchema({
        schema: LoginPayloadSchema,
        payload: {
          password: 'password'
        }
      })).toThrow(ValidationException);
    });
  });

  describe('RefreshTokenPayloadSchema', () => {
    it('should return value when schema is valid', () => {
      const result = validateSchema({ schema: RefreshTokenPayloadSchema, payload: { refreshToken: 'refreshToken' } });
      expect(result).toEqual({ refreshToken: 'refreshToken' });
    });

    it('should throw validation exception when refreshToken not provided', () => {
      expect(() => validateSchema({ schema: RefreshTokenPayloadSchema, payload: {} })).toThrow(ValidationException);
    });
  });
});
