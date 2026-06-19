import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../core/database/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async getStatistics() {
    const [
      totalCitizens,
      totalAgents,
      totalRequests,
      pendingRequests,
      inProgressRequests,
      completedRequests,
      rejectedRequests,
      totalComplaints,
      openComplaints,
      resolvedComplaints,
      totalMissingDocuments,
      foundMissingDocuments,
      totalDocumentsIssued,
      departments,
      agents,
      totalProjects,
    ] = await Promise.all([
      this.prisma.user.count({ where: { role: 'CITIZEN' } }),
      this.prisma.user.count({ where: { role: 'AGENT' } }),
      this.prisma.administrativeRequest.count(),
      this.prisma.administrativeRequest.count({ where: { status: 'SUBMITTED' } }),
      this.prisma.administrativeRequest.count({ where: { status: 'IN_PROGRESS' } }),
      this.prisma.administrativeRequest.count({ where: { status: 'COMPLETED' } }),
      this.prisma.administrativeRequest.count({ where: { status: 'REJECTED' } }),
      this.prisma.complaint.count(),
      this.prisma.complaint.count({ where: { status: 'OPEN' } }),
      this.prisma.complaint.count({ where: { status: 'RESOLVED' } }),
      this.prisma.missingDocument.count(),
      this.prisma.missingDocument.count({ where: { status: 'FOUND' } }),
      this.prisma.administrativeDocument.count(),
      this.prisma.department.findMany({
        include: {
          _count: { select: { requestTypes: true, complaints: true, agents: true } },
        },
      }),
      this.prisma.user.findMany({
        where: { role: 'AGENT' },
        include: { _count: { select: { assignedRequests: true, documentsIssued: true } } },
      }),
      this.prisma.investmentProject.count(),
    ]);

    return {
      citizens: { total: totalCitizens },
      agents: { total: totalAgents },
      administrativeRequests: {
        total: totalRequests,
        pending: pendingRequests,
        inProgress: inProgressRequests,
        completed: completedRequests,
        rejected: rejectedRequests,
      },
      documents: {
        totalIssued: totalDocumentsIssued,
      },
      complaints: {
        total: totalComplaints,
        open: openComplaints,
        resolved: resolvedComplaints,
      },
      missingDocuments: {
        total: totalMissingDocuments,
        found: foundMissingDocuments,
      },
      projects: {
        total: totalProjects,
      },
      departments: departments.map((d) => ({
        id: d.id,
        name: d.name,
        description: d.description,
        agentsCount: d._count.agents,
        requestTypesCount: d._count.requestTypes,
        complaintsCount: d._count.complaints,
      })),
      agentsPerformance: agents.map((a) => ({
        id: a.id,
        name: `${a.firstName} ${a.lastName}`,
        assignedRequests: a._count.assignedRequests,
        documentsIssued: a._count.documentsIssued,
        performanceScore:
          a._count.assignedRequests > 0
            ? Math.round((a._count.documentsIssued / a._count.assignedRequests) * 100)
            : 0,
      })),
    };
  }

  async getAnalytics() {
    // Calcul des statistiques mensuelles des 6 derniers mois
    const months = [];
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      months.push({
        year: date.getFullYear(),
        month: date.getMonth() + 1,
        label: date.toLocaleDateString('fr-FR', { month: 'short' }),
      });
    }

    const monthlyData = await Promise.all(
      months.map(async ({ year, month, label }) => {
        const start = new Date(year, month - 1, 1);
        const end = new Date(year, month, 0, 23, 59, 59);

        const [demandes, reclamations, documentsIssued] = await Promise.all([
          this.prisma.administrativeRequest.count({
            where: { createdAt: { gte: start, lte: end } },
          }),
          this.prisma.complaint.count({
            where: { createdAt: { gte: start, lte: end } },
          }),
          this.prisma.administrativeDocument.count({
            where: { createdAt: { gte: start, lte: end } },
          }),
        ]);

        return { month: label, demandes, reclamations, documentsIssued };
      }),
    );

    // Répartition des statuts des demandes
    const [validated, inProgress, rejected] = await Promise.all([
      this.prisma.administrativeRequest.count({
        where: { status: { in: ['VALIDATED', 'COMPLETED'] } },
      }),
      this.prisma.administrativeRequest.count({
        where: { status: { in: ['SUBMITTED', 'ASSIGNED', 'IN_PROGRESS', 'PROCESSED'] } },
      }),
      this.prisma.administrativeRequest.count({ where: { status: 'REJECTED' } }),
    ]);

    // Répartition des demandes par département
    const departmentStats = await this.prisma.department.findMany({
      include: {
        requestTypes: {
          include: { _count: { select: { requests: true } } },
        },
      },
    });

    const deptBreakdown = departmentStats.map((d) => ({
      name: d.name,
      total: d.requestTypes.reduce((acc, rt) => acc + rt._count.requests, 0),
    }));

    const totalDeptRequests = deptBreakdown.reduce((acc, d) => acc + d.total, 0);
    const deptWithPercent = deptBreakdown.map((d) => ({
      ...d,
      percentage: totalDeptRequests > 0 ? Math.round((d.total / totalDeptRequests) * 100) : 0,
    }));

    return {
      monthlyActivity: monthlyData,
      requestsByStatus: [
        { name: 'Validées', value: validated },
        { name: 'En cours', value: inProgress },
        { name: 'Rejetées', value: rejected },
      ],
      departmentBreakdown: deptWithPercent,
    };
  }
}
