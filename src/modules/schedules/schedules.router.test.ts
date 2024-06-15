import { Express } from 'express';
import request from 'supertest';
import { HttpStatusCode } from 'axios';
import { container, setup } from '../../di-config';
import { Environment, RestApiException } from '@utils';
import { mockExplorationPayload, mockSchedule, mockUpdateSchedulePayload } from '../../test/mock-schedules-data';
import { mockUser } from '../../test/mock-users-data';

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

const mockSchedulesDaoGet = jest.fn();
const mockSchedulesDaoGetAll = jest.fn();
const mockSchedulesDaoExplore = jest.fn();
const mockSchedulesDaoCreate = jest.fn();
const mockSchedulesDaoUpdate = jest.fn();
const mockSchedulesDaoDelete = jest.fn();
jest.mock('./schedules.dao', () => ({
  SchedulesDao: jest.fn().mockImplementation(() => ({
    get: (payload: any): void => mockSchedulesDaoGet(payload),
    getAll: (payload: any): void => mockSchedulesDaoGetAll(payload),
    explore: (payload: any): void => mockSchedulesDaoExplore(payload),
    create: (payload: any): void => mockSchedulesDaoCreate(payload),
    update: (payload: any): void => mockSchedulesDaoUpdate(payload),
    delete: (payload: any): void => mockSchedulesDaoDelete(payload)
  }))
}));

describe('schedules-router', () => {
  mockSchedulesDaoGet.mockResolvedValue(mockSchedule);
  mockSchedulesDaoGetAll.mockResolvedValue([mockSchedule]);
  mockSchedulesDaoExplore.mockImplementation((payload) => ({
    data: [mockSchedule],
    exploration: payload
  }));
  mockSchedulesDaoCreate.mockResolvedValue(mockSchedule);
  mockSchedulesDaoUpdate.mockResolvedValue(mockSchedule);
  mockSchedulesDaoDelete.mockImplementation((payload) => Promise.resolve(payload));

  mockJWTVerify.mockReturnValue(mockUser);

  let app: Express;

  beforeAll(() => {
    setup();
    app = container.resolve('app');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('get', () => {
    it('should successfully return schedule', async () => {
      const response = await request(app)
        .get(`/api/${Environment.getApiVersion()}/schedules/${mockSchedule.id}`)
        .set({ Authorization: 'Bearer fake-access-token' })
        .expect(HttpStatusCode.Ok);

      expect(response).toHaveProperty('text');
      const body = JSON.parse(response.text);
      expect(body).toHaveProperty('data');
      expect(body.data).toEqual({
        ...mockSchedule,
        start: mockSchedule.start.toISOString(),
        end: mockSchedule.end?.toISOString()
      });
    });

    it('should return 404 when schedule not found', async () => {
      mockSchedulesDaoGet.mockReturnValueOnce(Promise.resolve(null));
      await request(app)
        .get(`/api/${Environment.getApiVersion()}/schedules/${mockSchedule.id}`)
        .set({ Authorization: 'Bearer fake-access-token' })
        .expect(HttpStatusCode.NotFound);
    });
  });

  describe('getAll', () => {
    it('should successfully get all schedules', async () => {
      const response = await request(app)
        .get(`/api/${Environment.getApiVersion()}/schedules`)
        .set({ Authorization: 'Bearer fake-access-token' })
        .expect(HttpStatusCode.Ok);
      expect(response).toHaveProperty('text');
      const body = JSON.parse(response.text);
      expect(body).toHaveProperty('data');
      expect(body.data).toEqual([{
        ...mockSchedule,
        start: mockSchedule.start.toISOString(),
        end: mockSchedule.end?.toISOString()
      }]);
    });

    it('should return empty', async () => {
      mockSchedulesDaoGetAll.mockReturnValueOnce(Promise.resolve([]));

      const response = await request(app)
        .get(`/api/${Environment.getApiVersion()}/schedules`)
        .set({ Authorization: 'Bearer fake-access-token' })
        .expect(HttpStatusCode.Ok);
      expect(response).toHaveProperty('text');
      const body = JSON.parse(response.text);
      expect(body).toHaveProperty('data');
      expect(body.data).toEqual([]);
    });

    it('should return internal server error', async () => {
      mockSchedulesDaoGetAll.mockRejectedValueOnce(new Error('error'));

      await request(app)
        .get(`/api/${Environment.getApiVersion()}/schedules`)
        .set({ Authorization: 'Bearer fake-access-token' })
        .expect(HttpStatusCode.InternalServerError);
    });
  });

  describe('explore', () => {
    it('should successfully get schedules with correct exploration payload', async () => {
      const response = await request(app)
        .post(`/api/${Environment.getApiVersion()}/schedules/explore`)
        .send(mockExplorationPayload)
        .set({ Authorization: 'Bearer fake-access-token' })
        .expect(HttpStatusCode.Ok);
      expect(response).toHaveProperty('text');
      const body = JSON.parse(response.text);
      expect(body).toHaveProperty('data');
      expect(body.data).toEqual({
        data: [{
          ...mockSchedule,
          start: mockSchedule.start.toISOString(),
          end: mockSchedule.end?.toISOString()
        }],
        exploration: {
          ...mockExplorationPayload,
          pagination: {
            ...mockExplorationPayload.pagination,
            sort: {
              ...mockExplorationPayload.pagination.sort,
              order: mockExplorationPayload.pagination.sort.order
            }
          }
        }
      });
    });

    it('should return internal server error', async () => {
      mockSchedulesDaoGetAll.mockRejectedValueOnce(new Error('error'));

      await request(app)
        .get(`/api/${Environment.getApiVersion()}/schedules`)
        .set({ Authorization: 'Bearer fake-access-token' })
        .expect(HttpStatusCode.InternalServerError);
    });
  });

  describe('update', () => {
    it('should successfully update schedule', async () => {
      const response = await request(app)
        .patch(`/api/${Environment.getApiVersion()}/schedules`)
        .send(mockUpdateSchedulePayload)
        .set({ Authorization: 'Bearer fake-access-token' })
        .expect(HttpStatusCode.Ok);
      expect(response).toHaveProperty('text');
      const body = JSON.parse(response.text);
      expect(body).toHaveProperty('data');
      expect(body.data).toEqual({
        ...mockSchedule,
        start: mockSchedule.start.toISOString(),
        end: mockSchedule.end?.toISOString()
      });
    });

    it('should successfully update schedule when only some of the field is provided', async () => {
      const response = await request(app)
        .patch(`/api/${Environment.getApiVersion()}/schedules`)
        .send({
          id: 'schedule-id',
          name: 'new-name'
        })
        .set({ Authorization: 'Bearer fake-access-token' })
        .expect(HttpStatusCode.Ok);
      expect(response).toHaveProperty('text');
      const body = JSON.parse(response.text);
      expect(body).toHaveProperty('data');
      expect(body.data).toEqual({
        ...mockSchedule,
        start: mockSchedule.start.toISOString(),
        end: mockSchedule.end?.toISOString()
      });
    });

    it('should fail update schedule when schedule not found', async () => {
      mockSchedulesDaoUpdate.mockResolvedValueOnce(null);

      await request(app)
        .patch(`/api/${Environment.getApiVersion()}/schedules`)
        .send(mockUpdateSchedulePayload)
        .set({ Authorization: 'Bearer fake-access-token' })
        .expect(HttpStatusCode.NotFound);
    });
  });

  describe('delete', () => {
    it('should successfully delete a schedule', async () => {
      const response = await request(app)
        .delete(`/api/${Environment.getApiVersion()}/schedules/${mockSchedule.id}`)
        .set({ Authorization: 'Bearer fake-access-token' })
        .expect(HttpStatusCode.Ok);
      expect(response).toHaveProperty('text');
      const body = JSON.parse(response.text);
      expect(body).toHaveProperty('data');
      expect(body.data).toEqual(mockSchedule.id);
    });

    it('should throw an error when data access object throw an error', async () => {
      mockSchedulesDaoDelete.mockRejectedValueOnce(new RestApiException('internal server error', 500));
      await request(app)
        .delete(`/api/${Environment.getApiVersion()}/schedules/${mockSchedule.id}`)
        .set({ Authorization: 'Bearer fake-access-token' })
        .expect(HttpStatusCode.InternalServerError);
    });
  });
});
