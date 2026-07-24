import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Injectable } from '@nestjs/common';

@WebSocketGateway({
  cors: {
    origin: '*', // Fejlesztés alatt engedjük a 4200-as portról a csatlakozást
  },
})
@Injectable()
export class SyncEventsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server!: Server;

  handleConnection(client: Socket) {
    console.log(`Kliens csatlakozott a Socket-hez: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`Kliens lecsatlakozott: ${client.id}`);
  }

  // Ezt hívja meg a BullMQ Worker
  notifySyncCompleted(repoName: string) {
    this.server.emit('sync_completed', {
      repo: repoName,
      message: 'A szinkronizáció sikeresen befejeződött.',
      timestamp: new Date().toISOString(),
    });
  }
}