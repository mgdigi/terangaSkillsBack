import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateMissingDocumentDto {
  @ApiProperty({ example: 'Carte d\'identité nationale' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ example: 'Carte d\'identité au nom de John Doe perdue vers Liberté 6.' })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiPropertyOptional({ example: 'Liberté 6, Dakar' })
  @IsString()
  @IsOptional()
  lastSeenLocation?: string;

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

  @ApiPropertyOptional({ type: 'string', format: 'binary', description: 'Photo du document perdu' })
  file?: any;
}

