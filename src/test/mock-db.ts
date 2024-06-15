import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

class MockDB {
  mongod: MongoMemoryServer | null = null;

  async connect (): Promise<void> {
    this.mongod = await MongoMemoryServer.create();
    const uri = this.mongod.getUri();
    await mongoose.connect(uri, { dbName: 'mock-db-name' });
  }

  async close (): Promise<void> {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
    await this.mongod?.stop();
  }

  async clearDB (): Promise<void> {
    const { collections } = mongoose.connection;
    for (const key in collections) {
      const collection = collections[key];
      await collection.deleteMany({});
    }
  }
}

export default MockDB;
