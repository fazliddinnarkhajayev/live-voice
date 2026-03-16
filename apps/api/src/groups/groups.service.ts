import {
  Injectable,
  Inject,
  NotFoundException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { randomBytes } from 'crypto';
import type { Knex } from 'knex';
import { KNEX_CONNECTION } from '../common/constants';
import { CreateGroupDto } from './dto/create-group.dto';

function randomCode(length = 8): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const charCount = chars.length; // 32 = 2^5, fits evenly in 256
  let code = '';
  // Use extra bytes to allow for rejection sampling
  while (code.length < length) {
    const bytes = randomBytes(length * 2);
    for (let i = 0; i < bytes.length && code.length < length; i++) {
      // Reject bytes that would create modulo bias (256 % 32 == 0, so no bias here, but kept for correctness)
      if (bytes[i] < Math.floor(256 / charCount) * charCount) {
        code += chars[bytes[i] % charCount];
      }
    }
  }
  return code;
}

@Injectable()
export class GroupsService {
  constructor(@Inject(KNEX_CONNECTION) private readonly knex: Knex) {}

  async createGroup(guideId: number, dto: CreateGroupDto) {
    const invite_code = randomCode();
    const [group] = await this.knex('groups')
      .insert({ name: dto.name, description: dto.description, guide_id: guideId, invite_code })
      .returning('*');
    return group;
  }

  async getGroup(groupId: number) {
    const group = await this.knex('groups').where({ id: groupId }).first();
    if (!group) throw new NotFoundException('Group not found');
    return group;
  }

  async getMyGroups(userId: number, role: string) {
    if (role === 'guide') {
      return this.knex('groups').where({ guide_id: userId });
    }
    return this.knex('groups')
      .join('memberships', 'groups.id', 'memberships.group_id')
      .where('memberships.user_id', userId)
      .select('groups.*');
  }

  async joinGroup(userId: number, inviteCode: string) {
    const group = await this.knex('groups').where({ invite_code: inviteCode }).first();
    if (!group) throw new NotFoundException('Group not found with that invite code');

    const existing = await this.knex('memberships')
      .where({ user_id: userId, group_id: group.id })
      .first();
    if (existing) throw new ConflictException('Already a member of this group');

    await this.knex('memberships').insert({ user_id: userId, group_id: group.id });
    return group;
  }

  async assertMembership(userId: number, groupId: number) {
    const group = await this.knex('groups').where({ id: groupId }).first();
    if (!group) throw new NotFoundException('Group not found');

    const isMember = await this.knex('memberships')
      .where({ user_id: userId, group_id: groupId })
      .first();
    if (!isMember) throw new ForbiddenException('Not a member of this group');
    return group;
  }

  async assertGuideOfGroup(guideId: number, groupId: number) {
    const group = await this.knex('groups').where({ id: groupId, guide_id: guideId }).first();
    if (!group) throw new ForbiddenException('Not the guide of this group');
    return group;
  }

  async getListenerCount(groupId: number): Promise<number> {
    const result = await this.knex('memberships')
      .where({ group_id: groupId })
      .count('id as count')
      .first();
    return parseInt(String(result?.count || '0'));
  }
}
