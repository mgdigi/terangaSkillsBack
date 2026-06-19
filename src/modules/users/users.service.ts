import {
  Injectable,
  ConflictException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../core/database/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';

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

  async findAll(role?: Role, search?: string) {
    const users = await this.prisma.user.findMany({
      where: {
        ...(role && { role }),
        ...(search && {
          OR: [
            { firstName: { contains: search, mode: 'insensitive' } },
            { lastName: { contains: search, mode: 'insensitive' } },
            { email: { contains: search, mode: 'insensitive' } },
            { phone: { contains: search, mode: 'insensitive' } },
          ],
        }),
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        role: true,
        isActive: true,
        departmentId: true,
        department: { select: { id: true, name: true } },
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            assignedRequests: true,
            documentsIssued: true,
            complaints: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    return users;
  }

  async findCitizensStats() {
    const [total, active, inactive] = await Promise.all([
      this.prisma.user.count({ where: { role: 'CITIZEN' } }),
      this.prisma.user.count({ where: { role: 'CITIZEN', isActive: true } }),
      this.prisma.user.count({ where: { role: 'CITIZEN', isActive: false } }),
    ]);
    // "Nouveaux" = inscrits ce mois
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);
    const newThisMonth = await this.prisma.user.count({
      where: { role: 'CITIZEN', createdAt: { gte: startOfMonth } },
    });
    return { total, active, inactive, newThisMonth };
  }

  async findAgentsStats() {
    const [total] = await Promise.all([
      this.prisma.user.count({ where: { role: 'AGENT' } }),
    ]);
    const departments = await this.prisma.department.count();
    const totalDossiers = await this.prisma.administrativeRequest.count();
    return { total, departments, totalDossiers };
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        department: { select: { id: true, name: true } },
        administrativeRequests: {
          orderBy: { createdAt: 'desc' },
          take: 10,
          include: { requestType: { select: { name: true } } },
        },
        complaints: {
          orderBy: { createdAt: 'desc' },
          take: 5,
        },
        _count: {
          select: { assignedRequests: true, documentsIssued: true, complaints: true },
        },
      },
    });
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

  async update(id: string, updateUserDto: UpdateUserDto) {
    await this.findOne(id);

    const data: any = { ...updateUserDto };
    if (data.password) {
      data.password = await bcrypt.hash(data.password, 10);
    }

    const updatedUser = await this.prisma.user.update({
      where: { id },
      data,
    });

    const { password, refreshToken, ...result } = updatedUser;
    return result;
  }

  async toggleStatus(id: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException(`User with ID ${id} not found`);
    if (user.role === 'ADMIN') {
      throw new ForbiddenException('Cannot deactivate an admin account');
    }

    const updated = await this.prisma.user.update({
      where: { id },
      data: { isActive: !user.isActive },
    });
    const { password, refreshToken, ...result } = updated;
    return result;
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.user.delete({
      where: { id },
    });
  }
}
