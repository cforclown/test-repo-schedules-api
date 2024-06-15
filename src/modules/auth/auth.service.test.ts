import { RestApiException } from '@utils';
import { AuthService, IUserContext } from '.';
import { mockRegisterUserPayload, mockUser as mockUserData } from '../../test/mock-users-data';
import { container, setup } from '../../di-config';

const mockUsersDaoAuthenticate = jest.fn();
const mockUsersDaoGet = jest.fn();
const mockUsersDaoGetByUsername = jest.fn();
const mockUsersDaoGetByEmail = jest.fn();
const mockUsersDaoCreate = jest.fn();

jest.mock('../users/users.dao', () => ({
  UsersDao: jest.fn().mockImplementation(() => ({
    authenticate: (payload: any): void => mockUsersDaoAuthenticate(payload),
    get: (payload: any): void => mockUsersDaoGet(payload),
    getByUsername: (payload: any): void => mockUsersDaoGetByUsername(payload),
    getByEmail: (payload: any): void => mockUsersDaoGetByEmail(payload),
    create: (payload: any): void => mockUsersDaoCreate(payload)
  }))
}));

jest.mock('mongoose', () => ({
  ...jest.requireActual('mongoose'),
  model: jest.fn().mockImplementation(() => ({}))
}));

const mockJwtSign = jest.fn();
const mockJwtVerify = jest.fn();
jest.mock('jsonwebtoken', () => ({
  ...jest.requireActual('jsonwebtoken'),
  sign: jest.fn().mockImplementation((): string => mockJwtSign()),
  verify: jest.fn().mockImplementation((): string => mockJwtVerify())
}));

describe('auth-service', () => {
  const mockUser = {
    ...mockUserData,
    toJSON: (): Record<string, any> => mockUserData
  };

  const mockAccessToken = 'generated-access-token';
  const mockRefreshToken = 'generated-refresh-token';
  const mockUserToken: IUserContext = {
    user: mockUser,
    accessToken: mockAccessToken,
    refreshToken: mockRefreshToken,
    expiresIn: 3600
  };

  mockUsersDaoAuthenticate.mockReturnValue(Promise.resolve(mockUser));
  mockUsersDaoGet.mockReturnValue(Promise.resolve(mockUser));
  mockUsersDaoGetByUsername.mockReturnValue(Promise.resolve(null));
  mockUsersDaoGetByEmail.mockReturnValue(Promise.resolve(null));
  mockUsersDaoCreate.mockReturnValue(Promise.resolve(mockUser));
  mockUsersDaoCreate.mockReturnValue(Promise.resolve(mockUser));

  let authService: AuthService;
  beforeAll(() => {
    setup();
    authService = container.resolve('authService');
  });

  beforeEach(() => {
    mockJwtSign.mockReturnValueOnce(mockAccessToken);
    mockJwtSign.mockReturnValueOnce(mockRefreshToken);
    mockJwtVerify.mockReturnValue(mockUserToken);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getUser', () => {
    it('should successfully return user', async () => {
      const user = await authService.getUserById(mockUser.id);
      expect(mockUsersDaoGet).toHaveBeenCalled();
      expect(user).toEqual(user);
    });

    it('should throw an error when role not found', async () => {
      mockUsersDaoGet.mockRejectedValueOnce(new RestApiException('not found'));

      await expect(authService.getUserById(mockUser.id)).rejects.toThrow(RestApiException);
    });
  });

  describe('authenticate', () => {
    it('should successfully authenticate user', async () => {
      const user = await authService.authenticate({
        username: 'username',
        password: 'password'
      });
      expect(mockUsersDaoAuthenticate).toHaveBeenCalled();
      expect(user).toEqual(mockUser);
    });

    it('should throw an error when usersDao.authenticate throw an error', async () => {
      mockUsersDaoAuthenticate.mockRejectedValueOnce(new RestApiException('not found'));

      await expect(authService.authenticate({
        username: 'username',
        password: 'password'
      })).rejects.toThrow(RestApiException);
    });
  });

  describe('login', () => {
    it('should successfully authenticate user', async () => {
      const token = await authService.login({
        username: 'username',
        password: 'password'
      });
      expect(mockUsersDaoAuthenticate).toHaveBeenCalled();
      expect(token).toEqual(mockUserToken);
    });

    it('should throw an error when usersDao.authenticate throw an error', async () => {
      mockUsersDaoAuthenticate.mockRejectedValueOnce(new RestApiException('not found'));

      await expect(authService.login({
        username: 'username',
        password: 'password'
      })).rejects.toThrow(RestApiException);
    });
  });

  describe('verify', () => {
    it('should successfully verify authenticated user', async () => {
      const token = await authService.verify(mockUser);
      expect(mockJwtSign).toHaveBeenCalledTimes(2);
      expect(token).toEqual(mockUserToken);
    });
  });

  describe('register', () => {
    it('should successfully register user', async () => {
      const token = await authService.register(mockRegisterUserPayload);
      expect(mockUsersDaoCreate).toHaveBeenCalled();
      expect(token).toEqual(mockUserToken);
    });

    it('should throw an error when password and confirmPassword is not match', async () => {
      await expect(authService.register({
        ...mockRegisterUserPayload,
        password: 'password',
        confirmPassword: 'not-match-password'
      })).rejects.toThrow(RestApiException);
    });
  });

  describe('refresh', () => {
    it('should successfully verify authenticated user', async () => {
      const token = await authService.refresh('refresh-token');
      expect(mockJwtVerify).toHaveBeenCalled();
      expect(mockJwtSign).toHaveBeenCalledTimes(2);
      expect(token).toEqual(mockUserToken);
    });

    it('should throw an error when data access object throw an error', async () => {
      mockJwtVerify.mockReturnValueOnce(null);
      await expect(authService.refresh('refresh-token')).rejects.toThrow(Error);
      expect(mockJwtSign).not.toHaveBeenCalled();
    });
  });
});
