import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import Knex from 'knex';
import { KNEX_CONNECTION } from '../common/constants';

@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: KNEX_CONNECTION,
      useFactory: () => {
        return Knex({
          client: 'pg',
          connection: process.env.DATABASE_URL || {
            host: process.env.DB_HOST || 'localhost',
            port: parseInt(process.env.DB_PORT || '5432'),
            user: process.env.DB_USER || 'postgres',
            password: process.env.DB_PASSWORD || 'postgres',
            database: process.env.DB_NAME || 'livevoice',
          },
        });
      },
    },
  ],
  exports: [KNEX_CONNECTION],
})
export class DatabaseModule {}
