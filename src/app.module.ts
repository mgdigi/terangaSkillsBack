import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './core/database/database.module';
import { UsersModule } from './modules/users/users.module';
import { AuthModule } from './modules/auth/auth.module';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from './core/common/guards/jwt-auth.guard';
import { CloudinaryModule } from './modules/cloudinary/cloudinary.module';
import { MissingDocumentsModule } from './modules/missing-documents/missing-documents.module';
import { ComplaintsModule } from './modules/complaints/complaints.module';
import { AdministrativeRequestsModule } from './modules/administrative-requests/administrative-requests.module';
import { DocumentsModule } from './modules/documents/documents.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { DepartmentsModule } from './modules/departments/departments.module';
import { PaymentModule } from './modules/payment/payment.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    DatabaseModule,
    UsersModule,
    AuthModule,
    CloudinaryModule,
    MissingDocumentsModule,
    ComplaintsModule,
    AdministrativeRequestsModule,
    DocumentsModule,
    DashboardModule,
    DepartmentsModule,
    PaymentModule,
  ],
  controllers: [],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule {}

