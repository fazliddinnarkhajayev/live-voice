import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  ParseIntPipe,
  UseGuards,
  Request,
  ForbiddenException,
} from '@nestjs/common';
import { GroupsService } from './groups.service';
import { CreateGroupDto } from './dto/create-group.dto';
import { JoinGroupDto } from './dto/join-group.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('groups')
@UseGuards(JwtAuthGuard)
export class GroupsController {
  constructor(private readonly groupsService: GroupsService) {}

  @Post()
  create(@Request() req, @Body() dto: CreateGroupDto) {
    if (req.user.role !== 'guide') {
      throw new ForbiddenException('Only guides can create groups');
    }
    return this.groupsService.createGroup(req.user.id, dto);
  }

  @Get()
  getMyGroups(@Request() req) {
    return this.groupsService.getMyGroups(req.user.id, req.user.role);
  }

  @Get(':groupId')
  getGroup(@Param('groupId', ParseIntPipe) groupId: number) {
    return this.groupsService.getGroup(groupId);
  }

  @Post('join')
  joinGroup(@Request() req, @Body() dto: JoinGroupDto) {
    if (req.user.role !== 'listener') {
      throw new ForbiddenException('Only listeners can join groups via invite code');
    }
    return this.groupsService.joinGroup(req.user.id, dto.invite_code);
  }
}
