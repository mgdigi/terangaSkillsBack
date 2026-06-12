import { Module } from '@nestjs/common';
import { MissingDocumentsService } from './missing-documents.service';
import { MissingDocumentsController } from './missing-documents.controller';
import { CloudinaryModule } from '../cloudinary/cloudinary.module';

@Module({
  imports: [CloudinaryModule],
  controllers: [MissingDocumentsController],
  providers: [MissingDocumentsService],
})
export class MissingDocumentsModule {}
