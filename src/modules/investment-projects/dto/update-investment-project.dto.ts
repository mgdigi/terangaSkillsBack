import { PartialType } from '@nestjs/swagger';
import { CreateInvestmentProjectDto } from './create-investment-project.dto';
import { IsEnum, IsOptional } from 'class-validator';
import { ProjectStatus } from '@prisma/client';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateInvestmentProjectDto extends PartialType(CreateInvestmentProjectDto) {
  @ApiPropertyOptional({ enum: ProjectStatus })
  @IsOptional()
  @IsEnum(ProjectStatus)
  status?: ProjectStatus;
}
