import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../core/database/prisma.service';
import { CreateDepartmentDto } from './dto/create-department.dto';
import { UpdateDepartmentDto } from './dto/update-department.dto';
import { CreateRequestTypeDto } from './dto/create-request-type.dto';

@Injectable()
export class DepartmentsService {
  constructor(private readonly prisma: PrismaService) {}

  async createDepartment(dto: CreateDepartmentDto) {
    const existing = await this.prisma.department.findUnique({
      where: { name: dto.name },
    });
    if (existing) throw new ConflictException('Un service avec ce nom existe déjà');

    return this.prisma.department.create({
      data: dto,
      include: {
        requestTypes: true,
        _count: { select: { agents: true, requestTypes: true } },
      },
    });
  }

  async findAllDepartments() {
    return this.prisma.department.findMany({
      include: {
        requestTypes: {
          include: {
            _count: { select: { requests: true } },
          },
        },
        agents: {
          select: { id: true, firstName: true, lastName: true, email: true, isActive: true },
        },
        _count: { select: { agents: true, requestTypes: true } },
      },
      orderBy: { name: 'asc' },
    });
  }

  async findDepartmentById(id: string) {
    const dept = await this.prisma.department.findUnique({
      where: { id },
      include: {
        requestTypes: {
          include: {
            _count: { select: { requests: true } },
          },
        },
        agents: {
          select: { id: true, firstName: true, lastName: true, email: true, isActive: true },
        },
        _count: { select: { agents: true, requestTypes: true } },
      },
    });
    if (!dept) throw new NotFoundException('Service non trouvé');
    return dept;
  }

  async updateDepartment(id: string, dto: UpdateDepartmentDto) {
    await this.findDepartmentById(id);

    if (dto.name) {
      const existing = await this.prisma.department.findUnique({ where: { name: dto.name } });
      if (existing && existing.id !== id) throw new ConflictException('Un service avec ce nom existe déjà');
    }

    return this.prisma.department.update({
      where: { id },
      data: dto,
      include: {
        requestTypes: true,
        _count: { select: { agents: true, requestTypes: true } },
      },
    });
  }

  async assignAgent(departmentId: string, agentId: string) {
    await this.findDepartmentById(departmentId);

    const agent = await this.prisma.user.findUnique({ where: { id: agentId } });
    if (!agent) throw new NotFoundException('Agent non trouvé');

    return this.prisma.user.update({
      where: { id: agentId },
      data: { departmentId },
      select: { id: true, firstName: true, lastName: true, email: true, departmentId: true },
    });
  }

  async removeAgent(departmentId: string, agentId: string) {
    await this.findDepartmentById(departmentId);

    return this.prisma.user.update({
      where: { id: agentId },
      data: { departmentId: null },
      select: { id: true, firstName: true, lastName: true, email: true },
    });
  }

  async removeDepartment(id: string) {
    await this.findDepartmentById(id);
    return this.prisma.department.delete({ where: { id } });
  }

  async createRequestType(dto: CreateRequestTypeDto) {
    const dept = await this.prisma.department.findUnique({ where: { id: dto.departmentId } });
    if (!dept) throw new NotFoundException('Service non trouvé');

    const existing = await this.prisma.requestType.findUnique({ where: { name: dto.name } });
    if (existing) throw new ConflictException('Ce type de demande existe déjà');

    return this.prisma.requestType.create({
      data: dto,
    });
  }

  async findAllRequestTypes() {
    return this.prisma.requestType.findMany({
      include: { department: true },
      orderBy: { name: 'asc' },
    });
  }
}
