import { Request } from 'express';
import { BaseController, IExplorationRes } from '@utils';
import { ISchedule, SchedulesService } from '.';

export class SchedulesController extends BaseController<ISchedule> {
  public static readonly INSTANCE_NAME = 'schedulesController';

  private readonly schedulesService: SchedulesService;

  constructor (schedulesService: SchedulesService) {
    super(schedulesService);
    this.schedulesService = schedulesService;
    this.explore = this.explore.bind(this);
  }

  async explore ({ body }: Request): Promise<IExplorationRes<ISchedule>> {
    return this.schedulesService.explore(body);
  }
}
