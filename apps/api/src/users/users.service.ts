import { Injectable, Inject } from '@nestjs/common';
import type { Knex } from 'knex';
import { KNEX_CONNECTION } from '../common/constants';

export interface User {
  id: number;
  email: string;
  password_hash: string;
  name: string;
  role: 'guide' | 'listener';
  created_at: Date;
  updated_at: Date;
}

@Injectable()
export class UsersService {
  constructor(@Inject(KNEX_CONNECTION) private readonly knex: Knex) {}

  async findById(id: number): Promise<User | undefined> {
    return this.knex('users').where({ id }).first();
  }

  async findByEmail(email: string): Promise<User | undefined> {
    return this.knex('users').where({ email }).first();
  }

  async create(data: {
    email: string;
    password_hash: string;
    name: string;
    role: 'guide' | 'listener';
  }): Promise<User> {
    const [user] = await this.knex('users').insert(data).returning('*');
    return user;
  }
}
