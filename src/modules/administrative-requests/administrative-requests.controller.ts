import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Req,
  UseInterceptors,
  UploadedFiles,
} from '@nestjs/common';
import { AdministrativeRequestsService } from './administrative-requests.service';
import { CreateAdministrativeRequestDto } from './dto/create-administrative-request.dto';
import { UpdateAdministrativeRequestDto } from './dto/update-administrative-request.dto';
import { ApiBearerAuth, ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';
import { RequestStatus, Role } from '@prisma/client';
import { Roles } from '../../core/common/decorators/roles.decorator';
import { FilesInterceptor } from '@nestjs/platform-express';

@ApiTags('administrative-requests')
@ApiBearerAuth()
@Controller('administrative-requests')
export class AdministrativeRequestsController {
  constructor(private readonly service: AdministrativeRequestsService) {}

  @Post()
  @ApiOperation({ summary: 'Submit an administrative request' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FilesInterceptor('files'))
  create(
    @Body() createDto: CreateAdministrativeRequestDto,
    @UploadedFiles() files: Array<Express.Multer.File>,
    @Req() req: any,
  ) {
    return this.service.create(createDto, files, req.user.id);
  }

  @Roles(Role.SUPER_ADMIN, Role.ADMIN, Role.AGENT)
  @Get()
  @ApiOperation({ summary: 'Get all requests (Admin/Agent)' })
  findAll() {
    return this.service.findAll();
  }

  @Get('my-requests')
  @ApiOperation({ summary: 'Get current citizen requests' })
  findAllMyRequests(@Req() req: any) {
    return this.service.findAllByCitizen(req.user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get details of a request' })
  findOne(@Param('id') id: string, @Req() req: any) {
    const isAdmin = [Role.SUPER_ADMIN, Role.ADMIN, Role.AGENT].includes(req.user.role);
    return this.service.findOne(id, req.user.id, isAdmin);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update request details' })
  update(
    @Param('id') id: string,
    @Body() updateDto: UpdateAdministrativeRequestDto,
    @Req() req: any,
  ) {
    const isAdmin = [Role.SUPER_ADMIN, Role.ADMIN].includes(req.user.role);
    return this.service.update(id, updateDto, req.user.id, isAdmin);
  }

  @Roles(Role.SUPER_ADMIN, Role.ADMIN, Role.AGENT)
  @Patch(':id/status')
  @ApiOperation({ summary: 'Change request status (Admin/Agent)' })
  updateStatus(
    @Param('id') id: string,
    @Body('status') status: RequestStatus,
    @Req() req: any,
  ) {
    return this.service.updateStatus(id, status, req.user.id);
  }

  @Roles(Role.SUPER_ADMIN, Role.ADMIN)
  @Patch(':id/assign')
  @ApiOperation({ summary: 'Assign an agent to a request (Admin)' })
  assignAgent(
    @Param('id') id: string,
    @Body('agentId') agentId: string,
    @Req() req: any,
  ) {
    return this.service.assignAgent(id, agentId, req.user.id);
  }

  @Roles(Role.SUPER_ADMIN)
  @Delete(':id')
  @ApiOperation({ summary: 'Delete a request (Super Admin only)' })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
