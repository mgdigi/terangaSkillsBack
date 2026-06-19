import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ApiBearerAuth, ApiQuery, ApiTags, ApiOperation } from '@nestjs/swagger';
import { Roles } from '../../core/common/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { RolesGuard } from '../../core/common/guards/roles.guard';

@ApiTags('users')
@ApiBearerAuth()
@UseGuards(RolesGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Roles(Role.ADMIN)
  @Post()
  @ApiOperation({ summary: 'Create a new user (Admin only)' })
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Roles(Role.ADMIN)
  @Get()
  @ApiOperation({ summary: 'Get all users with optional role and search filters (Admin only)' })
  @ApiQuery({ name: 'role', required: false, enum: Role })
  @ApiQuery({ name: 'search', required: false })
  findAll(@Query('role') role?: Role, @Query('search') search?: string) {
    return this.usersService.findAll(role, search);
  }

  @Roles(Role.ADMIN)
  @Get('citizens/stats')
  @ApiOperation({ summary: 'Get citizens statistics (Admin only)' })
  getCitizensStats() {
    return this.usersService.findCitizensStats();
  }

  @Roles(Role.ADMIN)
  @Get('agents/stats')
  @ApiOperation({ summary: 'Get agents statistics (Admin only)' })
  getAgentsStats() {
    return this.usersService.findAgentsStats();
  }

  @Roles(Role.ADMIN)
  @Get(':id')
  @ApiOperation({ summary: 'Get user by ID (Admin only)' })
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Roles(Role.ADMIN)
  @Patch(':id')
  @ApiOperation({ summary: 'Update user info (Admin only)' })
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(id, updateUserDto);
  }

  @Roles(Role.ADMIN)
  @Patch(':id/toggle-status')
  @ApiOperation({ summary: 'Activate or deactivate a user account (Admin only)' })
  toggleStatus(@Param('id') id: string) {
    return this.usersService.toggleStatus(id);
  }

  @Roles(Role.ADMIN)
  @Delete(':id')
  @ApiOperation({ summary: 'Delete a user (Admin only)' })
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }
}
