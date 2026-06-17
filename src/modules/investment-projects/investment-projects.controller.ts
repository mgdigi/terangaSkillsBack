import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Role } from '@prisma/client';

import { InvestmentProjectsService } from './investment-projects.service';
import { CreateInvestmentProjectDto } from './dto/create-investment-project.dto';
import { UpdateInvestmentProjectDto } from './dto/update-investment-project.dto';
import { Roles } from '../../core/common/decorators/roles.decorator';

@ApiTags('Investment Projects')
@ApiBearerAuth()
@Roles(Role.ADMIN, Role.AGENT)
@Controller('investment-projects')
export class InvestmentProjectsController {
  constructor(
    private readonly investmentProjectsService: InvestmentProjectsService,
  ) {}

  @Post()
  create(@Body() dto: CreateInvestmentProjectDto) {
    return this.investmentProjectsService.create(dto);
  }

  @Get()
  findAll() {
    return this.investmentProjectsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.investmentProjectsService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateInvestmentProjectDto) {
    return this.investmentProjectsService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.investmentProjectsService.remove(id);
  }
}
