import Joi from 'joi';
import { IPaginationReq, IPaginationRes, PaginationReq, PaginationReqSwaggerSchemas } from './pagination';

export interface IExplorationReq {
  query?: string;
  pagination: IPaginationReq;
}

export interface IExplorationRes<T> {
  data: T[],
  exploration: IExplorationReq & {
    pagination: IPaginationRes
  }
}

export const ExplorationReqSchema = Joi.object<IExplorationReq>({
  query: Joi.string().allow(null, '').default(null),
  pagination: PaginationReq.required()
});

export const ExplorationSwaggerSchemas = {
  explorationReq: {
    query: { type: 'string' },
    pagination: { ...PaginationReqSwaggerSchemas }
  }
};
