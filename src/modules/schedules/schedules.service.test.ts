import { container, setup } from '../../di-config';
import { mockCreateSchedulePayload, mockSchedule, mockUpdateSchedulePayload } from '../../test/mock-schedules-data';
import { SchedulesService } from './schedules.service';

const mockSchedulesDaoGet = jest.fn();
const mockSchedulesDaoGetAll = jest.fn();
const mockSchedulesDaoGetCreate = jest.fn();
const mockSchedulesDaoGetUpdate = jest.fn();
const mockSchedulesDaoGetDelete = jest.fn();
jest.mock('./schedules.dao', () => ({
  SchedulesDao: jest.fn().mockImplementation(() => ({
    get: (payload: any): void => mockSchedulesDaoGet(payload),
    getAll: (payload: any): void => mockSchedulesDaoGetAll(payload),
    create: (payload: any): void => mockSchedulesDaoGetCreate(payload),
    update: (payload: any): void => mockSchedulesDaoGetUpdate(payload),
    delete: (payload: any): void => mockSchedulesDaoGetDelete(payload)
  }))
}));

jest.mock('mongoose', () => ({
  ...jest.requireActual('mongoose'),
  model: jest.fn().mockImplementation(() => ({}))
}));

describe('schedules-service', () => {
  mockSchedulesDaoGet.mockReturnValue(Promise.resolve(mockSchedule));
  mockSchedulesDaoGetAll.mockReturnValue(Promise.resolve([mockSchedule]));
  mockSchedulesDaoGetCreate.mockReturnValue(Promise.resolve(mockSchedule));
  mockSchedulesDaoGetUpdate.mockReturnValue(Promise.resolve(mockSchedule));
  mockSchedulesDaoGetDelete.mockImplementation((payload) => Promise.resolve(payload));

  let schedulesService: SchedulesService;

  beforeAll(() => {
    setup();
    schedulesService = container.resolve(SchedulesService.INSTANCE_NAME);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('get getAll', () => {
    it('should successfully return schedule', async () => {
      expect(await schedulesService.get(mockSchedule.id)).toEqual(mockSchedule);
      expect(await schedulesService.getAll()).toEqual([mockSchedule]);
    });

    it('should return null when schedule not found', async () => {
      mockSchedulesDaoGet.mockReturnValueOnce(null);

      expect(await schedulesService.get(mockSchedule.id)).toEqual(null);
    });
  });

  describe('create', () => {
    it('should successfully create a schedule', async () => {
      expect(await schedulesService.create(mockCreateSchedulePayload)).toEqual(mockSchedule);
    });
  });

  describe('update', () => {
    it('should successfully update a schedule', async () => {
      expect(await schedulesService.update(mockUpdateSchedulePayload)).toEqual(mockSchedule);
    });
  });

  describe('delete', () => {
    it('should successfully delete a schedule', async () => {
      expect(await schedulesService.delete('schedule-id')).toEqual('schedule-id');
    });
  });
});
