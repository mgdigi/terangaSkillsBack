import { Controller, Get, Post, Body, Param, UseGuards, Patch, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { DepartmentsService } from './departments.service';
import { CreateDepartmentDto } from './dto/create-department.dto';
import { CreateRequestTypeDto } from './dto/create-request-type.dto';
import { JwtAuthGuard } from '../../core/common/guards/jwt-auth.guard';
import { RolesGuard } from '../../core/common/guards/roles.guard';
import { Roles } from '../../core/common/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { UpdateDepartmentDto } from './dto/update-department.dto';
import { UpdateDepartmentStatusDto } from './dto/update-department-status.dto';

@ApiTags('Departments & Request Types')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('departments')
export class DepartmentsController {
  constructor(private readonly departmentsService: DepartmentsService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Create a new department (Admin only)' })
  createDepartment(@Body() dto: CreateDepartmentDto) {
    return this.departmentsService.createDepartment(dto);
  }

  @Get('admin/services')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Get admin services overview' })
  findServices(@Query('search') search?: string) {
    return this.departmentsService.findServices(search);
  }

  @Get('admin/services/:id')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Get admin service details' })
  findServiceById(@Param('id') id: string) {
    return this.departmentsService.findServiceById(id);
  }

  @Patch('admin/services/:id')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Update admin service' })
  updateDepartment(@Param('id') id: string, @Body() dto: UpdateDepartmentDto) {
    return this.departmentsService.updateDepartment(id, dto);
  }

  @Patch('admin/services/:id/status')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Update admin service status' })
  updateDepartmentStatus(
    @Param('id') id: string,
    @Body() dto: UpdateDepartmentStatusDto,
  ) {
    return this.departmentsService.updateDepartmentStatus(id, dto.isActive);
  }

  @Get('request-types/all')
  @ApiOperation({ summary: 'Get all request types' })
  findAllRequestTypes() {
    return this.departmentsService.findAllRequestTypes();
  }

  @Get()
  @ApiOperation({ summary: 'Get all departments with request types' })
  findAllDepartments() {
    return this.departmentsService.findAllDepartments();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a department by ID' })
  findDepartmentById(@Param('id') id: string) {
    return this.departmentsService.findDepartmentById(id);
  }

  @Post('request-types')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Create a new request type (Admin only)' })
  createRequestType(@Body() dto: CreateRequestTypeDto) {
    return this.departmentsService.createRequestType(dto);
  }
}
