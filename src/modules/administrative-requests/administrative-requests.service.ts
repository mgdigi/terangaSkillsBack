import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../core/database/prisma.service';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { CreateAdministrativeRequestDto } from './dto/create-administrative-request.dto';
import { UpdateAdministrativeRequestDto } from './dto/update-administrative-request.dto';
import { RequestStatus } from '@prisma/client';

@Injectable()
export class AdministrativeRequestsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cloudinary: CloudinaryService
  ) {}

  async create(createDto: CreateAdministrativeRequestDto, files: Array<Express.Multer.File>, citizenId: string) {
    const attachments = [];
    if (files && files.length > 0) {
      for (const file of files) {
        const result = await this.cloudinary.uploadImage(file);
        attachments.push(result.secure_url);
      }
    }

    let parsedData = createDto.data || {};
    if (typeof parsedData === 'string') {
      try {
        parsedData = JSON.parse(parsedData);
      } catch (e) {
        // keep as string if not JSON
      }
    }

    return this.prisma.$transaction(async (prisma) => {
      const request = await prisma.administrativeRequest.create({
        data: {
          type: createDto.type,
          title: createDto.title,
          description: createDto.description,
          data: parsedData,
          attachments,
          citizenId,
        },
      });

      await prisma.actionLog.create({
        data: {
          action: 'CREATED',
          description: 'Request submitted by citizen',
          actorId: citizenId,
          administrativeRequestId: request.id,
        },
      });

      return request;
    });
  }

  async findAll() {
    return this.prisma.administrativeRequest.findMany({
      include: {
        citizen: { select: { firstName: true, lastName: true, phone: true } },
        assignedAgent: { select: { firstName: true, lastName: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findAllByCitizen(citizenId: string) {
    return this.prisma.administrativeRequest.findMany({
      where: { citizenId },
      include: {
        assignedAgent: { select: { firstName: true, lastName: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string, userId?: string, isAdmin?: boolean) {
    const request = await this.prisma.administrativeRequest.findUnique({
      where: { id },
      include: {
        citizen: { select: { firstName: true, lastName: true, phone: true } },
        assignedAgent: { select: { firstName: true, lastName: true } },
        documents: true,
        history: {
          include: { actor: { select: { firstName: true, lastName: true, role: true } } },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!request) throw new NotFoundException(`Request with ID ${id} not found`);
    
    if (userId && !isAdmin && request.citizenId !== userId) {
      throw new NotFoundException(`Request not found or unauthorized`);
    }

    return request;
  }

  async update(id: string, updateDto: UpdateAdministrativeRequestDto, userId: string, isAdmin: boolean) {
    const request = await this.findOne(id);

    if (!isAdmin && request.citizenId !== userId) {
      throw new NotFoundException(`Request not found or unauthorized`);
    }

    return this.prisma.administrativeRequest.update({
      where: { id },
      data: updateDto,
    });
  }

  async updateStatus(id: string, status: RequestStatus, actorId: string) {
    await this.findOne(id);
    
    return this.prisma.$transaction(async (prisma) => {
      const updated = await prisma.administrativeRequest.update({
        where: { id },
        data: { status },
      });

      await prisma.actionLog.create({
        data: {
          action: 'STATUS_CHANGED',
          description: `Status changed to ${status}`,
          actorId,
          administrativeRequestId: id,
        },
      });

      return updated;
    });
  }

  async assignAgent(id: string, agentId: string, actorId: string) {
    await this.findOne(id);
    
    return this.prisma.$transaction(async (prisma) => {
      const updated = await prisma.administrativeRequest.update({
        where: { id },
        data: { assignedAgentId: agentId },
      });

      await prisma.actionLog.create({
        data: {
          action: 'AGENT_ASSIGNED',
          description: `Assigned to agent ${agentId}`,
          actorId,
          administrativeRequestId: id,
        },
      });

      return updated;
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.administrativeRequest.delete({ where: { id } });
  }
}
