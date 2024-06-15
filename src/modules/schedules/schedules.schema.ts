import { Schema } from 'mongoose';
import Joi from 'joi';
import { WithRequired } from '@utils';

export interface ISchedule {
  _id: string;
  id: string;
  name: string;
  start: Date;
  end?: Date;
  desc?: string;
}

export type ICreateSchedulePayload = Omit<ISchedule, '_id' | 'id'>;

export type IUpdateSchedulePayload = WithRequired<Partial<ISchedule>, '_id' | 'id'>;

export const schedulesSchema = new Schema<ISchedule>({
  name: { type: String, required: true },
  start: { type: Date, required: true },
  end: { type: Date, required: false, default: null },
  desc: { type: String, required: false, default: null }
});

// virtualize _id to id when doing query
schedulesSchema.virtual('id').get(function () {
  return this._id.toString();
});

// Ensure virtual fields are serialised.
schedulesSchema.set('toJSON', {
  virtuals: true
});

export const CreateSchedulePayloadSchema = Joi.object({
  name: Joi.string().required(),
  start: Joi.date().required(),
  end: Joi.date().allow('').default(null),
  desc: Joi.string().allow('').default(null)
});

export const UpdateSchedulePayloadSchema = Joi.object({
  id: Joi.string().required(),
  _id: Joi.string(),
  name: Joi.string(),
  start: Joi.date(),
  end: Joi.date().allow('').default(null),
  desc: Joi.string().allow('').default(null)
});

export const SchedulesSwaggerSchemas = {
  createSchedule: {
    type: 'object',
    properties: {
      name: { type: 'string', required: true },
      start: { type: 'date', required: true },
      end: { type: 'date' },
      desc: { type: 'string' }
    }
  },
  updateSchedule: {
    type: 'object',
    properties: {
      _id: { type: 'string' },
      id: { type: 'string' },
      name: { type: 'string' },
      start: { type: 'date' },
      end: { type: 'date' },
      desc: { type: 'string' }
    }
  }
};
