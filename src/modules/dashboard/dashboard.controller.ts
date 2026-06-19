import { Controller, Get } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { Roles } from '../../core/common/decorators/roles.decorator';

@ApiTags('dashboard')
@ApiBearerAuth()
@Roles(Role.ADMIN, Role.AGENT)
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('statistics')
  @ApiOperation({ summary: 'Get global platform statistics (Admin/Agent)' })
  getStatistics() {
    return this.dashboardService.getStatistics();
  }

  @Get('analytics')
  @ApiOperation({ summary: 'Get detailed analytics with monthly data and charts (Admin/Agent)' })
  getAnalytics() {
    return this.dashboardService.getAnalytics();
  }
}
