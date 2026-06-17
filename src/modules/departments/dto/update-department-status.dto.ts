import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean } from 'class-validator';

export class UpdateDepartmentStatusDto {
  @ApiProperty({ example: false })
  @IsBoolean()
  isActive: boolean;
}
