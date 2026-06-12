import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../core/database/prisma.service';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { CreateMissingDocumentDto } from './dto/create-missing-document.dto';
import { UpdateMissingDocumentDto } from './dto/update-missing-document.dto';
import { MissingDocumentStatus } from '@prisma/client';

@Injectable()
export class MissingDocumentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cloudinary: CloudinaryService,
  ) {}

  async create(createDto: CreateMissingDocumentDto, file: Express.Multer.File, userId: string) {
    let photoUrl = null;
    if (file) {
      const uploadResult = await this.cloudinary.uploadImage(file);
      photoUrl = uploadResult.secure_url;
    }

    return this.prisma.missingDocument.create({
      data: {
        title: createDto.title,
        description: createDto.description,
        lastSeenLocation: createDto.lastSeenLocation,
        latitude: createDto.latitude ? parseFloat(createDto.latitude as any) : null,
        longitude: createDto.longitude ? parseFloat(createDto.longitude as any) : null,
        photoUrl,
        reportedBy: { connect: { id: userId } },
      },
    });
  }

  async findAll() {
    return this.prisma.missingDocument.findMany({
      include: {
        reportedBy: { select: { firstName: true, lastName: true, phone: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const document = await this.prisma.missingDocument.findUnique({
      where: { id },
      include: {
        reportedBy: { select: { firstName: true, lastName: true, phone: true } },
      },
    });

    if (!document) {
      throw new NotFoundException(`Missing document with ID ${id} not found`);
    }

    return document;
  }

  async update(id: string, updateDto: UpdateMissingDocumentDto, userId: string, isAdmin: boolean) {
    const document = await this.findOne(id);
    
    if (!isAdmin && document.reportedById !== userId) {
      throw new NotFoundException(`Missing document not found or you don't have access`);
    }

    return this.prisma.missingDocument.update({
      where: { id },
      data: {
        ...updateDto,
        latitude: updateDto.latitude ? parseFloat(updateDto.latitude as any) : undefined,
        longitude: updateDto.longitude ? parseFloat(updateDto.longitude as any) : undefined,
      },
    });
  }

  async updateStatus(id: string, status: MissingDocumentStatus, isAdmin: boolean) {
    await this.findOne(id);
    return this.prisma.missingDocument.update({
      where: { id },
      data: { status, isVerified: isAdmin ? true : undefined },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.missingDocument.delete({ where: { id } });
  }
}
