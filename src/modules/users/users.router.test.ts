import request from 'supertest';
import { HttpStatusCode } from 'axios';
import { container, setup } from '../../di-config';
import { Environment, RestApiException } from '@utils';
import { mockUpdateUserPayload, mockUser } from '../../test/mock-users-data';

const mockJWTVerify = jest.fn();
jest.mock('jsonwebtoken', () => ({
  ...jest.requireActual('jsonwebtoken'),
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
jest.mock('./users.dao', () => ({
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

describe('users-router', () => {
  mockUsersDaoAuthenticate.mockReturnValue(Promise.resolve(mockUser));
  mockUsersDaoGet.mockReturnValue(Promise.resolve(mockUser));
  mockUsersDaoGetByUsername.mockReturnValue(Promise.resolve(null));
  mockUsersDaoGetByEmail.mockReturnValue(Promise.resolve(null));
  mockUsersDaoGetAll.mockReturnValue(Promise.resolve([mockUser]));
  mockUsersDaoGetCreate.mockReturnValue(Promise.resolve(mockUser));
  mockUsersDaoGetUpdate.mockReturnValue(Promise.resolve(mockUser));
  mockUsersDaoGetDelete.mockImplementation((payload) => Promise.resolve(payload));

  mockJWTVerify.mockReturnValue(mockUser);

  let app: any;

  beforeAll(() => {
    setup();
    app = container.resolve('app');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('get', () => {
    it('should successfully return user', async () => {
      const response = await request(app)
        .get(`/api/${Environment.getApiVersion()}/users/${mockUser.id}`)
        .set({ Authorization: 'Bearer fake-access-token' })
        .expect(HttpStatusCode.Ok);

      expect(response).toHaveProperty('text');
      const body = JSON.parse(response.text);
      expect(body).toHaveProperty('data');
      expect(body.data).toEqual(mockUser);
    });

    it('should return 404 when user not found', async () => {
      mockUsersDaoGet.mockReturnValueOnce(Promise.resolve(null));
      await request(app)
        .get(`/api/${Environment.getApiVersion()}/users/${mockUser.id}`)
        .set({ Authorization: 'Bearer fake-access-token' })
        .expect(HttpStatusCode.NotFound);
    });
  });

  describe('getAll', () => {
    it('should successfully get all users', async () => {
      const response = await request(app)
        .get(`/api/${Environment.getApiVersion()}/users`)
        .set({ Authorization: 'Bearer fake-access-token' })
        .expect(HttpStatusCode.Ok);
      expect(response).toHaveProperty('text');
      const body = JSON.parse(response.text);
      expect(body).toHaveProperty('data');
      expect(body.data).toEqual([mockUser]);
    });

    it('should return empty', async () => {
      mockUsersDaoGetAll.mockReturnValueOnce(Promise.resolve([]));

      const response = await request(app)
        .get(`/api/${Environment.getApiVersion()}/users`)
        .set({ Authorization: 'Bearer fake-access-token' })
        .expect(HttpStatusCode.Ok);
      expect(response).toHaveProperty('text');
      const body = JSON.parse(response.text);
      expect(body).toHaveProperty('data');
      expect(body.data).toEqual([]);
    });

    it('should return internal server error', async () => {
      mockUsersDaoGetAll.mockRejectedValueOnce(new Error('error'));

      await request(app)
        .get(`/api/${Environment.getApiVersion()}/users`)
        .set({ Authorization: 'Bearer fake-access-token' })
        .expect(HttpStatusCode.InternalServerError);
    });
  });

  describe('update', () => {
    it('should successfully update user', async () => {
      const response = await request(app)
        .patch(`/api/${Environment.getApiVersion()}/users`)
        .set({ Authorization: 'Bearer fake-access-token' })
        .send(mockUpdateUserPayload)
        .expect(HttpStatusCode.Ok);
      expect(response).toHaveProperty('text');
      const body = JSON.parse(response.text);
      expect(body).toHaveProperty('data');
      expect(body.data).toEqual(mockUser);
    });

    it('should successfully update user when only some of the field is provided', async () => {
      const response = await request(app)
        .patch(`/api/${Environment.getApiVersion()}/users`)
        .set({ Authorization: 'Bearer fake-access-token' })
        .send({
          username: 'new-username'
        })
        .expect(HttpStatusCode.Ok);
      expect(response).toHaveProperty('text');
      const body = JSON.parse(response.text);
      expect(body).toHaveProperty('data');
      expect(body.data).toEqual(mockUser);
    });

    it('should fail update user when user not found', async () => {
      mockUsersDaoGet.mockReturnValueOnce(Promise.resolve(null));
      await request(app)
        .patch(`/api/${Environment.getApiVersion()}/users`)
        .set({ Authorization: 'Bearer fake-access-token' })
        .send(mockUpdateUserPayload)
        .expect(HttpStatusCode.BadRequest);
    });

    it('should fail update user when given username is taken', async () => {
      mockUsersDaoGetByUsername.mockReturnValueOnce(Promise.resolve(mockUser));
      await request(app)
        .patch(`/api/${Environment.getApiVersion()}/users`)
        .set({ Authorization: 'Bearer fake-access-token' })
        .send(mockUpdateUserPayload)
        .expect(HttpStatusCode.BadRequest);
    });

    it('should fail update user when given email already registered', async () => {
      mockUsersDaoGetByEmail.mockReturnValueOnce(Promise.resolve(mockUser));
      await request(app)
        .patch(`/api/${Environment.getApiVersion()}/users`)
        .set({ Authorization: 'Bearer fake-access-token' })
        .send(mockUpdateUserPayload)
        .expect(HttpStatusCode.BadRequest);
    });
  });

  describe('delete', () => {
    it('should successfully delete a user', async () => {
      const response = await request(app)
        .delete(`/api/${Environment.getApiVersion()}/users/${mockUser.id}`)
        .set({ Authorization: 'Bearer fake-access-token' })
        .expect(HttpStatusCode.Ok);
      expect(response).toHaveProperty('text');
      const body = JSON.parse(response.text);
      expect(body).toHaveProperty('data');
      expect(body.data).toEqual(mockUser.id);
    });

    it('should throw an error when data access object throw an error', async () => {
      mockUsersDaoGetDelete.mockRejectedValueOnce(new RestApiException('internal server error', 500));
      await request(app)
        .delete(`/api/${Environment.getApiVersion()}/users/${mockUser.id}`)
        .set({ Authorization: 'Bearer fake-access-token' })
        .expect(HttpStatusCode.InternalServerError);
    });
  });
});
