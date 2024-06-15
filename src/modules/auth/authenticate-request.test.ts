import { HttpStatusCode } from 'axios';
import { dro } from '@utils';
import { authenticateRequest, IExcludePath } from '.';
import { mockUser } from '../../test/mock-users-data';

const mockJWTVerify = jest.fn();
jest.mock('jsonwebtoken', () => ({
  ...jest.requireActual('jsonwebtoken'),
  verify: jest.fn().mockImplementation((token: string, secret: string) => mockJWTVerify(token, secret))
}));

describe('authenticate-request', () => {
  mockJWTVerify.mockReturnValue(mockUser);

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should successfully authenticate a request with a valid access token', () => {
    // Arrange
    const excludePaths: IExcludePath[] = [];
    const mockReq: any = {
      originalUrl: '/api/v1/users',
      method: 'GET',
      headers: {
        authorization: 'Bearer validAccessToken'
      }
    };
    const mockRes: any = {
      sendStatus: jest.fn(),
      status: jest.fn().mockReturnThis(),
      send: jest.fn()
    };
    const mockNext = jest.fn();

    // Act
    authenticateRequest(excludePaths)(mockReq, mockRes, mockNext);

    // Assert
    expect(mockRes.sendStatus).not.toHaveBeenCalled();
    expect(mockRes.status).not.toHaveBeenCalled();
    expect(mockRes.send).not.toHaveBeenCalled();
    expect(mockNext).toHaveBeenCalled();
  });

  it('should skip authentication for excluded paths with GET method', () => {
    // Arrange
    const excludePaths: IExcludePath[] = [{ path: '/api/v1/public' }];
    const mockReq: any = {
      originalUrl: '/api/v1/public',
      method: 'GET',
      headers: {}
    };
    const mockRes: any = {};
    const mockNext = jest.fn();

    // Act
    authenticateRequest(excludePaths)(mockReq, mockRes, mockNext);

    // Assert
    expect(mockNext).toHaveBeenCalled();
  });

  it('should return 401 Unauthorized if no authorization header set', () => {
    // Arrange
    const excludePaths: IExcludePath[] = [];
    const mockReq: any = {
      originalUrl: '/api/v1/users',
      method: 'GET',
      headers: {}
    };
    const mockRes: any = {
      sendStatus: jest.fn(),
      status: jest.fn().mockReturnThis(),
      send: jest.fn()
    };
    const mockNext = jest.fn();

    // Act
    authenticateRequest(excludePaths)(mockReq, mockRes, mockNext);

    // Assert
    expect(mockRes.status).toHaveBeenCalledWith(HttpStatusCode.Unauthorized);
    expect(mockRes.send).toHaveBeenCalledWith(dro.error('Unauthorized'));
    expect(mockNext).not.toHaveBeenCalled();
  });

  it('should return 401 Unauthorized if the access token is invalid', () => {
    // Arrange
    const excludePaths: IExcludePath[] = [];
    const mockReq: any = {
      originalUrl: '/api/v1/users',
      method: 'GET',
      headers: {
        authorization: 'Bearer invalidAccessToken'
      }
    };
    const mockRes: any = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn()
    };
    const mockNext = jest.fn();

    mockJWTVerify.mockReturnValueOnce(null);

    // Act
    authenticateRequest(excludePaths)(mockReq, mockRes, mockNext);

    // Assert
    expect(mockRes.status).toHaveBeenCalledWith(HttpStatusCode.Unauthorized);
    expect(mockRes.send).toHaveBeenCalledWith(dro.error('Invalid access token'));
    expect(mockNext).not.toHaveBeenCalled();
  });

  it('should set req.user if the access token is valid', () => {
    // Arrange
    const excludePaths: IExcludePath[] = [];
    const mockReq: any = {
      originalUrl: '/api/v1/users',
      method: 'GET',
      headers: {
        authorization: 'Bearer validAccessToken'
      }
    };
    const mockRes: any = {};
    const mockNext = jest.fn();

    // Act
    authenticateRequest(excludePaths)(mockReq, mockRes, mockNext);

    // Assert
    expect(mockReq.user).toBeDefined();
    expect(mockNext).toHaveBeenCalled();
  });
});
