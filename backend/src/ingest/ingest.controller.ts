import { Body, Controller, Headers, Param, Post } from '@nestjs/common';
import { Public } from '../auth/public.decorator';
import { IngestPunchDto } from './dto/ingest-punch.dto';
import { IngestService } from './ingest.service';

@Controller('ingest')
export class IngestController {
  constructor(private readonly ingestService: IngestService) {}

  @Public()
  @Post(':connectorId/punch')
  punch(
    @Param('connectorId') connectorId: string,
    @Body() body: IngestPunchDto,
    @Headers('x-connector-key') connectorKey?: string,
  ) {
    return this.ingestService.punch(connectorId, body, connectorKey);
  }
}

