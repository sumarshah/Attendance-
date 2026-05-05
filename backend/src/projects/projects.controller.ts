import { Body, Controller, Get, Post } from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { RequirePermissions } from '../auth/permissions.decorator';

@RequirePermissions('PROJECTS')
@Controller('projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Get()
  findAll() {
    return this.projectsService.findAll();
  }

  @Post()
  create(@Body() body: CreateProjectDto) {
    return this.projectsService.create(body);
  }
}
