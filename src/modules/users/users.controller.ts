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
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Roles } from '../../core/common/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { RolesGuard } from '../../core/common/guards/roles.guard';
import { UpdateUserStatusDto } from './dto/update-user-status.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { CreateAgentDto } from './dto/create-agent.dto';
import { UpdateAgentDto } from './dto/update-agent.dto';

@ApiTags('users')
@ApiBearerAuth()
@UseGuards(RolesGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Roles(Role.ADMIN)
  @Get('admin/citizens')
  findCitizens(@Query('search') search?: string) {
    return this.usersService.findCitizens(search);
  }

  @Roles(Role.ADMIN)
  @Get('admin/citizens/:id')
  findCitizenById(@Param('id') id: string) {
    return this.usersService.findCitizenById(id);
  }

  @Roles(Role.ADMIN)
  @Patch('admin/citizens/:id/status')
  updateCitizenStatus(
    @Param('id') id: string,
    @Body() dto: UpdateUserStatusDto,
  ) {
    return this.usersService.updateUserStatus(id, dto.isActive);
  }

  @Roles(Role.ADMIN)
  @Post('admin/citizens/:id/reset-password')
  resetCitizenPassword(
    @Param('id') id: string,
    @Body() dto: ResetPasswordDto,
  ) {
    return this.usersService.resetUserPassword(id, dto.newPassword);
  }

  @Roles(Role.ADMIN)
  @Get('admin/agents')
  findAgents(@Query('search') search?: string) {
    return this.usersService.findAgents(search);
  }

  @Roles(Role.ADMIN)
  @Get('admin/agents/:id')
  findAgentById(@Param('id') id: string) {
    return this.usersService.findAgentById(id);
  }

  @Roles(Role.ADMIN)
  @Post('admin/agents')
  createAgent(@Body() dto: CreateAgentDto) {
    return this.usersService.createAgent(dto);
  }

  @Roles(Role.ADMIN)
  @Patch('admin/agents/:id')
  updateAgent(@Param('id') id: string, @Body() dto: UpdateAgentDto) {
    return this.usersService.updateAgent(id, dto);
  }

  @Roles(Role.ADMIN)
  @Patch('admin/agents/:id/status')
  updateAgentStatus(
    @Param('id') id: string,
    @Body() dto: UpdateUserStatusDto,
  ) {
    return this.usersService.updateUserStatus(id, dto.isActive);
  }

  @Roles(Role.ADMIN)
  @Post('admin/agents/:id/reset-password')
  resetAgentPassword(
    @Param('id') id: string,
    @Body() dto: ResetPasswordDto,
  ) {
    return this.usersService.resetUserPassword(id, dto.newPassword);
  }

  @Roles(Role.ADMIN)
  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Roles(Role.ADMIN)
  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @Roles(Role.ADMIN)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Roles(Role.ADMIN)
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(id, updateUserDto);
  }

  @Roles(Role.ADMIN)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }
}
