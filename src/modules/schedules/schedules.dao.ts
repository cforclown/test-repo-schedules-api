import { ISchedule } from '.';
import { BaseDataAccessObject, IExplorationReq, IExplorationRes } from '@utils';
import { model } from 'mongoose';

export class SchedulesDao extends BaseDataAccessObject<ISchedule> {
  public static readonly INSTANCE_NAME = 'schedulesDao';
  public static readonly MODEL_NAME = 'schedules';

  constructor () {
    super(model<ISchedule>(SchedulesDao.MODEL_NAME));
  }

  async explore ({ query, pagination }: IExplorationReq): Promise<IExplorationRes<ISchedule>> {
    const result = await this.model
      .aggregate([
        {
          $match: {
            $or: [
              { name: { $regex: query ?? '', $options: 'i' } },
              { start: { $regex: query ?? '', $options: 'i' } },
              { end: { $regex: query ?? '', $options: 'i' } },
              { desc: { $regex: query ?? '', $options: 'i' } }
            ]
          }
        },
        {
          $sort: {
            [pagination.sort.by]: pagination.sort.order
          }
        },
        {
          $addFields: {
            id: '$_id'
          }
        },
        {
          $facet: {
            metadata: [
              { $count: 'total' },
              { $addFields: { page: pagination.page } }
            ],
            data: [
              { $skip: (pagination.page - 1) * pagination.limit },
              { $limit: pagination.limit }
            ]
          }
        }
      ])
      .exec();

    const response = {
      data: [],
      exploration: {
        query,
        pagination: {
          ...pagination,
          pageCount: 0
        }
      }
    };

    if (result[0].metadata.length && result[0].data.length) {
      response.data = result[0].data;
      response.exploration.pagination.pageCount = Math.ceil(result[0].metadata[0].total / pagination.limit);
    }

    return response;
  }
}
