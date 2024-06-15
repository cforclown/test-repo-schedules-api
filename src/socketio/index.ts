import { Server } from 'socket.io';
import { Server as HttpServer } from 'http';
import SIOController from './sio.controller';

function initSocketIO (server: HttpServer, sioController: SIOController): Server {
  const io = new Server(server, {
    cors: { origin: '*' }
  });

  io
    .use(sioController.authenticate)
    .on('connection', sioController.connection);

  return io;
}

export default initSocketIO;
