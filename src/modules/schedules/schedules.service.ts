import { BaseService, IExplorationReq, IExplorationRes } from '@utils';
import { ISchedule, SchedulesDao } from '.';

export class SchedulesService extends BaseService<ISchedule> {
  public static readonly INSTANCE_NAME = 'schedulesService';

  private readonly schedulesDao: SchedulesDao;

  constructor (schedulesDao: SchedulesDao) {
    super(schedulesDao);

    this.schedulesDao = schedulesDao;
  }

  async explore (payload: IExplorationReq): Promise<IExplorationRes<ISchedule>> {
    return this.schedulesDao.explore(payload);
  }
}
