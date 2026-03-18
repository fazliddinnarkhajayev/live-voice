import {
  Injectable,
  Inject,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import type { Knex } from 'knex';
import { KNEX_CONNECTION } from '../common/constants';
import { LiveKitService } from '../livekit/livekit.service';
import { GroupsService } from '../groups/groups.service';

@Injectable()
export class SessionsService {
  constructor(
    @Inject(KNEX_CONNECTION) private readonly knex: Knex,
    private readonly livekitService: LiveKitService,
    private readonly groupsService: GroupsService,
  ) {}

  async startSession(guideId: number, groupId: number) {
    // Assert guide owns this group
    await this.groupsService.assertGuideOfGroup(guideId, groupId);

    // End any existing active session
    await this.knex('live_sessions')
      .where({ group_id: groupId, status: 'active' })
      .update({ status: 'ended', ended_at: this.knex.fn.now() });

    const roomName = `group_${groupId}`;
    const [session] = await this.knex('live_sessions')
      .insert({ group_id: groupId, guide_id: guideId, livekit_room: roomName, status: 'active' })
      .returning('*');

    const token = await this.livekitService.createGuideToken(guideId, groupId);
    const listenerCount = await this.groupsService.getListenerCount(groupId);

    return {
      session,
      token,
      livekit_url: process.env.LIVEKIT_URL || 'ws://localhost:7880',
      room: roomName,
      listener_count: listenerCount,
    };
  }

  async joinSession(listenerId: number, groupId: number) {
    // Assert listener is a member of this group
    await this.groupsService.assertMembership(listenerId, groupId);

    const session = await this.knex('live_sessions')
      .where({ group_id: groupId, status: 'active' })
      .first();
    if (!session) throw new NotFoundException('No active session for this group');

    const token = await this.livekitService.createListenerToken(listenerId, groupId);

    return {
      session,
      token,
      livekit_url: process.env.LIVEKIT_URL || 'ws://localhost:7880',
      room: `group_${groupId}`,
    };
  }

  async endSession(guideId: number, groupId: number) {
    await this.groupsService.assertGuideOfGroup(guideId, groupId);

    const updated = await this.knex('live_sessions')
      .where({ group_id: groupId, guide_id: guideId, status: 'active' })
      .update({ status: 'ended', ended_at: this.knex.fn.now() })
      .returning('*');

    if (!updated.length) throw new NotFoundException('No active session to end');

    return { message: 'Session ended', session: updated[0] };
  }

  async getActiveSession(groupId: number) {
    const session = await this.knex('live_sessions')
      .where({ group_id: groupId, status: 'active' })
      .first();
    return { active: !!session, session: session || null };
  }
}
