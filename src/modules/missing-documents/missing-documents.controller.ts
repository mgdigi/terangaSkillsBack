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
import { MissingDocumentsService } from './missing-documents.service';
import { CreateMissingDocumentDto } from './dto/create-missing-document.dto';
import { UpdateMissingDocumentDto } from './dto/update-missing-document.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';
import { MissingDocumentStatus, Role } from '@prisma/client';
import { Roles } from '../../core/common/decorators/roles.decorator';
import { Public } from '../../core/common/decorators/public.decorator';

@ApiTags('missing-documents')
@ApiBearerAuth()
@Controller('missing-documents')
export class MissingDocumentsController {
  constructor(private readonly missingDocumentsService: MissingDocumentsService) {}

  @Post()
  @ApiOperation({ summary: 'Report a missing document' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file'))
  create(
    @Body() createDto: CreateMissingDocumentDto,
    @UploadedFile() file: Express.Multer.File,
    @Req() req: any,
  ) {
    return this.missingDocumentsService.create(createDto, file, req.user.id);
  }

  @Public()
  @Get()
  @ApiOperation({ summary: 'Get all reported missing documents' })
  findAll() {
    return this.missingDocumentsService.findAll();
  }

  @Public()
  @Get(':id')
  @ApiOperation({ summary: 'Get details of a missing document' })
  findOne(@Param('id') id: string) {
    return this.missingDocumentsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a missing document report' })
  update(
    @Param('id') id: string,
    @Body() updateDto: UpdateMissingDocumentDto,
    @Req() req: any,
  ) {
    const isAdmin = [Role.ADMIN].includes(req.user.role);
    return this.missingDocumentsService.update(id, updateDto, req.user.id, isAdmin);
  }

  @Roles(Role.ADMIN)
  @Patch(':id/status')
  @ApiOperation({ summary: 'Update the status of a missing document (Admin)' })
  @ApiBody({ schema: { type: 'object', properties: { status: { type: 'string', enum: ['MISSING', 'FOUND', 'RETURNED', 'ARCHIVED'] } } } })
  updateStatus(
    @Param('id') id: string,
    @Body('status') status: MissingDocumentStatus,
    @Req() req: any,
  ) {
    return this.missingDocumentsService.updateStatus(id, status, true);
  }

  @Roles(Role.ADMIN)
  @Delete(':id')
  @ApiOperation({ summary: 'Delete a missing document report (Admin only)' })
  remove(@Param('id') id: string) {
    return this.missingDocumentsService.remove(id);
  }
}
