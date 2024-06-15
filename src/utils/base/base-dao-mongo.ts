import { Model } from 'mongoose';

export abstract class BaseDataAccessObject<T> {
  protected readonly model: Model<T>;

  constructor (model: Model<T>) {
    this.model = model;
  }

  async get (id: string): Promise<T | null> {
    return this.model.findById(id).exec();
  }

  async getAll (): Promise<T[]> {
    return this.model.find({ }).exec();
  }

  async create (payload: Record<string, any> & { id?: string; }): Promise<T> {
    return this.model.create({ ...payload });
  }

  async update (payload: Record<string, any>): Promise<T | null> {
    return this.model.findOneAndUpdate({ _id: payload.id }, { ...payload }, { new: true }).exec();
  }

  async delete (id: string): Promise<T | null> {
    return this.model.findOneAndDelete({ _id: id }, { new: true }).exec();
  }
}
