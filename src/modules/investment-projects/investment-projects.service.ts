import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../../core/database/prisma.service';
import { CreateInvestmentProjectDto } from './dto/create-investment-project.dto';
import { UpdateInvestmentProjectDto } from './dto/update-investment-project.dto';

@Injectable()
export class InvestmentProjectsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateInvestmentProjectDto) {
    const existing = await this.prisma.investmentProject.findUnique({
      where: { reference: dto.reference },
    });

    if (existing) {
      throw new ConflictException(
        'A project with this reference already exists',
      );
    }

    return this.prisma.investmentProject.create({
      data: {
        ...dto,
        startDate: new Date(dto.startDate),
        endDate: dto.endDate ? new Date(dto.endDate) : null,
      },
    });
  }

  async findAll() {
    return this.prisma.investmentProject.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(id: string) {
    const project = await this.prisma.investmentProject.findUnique({
      where: { id },
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

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
    });
  }

  async remove(id: string) {
    await this.findOne(id);

    return this.prisma.investmentProject.delete({
      where: { id },
    });
  }
}
