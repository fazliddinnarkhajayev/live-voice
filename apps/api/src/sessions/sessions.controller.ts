import {
  Controller,
  Post,
  Get,
  Param,
  ParseIntPipe,
  UseGuards,
  Request,
  ForbiddenException,
} from '@nestjs/common';
import { SessionsService } from './sessions.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('groups/:groupId/session')
@UseGuards(JwtAuthGuard)
export class SessionsController {
  constructor(private readonly sessionsService: SessionsService) {}

  @Get('status')
  getStatus(@Param('groupId', ParseIntPipe) groupId: number) {
    return this.sessionsService.getActiveSession(groupId);
  }

  @Post('start')
  startSession(@Request() req, @Param('groupId', ParseIntPipe) groupId: number) {
    if (req.user.role !== 'guide') {
      throw new ForbiddenException('Only guides can start sessions');
    }
    return this.sessionsService.startSession(req.user.id, groupId);
  }

  @Post('join')
  joinSession(@Request() req, @Param('groupId', ParseIntPipe) groupId: number) {
    if (req.user.role !== 'listener') {
      throw new ForbiddenException('Only listeners can join sessions');
    }
    return this.sessionsService.joinSession(req.user.id, groupId);
  }

  @Post('end')
  endSession(@Request() req, @Param('groupId', ParseIntPipe) groupId: number) {
    if (req.user.role !== 'guide') {
      throw new ForbiddenException('Only guides can end sessions');
    }
    return this.sessionsService.endSession(req.user.id, groupId);
  }
}
