import { HttpStatusCode } from 'axios';
import { mockRequest, mockResponse } from 'jest-mock-req-res';
import { RequestHandler } from './request-handler';
import { RestApiException } from './exceptions';
import { Logger } from './logger';

describe('request-handler', () => {
  const data = {
    message: 'message'
  };
  const event = jest.fn().mockImplementation(async (): Promise<Record<string, any>> => data);
  const req = mockRequest({});
  const res = mockResponse({});
  const next = (): any => ({});
  const spyOnLoggerException = jest.spyOn(Logger, 'exception');

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should send data successfully', async () => {
    const result = RequestHandler(event);
    expect(typeof result).toBe('function');
    await result(req, res, next);
    expect(res.send).toHaveBeenCalled();
  });

  it('should should send error response with given http code', async () => {
    event.mockRejectedValueOnce(new RestApiException('not found', HttpStatusCode.NotFound));
    const result = RequestHandler(event);
    expect(typeof result).toBe('function');
    await result(req, res, next);
    expect(res.status).toHaveBeenCalledWith(HttpStatusCode.NotFound);
    expect(res.send).toHaveBeenCalledWith({
      data: null, error: 'not found'
    });
    expect(spyOnLoggerException).not.toHaveBeenCalled();
  });

  it('should should send error response with http code internal server error', async () => {
    event.mockRejectedValueOnce(new Error('error'));
    const result = RequestHandler(event);
    expect(typeof result).toBe('function');
    await result(req, res, next);
    expect(res.status).toHaveBeenCalledWith(HttpStatusCode.InternalServerError);
    expect(res.send).toHaveBeenCalledWith({
      data: null, error: 'error'
    });
    expect(spyOnLoggerException).toHaveBeenCalled();
  });
});
