import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';

@WebSocketGateway({
  cors: { origin: '*' },
  namespace: '/',
})
export class AppGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private listenerCounts: Map<number, Set<string>> = new Map();

  constructor(
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService,
  ) {}

  async handleConnection(client: Socket) {
    try {
      const token =
        client.handshake.auth?.token ||
        client.handshake.headers?.authorization?.replace('Bearer ', '');
      if (!token) {
        client.emit('error', { message: 'Authentication token required' });
        client.disconnect();
        return;
      }
      const payload = this.jwtService.verify(token);
      client.data.user = await this.usersService.findById(payload.sub);
    } catch {
      client.emit('error', { message: 'Invalid or expired token' });
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    const groupId = client.data.groupId;
    if (groupId && client.data.user?.role === 'listener') {
      const set = this.listenerCounts.get(groupId);
      if (set) {
        set.delete(client.id);
        this.server.to(`group_${groupId}`).emit('listener_count', { count: set.size });
      }
    }
  }

  @SubscribeMessage('join_group_room')
  handleJoinGroupRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { groupId: number },
  ) {
    const groupId = data.groupId;
    client.data.groupId = groupId;
    client.join(`group_${groupId}`);

    if (client.data.user?.role === 'listener') {
      if (!this.listenerCounts.has(groupId)) {
        this.listenerCounts.set(groupId, new Set());
      }
      this.listenerCounts.get(groupId)!.add(client.id);
      const count = this.listenerCounts.get(groupId)!.size;
      this.server.to(`group_${groupId}`).emit('listener_count', { count });
    }
  }

  broadcastSessionStatus(groupId: number, status: 'started' | 'ended', listenerCount?: number) {
    this.server.to(`group_${groupId}`).emit('session_status', { status, listener_count: listenerCount || 0 });
  }
}
