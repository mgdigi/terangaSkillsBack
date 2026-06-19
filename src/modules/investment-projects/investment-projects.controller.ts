import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Req,
  Query,
  UseGuards,
} from '@nestjs/common';
import { InvestmentProjectsService } from './investment-projects.service';
import { CreateInvestmentProjectDto } from './dto/create-investment-project.dto';
import { UpdateInvestmentProjectDto } from './dto/update-investment-project.dto';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { Roles } from '../../core/common/decorators/roles.decorator';
import { Role, ProjectStatus } from '@prisma/client';
import { RolesGuard } from '../../core/common/guards/roles.guard';

@ApiTags('investment-projects')
@ApiBearerAuth()
@Controller('investment-projects')
export class InvestmentProjectsController {
  constructor(private readonly service: InvestmentProjectsService) {}

  @Roles(Role.ADMIN)
  @UseGuards(RolesGuard)
  @Post()
  @ApiOperation({ summary: 'Create a new investment project (Admin only)' })
  create(@Body() dto: CreateInvestmentProjectDto, @Req() req: any) {
    return this.service.create(dto, req.user.id);
  }

  @Get()
  @ApiOperation({ summary: 'Get all investment projects' })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'status', required: false, enum: ProjectStatus })
  findAll(@Query('search') search?: string, @Query('status') status?: ProjectStatus) {
    return this.service.findAll(search, status);
  }

  @Get('stats')
  @Roles(Role.ADMIN, Role.AGENT)
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Get investment projects statistics (Admin/Agent)' })
  getStats() {
    return this.service.getStats();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single investment project' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Roles(Role.ADMIN)
  @UseGuards(RolesGuard)
  @Patch(':id')
  @ApiOperation({ summary: 'Update an investment project (Admin only)' })
  update(@Param('id') id: string, @Body() dto: UpdateInvestmentProjectDto) {
    return this.service.update(id, dto);
  }

  @Roles(Role.ADMIN)
  @UseGuards(RolesGuard)
  @Delete(':id')
  @ApiOperation({ summary: 'Delete an investment project (Admin only)' })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
