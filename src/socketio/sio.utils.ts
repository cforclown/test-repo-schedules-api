import { Socket } from 'socket.io';
import { ObjectSchema } from 'joi';
import { dro, Logger } from '@utils';
import { IUser } from '@modules';

export interface ExtSocket extends Socket {
  userContext: { user: IUser };
}

export interface IEventPayloadWrapper<T> {
  data: T;
}

type SocketIOEventHandler<T> = (payload?: IEventPayloadWrapper<T>) => Promise<void>
export type EventHandlerWithPayload<T> = (socket: ExtSocket, payload: IEventPayloadWrapper<T>) => Promise<void>
export type EventHandlerWithoutPayload = (socket: ExtSocket) => Promise<void>
export type EventHandler<T> = EventHandlerWithPayload<T> | EventHandlerWithoutPayload

export const socketioEventHandlerWrapper = <T, H extends EventHandler<T>>(
  eventName: string,
  socket: ExtSocket,
  handler: H,
  schema?: ObjectSchema
): SocketIOEventHandler<T> | (() => Promise<void>) => {
  if (schema) {
    return async (payload?: IEventPayloadWrapper<T>): Promise<void> => {
      try {
        if (!payload) {
          socket.emit(eventName, dro.error('Payload not found'));
          return;
        }
        const { error } = schema.validate(payload.data);
        if (error) {
          Logger.error(error);
          socket.emit(eventName, dro.error(error.details.map(er => er.message).join(', ')));
          return;
        }

        (handler as EventHandlerWithPayload<T>)(socket, payload);
      } catch (err: any) {
        Logger.exception(err);
        socket.emit(eventName, dro.error(err.message ?? 'Unexpected error occured'));
      }
    };
  }

  return async (): Promise<void> => {
    try {
      (handler as EventHandlerWithoutPayload)(socket);
    } catch (err: any) {
      Logger.exception(err);
      socket.emit(eventName, dro.error(err.message ?? 'Unexpected error occured'));
    }
  };
};

export const registerEvent = <T, H extends EventHandler<T>>(
  socket: ExtSocket,
  eventName: string,
  handler: H,
  schema?: ObjectSchema
): void => {
  socket.on(
    eventName,
    socketioEventHandlerWrapper<T, H>(
      eventName,
      socket,
      handler,
      schema
    )
  );
};
