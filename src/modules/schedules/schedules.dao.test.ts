import mongoose, { Types } from 'mongoose';
import { ISchedule, SchedulesDao, schedulesSchema } from '.';
import { mockCreateSchedulePayload } from '../../test/mock-schedules-data';
import MockDB from '../../test/mock-db';
import { docToJSON, expectDocumentToEqual } from '../../test/test-utils';

describe('schedules-dao', () => {
  const db = new MockDB();
  mongoose.model<ISchedule>(SchedulesDao.MODEL_NAME, schedulesSchema);
  const schedulesDao = new SchedulesDao();

  beforeAll(async () => {
    await db.connect();
  });

  afterEach(async () => {
    await db.clearDB();
  });

  afterAll(async () => {
    await db.close();
  });

  it('create -> get, getAll', async () => {
    const doc = await schedulesDao.create(mockCreateSchedulePayload);
    expectDocumentToEqual(doc, {
      ...mockCreateSchedulePayload,
      start: mockCreateSchedulePayload.start.toISOString(),
      end: mockCreateSchedulePayload.end?.toISOString()
    });

    const getResult = await schedulesDao.get(doc.id);
    expectDocumentToEqual(getResult, doc);

    const getAllResult = await schedulesDao.getAll();
    expect(getAllResult.length).toEqual(1);
    expectDocumentToEqual(getAllResult[0], doc);
  });

  it('create -> update -> get', async () => {
    const doc = await schedulesDao.create(mockCreateSchedulePayload);
    expectDocumentToEqual(doc, {
      ...mockCreateSchedulePayload,
      start: mockCreateSchedulePayload.start.toISOString(),
      end: mockCreateSchedulePayload.end?.toISOString()
    });

    const updateResult = await schedulesDao.update({ id: doc.id, name: 'new name' });
    expectDocumentToEqual(updateResult, { ...docToJSON(doc), name: 'new name' }, { ignoreTimestamp: true });

    const getResult = await schedulesDao.get(doc.id);
    expectDocumentToEqual(getResult, updateResult);
  });

  it('create -> update (fail) -> get (same as before)', async () => {
    const doc = await schedulesDao.create(mockCreateSchedulePayload);
    expectDocumentToEqual(doc, {
      ...mockCreateSchedulePayload,
      start: mockCreateSchedulePayload.start.toISOString(),
      end: mockCreateSchedulePayload.end?.toISOString()
    });

    const updateResult = await schedulesDao.update({
      id: new Types.ObjectId().toString(),
      name: 'new name'
    });
    expect(updateResult).toEqual(null);

    const getResult = await schedulesDao.get(doc.id);
    expectDocumentToEqual(getResult, doc);
  });

  it('create -> delete (success) -> get (null)', async () => {
    const doc = await schedulesDao.create(mockCreateSchedulePayload);
    expectDocumentToEqual(doc, {
      ...mockCreateSchedulePayload,
      start: mockCreateSchedulePayload.start.toISOString(),
      end: mockCreateSchedulePayload.end?.toISOString()
    });

    const deletedExplorationId = await schedulesDao.delete(doc.id);
    expect(deletedExplorationId).toBeTruthy();

    const getResult = await schedulesDao.get(doc.id);
    expect(getResult).toEqual(null);
  });

  it('create -> delete (fail) -> get (exists)', async () => {
    const doc = await schedulesDao.create(mockCreateSchedulePayload);
    expectDocumentToEqual(doc, {
      ...mockCreateSchedulePayload,
      start: mockCreateSchedulePayload.start.toISOString(),
      end: mockCreateSchedulePayload.end?.toISOString()
    });

    const deletedExplorationId = await schedulesDao.delete(new Types.ObjectId().toString());
    expect(deletedExplorationId).toEqual(null);

    const getResult = await schedulesDao.get(doc.id);
    expectDocumentToEqual(getResult, doc);
  });
});
