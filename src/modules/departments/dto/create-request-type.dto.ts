import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateRequestTypeDto {
  @ApiProperty({ example: 'Acte de naissance' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({ example: 'Demande pour obtenir un acte de naissance' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ example: 'uuid-of-department' })
  @IsString()
  @IsNotEmpty()
  departmentId: string;
}
