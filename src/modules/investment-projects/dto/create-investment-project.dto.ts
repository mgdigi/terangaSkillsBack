import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNumber, IsOptional, IsDateString, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateInvestmentProjectDto {
  @ApiProperty({ example: 'Construction du marché central' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ example: 'Réhabilitation complète du marché central de Dakar' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: 150000000 })
  @IsNumber()
  @Type(() => Number)
  budget: number;

  @ApiPropertyOptional({ example: 'SEN BATIMENT' })
  @IsOptional()
  @IsString()
  company?: string;

  @ApiPropertyOptional({ example: 65 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  @Type(() => Number)
  progress?: number;

  @ApiPropertyOptional({ example: '2026-01-01' })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({ example: '2026-12-31' })
  @IsOptional()
  @IsDateString()
  endDate?: string;
}
