import type { Knex } from 'knex';
import * as bcrypt from 'bcryptjs';

export async function seed(knex: Knex): Promise<void> {
  // Clean up in reverse dependency order
  await knex('live_sessions').del();
  await knex('memberships').del();
  await knex('groups').del();
  await knex('users').del();

  const guideHash = await bcrypt.hash('guide1234', 10);
  const listenerHash = await bcrypt.hash('listen1234', 10);

  const [guide] = await knex('users')
    .insert({
      email: 'guide@demo.com',
      password_hash: guideHash,
      name: 'Demo Guide',
      role: 'guide',
    })
    .returning('*');

  const [listener] = await knex('users')
    .insert({
      email: 'listener@demo.com',
      password_hash: listenerHash,
      name: 'Demo Listener',
      role: 'listener',
    })
    .returning('*');

  const [group] = await knex('groups')
    .insert({
      name: 'Demo Tour Group',
      description: 'A demonstration tour group',
      guide_id: guide.id,
      invite_code: 'DEMO2024',
    })
    .returning('*');

  await knex('memberships').insert({
    user_id: listener.id,
    group_id: group.id,
  });

  console.log('Seed complete:');
  console.log('  Guide:    guide@demo.com    / guide1234');
  console.log('  Listener: listener@demo.com / listen1234');
  console.log('  Group invite code: DEMO2024');
}
