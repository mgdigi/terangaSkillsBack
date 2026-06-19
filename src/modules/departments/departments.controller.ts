import { Controller, Get, Post, Body, Param, Patch, Delete, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { DepartmentsService } from './departments.service';
import { CreateDepartmentDto } from './dto/create-department.dto';
import { UpdateDepartmentDto } from './dto/update-department.dto';
import { CreateRequestTypeDto } from './dto/create-request-type.dto';
import { JwtAuthGuard } from '../../core/common/guards/jwt-auth.guard';
import { RolesGuard } from '../../core/common/guards/roles.guard';
import { Roles } from '../../core/common/decorators/roles.decorator';
import { Role } from '@prisma/client';

@ApiTags('Services municipaux')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('departments')
export class DepartmentsController {
  constructor(private readonly departmentsService: DepartmentsService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Créer un nouveau service municipal (Admin uniquement)' })
  createDepartment(@Body() dto: CreateDepartmentDto) {
    return this.departmentsService.createDepartment(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Récupérer tous les services avec leurs types de demande' })
  findAllDepartments() {
    return this.departmentsService.findAllDepartments();
  }

  @Get('request-types/all')
  @ApiOperation({ summary: 'Récupérer tous les types de demande' })
  findAllRequestTypes() {
    return this.departmentsService.findAllRequestTypes();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Récupérer un service par ID' })
  findDepartmentById(@Param('id') id: string) {
    return this.departmentsService.findDepartmentById(id);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Modifier un service (Admin uniquement)' })
  updateDepartment(@Param('id') id: string, @Body() dto: UpdateDepartmentDto) {
    return this.departmentsService.updateDepartment(id, dto);
  }

  @Post(':id/agents/:agentId')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Affecter un agent à un service' })
  assignAgent(@Param('id') id: string, @Param('agentId') agentId: string) {
    return this.departmentsService.assignAgent(id, agentId);
  }

  @Delete(':id/agents/:agentId')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Retirer un agent d\'un service' })
  removeAgent(@Param('id') id: string, @Param('agentId') agentId: string) {
    return this.departmentsService.removeAgent(id, agentId);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Supprimer un service (Admin uniquement)' })
  removeDepartment(@Param('id') id: string) {
    return this.departmentsService.removeDepartment(id);
  }

  @Post('request-types')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Créer un type de demande (Admin uniquement)' })
  createRequestType(@Body() dto: CreateRequestTypeDto) {
    return this.departmentsService.createRequestType(dto);
  }
}
