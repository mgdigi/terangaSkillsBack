import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MinLength } from 'class-validator';

export class ResetPasswordDto {
  @ApiPropertyOptional({ example: 'TempPass123' })
  @IsString()
  @MinLength(6)
  @IsOptional()
  newPassword?: string;
}
