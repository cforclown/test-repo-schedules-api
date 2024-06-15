import { model, Model } from 'mongoose';
import { ICreateUserPayload, IUpdateUserPayload, IUser, IUserRes } from './users.schema';
import { ILoginReq } from '../auth';

export interface IUserDaoOpts {
  withPassword?: boolean;
  plain?: boolean;
}

export class UsersDao {
  public static readonly INSTANCE_NAME = 'usersDao';
  public static readonly MODEL_NAME = 'users'

  private readonly model: Model<IUser>;

  constructor () {
    this.model = model<IUser>('users');
  }

  async authenticate ({ username, password }: ILoginReq, opts?: IUserDaoOpts): Promise<IUserRes | null> {
    const user = await this.model.findOne({
      $or: [
        { username },
        { email: username }
      ],
      password,
      archived: false
    }).select('-password').exec();

    if (!user) {
      return null;
    }

    if (opts?.plain) {
      return user.toObject();
    }

    return user;
  }

  async get (userId: string, opts?: IUserDaoOpts): Promise<IUserRes | null> {
    const user = await this.model.findOne({ _id: userId, archived: false }).select('-password').exec();
    if (!user) {
      return null;
    }

    if (opts?.plain) {
      return user.toObject();
    }

    return user;
  }

  async getByUsername (username: string): Promise<IUser | null> {
    return this.model.findOne({ username, archived: false }).select('-password').exec();
  }

  async getByEmail (email: string): Promise<IUser | null> {
    return this.model.findOne({ email, archived: false }).select('-password').exec();
  }

  async getAll (): Promise<IUser[]> {
    return this.model.find({ archived: false }).exec();
  }

  async create (payload: ICreateUserPayload, opts?: IUserDaoOpts): Promise<IUser> {
    const user = await this.model.create({ ...payload });
    delete user.password;

    if (opts?.plain) {
      return user.toObject();
    }

    return user;
  }

  async update (payload: IUpdateUserPayload & { id: string, password?: string }): Promise<IUser | null> {
    return this.model.findOneAndUpdate({ _id: payload.id }, { ...payload }, { new: true }).exec();
  }

  async delete (userId: string): Promise<string | null> {
    const deletedUser = await this.model.findOneAndUpdate({ _id: userId }, { archived: true }).exec();
    if (!deletedUser) {
      return null;
    }

    return deletedUser._id;
  }
}
