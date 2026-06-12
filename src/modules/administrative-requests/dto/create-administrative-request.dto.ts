import { IsEnum, IsNotEmpty, IsObject, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AdministrativeRequestType } from '@prisma/client';

export class CreateAdministrativeRequestDto {
  @ApiProperty({ enum: AdministrativeRequestType, example: AdministrativeRequestType.BIRTH_CERTIFICATE })
  @IsEnum(AdministrativeRequestType)
  @IsNotEmpty()
  type: AdministrativeRequestType;

  @ApiProperty({ example: 'Demande d\'extrait de naissance' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ example: 'J\'aimerais avoir un extrait de naissance pour mon fils.' })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiPropertyOptional({ 
    example: { 
      nomPere: 'Sow', 
      nomMere: 'Diop', 
      dateNaissance: '2020-01-01', 
      lieuNaissance: 'Dakar' 
    },
    description: 'Informations spécifiques requises selon le type de demande'
  })
  @IsObject()
  @IsOptional()
  data?: any;

  @ApiPropertyOptional({
    type: 'array',
    items: { type: 'string', format: 'binary' },
    description: 'Pièces jointes optionnelles (ex: certificat médical, ticket d\'hôpital)',
  })
  files?: any[];
}

