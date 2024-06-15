import { Request } from 'express';
import { HttpStatusCode } from 'axios';
import { RestApiException } from '@utils';
import { IUser, UsersService } from '.';

export class UsersController {
  public static readonly INSTANCE_NAME = 'usersController';

  private readonly usersService: UsersService;

  constructor (usersService: UsersService) {
    this.usersService = usersService;

    this.get = this.get.bind(this);
    this.getAll = this.getAll.bind(this);
    this.update = this.update.bind(this);
    this.delete = this.delete.bind(this);
  }

  async get ({ params }: Request): Promise<IUser> {
    const user = await this.usersService.get(params.id);
    if (!user) {
      throw new RestApiException('User not found', HttpStatusCode.NotFound);
    }
    return user;
  }

  async getAll (): Promise<IUser[]> {
    return this.usersService.getAll();
  }

  async update ({ user, body }: Request): Promise<IUser> {
    const updatedUser = await this.usersService.update((user as IUser).id, body);
    if (!updatedUser) {
      throw new RestApiException('User not found');
    }

    return updatedUser;
  }

  async changePassword ({ user, body }: Request): Promise<IUser> {
    const result = await this.usersService.changePassword((user as IUser).id, body);
    if (!result) {
      throw new RestApiException('User not found');
    }

    return result;
  }

  async delete ({ params }: Request): Promise<string> {
    const result = await this.usersService.delete(params.id);
    if (!result) {
      throw new RestApiException('User not found');
    }

    return result;
  }
}
