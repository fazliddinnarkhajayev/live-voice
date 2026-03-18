import { Module } from '@nestjs/common';
import { SessionsController } from './sessions.controller';
import { SessionsService } from './sessions.service';
import { DatabaseModule } from '../database/database.module';
import { LiveKitModule } from '../livekit/livekit.module';
import { GroupsModule } from '../groups/groups.module';

@Module({
  imports: [DatabaseModule, LiveKitModule, GroupsModule],
  controllers: [SessionsController],
  providers: [SessionsService],
})
export class SessionsModule {}
