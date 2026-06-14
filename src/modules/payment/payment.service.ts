import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../core/database/prisma.service';

@Injectable()
export class PaymentService {
  constructor(private readonly prisma: PrismaService) {}

  async processMockPayment(requestId: string, amount: number, provider: string, userId: string) {
    const request = await this.prisma.administrativeRequest.findUnique({
      where: { id: requestId },
    });

    if (!request) {
      throw new NotFoundException('Administrative request not found');
    }

    if (request.status !== 'AWAITING_PAYMENT') {
      throw new BadRequestException('Request is not in AWAITING_PAYMENT status');
    }

    // Mock payment processing (simulate a delay)
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Update request status to COMPLETED
    const updatedRequest = await this.prisma.administrativeRequest.update({
      where: { id: requestId },
      data: { status: 'COMPLETED' },
    });

    await this.prisma.actionLog.create({
      data: {
        action: 'PAYMENT_PROCESSED',
        description: `Payment of ${amount} via ${provider} successful`,
        actorId: userId,
        administrativeRequestId: requestId,
      },
    });

    return {
      message: 'Payment processed successfully',
      request: updatedRequest,
    };
  }
}
