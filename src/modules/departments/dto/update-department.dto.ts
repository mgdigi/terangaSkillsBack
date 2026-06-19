import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional } from 'class-validator';

export class UpdateDepartmentDto {
  @ApiPropertyOptional({ example: 'État Civil' })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({ example: 'Service en charge des actes d\'état civil' })
  @IsString()
  @IsOptional()
  description?: string;
}
