import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../core/database/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async getStatistics() {
    const [
      totalUsers,
      totalRequests,
      pendingRequests,
      completedRequests,
      totalComplaints,
      resolvedComplaints,
      totalMissingDocuments,
      foundMissingDocuments,
    ] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.administrativeRequest.count(),
      this.prisma.administrativeRequest.count({ where: { status: 'PENDING' } }),
      this.prisma.administrativeRequest.count({ where: { status: 'COMPLETED' } }),
      this.prisma.complaint.count(),
      this.prisma.complaint.count({ where: { status: 'RESOLVED' } }),
      this.prisma.missingDocument.count(),
      this.prisma.missingDocument.count({ where: { status: 'FOUND' } }),
    ]);

    return {
      users: { total: totalUsers },
      administrativeRequests: {
        total: totalRequests,
        pending: pendingRequests,
        completed: completedRequests,
      },
      complaints: {
        total: totalComplaints,
        resolved: resolvedComplaints,
      },
      missingDocuments: {
        total: totalMissingDocuments,
        found: foundMissingDocuments,
      },
    };
  }
}
