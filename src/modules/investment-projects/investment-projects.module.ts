import { Module } from '@nestjs/common';
import { InvestmentProjectsService } from './investment-projects.service';
import { InvestmentProjectsController } from './investment-projects.controller';
import { DatabaseModule } from '../../core/database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [InvestmentProjectsController],
  providers: [InvestmentProjectsService],
  exports: [InvestmentProjectsService],
})
export class InvestmentProjectsModule {}
