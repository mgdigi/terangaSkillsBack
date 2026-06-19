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
  Query,
} from '@nestjs/common';
import { AdministrativeRequestsService } from './administrative-requests.service';
import { CreateAdministrativeRequestDto } from './dto/create-administrative-request.dto';
import { UpdateAdministrativeRequestDto } from './dto/update-administrative-request.dto';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
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

  @Roles(Role.ADMIN, Role.AGENT)
  @Get()
  @ApiOperation({ summary: 'Get all requests with optional filters (Admin/Agent)' })
  @ApiQuery({ name: 'departmentId', required: false })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'status', required: false, enum: RequestStatus })
  findAll(
    @Req() req: any,
    @Query('departmentId') departmentId?: string,
    @Query('search') search?: string,
    @Query('status') status?: RequestStatus,
  ) {
    if (req.user.role === Role.AGENT) {
      if (!req.user.departmentId) {
        return []; // Agent sans service ne voit aucune demande
      }
      departmentId = req.user.departmentId;
    }
    return this.service.findAll(departmentId, search, status);
  }

  @Roles(Role.ADMIN, Role.AGENT)
  @Get('stats')
  @ApiOperation({ summary: 'Get request statistics, optionally filtered by department (Admin/Agent)' })
  @ApiQuery({ name: 'departmentId', required: false })
  getStats(@Req() req: any, @Query('departmentId') departmentId?: string) {
    if (req.user.role === Role.AGENT) {
      if (!req.user.departmentId) {
        return { total: 0, pending: 0, inProgress: 0, completed: 0, rejected: 0 };
      }
      departmentId = req.user.departmentId;
    }
    return this.service.getStats(departmentId);
  }

  @Get('my-requests')
  @ApiOperation({ summary: 'Get current citizen requests' })
  findAllMyRequests(@Req() req: any) {
    return this.service.findAllByCitizen(req.user.id);
  }

  @Roles(Role.AGENT)
  @Get('assigned-to-me')
  @ApiOperation({ summary: 'Get requests assigned to the current agent' })
  findAssignedToMe(@Req() req: any) {
    return this.service.findAllAssignedToAgent(req.user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get details of a request' })
  findOne(@Param('id') id: string, @Req() req: any) {
    const isAdmin = [Role.ADMIN, Role.AGENT].includes(req.user.role);
    return this.service.findOne(id, req.user.id, isAdmin);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update request details' })
  update(
    @Param('id') id: string,
    @Body() updateDto: UpdateAdministrativeRequestDto,
    @Req() req: any,
  ) {
    const isAdmin = [Role.ADMIN].includes(req.user.role);
    return this.service.update(id, updateDto, req.user.id, isAdmin);
  }

  @Roles(Role.ADMIN, Role.AGENT)
  @Patch(':id/status')
  @ApiOperation({ summary: 'Change request status (Admin/Agent)' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        status: {
          type: 'string',
          enum: [
            'SUBMITTED',
            'ASSIGNED',
            'IN_PROGRESS',
            'PROCESSED',
            'VALIDATED',
            'AWAITING_PAYMENT',
            'COMPLETED',
            'REJECTED',
          ],
        },
      },
    },
  })
  updateStatus(
    @Param('id') id: string,
    @Body('status') status: RequestStatus,
    @Req() req: any,
  ) {
    return this.service.updateStatus(id, status, req.user.id);
  }

  @Roles(Role.ADMIN)
  @Patch(':id/assign')
  @ApiOperation({ summary: 'Assign an agent to a request (Admin)' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: { agentId: { type: 'string', example: 'uuid-of-agent' } },
    },
  })
  assignAgent(
    @Param('id') id: string,
    @Body('agentId') agentId: string,
    @Req() req: any,
  ) {
    return this.service.assignAgent(id, agentId, req.user.id);
  }

  @Roles(Role.ADMIN)
  @Delete(':id')
  @ApiOperation({ summary: 'Delete a request (Admin only)' })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
