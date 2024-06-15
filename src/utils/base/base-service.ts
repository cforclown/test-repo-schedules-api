import { BaseDataAccessObject } from './base-dao-mongo';

export abstract class BaseService<T> {
  protected readonly dao: BaseDataAccessObject<T>;

  constructor (dao: BaseDataAccessObject<T>) {
    this.dao = dao;
  }

  async get (id: string): Promise<T | null> {
    return this.dao.get(id);
  }

  async getAll (): Promise<T[]> {
    return this.dao.getAll();
  }

  async create (payload: Record<string, any>): Promise<T> {
    return this.dao.create(payload);
  }

  async update (payload: Record<string, any>): Promise<T | null> {
    return this.dao.update(payload);
  }

  async delete (id: string): Promise<T | null> {
    return this.dao.delete(id);
  }
}
