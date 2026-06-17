import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../core/database/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';
import { Prisma, Role } from '@prisma/client';
import { CreateAgentDto } from './dto/create-agent.dto';
import { UpdateAgentDto } from './dto/update-agent.dto';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createUserDto: CreateUserDto) {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: createUserDto.email },
    });

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

    const user = await this.prisma.user.create({
      data: {
        ...createUserDto,
        password: hashedPassword,
      },
    });

    const { password, refreshToken, ...result } = user;
    return result;
  }

  async findAll() {
    const users = await this.prisma.user.findMany({
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        nationalId: true,
        address: true,
        employeeId: true,
        jobTitle: true,
        role: true,
        isActive: true,
        department: {
          select: {
            id: true,
            name: true,
          },
        },
        createdAt: true,
        updatedAt: true,
      },
    });
    return users;
  }

  async findOne(id: string) {
    const user = await this.findOneWithPassword(id);
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    const { password, refreshToken, ...result } = user;
    return result;
  }

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  async findOneWithPassword(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return user;
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    await this.findOne(id); 

    const data: any = { ...updateUserDto };
    if (data.password) {
      data.password = await bcrypt.hash(data.password, 10);
    }
    if (data.assignedAt) {
      data.assignedAt = new Date(data.assignedAt);
    }

    const updatedUser = await this.prisma.user.update({
      where: { id },
      data,
    });

    const { password, refreshToken, ...result } = updatedUser;
    return result;
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.user.delete({
      where: { id },
    });
  }

  async clearRefreshToken(id: string) {
    await this.findOneWithPassword(id);

    return this.prisma.user.update({
      where: { id },
      data: { refreshToken: null },
    });
  }

  async updatePassword(id: string, password: string) {
    await this.findOneWithPassword(id);

    const hashedPassword = await bcrypt.hash(password, 10);

    return this.prisma.user.update({
      where: { id },
      data: {
        password: hashedPassword,
        refreshToken: null,
      },
    });
  }

  async findCitizens(search?: string) {
    const where = this.buildUserSearchWhere(Role.CITIZEN, search);

    const [citizens, totalCitizens, activeCitizens, recentCitizens] =
      await Promise.all([
        this.prisma.user.findMany({
          where,
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            firstName: true,
            lastName: true,
            phone: true,
            email: true,
            nationalId: true,
            isActive: true,
            createdAt: true,
            _count: {
              select: {
                administrativeRequests: true,
                complaints: true,
              },
            },
          },
        }),
        this.prisma.user.count({ where: { role: Role.CITIZEN } }),
        this.prisma.user.count({
          where: { role: Role.CITIZEN, isActive: true },
        }),
        this.prisma.user.count({
          where: {
            role: Role.CITIZEN,
            createdAt: {
              gte: this.getDateDaysAgo(30),
            },
          },
        }),
      ]);

    return {
      summary: {
        totalCitizens,
        activeCitizens,
        newCitizensLast30Days: recentCitizens,
      },
      items: citizens.map((citizen) => ({
        id: citizen.id,
        fullName: `${citizen.firstName} ${citizen.lastName}`.trim(),
        nationalId: citizen.nationalId,
        phone: citizen.phone,
        email: citizen.email,
        status: citizen.isActive ? 'ACTIVE' : 'INACTIVE',
        requestsCount: citizen._count.administrativeRequests,
        complaintsCount: citizen._count.complaints,
        createdAt: citizen.createdAt,
      })),
    };
  }

  async findCitizenById(id: string) {
    const citizen = await this.prisma.user.findFirst({
      where: {
        id,
        role: Role.CITIZEN,
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        phone: true,
        email: true,
        nationalId: true,
        address: true,
        isActive: true,
        createdAt: true,
        administrativeRequests: {
          take: 10,
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            title: true,
            status: true,
            createdAt: true,
            requestType: {
              select: {
                name: true,
              },
            },
          },
        },
        complaints: {
          take: 10,
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            title: true,
            status: true,
            createdAt: true,
          },
        },
        missingDocumentsReports: {
          take: 10,
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            title: true,
            status: true,
            createdAt: true,
          },
        },
      },
    });

    if (!citizen) {
      throw new NotFoundException(`Citizen with ID ${id} not found`);
    }

    return citizen;
  }

  async updateUserStatus(id: string, isActive: boolean) {
    await this.findOneWithPassword(id);

    const updatedUser = await this.prisma.user.update({
      where: { id },
      data: { isActive },
    });

    return this.sanitizeUser(updatedUser);
  }

  async resetUserPassword(id: string, newPassword?: string) {
    const temporaryPassword = newPassword || this.generateTemporaryPassword();
    await this.updatePassword(id, temporaryPassword);

    return {
      reset: true,
      temporaryPassword,
    };
  }

  async findAgents(search?: string) {
    const where = this.buildUserSearchWhere(Role.AGENT, search);

    const [agents, totalAgents, activeAgents] = await Promise.all([
      this.prisma.user.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          phone: true,
          employeeId: true,
          jobTitle: true,
          isActive: true,
          department: {
            select: {
              id: true,
              name: true,
            },
          },
          _count: {
            select: {
              assignedRequests: true,
              documentsIssued: true,
            },
          },
        },
      }),
      this.prisma.user.count({ where: { role: Role.AGENT } }),
      this.prisma.user.count({ where: { role: Role.AGENT, isActive: true } }),
    ]);

    const agentItems = agents.map((agent) => {
      const performance = this.calculatePerformance(
        agent._count.assignedRequests,
        agent._count.documentsIssued,
      );

      return {
        id: agent.id,
        employeeId: agent.employeeId,
        fullName: `${agent.firstName} ${agent.lastName}`.trim(),
        email: agent.email,
        phone: agent.phone,
        departmentName: agent.department?.name || 'Non affecté',
        assignedRequestsCount: agent._count.assignedRequests,
        documentsIssuedCount: agent._count.documentsIssued,
        performance,
        status: agent.isActive ? 'ACTIVE' : 'INACTIVE',
        jobTitle: agent.jobTitle,
      };
    });

    const averagePerformance =
      agentItems.length > 0
        ? Math.round(
            agentItems.reduce(
              (sum, agent) => sum + agent.performance,
              0,
            ) / agentItems.length,
          )
        : 0;

    return {
      summary: {
        totalAgents,
        activeAgents,
        averagePerformance,
      },
      items: agentItems,
    };
  }

  async findAgentById(id: string) {
    const agent = await this.prisma.user.findFirst({
      where: {
        id,
        role: Role.AGENT,
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        employeeId: true,
        address: true,
        jobTitle: true,
        isActive: true,
        assignedAt: true,
        department: {
          select: {
            id: true,
            name: true,
          },
        },
        _count: {
          select: {
            assignedRequests: true,
            documentsIssued: true,
          },
        },
        assignedRequests: {
          take: 10,
          orderBy: { updatedAt: 'desc' },
          select: {
            id: true,
            title: true,
            status: true,
            updatedAt: true,
            citizen: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
          },
        },
        actions: {
          take: 10,
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            action: true,
            description: true,
            createdAt: true,
          },
        },
      },
    });

    if (!agent) {
      throw new NotFoundException(`Agent with ID ${id} not found`);
    }

    return {
      ...agent,
      performance: this.calculatePerformance(
        agent._count.assignedRequests,
        agent._count.documentsIssued,
      ),
    };
  }

  async createAgent(dto: CreateAgentDto) {
    const department = dto.departmentName
      ? await this.prisma.department.findFirst({
          where: {
            name: {
              equals: dto.departmentName,
              mode: 'insensitive',
            },
          },
        })
      : null;

    const { firstName, lastName } = this.splitFullName(dto.fullName);
    const temporaryPassword = dto.password || this.generateTemporaryPassword();

    const agent = await this.create({
      email: dto.email,
      password: temporaryPassword,
      firstName,
      lastName,
      phone: dto.phone,
      employeeId: dto.employeeId || this.generateEmployeeId(),
      jobTitle: dto.jobTitle || 'Agent administratif',
      address: dto.address,
      role: Role.AGENT,
      departmentId: department?.id,
      assignedAt: new Date(),
    });

    return {
      ...agent,
      temporaryPassword,
    };
  }

  async updateAgent(id: string, dto: UpdateAgentDto) {
    await this.ensureRole(id, Role.AGENT);

    const department = dto.departmentName
      ? await this.prisma.department.findFirst({
          where: {
            name: {
              equals: dto.departmentName,
              mode: 'insensitive',
            },
          },
        })
      : null;

    const data: Prisma.UserUpdateInput = {};

    if (dto.fullName) {
      const { firstName, lastName } = this.splitFullName(dto.fullName);
      data.firstName = firstName;
      data.lastName = lastName;
    }

    if (dto.email !== undefined) data.email = dto.email;
    if (dto.phone !== undefined) data.phone = dto.phone;
    if (dto.employeeId !== undefined) data.employeeId = dto.employeeId;
    if (dto.jobTitle !== undefined) data.jobTitle = dto.jobTitle;
    if (dto.address !== undefined) data.address = dto.address;
    if (dto.password) data.password = await bcrypt.hash(dto.password, 10);
    if (dto.departmentName !== undefined) {
      data.department = department
        ? { connect: { id: department.id } }
        : { disconnect: true };
    }

    const updatedAgent = await this.prisma.user.update({
      where: { id },
      data,
    });

    return this.sanitizeUser(updatedAgent);
  }

  private buildUserSearchWhere(role: Role, search?: string): Prisma.UserWhereInput {
    if (!search) {
      return { role };
    }

    return {
      role,
      OR: [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } },
        { nationalId: { contains: search, mode: 'insensitive' } },
        { employeeId: { contains: search, mode: 'insensitive' } },
      ],
    };
  }

  private sanitizeUser(user: {
    password: string;
    refreshToken: string | null;
    [key: string]: unknown;
  }) {
    const { password, refreshToken, ...result } = user;
    return result;
  }

  private splitFullName(fullName: string) {
    const trimmedName = fullName.trim();
    const [firstName, ...rest] = trimmedName.split(/\s+/);

    return {
      firstName: firstName || trimmedName,
      lastName: rest.join(' ') || 'Agent',
    };
  }

  private calculatePerformance(
    assignedRequestsCount: number,
    documentsIssuedCount: number,
  ) {
    if (assignedRequestsCount === 0) {
      return 0;
    }

    return Math.min(
      100,
      Math.round((documentsIssuedCount / assignedRequestsCount) * 100),
    );
  }

  private getDateDaysAgo(days: number) {
    const date = new Date();
    date.setDate(date.getDate() - days);
    return date;
  }

  private async ensureRole(id: string, role: Role) {
    const user = await this.findOneWithPassword(id);

    if (user.role !== role) {
      throw new NotFoundException(`${role} with ID ${id} not found`);
    }

    return user;
  }

  private generateTemporaryPassword() {
    return `Temp${Date.now().toString().slice(-8)}!`;
  }

  private generateEmployeeId() {
    return `AGT-${Date.now().toString().slice(-6)}`;
  }
}
