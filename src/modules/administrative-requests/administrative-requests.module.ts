import { Module } from '@nestjs/common';
import { AdministrativeRequestsController } from './administrative-requests.controller';
import { AdministrativeRequestsService } from './administrative-requests.service';
import { CloudinaryModule } from '../cloudinary/cloudinary.module';

@Module({
  imports: [CloudinaryModule],
  controllers: [AdministrativeRequestsController],
  providers: [AdministrativeRequestsService]
})
export class AdministrativeRequestsModule {}
