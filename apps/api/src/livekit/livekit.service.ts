import { Injectable, Logger } from '@nestjs/common';
import {
  AccessToken,
  VideoGrant,
} from 'livekit-server-sdk';

@Injectable()
export class LiveKitService {
  private readonly logger = new Logger(LiveKitService.name);
  private readonly apiKey: string;
  private readonly apiSecret: string;

  constructor() {
    this.apiKey = process.env.LIVEKIT_API_KEY || 'devkey';
    this.apiSecret = process.env.LIVEKIT_API_SECRET || 'devsecret';
    if (
      process.env.NODE_ENV === 'production' &&
      (!process.env.LIVEKIT_API_KEY || !process.env.LIVEKIT_API_SECRET)
    ) {
      throw new Error(
        'LIVEKIT_API_KEY and LIVEKIT_API_SECRET environment variables are required in production',
      );
    }
    if (!process.env.LIVEKIT_API_KEY || !process.env.LIVEKIT_API_SECRET) {
      this.logger.warn(
        'LIVEKIT_API_KEY/LIVEKIT_API_SECRET not set – using insecure dev defaults. Set these in production.',
      );
    }
  }

  /**
   * Create a token for the guide: can publish + subscribe in their group's room.
   */
  async createGuideToken(userId: number, groupId: number): Promise<string> {
    const roomName = `group_${groupId}`;
    const identity = `guide_${userId}`;
    const at = new AccessToken(this.apiKey, this.apiSecret, {
      identity,
      ttl: '4h',
    });
    const grant: VideoGrant = {
      room: roomName,
      roomJoin: true,
      canPublish: true,
      canSubscribe: true,
      canPublishData: true,
    };
    at.addGrant(grant);
    return await at.toJwt();
  }

  /**
   * Create a token for a listener: subscribe-only, cannot publish audio/video.
   */
  async createListenerToken(userId: number, groupId: number): Promise<string> {
    const roomName = `group_${groupId}`;
    const identity = `listener_${userId}`;
    const at = new AccessToken(this.apiKey, this.apiSecret, {
      identity,
      ttl: '4h',
    });
    const grant: VideoGrant = {
      room: roomName,
      roomJoin: true,
      canPublish: false,
      canSubscribe: true,
      canPublishData: false,
    };
    at.addGrant(grant);
    return await at.toJwt();
  }
}
