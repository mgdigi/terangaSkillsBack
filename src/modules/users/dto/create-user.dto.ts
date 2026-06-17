import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Role } from '@prisma/client';

export class CreateUserDto {
  @ApiProperty({ example: 'john.doe@example.com' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: 'password123' })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty({ example: 'John' })
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @ApiProperty({ example: 'Doe' })
  @IsString()
  @IsNotEmpty()
  lastName: string;

  @ApiPropertyOptional({ example: '+221770000000' })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiPropertyOptional({ example: '1234567890123' })
  @IsString()
  @IsOptional()
  nationalId?: string;

  @ApiPropertyOptional({ example: 'Dakar Plateau' })
  @IsString()
  @IsOptional()
  address?: string;

  @ApiPropertyOptional({ example: 'AGT-001' })
  @IsString()
  @IsOptional()
  employeeId?: string;

  @ApiPropertyOptional({ example: 'Agent instructeur' })
  @IsString()
  @IsOptional()
  jobTitle?: string;

  @ApiPropertyOptional({ enum: Role, default: Role.CITIZEN })
  @IsEnum(Role)
  @IsOptional()
  role?: Role;

  @ApiPropertyOptional({ example: 'uuid-department' })
  @IsString()
  @IsOptional()
  departmentId?: string;

  @ApiPropertyOptional({ example: '2026-06-17T00:00:00.000Z' })
  @IsOptional()
  assignedAt?: Date;
}
