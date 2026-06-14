import { Controller, Get, Post, Body, Param, UseGuards, Req } from '@nestjs/common';
import { DocumentsService } from './documents.service';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { Roles } from '../../core/common/decorators/roles.decorator';
import { Public } from '../../core/common/decorators/public.decorator';

@ApiTags('documents')
@Controller('documents')
export class DocumentsController {
  constructor(private readonly documentsService: DocumentsService) {}

  @ApiBearerAuth()
  @Roles(Role.ADMIN, Role.AGENT)
  @Post('generate/:requestId')
  @ApiOperation({ summary: 'Generate PDF document for a request (Admin/Agent)' })
  @ApiBody({ schema: { type: 'object', properties: { name: { type: 'string', example: 'DOC-2023-001' }, content: { type: 'string', example: 'Contenu du document...' } } } })
  generateDocument(
    @Param('requestId') requestId: string,
    @Body('name') name: string,
    @Body('content') content: string,
    @Req() req: any,
  ) {
    return this.documentsService.generateDocument(requestId, name, content, req.user.id);
  }

  @Public()
  @Get('verify/:id')
  @ApiOperation({ summary: 'Verify document authenticity using QR Code URL' })
  verify(@Param('id') id: string) {
    return this.documentsService.verify(id);
  }
}
