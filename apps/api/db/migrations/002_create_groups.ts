import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('groups', (table) => {
    table.increments('id').primary();
    table.string('name').notNullable();
    table.string('description').nullable();
    table.integer('guide_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
    table.string('invite_code').notNullable().unique();
    table.timestamps(true, true);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('groups');
}
