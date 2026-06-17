import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';

export class CreateAgentDto {
  @ApiProperty({ example: 'Aminata Ndiaye' })
  @IsString()
  @IsNotEmpty()
  fullName: string;

  @ApiProperty({ example: 'aminata.ndiaye@mairie.sn' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiPropertyOptional({ example: '+221770000001' })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiPropertyOptional({ example: 'État Civil' })
  @IsString()
  @IsOptional()
  departmentName?: string;

  @ApiPropertyOptional({ example: 'AGT-001' })
  @IsString()
  @IsOptional()
  employeeId?: string;

  @ApiPropertyOptional({ example: 'Agent instructeur' })
  @IsString()
  @IsOptional()
  jobTitle?: string;

  @ApiPropertyOptional({ example: 'Dakar Plateau' })
  @IsString()
  @IsOptional()
  address?: string;

  @ApiPropertyOptional({ example: 'agent12345' })
  @IsString()
  @MinLength(6)
  @IsOptional()
  password?: string;
}
