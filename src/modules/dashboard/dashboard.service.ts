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
      totalDocumentsIssued,
      departments,
      agents,
    ] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.administrativeRequest.count(),
      this.prisma.administrativeRequest.count({ where: { status: 'SUBMITTED' } }),
      this.prisma.administrativeRequest.count({ where: { status: 'COMPLETED' } }),
      this.prisma.complaint.count(),
      this.prisma.complaint.count({ where: { status: 'RESOLVED' } }),
      this.prisma.missingDocument.count(),
      this.prisma.missingDocument.count({ where: { status: 'FOUND' } }),
      this.prisma.administrativeDocument.count(),
      this.prisma.department.findMany({
        include: { _count: { select: { requestTypes: true, complaints: true } } },
      }),
      this.prisma.user.findMany({
        where: { role: 'AGENT' },
        include: { _count: { select: { assignedRequests: true, documentsIssued: true } } },
      })
    ]);

    // Mock revenue for completed requests (assuming 2000 CFA per completed request)
    const mockRevenue = completedRequests * 2000;

    return {
      users: { total: totalUsers },
      administrativeRequests: {
        total: totalRequests,
        pending: pendingRequests,
        completed: completedRequests,
      },
      documents: {
        totalIssued: totalDocumentsIssued,
      },
      complaints: {
        total: totalComplaints,
        resolved: resolvedComplaints,
      },
      missingDocuments: {
        total: totalMissingDocuments,
        found: foundMissingDocuments,
      },
      departments: departments.map(d => ({
        name: d.name,
        requestTypesCount: d._count.requestTypes,
        complaintsCount: d._count.complaints,
      })),
      agentsPerformance: agents.map(a => ({
        name: `${a.firstName} ${a.lastName}`,
        assignedRequests: a._count.assignedRequests,
        documentsIssued: a._count.documentsIssued,
      })),
      revenue: {
        totalMockRevenue: mockRevenue,
      }
    };
  }
}
