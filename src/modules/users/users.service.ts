import { hashPassword, RestApiException } from '@utils';
import { IChangePasswordPayload, ICreateUserPayload, IUpdateUserPayload, IUser, IUserDaoOpts, IUserRes, UsersDao } from '.';
import { ILoginReq } from '@modules';

export class UsersService {
  public static readonly INSTANCE_NAME = 'usersService';
  private readonly usersDao: UsersDao;

  constructor (usersDao: UsersDao) {
    this.usersDao = usersDao;
  }

  async authenticate ({ username, password }: ILoginReq): Promise<IUserRes | null> {
    return this.usersDao.authenticate({
      username,
      password: (await hashPassword(password))
    }, { plain: true });
  }

  get (userId: string, opts?: IUserDaoOpts): Promise<IUser | null> {
    return this.usersDao.get(userId, opts);
  }

  getAll (): Promise<IUser[]> {
    return this.usersDao.getAll();
  }

  async create (payload: ICreateUserPayload): Promise<IUser> {
    const [isUsernameTaken, isEmailRegistered] = await Promise.all([
      this.usersDao.getByUsername(payload.username),
      this.usersDao.getByEmail(payload.email)
    ]);
    if (isUsernameTaken) {
      throw new RestApiException('Username is taken');
    }
    if (isEmailRegistered) {
      throw new RestApiException('Email already registered');
    }

    return this.usersDao.create(payload, { plain: true });
  }

  async update (userId: string, payload: IUpdateUserPayload): Promise<IUser | null> {
    const [user, isUsernameTaken, isEmailRegistered] = await Promise.all([
      this.usersDao.get(userId),
      payload.username ? this.usersDao.getByUsername(payload.username) : false,
      payload.email ? this.usersDao.getByEmail(payload.email) : false
    ]);
    if (!user) {
      throw new RestApiException('User not found');
    }
    if (isUsernameTaken && user.username !== payload.username) {
      throw new RestApiException('Username is taken');
    }
    if (isEmailRegistered && user.email !== payload.email) {
      throw new RestApiException('Email already registered');
    }

    return this.usersDao.update({ id: userId, ...payload });
  }

  async changePassword (userId: string, payload: IChangePasswordPayload): Promise<IUserRes | null> {
    const user = await this.usersDao.get(userId);
    if (!user) {
      throw new RestApiException('User not found');
    }
    if (!(await this.usersDao.authenticate({
      username: user.username,
      password: (await hashPassword(payload.currentPassword))
    }))) {
      throw new RestApiException('Invalid password');
    }

    return this.usersDao.update({
      id: user._id,
      password: (await hashPassword(payload.newPassword))
    });
  }

  delete (userId: string): Promise<string | null> {
    return this.usersDao.delete(userId);
  }
}
