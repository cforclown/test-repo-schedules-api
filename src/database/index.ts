import mongoose from 'mongoose';
import { Environment } from '@utils';
import { schedulesSchema, usersSchema } from '@modules';

class Database {
  public static readonly INSTANCE_NAME = 'database';

  constructor () {
    this.connect = this.connect.bind(this);
    this.registerModels();
  }

  async connect (): Promise<void> {
    await mongoose.connect(Environment.getDBConnectionString());
  }

  close (): void {
    mongoose.disconnect();
  }

  registerModels (): void {
    mongoose.model('users', usersSchema);
    mongoose.model('schedules', schedulesSchema);
  }
}

export default Database;
