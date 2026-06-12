import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateComplaintDto {
  @ApiProperty({ example: 'Panne d\'éclairage public' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ example: 'Le lampadaire devant ma maison ne fonctionne plus depuis 3 jours.' })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiPropertyOptional({ example: 14.7167 })
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  latitude?: number;

  @ApiPropertyOptional({ example: -17.4677 })
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  longitude?: number;

  @ApiPropertyOptional({ type: 'string', format: 'binary', description: 'Photo de la réclamation' })
  file?: any;
}

