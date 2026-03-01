import { Module } from '@nestjs/common';
import { AppGateway } from './app.gateway';
import { AuthModule } from '../auth/auth.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [AuthModule, UsersModule],
  providers: [AppGateway],
  exports: [AppGateway],
})
export class GatewayModule {}
