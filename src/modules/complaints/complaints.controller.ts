import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseInterceptors,
  UploadedFile,
  Req,
} from '@nestjs/common';
import { ComplaintsService } from './complaints.service';
import { CreateComplaintDto } from './dto/create-complaint.dto';
import { UpdateComplaintDto } from './dto/update-complaint.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ComplaintStatus, Role } from '@prisma/client';
import { Roles } from '../../core/common/decorators/roles.decorator';

@ApiTags('complaints')
@ApiBearerAuth()
@Controller('complaints')
export class ComplaintsController {
  constructor(private readonly complaintsService: ComplaintsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new citizen complaint' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file'))
  create(
    @Body() createDto: CreateComplaintDto,
    @UploadedFile() file: Express.Multer.File,
    @Req() req: any,
  ) {
    return this.complaintsService.create(createDto, file, req.user.id);
  }

  @Roles(Role.ADMIN, Role.AGENT)
  @Get()
  @ApiOperation({ summary: 'Get all complaints (Admin/Agent/Chief)' })
  findAll() {
    return this.complaintsService.findAll();
  }

  @Get('my-complaints')
  @ApiOperation({ summary: 'Get complaints created by the logged in citizen' })
  findAllMyComplaints(@Req() req: any) {
    return this.complaintsService.findAllByCitizen(req.user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get complaint details' })
  findOne(@Param('id') id: string, @Req() req: any) {
    const isAdmin = [Role.ADMIN, Role.AGENT].includes(req.user.role);
    return this.complaintsService.findOne(id, req.user.id, isAdmin);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a complaint' })
  update(
    @Param('id') id: string,
    @Body() updateDto: UpdateComplaintDto,
    @Req() req: any,
  ) {
    const isAdmin = [Role.ADMIN].includes(req.user.role);
    return this.complaintsService.update(id, updateDto, req.user.id, isAdmin);
  }

  @Roles(Role.ADMIN, Role.AGENT)
  @Patch(':id/status')
  @ApiOperation({ summary: 'Update complaint status (Admin/Agent)' })
  @ApiBody({ schema: { type: 'object', properties: { status: { type: 'string', enum: ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'] } } } })
  updateStatus(
    @Param('id') id: string,
    @Body('status') status: ComplaintStatus,
    @Req() req: any,
  ) {
    return this.complaintsService.updateStatus(id, status, req.user.id);
  }

  @Roles(Role.ADMIN)
  @Delete(':id')
  @ApiOperation({ summary: 'Delete a complaint (Super Admin only)' })
  remove(@Param('id') id: string) {
    return this.complaintsService.remove(id);
  }
}
