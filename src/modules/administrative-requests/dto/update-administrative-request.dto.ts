import { PartialType } from '@nestjs/swagger';
import { CreateAdministrativeRequestDto } from './create-administrative-request.dto';

export class UpdateAdministrativeRequestDto extends PartialType(CreateAdministrativeRequestDto) {}
