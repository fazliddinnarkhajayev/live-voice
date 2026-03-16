import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('live_sessions', (table) => {
    table.increments('id').primary();
    table.integer('group_id').notNullable().references('id').inTable('groups').onDelete('CASCADE');
    table.integer('guide_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
    table.string('livekit_room').notNullable();
    table.enu('status', ['active', 'ended']).notNullable().defaultTo('active');
    table.timestamp('started_at').defaultTo(knex.fn.now());
    table.timestamp('ended_at').nullable();
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('live_sessions');
}
