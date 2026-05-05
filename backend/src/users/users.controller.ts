import { Controller, ForbiddenException, Get, Param, Put, Req } from '@nestjs/common';
import type { Request } from 'express';
import { UsersService } from './users.service';
import { Body } from '@nestjs/common';
import { SetPermissionsDto } from './dto/set-permissions.dto';

function requireAdmin(req: Request) {
  const role = (req as any).user?.role as string | undefined;
  if (role !== 'ADMIN') throw new ForbiddenException('ADMIN only');
}

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  list(@Req() req: Request) {
    requireAdmin(req);
    return this.usersService.listUsers();
  }

  @Get(':id/permissions')
  perms(@Param('id') id: string, @Req() req: Request) {
    requireAdmin(req);
    return this.usersService.getPermissions(id);
  }

  @Put(':id/permissions')
  setPerms(@Param('id') id: string, @Body() body: SetPermissionsDto, @Req() req: Request) {
    requireAdmin(req);
    return this.usersService.setPermissions(id, body.permissions.map((p) => p.toUpperCase() as any));
  }
}

