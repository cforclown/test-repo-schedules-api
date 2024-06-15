import { Socket } from 'socket.io';
import { TokenExpiredError } from 'jsonwebtoken';
import { HttpStatusCode } from 'axios';
import SIOService from './sio.service';
import { ExtSocket } from './sio.utils';
import { dro, Logger, RestApiException } from '@utils';
import { IUser } from '@modules';

class SIOController {
  static readonly INSTANCE_NAME = 'sioController';

  sioService: SIOService;

  constructor (sioService: SIOService) {
    this.sioService = sioService;

    this.authenticate = this.authenticate.bind(this);
    this.connection = this.connection.bind(this);
  }

  async authenticate (socket: Socket, next: (args?: any) => void): Promise<void> {
    try {
      const { accessToken, refreshToken } = socket.handshake.auth;
      if (!accessToken) {
        next(new Error('Access token not found'));
      }

      let userContext: { user: IUser } | undefined;
      try {
        const user = await this.sioService.verifyAccessToken(accessToken as string);
        userContext = { user };
      } catch (err) {
        if (err instanceof TokenExpiredError) {
          const newToken = await this.sioService.refreshUserToken(refreshToken);
          socket.emit('new-access-token', dro.response(newToken));
          userContext = {
            user: newToken.user
          };
        }
      }
      if (!userContext) {
        throw new Error('Unauthorized');
      }
      const extsocket = <ExtSocket>socket;
      extsocket.userContext = userContext;

      next();
    } catch (err) {
      if (err instanceof Error) {
        Logger.danger(err.message);
        next(new RestApiException(err.message, HttpStatusCode.Unauthorized));
        socket.disconnect(true);
      }
    }
  }

  async connection (socket: any): Promise<void> {
    Logger.success('NEW CONNECTION: ' + socket.id);

    socket.use((packet: any, next: any) => {
      try {
        Logger.info(packet[0]);
      } catch (err: any) {
        Logger.error(err.message);
      } finally {
        next();
      }
    });
  }
}

export default SIOController;
