import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../core/database/prisma.service';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { CreateComplaintDto } from './dto/create-complaint.dto';
import { UpdateComplaintDto } from './dto/update-complaint.dto';
import { ComplaintStatus } from '@prisma/client';

@Injectable()
export class ComplaintsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cloudinary: CloudinaryService,
  ) {}

  async create(createDto: CreateComplaintDto, file: Express.Multer.File, userId: string) {
    let photoUrl = null;
    if (file) {
      const uploadResult = await this.cloudinary.uploadImage(file);
      photoUrl = uploadResult.secure_url;
    }

    return this.prisma.complaint.create({
      data: {
        title: createDto.title,
        description: createDto.description,
        latitude: createDto.latitude,
        longitude: createDto.longitude,
        photoUrl,
        citizen: { connect: { id: userId } },
      },
    });
  }

  async findAll(search?: string, status?: ComplaintStatus) {
    return this.prisma.complaint.findMany({
      where: {
        ...(status && { status }),
        ...(search && {
          OR: [
            { title: { contains: search, mode: 'insensitive' } },
            { description: { contains: search, mode: 'insensitive' } },
            { citizen: { firstName: { contains: search, mode: 'insensitive' } } },
            { citizen: { lastName: { contains: search, mode: 'insensitive' } } },
          ],
        }),
      },
      include: {
        citizen: { select: { firstName: true, lastName: true, phone: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findAllByCitizen(userId: string) {
    return this.prisma.complaint.findMany({
      where: { citizenId: userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string, userId?: string, isAdmin?: boolean) {
    const complaint = await this.prisma.complaint.findUnique({
      where: { id },
      include: {
        citizen: { select: { firstName: true, lastName: true, phone: true } },
        history: true,
      },
    });

    if (!complaint) {
      throw new NotFoundException(`Complaint with ID ${id} not found`);
    }

    if (userId && !isAdmin && complaint.citizenId !== userId) {
      throw new NotFoundException(`Complaint not found or unauthorized`);
    }

    return complaint;
  }

  async update(id: string, updateDto: UpdateComplaintDto, userId: string, isAdmin: boolean) {
    const complaint = await this.findOne(id);

    if (!isAdmin && complaint.citizenId !== userId) {
      throw new NotFoundException(`Complaint not found or unauthorized`);
    }

    return this.prisma.complaint.update({
      where: { id },
      data: updateDto,
    });
  }

  async updateStatus(id: string, status: ComplaintStatus, actorId: string) {
    await this.findOne(id);
    
    
    return this.prisma.$transaction(async (prisma) => {
      const updated = await prisma.complaint.update({
        where: { id },
        data: { status },
      });

      await prisma.actionLog.create({
        data: {
          action: 'STATUS_CHANGED',
          description: `Status changed to ${status}`,
          actorId,
          complaintId: id,
        },
      });

      return updated;
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.complaint.delete({ where: { id } });
  }
}
