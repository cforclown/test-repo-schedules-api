import request from 'supertest';
import { HttpStatusCode } from 'axios';
import { container, setup } from '../../di-config';
import { mockRegisterUserPayload, mockUser as mockUserData } from '../../test/mock-users-data';
import { Environment } from '@utils';

const mockJWTSign = jest.fn();
const mockJWTVerify = jest.fn();
jest.mock('jsonwebtoken', () => ({
  ...jest.requireActual('jsonwebtoken'),
  sign: jest.fn().mockImplementation((user: any, secret: string, options: any) => mockJWTSign(user, secret, options)),
  verify: jest.fn().mockImplementation((token: string, secret: string) => mockJWTVerify(token, secret))
}));

const mockModel = jest.fn();
jest.mock('mongoose', () => ({
  ...jest.requireActual('mongoose'),
  model: jest.fn().mockImplementation((collection: string): string => mockModel(collection))
}));

const mockUsersDaoAuthenticate = jest.fn();
const mockUsersDaoGet = jest.fn();
const mockUsersDaoGetByUsername = jest.fn();
const mockUsersDaoGetByEmail = jest.fn();
const mockUsersDaoGetAll = jest.fn();
const mockUsersDaoGetCreate = jest.fn();
const mockUsersDaoGetUpdate = jest.fn();
const mockUsersDaoGetDelete = jest.fn();
jest.mock('../users/users.dao', () => ({
  UsersDao: jest.fn().mockImplementation(() => ({
    authenticate: (payload: any): void => mockUsersDaoAuthenticate(payload),
    get: (payload: any): void => mockUsersDaoGet(payload),
    getByUsername: (payload: any): void => mockUsersDaoGetByUsername(payload),
    getByEmail: (payload: any): void => mockUsersDaoGetByEmail(payload),
    getAll: (payload: any): void => mockUsersDaoGetAll(payload),
    create: (payload: any): void => mockUsersDaoGetCreate(payload),
    update: (payload: any): void => mockUsersDaoGetUpdate(payload),
    delete: (payload: any): void => mockUsersDaoGetDelete(payload)
  }))
}));

describe('auth-router', () => {
  const mockUser = {
    ...mockUserData,
    toJSON: (): Record<string, any> => mockUserData
  };
  mockUsersDaoAuthenticate.mockReturnValue(Promise.resolve(mockUser));
  mockUsersDaoGet.mockReturnValue(Promise.resolve(mockUser));
  mockUsersDaoGetByUsername.mockReturnValue(Promise.resolve(null));
  mockUsersDaoGetByEmail.mockReturnValue(Promise.resolve(null));
  mockUsersDaoGetAll.mockReturnValue(Promise.resolve([mockUser]));
  mockUsersDaoGetCreate.mockReturnValue(Promise.resolve(mockUser));
  mockUsersDaoGetUpdate.mockReturnValue(Promise.resolve(mockUser));
  mockUsersDaoGetDelete.mockImplementation((payload) => Promise.resolve(payload));

  let app: any;
  const apiBaseUrl = `/api/${Environment.getApiVersion()}`;

  const mockAccessToken = 'generated-access-token';
  const mockRefreshToken = 'generated-refresh-token';
  const mockUserToken = {
    user: mockUserData,
    accessToken: mockAccessToken,
    refreshToken: mockRefreshToken,
    expiresIn: 3600
  };
  mockJWTSign.mockReturnValue(mockUserData);
  mockJWTVerify.mockReturnValue(mockUserData);

  beforeAll(() => {
    setup();
    app = container.resolve('app');
  });

  beforeEach(() => {
    mockJWTSign.mockReturnValueOnce(mockAccessToken);
    mockJWTSign.mockReturnValueOnce(mockRefreshToken);
    mockJWTVerify.mockReturnValue(mockUserToken);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('login', () => {
    it('should successfully create a token for user', async () => {
      const response = await request(app)
        .post(`${apiBaseUrl}/auth/login/test`)
        .send({
          username: 'username',
          password: 'password'
        })
        .expect(HttpStatusCode.Ok);

      expect(response).toHaveProperty('text');
      const body = JSON.parse(response.text);
      expect(body).toHaveProperty('data');
      expect(body.data).toEqual(mockUserToken);
    });

    it('should fail because password not provided', async () => {
      await request(app)
        .post(`${apiBaseUrl}/auth/login/test`)
        .send({
          username: 'username'
        })
        .expect(HttpStatusCode.BadRequest);
    });

    it('should return 404 when user not found', async () => {
      mockUsersDaoAuthenticate.mockReturnValueOnce(Promise.resolve(null));
      await request(app)
        .post(`${apiBaseUrl}/auth/login/test`)
        .send({
          username: 'username',
          password: 'password'
        })
        .expect(HttpStatusCode.NotFound);
    });
  });

  describe('register', () => {
    it('should successfully register a user', async () => {
      const response = await request(app)
        .post(`${apiBaseUrl}/auth/register`)
        .send(mockRegisterUserPayload)
        .expect(HttpStatusCode.Ok);

      expect(response).toHaveProperty('text');
      const body = JSON.parse(response.text);
      expect(body).toHaveProperty('data');
      expect(body.data).toEqual(mockUserToken);
    });

    it('should return error when password and confirmPassword is not match', async () => {
      await request(app)
        .post(`${apiBaseUrl}/auth/register`)
        .send({
          ...mockRegisterUserPayload,
          password: 'password',
          confirmPassword: 'not-match-password'
        })
        .expect(HttpStatusCode.BadRequest);
    });
  });

  describe('refresh', () => {
    it('should successfully refresh user token', async () => {
      const response = await request(app)
        .post(`${apiBaseUrl}/auth/refresh`)
        .set({ Authorization: 'Bearer fake-access-token' })
        .send({ refreshToken: 'mock-refresh-token' })
        .expect(HttpStatusCode.Ok);

      expect(response).toHaveProperty('text');
      const body = JSON.parse(response.text);
      expect(body).toHaveProperty('data');
      expect(body.data).toEqual(mockUserToken);
    });

    it('should return BadRequest when refresh token is not valid anymore', async () => {
      mockUsersDaoGet.mockReturnValueOnce(Promise.resolve(null));

      await request(app)
        .post(`${apiBaseUrl}/auth/refresh`)
        .set({ Authorization: 'Bearer fake-access-token' })
        .send({ refreshToken: 'mock-refresh-token' })
        .expect(HttpStatusCode.Unauthorized);
    });
  });

  describe('logout', () => {
    it('should successfully delete a user', async () => {
      const response = await request(app)
        .delete(`${apiBaseUrl}/auth/logout`)
        .set({ Authorization: 'Bearer fake-access-token' })
        .expect(HttpStatusCode.Ok);
      expect(response).toHaveProperty('text');
      const body = JSON.parse(response.text);
      expect(body).toHaveProperty('data');
      expect(body.data).toEqual(true);
    });
  });
});
