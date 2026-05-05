import { Body, Controller, Get, Param, Patch, Post, Query, Req } from '@nestjs/common';
import type { Request } from 'express';
import { CorrectionsService } from './corrections.service';
import { CreateCorrectionDto } from './dto/create-correction.dto';
import { DecisionDto } from './dto/decision.dto';
import { RequirePermissions } from '../auth/permissions.decorator';

@RequirePermissions('CORRECTIONS')
@Controller('corrections')
export class CorrectionsController {
  constructor(private readonly correctionsService: CorrectionsService) {}

  @Get()
  findAll(@Query('status') status?: string) {
    const s = (status ?? '').toUpperCase().trim();
    const normalized = s === 'PENDING' || s === 'APPROVED' || s === 'REJECTED' ? (s as any) : undefined;
    return this.correctionsService.findAll({ status: normalized });
  }

  @Post()
  create(@Body() body: CreateCorrectionDto, @Req() req: Request) {
    const userId = (req as any).user?.sub as string | undefined;
    return this.correctionsService.create({
      ...body,
      requestedByUserId: userId,
    });
  }

  // UI currently calls POST for approve/reject; we support both POST and PATCH.
  @Post(':id/approve')
  approvePost(@Param('id') id: string, @Body() body: DecisionDto, @Req() req: Request) {
    const userId = (req as any).user?.sub as string | undefined;
    return this.correctionsService.approve(id, userId, body.note);
  }

  @Patch(':id/approve')
  approvePatch(@Param('id') id: string, @Body() body: DecisionDto, @Req() req: Request) {
    const userId = (req as any).user?.sub as string | undefined;
    return this.correctionsService.approve(id, userId, body.note);
  }

  @Post(':id/reject')
  rejectPost(@Param('id') id: string, @Body() body: DecisionDto, @Req() req: Request) {
    const userId = (req as any).user?.sub as string | undefined;
    return this.correctionsService.reject(id, userId, body.note);
  }

  @Patch(':id/reject')
  rejectPatch(@Param('id') id: string, @Body() body: DecisionDto, @Req() req: Request) {
    const userId = (req as any).user?.sub as string | undefined;
    return this.correctionsService.reject(id, userId, body.note);
  }
}
