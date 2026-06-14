import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { DepartmentsService } from './departments.service';
import { CreateDepartmentDto } from './dto/create-department.dto';
import { CreateRequestTypeDto } from './dto/create-request-type.dto';
import { JwtAuthGuard } from '../../core/common/guards/jwt-auth.guard';
import { RolesGuard } from '../../core/common/guards/roles.guard';
import { Roles } from '../../core/common/decorators/roles.decorator';

@ApiTags('Departments & Request Types')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('departments')
export class DepartmentsController {
  constructor(private readonly departmentsService: DepartmentsService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Create a new department (Admin only)' })
  createDepartment(@Body() dto: CreateDepartmentDto) {
    return this.departmentsService.createDepartment(dto);
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
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Create a new request type (Admin only)' })
  createRequestType(@Body() dto: CreateRequestTypeDto) {
    return this.departmentsService.createRequestType(dto);
  }

  @Get('request-types/all')
  @ApiOperation({ summary: 'Get all request types' })
  findAllRequestTypes() {
    return this.departmentsService.findAllRequestTypes();
  }
}
