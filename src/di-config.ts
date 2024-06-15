import { asClass, asFunction, createContainer, InjectionMode } from 'awilix';
import {
  AUTH_ROUTER_INSTANCE_NAME,
  AuthController,
  AuthRouter,
  AuthService,
  SCHEDULES_ROUTER_INSTANCE_NAME,
  SchedulesController,
  SchedulesDao,
  SchedulesRouter,
  SchedulesService,
  USERS_ROUTER_INSTANCE_NAME,
  UsersController,
  UsersDao,
  UsersRouter,
  UsersService
} from '@modules';
import App from './app';
import Database from './database';
import { MainRouter } from './app/routers';
import { ApiRouter } from './app/routers/api';
import SIOController from './socketio/sio.controller';
import SIOService from './socketio/sio.service';

export const container = createContainer({
  injectionMode: InjectionMode.CLASSIC
});

export function setup (): void {
  container.register({
    app: asFunction(App),
    mainRouter: asFunction(MainRouter),
    apiRouter: asFunction(ApiRouter),
    [Database.INSTANCE_NAME]: asClass(Database),
    [SIOController.INSTANCE_NAME]: asClass(SIOController),
    [SIOService.INSTANCE_NAME]: asClass(SIOService),
    [AUTH_ROUTER_INSTANCE_NAME]: asFunction(AuthRouter),
    [AuthController.INSTANCE_NAME]: asClass(AuthController),
    [AuthService.INSTANCE_NAME]: asClass(AuthService),
    [USERS_ROUTER_INSTANCE_NAME]: asFunction(UsersRouter),
    [UsersController.INSTANCE_NAME]: asClass(UsersController),
    [UsersService.INSTANCE_NAME]: asClass(UsersService),
    usersDao: asClass(UsersDao),
    [SCHEDULES_ROUTER_INSTANCE_NAME]: asFunction(SchedulesRouter),
    [SchedulesController.INSTANCE_NAME]: asClass(SchedulesController),
    [SchedulesService.INSTANCE_NAME]: asClass(SchedulesService),
    schedulesDao: asClass(SchedulesDao)
  });
}
