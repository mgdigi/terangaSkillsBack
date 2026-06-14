import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../core/database/prisma.service';
import { CreateDepartmentDto } from './dto/create-department.dto';
import { CreateRequestTypeDto } from './dto/create-request-type.dto';

@Injectable()
export class DepartmentsService {
  constructor(private readonly prisma: PrismaService) {}

  async createDepartment(dto: CreateDepartmentDto) {
    const existing = await this.prisma.department.findUnique({
      where: { name: dto.name },
    });
    if (existing) throw new ConflictException('Department name already exists');

    return this.prisma.department.create({
      data: dto,
    });
  }

  async findAllDepartments() {
    return this.prisma.department.findMany({
      include: {
        requestTypes: true,
      },
    });
  }

  async findDepartmentById(id: string) {
    const dept = await this.prisma.department.findUnique({
      where: { id },
      include: { requestTypes: true, agents: { select: { id: true, firstName: true, lastName: true, email: true } } },
    });
    if (!dept) throw new NotFoundException('Department not found');
    return dept;
  }

  async createRequestType(dto: CreateRequestTypeDto) {
    const dept = await this.prisma.department.findUnique({ where: { id: dto.departmentId } });
    if (!dept) throw new NotFoundException('Department not found');

    const existing = await this.prisma.requestType.findUnique({ where: { name: dto.name } });
    if (existing) throw new ConflictException('Request Type name already exists');

    return this.prisma.requestType.create({
      data: dto,
    });
  }

  async findAllRequestTypes() {
    return this.prisma.requestType.findMany({
      include: { department: true },
    });
  }
}
