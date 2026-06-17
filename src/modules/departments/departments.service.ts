import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../core/database/prisma.service';
import { CreateDepartmentDto } from './dto/create-department.dto';
import { CreateRequestTypeDto } from './dto/create-request-type.dto';
import { UpdateDepartmentDto } from './dto/update-department.dto';

@Injectable()
export class DepartmentsService {
  constructor(private readonly prisma: PrismaService) {}

  async createDepartment(dto: CreateDepartmentDto) {
    const existing = await this.prisma.department.findUnique({
      where: { name: dto.name },
    });
    if (existing) throw new ConflictException('Department name already exists');

    await this.ensureManagerIfProvided(dto.managerId);

    return this.prisma.department.create({
      data: {
        name: dto.name,
        description: dto.description,
        isActive: dto.isActive ?? true,
        managerId: dto.managerId,
      },
    });
  }

  async findAllDepartments() {
    return this.prisma.department.findMany({
      include: {
        requestTypes: true,
        manager: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });
  }

  async findDepartmentById(id: string) {
    const dept = await this.prisma.department.findUnique({
      where: { id },
      include: {
        requestTypes: true,
        manager: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        agents: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
          },
        },
      },
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

  async findServices(search?: string) {
    const departments = await this.prisma.department.findMany({
      where: search
        ? {
            name: {
              contains: search,
              mode: 'insensitive',
            },
          }
        : undefined,
      include: {
        manager: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        agents: {
          select: {
            id: true,
          },
        },
        requestTypes: {
          select: {
            id: true,
            _count: {
              select: {
                requests: true,
              },
            },
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    });

    const items = departments.map((department) => ({
      id: department.id,
      name: department.name,
      description: department.description,
      responsable: department.manager
        ? `${department.manager.firstName} ${department.manager.lastName}`.trim()
        : 'Non assigné',
      agents: department.agents.length,
      dossiers: department.requestTypes.reduce(
        (sum, requestType) => sum + requestType._count.requests,
        0,
      ),
      status: department.isActive ? 'ACTIVE' : 'INACTIVE',
    }));

    return {
      summary: {
        totalServices: items.length,
        activeServices: items.filter((item) => item.status === 'ACTIVE').length,
      },
      items,
    };
  }

  async findServiceById(id: string) {
    const department = await this.prisma.department.findUnique({
      where: { id },
      include: {
        manager: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
          },
        },
        agents: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
            employeeId: true,
            isActive: true,
          },
        },
        requestTypes: {
          select: {
            id: true,
            name: true,
            _count: {
              select: {
                requests: true,
              },
            },
          },
        },
        _count: {
          select: {
            complaints: true,
          },
        },
      },
    });

    if (!department) {
      throw new NotFoundException('Department not found');
    }

    const recentRequests = await this.prisma.administrativeRequest.findMany({
      where: {
        requestType: {
          departmentId: id,
        },
      },
      take: 10,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        title: true,
        status: true,
        createdAt: true,
        citizen: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    return {
      department,
      stats: {
        totalAgents: department.agents.length,
        totalRequests: department.requestTypes.reduce(
          (sum, requestType) => sum + requestType._count.requests,
          0,
        ),
        totalComplaints: department._count.complaints,
      },
      recentRequests,
    };
  }

  async updateDepartment(id: string, dto: UpdateDepartmentDto) {
    await this.findDepartmentById(id);
    await this.ensureManagerIfProvided(dto.managerId);

    return this.prisma.department.update({
      where: { id },
      data: {
        name: dto.name,
        description: dto.description,
        isActive: dto.isActive,
        managerId: dto.managerId,
      },
    });
  }

  async updateDepartmentStatus(id: string, isActive: boolean) {
    await this.findDepartmentById(id);

    return this.prisma.department.update({
      where: { id },
      data: { isActive },
    });
  }

  private async ensureManagerIfProvided(managerId?: string) {
    if (!managerId) {
      return;
    }

    const manager = await this.prisma.user.findUnique({
      where: { id: managerId },
    });

    if (!manager) {
      throw new NotFoundException('Manager not found');
    }
  }
}
