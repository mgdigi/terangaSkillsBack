import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../core/database/prisma.service';
import { CreateInvestmentProjectDto } from './dto/create-investment-project.dto';
import { UpdateInvestmentProjectDto } from './dto/update-investment-project.dto';
import { ProjectStatus } from '@prisma/client';

@Injectable()
export class InvestmentProjectsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateInvestmentProjectDto, adminId: string) {
    return this.prisma.investmentProject.create({
      data: {
        name: dto.name,
        description: dto.description,
        budget: dto.budget,
        company: dto.company,
        progress: dto.progress ?? 0,
        startDate: dto.startDate ? new Date(dto.startDate) : null,
        endDate: dto.endDate ? new Date(dto.endDate) : null,
        createdById: adminId,
      },
      include: {
        createdBy: { select: { firstName: true, lastName: true } },
      },
    });
  }

  async findAll(search?: string, status?: ProjectStatus) {
    return this.prisma.investmentProject.findMany({
      where: {
        ...(search && {
          OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { company: { contains: search, mode: 'insensitive' } },
          ],
        }),
        ...(status && { status }),
      },
      include: {
        createdBy: { select: { firstName: true, lastName: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getStats() {
    const [total, inProgress, completed, totalBudget] = await Promise.all([
      this.prisma.investmentProject.count(),
      this.prisma.investmentProject.count({ where: { status: 'IN_PROGRESS' } }),
      this.prisma.investmentProject.count({ where: { status: 'COMPLETED' } }),
      this.prisma.investmentProject.aggregate({ _sum: { budget: true } }),
    ]);

    const projects = await this.prisma.investmentProject.findMany({ select: { progress: true } });
    const avgProgress = projects.length > 0
      ? Math.round(projects.reduce((acc, p) => acc + p.progress, 0) / projects.length)
      : 0;

    return { total, inProgress, completed, totalBudget: totalBudget._sum.budget || 0, avgProgress };
  }

  async findOne(id: string) {
    const project = await this.prisma.investmentProject.findUnique({
      where: { id },
      include: {
        createdBy: { select: { firstName: true, lastName: true } },
      },
    });
    if (!project) throw new NotFoundException(`Investment project with ID ${id} not found`);
    return project;
  }

  async update(id: string, dto: UpdateInvestmentProjectDto) {
    await this.findOne(id);
    return this.prisma.investmentProject.update({
      where: { id },
      data: {
        ...dto,
        startDate: dto.startDate ? new Date(dto.startDate) : undefined,
        endDate: dto.endDate ? new Date(dto.endDate) : undefined,
      },
      include: {
        createdBy: { select: { firstName: true, lastName: true } },
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.investmentProject.delete({ where: { id } });
  }
}
