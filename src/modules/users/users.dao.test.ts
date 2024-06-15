import { hashPassword } from '@utils';
import { IUser, UsersDao, usersSchema } from '.';
import { mockCreateUserPayload } from '../../test/mock-users-data';
import MockDB from '../../test/mock-db';
import { model, Types } from 'mongoose';
import { docToJSON, expectDocumentToEqual } from '../../test/test-utils';

describe('users-dao', () => {
  const db = new MockDB();
  model<IUser>(UsersDao.MODEL_NAME, usersSchema);

  const usersDao = new UsersDao();

  beforeAll(async () => {
    await db.connect();
  });

  afterEach(async () => {
    jest.clearAllMocks();
    await db.clearDB();
  });

  afterAll(async () => {
    await db.close();
  });

  it('create -> get, authenticate, getByUsername, getByEmail, getAll', async () => {
    const doc = await usersDao.create(mockCreateUserPayload);
    expectDocumentToEqual(doc, mockCreateUserPayload, { excludeFields: ['password'] });

    let getResult = await usersDao.get(doc.id);
    expectDocumentToEqual(getResult, doc, { excludeFields: ['password'] });
    getResult = await usersDao.authenticate({
      username: doc.username,
      password: await hashPassword(mockCreateUserPayload.password as string)
    });

    getResult = await usersDao.getByUsername(doc.username);
    expectDocumentToEqual(getResult, doc, { excludeFields: ['password'] });

    getResult = await usersDao.getByEmail(doc.email);
    expectDocumentToEqual(getResult, doc, { excludeFields: ['password'] });

    const [getAllResult] = await usersDao.getAll();
    expectDocumentToEqual(getAllResult, doc, { excludeFields: ['password'] });
  });

  it('create -> get -> update -> get', async () => {
    const doc = await usersDao.create(mockCreateUserPayload);
    expectDocumentToEqual(doc, mockCreateUserPayload, { excludeFields: ['password'] });

    let getResult = await usersDao.get(doc.id);
    expectDocumentToEqual(getResult, doc, { excludeFields: ['password'] });

    const updateResult = await usersDao.update({ id: doc.id, username: 'new-name' });
    expectDocumentToEqual(updateResult, { ...docToJSON(doc), username: 'new-name' }, { excludeFields: ['password'] });

    getResult = await usersDao.get(doc.id);
    expectDocumentToEqual(getResult, updateResult, { excludeFields: ['password'] });
  });

  it('create -> get -> update (fail) -> get (no changes)', async () => {
    const doc = await usersDao.create(mockCreateUserPayload);
    expectDocumentToEqual(doc, mockCreateUserPayload, { excludeFields: ['password'] });

    let getResult = await usersDao.get(doc.id);
    expectDocumentToEqual(getResult, doc, { excludeFields: ['password'] });

    const updateResult = await usersDao.update({ id: new Types.ObjectId().toString(), username: 'new-name' });
    expect(updateResult).toEqual(null);

    getResult = await usersDao.get(doc.id);
    expectDocumentToEqual(doc, mockCreateUserPayload, { excludeFields: ['password'] });
  });

  it('create -> get -> delete -> get (return null)', async () => {
    const doc = await usersDao.create(mockCreateUserPayload);
    expectDocumentToEqual(doc, mockCreateUserPayload, { excludeFields: ['password'] });

    let getResult = await usersDao.get(doc.id);
    expectDocumentToEqual(getResult, doc, { excludeFields: ['password'] });

    const deleteResult = await usersDao.delete(doc.id);
    expect(deleteResult?.toString()).toEqual(doc.id);

    getResult = await usersDao.get(doc.id);
    expect(getResult).toEqual(null);
  });

  it('create -> get -> delete (fail) -> get (still exist)', async () => {
    const doc = await usersDao.create(mockCreateUserPayload);
    expectDocumentToEqual(doc, mockCreateUserPayload, { excludeFields: ['password'] });

    let getResult = await usersDao.get(doc.id);
    expectDocumentToEqual(getResult, doc, { excludeFields: ['password'] });

    const deleteResult = await usersDao.delete(new Types.ObjectId().toString());
    expect(deleteResult).toEqual(null);

    getResult = await usersDao.get(doc.id);
    expectDocumentToEqual(getResult, doc, { excludeFields: ['password'] });
  });
});
