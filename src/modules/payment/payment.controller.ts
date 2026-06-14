import { Controller, Post, Body, Param, UseGuards, Req } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../core/common/guards/jwt-auth.guard';
import { RolesGuard } from '../../core/common/guards/roles.guard';
import { Roles } from '../../core/common/decorators/roles.decorator';
import { Role } from '@prisma/client';

@ApiTags('Payment')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('payment')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post(':requestId/mock')
  @Roles(Role.CITIZEN)
  @ApiOperation({ summary: 'Process a mock payment for a request' })
  processMockPayment(
    @Param('requestId') requestId: string,
    @Body('amount') amount: number,
    @Body('provider') provider: string,
    @Req() req: any,
  ) {
    return this.paymentService.processMockPayment(requestId, amount, provider, req.user.id);
  }
}
