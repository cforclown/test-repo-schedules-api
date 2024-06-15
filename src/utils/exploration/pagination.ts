import Joi from 'joi';

export enum IPaginationSortOrders {
  ASC = -1,
  DESC = 1
}

export interface IPaginationSort {
  by: string;
  order: IPaginationSortOrders;
}

export interface IPaginationReq {
  page: number;
  limit: number;
  sort: IPaginationSort;
}

export interface IPaginationRes extends IPaginationReq {
  pageCount: number;
}

export const PaginationReq = Joi.object<IPaginationReq>({
  page: Joi.number().required(),
  limit: Joi.number().required(),
  sort: Joi.object({
    by: Joi.string().required(),
    order: Joi.number().valid(-1, 1).default(1)
  })
});

export const PaginationReqSwaggerSchemas = {
  paginationPayload: {
    page: { type: 'number', required: true },
    limit: { type: 'number', required: true },
    sort: {
      type: 'object',
      properties: {
        by: { type: 'string', required: true },
        order: {
          type: 'number',
          enum: [-1, 1],
          required: true
        }
      }
    }
  }
};
