import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../core/database/database.module';
import { InvestmentProjectsService } from './investment-projects.service';
import { InvestmentProjectsController } from './investment-projects.controller';

@Module({
  imports: [DatabaseModule],
  controllers: [InvestmentProjectsController],
  providers: [InvestmentProjectsService],
})
export class InvestmentProjectsModule {}
