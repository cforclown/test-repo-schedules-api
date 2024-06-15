import { Router } from 'express';
import { CreateSchedulePayloadSchema, SchedulesController, UpdateSchedulePayloadSchema } from '.';
import { ExplorationReqSchema, RequestHandler, validateBody, validateParams } from '@utils';
import { idSchema } from '../../schemas';

export const SCHEDULES_ROUTER_INSTANCE_NAME = 'schedulesRouter';
export const SCHEDULES_BASE_API_PATH = 'schedules';

export function SchedulesRouter (schedulesController: SchedulesController): Router {
  const router = Router();

  /**
   * @swagger
   * /api/v1/schedules/{id}:
   *      get:
   *          tags:
   *              - Schedules
   *          description: Get schedule
   *          responses:
   *              '200':
   *                  description: OK
   *          parameters:
   *              -   name: id
   *                  in: path
   *                  required: true
   */
  router.get('/:id', validateParams(idSchema), RequestHandler(schedulesController.get));

  /**
   * @swagger
   * /api/v1/schedules:
   *      get:
   *          tags:
   *              - Schedules
   *          description: Get all schedules
   *          responses:
   *              '200':
   *                  description: OK
   */
  router.get('/', RequestHandler(schedulesController.getAll));

  /**
   * @swagger
   * /api/v1/schedules/explore:
   *      post:
   *          tags:
   *              - Schedules
   *          description: Explore schedules with pagination
   *          responses:
   *              '200':
   *                  description: OK
   *          requestBody:
   *              description: "Exploration payload"
   *              required: true
   *              content:
   *                  application/json:
   *                      schema:
   *                          $ref: '#/components/schemas/explorationPayload'
   */
  router.post('/explore', validateBody(ExplorationReqSchema), RequestHandler(schedulesController.explore));

  /**
   * @swagger
   * /api/v1/schedules:
   *      post:
   *          tags:
   *              - Schedules
   *          description: Create schedule
   *          responses:
   *              '200':
   *                  description: OK
   *          requestBody:
   *              description: "Create schedule payload"
   *              required: true
   *              content:
   *                  application/json:
   *                      schema:
   *                          $ref: '#/components/schemas/createSchedule'
   */
  router.post('/', validateBody(CreateSchedulePayloadSchema), RequestHandler(schedulesController.create));

  /**
   * @swagger
   * /api/v1/schedules:
   *      patch:
   *          tags:
   *              - Schedules
   *          description: Update schedule
   *          responses:
   *              '200':
   *                  description: OK
   *          requestBody:
   *              description: "Update schedule payload"
   *              required: true
   *              content:
   *                  application/json:
   *                      schema:
   *                          $ref: '#/components/schemas/updateSchedule'
   */
  router.patch('/', validateBody(UpdateSchedulePayloadSchema), RequestHandler(schedulesController.update));

  /**
   * @swagger
   * /api/v1/schedules:
   *      delete:
   *          tags:
   *              - Schedules
   *          description: Delete schedule
   *          responses:
   *              '200':
   *                  description: OK
   *          parameters:
   *              -   name: id
   *                  in: path
   *                  required: true
   */
  router.delete('/:id', RequestHandler(schedulesController.delete));

  return router;
}
