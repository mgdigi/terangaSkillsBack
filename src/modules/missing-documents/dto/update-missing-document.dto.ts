import { PartialType } from '@nestjs/swagger';
import { CreateMissingDocumentDto } from './create-missing-document.dto';

export class UpdateMissingDocumentDto extends PartialType(CreateMissingDocumentDto) {}
