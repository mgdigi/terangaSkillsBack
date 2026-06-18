import {
  PrismaClient,
  Role,
  RequestStatus,
  ComplaintStatus,
  MissingDocumentStatus,
  ProjectStatus,
} from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

function pick<T>(arr: T[]) {
  return arr[Math.floor(Math.random() * arr.length)];
}

async function upsertDepartment(name: string) {
  return prisma.department.upsert({
    where: { name },
    update: {},
    create: { name, isActive: true, description: `Department ${name}` },
  });
}

async function upsertRequestType(name: string, departmentId: string) {
  return prisma.requestType.upsert({
    where: { name },
    update: { departmentId },
    create: { name, departmentId, description: `RequestType ${name}` },
  });
}

async function createOrUpdateUser(params: {
  email: string;
  password?: string;
  firstName: string;
  lastName: string;
  phone?: string | null;
  role: Role;
  departmentId?: string | null;
  employeeId?: string | null;
  jobTitle?: string | null;
  nationalId?: string | null;
  assignedAt?: Date | null;
}) {
  const {
    email,
    password,
    firstName,
    lastName,
    phone,
    role,
    departmentId,
    employeeId,
    jobTitle,
    nationalId,
    assignedAt,
  } = params;

  const existing = await prisma.user.findUnique({ where: { email } });

  if (existing) {
    const data: any = {
      firstName,
      lastName,
      phone,
      role,
      isActive: true,
    };

    if (departmentId !== undefined) data.departmentId = departmentId;
    if (employeeId !== undefined) data.employeeId = employeeId;
    if (jobTitle !== undefined) data.jobTitle = jobTitle;
    if (nationalId !== undefined) data.nationalId = nationalId;
    if (assignedAt !== undefined) data.assignedAt = assignedAt;

    if (password) data.password = await bcrypt.hash(password, 10);

    await prisma.user.update({ where: { email }, data });
    return prisma.user.findUnique({ where: { email } });
  }

  const hashed = password
    ? await bcrypt.hash(password, 10)
    : await bcrypt.hash('pass123', 10);

  return prisma.user.create({
    data: {
      email,
      password: hashed,
      firstName,
      lastName,
      phone: phone ?? null,
      role,
      isActive: true,
      departmentId: departmentId ?? null,
      employeeId: employeeId ?? null,
      jobTitle: jobTitle ?? null,
      nationalId: nationalId ?? null,
      assignedAt: assignedAt ?? (role === Role.AGENT ? new Date() : undefined),
    },
  });
}

async function createAdministrativeRequest(params: {
  title: string;
  description: string;
  citizenId: string;
  requestTypeId: string;
  assignedAgentId?: string | null;
  status: RequestStatus;
  attachments?: string[];
}) {
  // Idempotency: reuse by (title + citizen + requestType)
  const existing = await prisma.administrativeRequest.findFirst({
    where: {
      title: params.title,
      citizenId: params.citizenId,
      requestTypeId: params.requestTypeId,
    },
    select: { id: true },
  });

  if (existing) {
    await prisma.administrativeRequest.update({
      where: { id: existing.id },
      data: {
        description: params.description,
        assignedAgentId: params.assignedAgentId ?? null,
        status: params.status,
        attachments: params.attachments ?? [],
        data: {},
      },
    });
    return prisma.administrativeRequest.findUnique({
      where: { id: existing.id },
    });
  }

  return prisma.administrativeRequest.create({
    data: {
      title: params.title,
      description: params.description,
      citizenId: params.citizenId,
      requestTypeId: params.requestTypeId,
      assignedAgentId: params.assignedAgentId ?? null,
      status: params.status,
      attachments: params.attachments ?? [],
      data: {},
    },
  });
}

async function createComplaint(params: {
  title: string;
  description: string;
  citizenId: string;
  departmentId: string;
  status: ComplaintStatus;
}) {
  const existing = await prisma.complaint.findFirst({
    where: {
      title: params.title,
      citizenId: params.citizenId,
      departmentId: params.departmentId,
    },
    select: { id: true },
  });

  if (existing) {
    await prisma.complaint.update({
      where: { id: existing.id },
      data: {
        description: params.description,
        status: params.status,
      },
    });
    return prisma.complaint.findUnique({ where: { id: existing.id } });
  }

  return prisma.complaint.create({
    data: {
      title: params.title,
      description: params.description,
      citizenId: params.citizenId,
      departmentId: params.departmentId,
      status: params.status,
      photoUrl: null,
      latitude: null,
      longitude: null,
    },
  });
}

async function createMissingDocument(params: {
  title: string;
  description: string;
  reportedById: string;
  status: MissingDocumentStatus;
  isVerified: boolean;
}) {
  const existing = await prisma.missingDocument.findFirst({
    where: {
      title: params.title,
      reportedById: params.reportedById,
    },
    select: { id: true },
  });

  if (existing) {
    await prisma.missingDocument.update({
      where: { id: existing.id },
      data: {
        description: params.description,
        status: params.status,
        isVerified: params.isVerified,
      },
    });
    return prisma.missingDocument.findUnique({ where: { id: existing.id } });
  }

  return prisma.missingDocument.create({
    data: {
      title: params.title,
      description: params.description,
      reportedById: params.reportedById,
      status: params.status,
      isVerified: params.isVerified,
      photoUrl: null,
      lastSeenLocation: null,
      latitude: null,
      longitude: null,
    },
  });
}

async function createInvestmentProject(params: {
  reference: string;
  name: string;
  company: string;
  budget: number;
  startDate: Date;
  endDate?: Date;
  status: ProjectStatus;
}) {
  await prisma.investmentProject.upsert({
    where: { reference: params.reference },
    update: {
      name: params.name,
      company: params.company,
      budget: params.budget,
      startDate: params.startDate,
      endDate: params.endDate ?? null,
      status: params.status,
      spentAmount: Math.round(params.budget * Math.random() * 0.4),
      progress: 0,
      description: `Project ${params.name}`,
    },
    create: {
      reference: params.reference,
      name: params.name,
      company: params.company,
      budget: params.budget,
      spentAmount: Math.round(params.budget * Math.random() * 0.4),
      startDate: params.startDate,
      endDate: params.endDate ?? null,
      status: params.status,
      progress: 0,
      description: `Project ${params.name}`,
    },
  });
}

async function main() {
  // Admin standard (seule source de démo)
  await createOrUpdateUser({
    email: 'diengabzo@gmail.com',
    password: 'pass123',
    firstName: 'Super',
    lastName: 'Admin',
    phone: '+221770000000',
    role: Role.ADMIN,
    departmentId: null,
    employeeId: null,
    jobTitle: 'Admin',
    nationalId: null,
    assignedAt: null,
  });

  // If already seeded, keep idempotency by just ensuring minimum volumes.
  // Minimal strategy: seed full demo dataset if key table is empty.
  const departmentCount = await prisma.department.count();
  if (departmentCount === 0) {
    const departmentsToCreate = [
      {
        name: 'État Civil',
        requestTypes: ['Acte de naissance', 'Acte de décès', 'Acte de mariage'],
      },
      {
        name: 'Urbanisme',
        requestTypes: [
          'Permis de construire',
          'Certificat d urbanisme',
          'Autorisation de lotir',
        ],
      },
      { name: 'Affaires Sociales', requestTypes: ['Attestation de vie'] },
      { name: 'Voirie', requestTypes: ['Autorisation voirie'] },
      { name: 'Assainissement', requestTypes: ['Autorisation assainissement'] },
    ];

    const departments = [] as { id: string; name: string }[];
    for (const d of departmentsToCreate) {
      const dep = await upsertDepartment(d.name);
      departments.push({ id: dep.id, name: dep.name });
    }

    const requestTypeIds: string[] = [];
    for (const d of departmentsToCreate) {
      const dep = departments.find((x) => x.name === d.name)!;
      for (const rt of d.requestTypes) {
        const rtRow = await upsertRequestType(rt, dep.id);
        requestTypeIds.push(rtRow.id);
      }
    }

    // Agents (5)
    const agentDepartmentNames = departmentsToCreate.map((d) => d.name);
    const agentFirstNames = ['Mamadou', 'Awa', 'Cheikh', 'Aminata', 'Fatou'];
    const agentLastNames = ['Fall', 'Ba', 'Diop', 'Ndiaye', 'Ndiaye'];

    const agents: { id: string; deptName: string }[] = [];
    for (let i = 0; i < 5; i++) {
      const deptName = agentDepartmentNames[i];
      const dep = departments.find((x) => x.name === deptName)!;
      const email = `agent${i + 1}@demo.local`;

      const user = await createOrUpdateUser({
        email,
        password: 'pass123',
        firstName: agentFirstNames[i],
        lastName: agentLastNames[i],
        phone: `+22177${String(10000000 + i * 1234).slice(-8)}`,
        role: Role.AGENT,
        departmentId: dep.id,
        employeeId: `AGT-DEMO-${i + 1}`,
        jobTitle: `Agent ${deptName}`,
        nationalId: null,
        assignedAt: new Date(),
      });

      agents.push({ id: user!.id, deptName });
    }

    // Citizens (10)
    const citizenFirstNames = [
      'Mamadou',
      'Fatou',
      'Ousmane',
      'Aïssatou',
      'Moustapha',
      'Sokhna',
      'Binta',
      'Omar',
      'Mariama',
      'Ibrahima',
    ];
    const citizenLastNames = [
      'Diop',
      'Ndiaye',
      'Fall',
      'Sow',
      'Diallo',
      'Ba',
      'Diallo',
      'Ndao',
      'Gaye',
      'Ndoye',
    ];

    const citizens: { id: string }[] = [];
    for (let i = 0; i < 10; i++) {
      const email = `citizen${i + 1}@demo.local`;
      const user = await createOrUpdateUser({
        email,
        password: 'pass123',
        firstName: citizenFirstNames[i],
        lastName: citizenLastNames[i],
        phone: `+22178${String(10000000 + i * 4321).slice(-8)}`,
        role: Role.CITIZEN,
        departmentId: null,
        employeeId: null,
        jobTitle: null,
        nationalId: `NCI-DEMO-${i + 1}`,
        assignedAt: null,
      });
      citizens.push({ id: user!.id });
    }

    // Administrative Requests (20)
    const possibleStatuses: RequestStatus[] = [
      'SUBMITTED',
      'ASSIGNED',
      'IN_PROGRESS',
      'PROCESSED',
      'VALIDATED',
      'AWAITING_PAYMENT',
      'COMPLETED',
      'REJECTED',
    ];

    for (let i = 0; i < 20; i++) {
      const citizen = pick(citizens);
      const rtId = pick(requestTypeIds);
      const agent = pick(agents);
      const assignedAgentId = Math.random() < 0.8 ? agent.id : null;
      const status = pick(possibleStatuses);

      await createAdministrativeRequest({
        title: `Demande de document #${i + 1}`,
        description: `Description demo administrative request #${i + 1}`,
        citizenId: citizen.id,
        requestTypeId: rtId,
        assignedAgentId,
        status,
        attachments: ['https://example.com/doc1.pdf'],
      });
    }

    // Complaints (10)
    const complaintsStatuses: ComplaintStatus[] = [
      'OPEN',
      'IN_PROGRESS',
      'RESOLVED',
      'CLOSED',
    ];
    for (let i = 0; i < 10; i++) {
      const citizen = pick(citizens);
      const dep = pick(departments);

      await createComplaint({
        title: `Réclamation #${i + 1}`,
        description: `Description demo complaint #${i + 1}`,
        citizenId: citizen.id,
        departmentId: dep.id,
        status: pick(complaintsStatuses),
      });
    }

    // Missing Documents (10)
    const missingStatuses: MissingDocumentStatus[] = [
      'MISSING',
      'FOUND',
      'RETURNED',
      'ARCHIVED',
    ];
    for (let i = 0; i < 10; i++) {
      const citizen = pick(citizens);
      await createMissingDocument({
        title: `Document perdu #${i + 1}`,
        description: `Description demo missing document #${i + 1}`,
        reportedById: citizen.id,
        status: pick(missingStatuses),
        isVerified: Math.random() < 0.3,
      });
    }

    // Investment Projects (5)
    const projectStatuses: ProjectStatus[] = [
      'PLANNED',
      'IN_PROGRESS',
      'COMPLETED',
      'SUSPENDED',
    ];
    const companies = [
      'Teranga Group',
      'Dakar Invest',
      'SeneTech',
      'Sahel Developments',
      'UrbanPro',
    ];
    for (let i = 0; i < 5; i++) {
      const start = new Date(Date.now() - (i + 1) * 30 * 24 * 60 * 60 * 1000);
      const end = new Date(
        start.getTime() + (i + 2) * 45 * 24 * 60 * 60 * 1000,
      );

      await createInvestmentProject({
        reference: `INV-DEMO-${Date.now()}-${i + 1}`,
        name: `Projet ${i + 1}`,
        company: companies[i],
        budget: 1000000 + i * 250000,
        startDate: start,
        endDate: end,
        status: pick(projectStatuses),
      });
    }

    console.log('✅ Demo seed completed (ADMIN/AGENT/CITIZEN only).');
  } else {
    console.log('✅ Departments already exist; keeping existing demo data.');
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
