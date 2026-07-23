import { PrismaClient, DocumentStatus, DocumentType, Discipline, UserRole, ActivityAction, RfiStatus, RfiPriority } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";
import "dotenv/config";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const DEMO_PASSWORD = "bcim@123";

const USERS: { name: string; email: string; role: UserRole }[] = [
  { name: "Arun Kumar", email: "arun.kumar@bcim.in", role: UserRole.DOCUMENT_CONTROLLER },
  { name: "Karthik S", email: "karthik.s@bcim.in", role: UserRole.SITE_ENGINEER },
  { name: "Dheena Dayalan", email: "dheena.dayalan@bcim.in", role: UserRole.SUPER_ADMIN },
  { name: "Priya Ramesh", email: "priya.ramesh@bcim.in", role: UserRole.QAQC_ENGINEER },
  { name: "Vignesh Raja", email: "vignesh.raja@bcim.in", role: UserRole.PROJECT_MANAGER },
  { name: "Meena Iyer", email: "meena.iyer@bcim.in", role: UserRole.PLANNING_ENGINEER },
];

const CATEGORIES = ["Drawing", "RFI", "Submittal", "Transmittal", "Contract", "BOQ", "Report", "Correspondence"];

const ALL_DISCIPLINE_FOLDERS: { name: string; discipline: Discipline }[] = [
  { name: "Civil", discipline: Discipline.CIVIL },
  { name: "Architecture", discipline: Discipline.ARCHITECTURE },
  { name: "Structural", discipline: Discipline.STRUCTURAL },
  { name: "MEP", discipline: Discipline.MEP },
  { name: "Electrical", discipline: Discipline.ELECTRICAL },
  { name: "HVAC", discipline: Discipline.HVAC },
  { name: "Plumbing", discipline: Discipline.PLUMBING },
  { name: "Fire Fighting", discipline: Discipline.FIRE_FIGHTING },
  { name: "QAQC", discipline: Discipline.QAQC },
  { name: "Safety", discipline: Discipline.SAFETY },
];

const DOC_TEMPLATES: {
  namePrefix: string;
  type: DocumentType;
  ext: "pdf" | "dwg" | "xlsx";
}[] = [
  { namePrefix: "GROUND FLOOR PLAN", type: DocumentType.DRAWING, ext: "pdf" },
  { namePrefix: "FIRST FLOOR PLAN", type: DocumentType.DRAWING, ext: "pdf" },
  { namePrefix: "SECOND FLOOR PLAN", type: DocumentType.DRAWING, ext: "pdf" },
  { namePrefix: "COLUMN SCHEDULE", type: DocumentType.OFFICE_FILE, ext: "xlsx" },
  { namePrefix: "BEAM DETAILS", type: DocumentType.CAD_DRAWING, ext: "dwg" },
  { namePrefix: "FOOTING DETAILS", type: DocumentType.DRAWING, ext: "pdf" },
  { namePrefix: "STAIRCASE DETAILS", type: DocumentType.CAD_DRAWING, ext: "dwg" },
  { namePrefix: "REBAR SCHEDULE", type: DocumentType.OFFICE_FILE, ext: "xlsx" },
  { namePrefix: "RFI CLARIFICATION", type: DocumentType.RFI, ext: "pdf" },
  { namePrefix: "MATERIAL SUBMITTAL", type: DocumentType.SUBMITTAL, ext: "pdf" },
  { namePrefix: "SITE TRANSMITTAL", type: DocumentType.TRANSMITTAL, ext: "pdf" },
];

const STATUSES = [
  DocumentStatus.APPROVED,
  DocumentStatus.APPROVED,
  DocumentStatus.APPROVED,
  DocumentStatus.UNDER_REVIEW,
  DocumentStatus.DRAFT,
  DocumentStatus.REJECTED,
];

function pick<T>(arr: T[], i: number): T {
  return arr[i % arr.length];
}

function randomBetween(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

type ProjectDef = {
  name: string;
  code: string;
  location: string;
  building: string;
  disciplineCount: number;
};

const PROJECT_DEFS: ProjectDef[] = [
  {
    name: "BCIM Residential Tower",
    code: "BCIM-RT-01",
    location: "Chennai, Tamil Nadu",
    building: "Tower A",
    disciplineCount: 10,
  },
  {
    name: "BCIM Corporate Waterfront",
    code: "BCIM-CW-02",
    location: "Kochi, Kerala",
    building: "Block B",
    disciplineCount: 7,
  },
  {
    name: "BCIM Metro Transit Hub",
    code: "BCIM-MT-03",
    location: "Bengaluru, Karnataka",
    building: "Concourse Level",
    disciplineCount: 6,
  },
];

async function seedProject(
  def: ProjectDef,
  users: { id: string; name: string }[],
  userByName: Record<string, { id: string; name: string }>,
  categories: { id: string }[]
) {
  const project = await prisma.project.create({
    data: { name: def.name, code: def.code, location: def.location },
  });

  const constructionFolder = await prisma.folder.create({
    data: { name: "Construction", path: "/Construction", projectId: project.id },
  });

  const disciplines = ALL_DISCIPLINE_FOLDERS.slice(0, def.disciplineCount);
  let docCounter = 1;
  const now = Date.now();

  for (const df of disciplines) {
    const disciplineFolder = await prisma.folder.create({
      data: {
        name: df.name,
        path: `/Construction/${df.name}`,
        projectId: project.id,
        parentId: constructionFolder.id,
      },
    });

    const drawingsFolder = await prisma.folder.create({
      data: {
        name: "Drawings",
        path: `/Construction/${df.name}/Drawings`,
        projectId: project.id,
        parentId: disciplineFolder.id,
      },
    });

    const docCount = df.discipline === Discipline.STRUCTURAL ? DOC_TEMPLATES.length : randomBetween(3, 6);

    for (let i = 0; i < docCount; i++) {
      const template = pick(DOC_TEMPLATES, i);
      const status = pick(STATUSES, docCounter + i);
      const uploader = pick(users, docCounter + i);
      const docNo = `${def.code.split("-")[1]}_${df.name.slice(0, 3).toUpperCase()}_${String(docCounter).padStart(2, "0")}`;
      const version = `V${randomBetween(1, 3)}`;
      const sizeBytes = randomBetween(300_000, 5_000_000);
      const daysAgo = randomBetween(0, 60);
      const createdAt = new Date(now - daysAgo * 24 * 60 * 60 * 1000);

      const document = await prisma.document.create({
        data: {
          documentNo: docNo,
          name: `${docNo}_${template.namePrefix}.${template.ext}`,
          description: `${template.namePrefix} for ${df.name} discipline, ${project.name}.`,
          type: template.type,
          discipline: df.discipline,
          status,
          version,
          building: def.building,
          floor: template.namePrefix.includes("FLOOR") ? template.namePrefix.replace(" PLAN", "") : null,
          sizeBytes,
          fileUrl: `/mock-files/${docNo}.${template.ext}`,
          projectId: project.id,
          folderId: drawingsFolder.id,
          categoryId: categories[docCounter % categories.length].id,
          uploadedById: uploader.id,
          createdAt,
          updatedAt: createdAt,
          tags: [df.name.toLowerCase(), template.type.toLowerCase()],
        },
      });

      await prisma.documentVersion.create({
        data: {
          documentId: document.id,
          version,
          isMajor: true,
          notes: "Initial upload",
          sizeBytes,
          fileUrl: document.fileUrl,
          uploadedById: uploader.id,
          createdAt,
        },
      });

      if (status === DocumentStatus.APPROVED) {
        await prisma.documentApproval.create({
          data: {
            documentId: document.id,
            status: DocumentStatus.APPROVED,
            comment: "Looks good, approved for construction.",
            actorId: userByName["Priya Ramesh"].id,
            createdAt,
          },
        });
      } else if (status === DocumentStatus.REJECTED) {
        await prisma.documentApproval.create({
          data: {
            documentId: document.id,
            status: DocumentStatus.REJECTED,
            comment: "Revise column grid alignment and resubmit.",
            actorId: userByName["Priya Ramesh"].id,
            createdAt,
          },
        });
      }

      await prisma.activity.create({
        data: {
          action: ActivityAction.UPLOADED,
          documentId: document.id,
          userId: uploader.id,
          message: `${uploader.name} uploaded ${document.name}`,
          createdAt,
        },
      });

      docCounter++;
    }
  }

  return { project, documentCount: docCounter - 1, folderCount: disciplines.length * 2 + 1 };
}

const RFI_TEMPLATES: { subject: string; question: string; discipline: Discipline; priority: RfiPriority }[] = [
  {
    subject: "Column reinforcement clash with MEP duct routing",
    question:
      "The proposed HVAC duct routing on the 2nd floor clashes with the column reinforcement cage at grid line C4. Please confirm whether the duct can be rerouted or if the column detail needs revision.",
    discipline: Discipline.STRUCTURAL,
    priority: RfiPriority.HIGH,
  },
  {
    subject: "Waterproofing detail at basement retaining wall",
    question:
      "Drawing STR-B-04 does not specify the waterproofing membrane lap detail at the construction joint. Please issue a revised detail or confirm standard BCIM detail applies.",
    discipline: Discipline.CIVIL,
    priority: RfiPriority.MEDIUM,
  },
  {
    subject: "Fire-rated door schedule discrepancy",
    question:
      "Door schedule lists FD-12 as 90-minute rated but the architectural plan shows a 60-minute rating for the same opening. Please clarify the correct rating before procurement.",
    discipline: Discipline.FIRE_FIGHTING,
    priority: RfiPriority.CRITICAL,
  },
  {
    subject: "Electrical panel clearance in switch room",
    question:
      "As-built dimensions of the switch room leave only 750mm clearance in front of DB-04, below the 900mm code minimum. Please advise on relocation or layout revision.",
    discipline: Discipline.ELECTRICAL,
    priority: RfiPriority.HIGH,
  },
  {
    subject: "Facade cladding fixing detail at parapet",
    question:
      "The parapet cladding fixing detail on ARC-14 does not show the wind load bracket spacing. Please provide the structural engineer's calculation-backed spacing.",
    discipline: Discipline.ARCHITECTURE,
    priority: RfiPriority.MEDIUM,
  },
  {
    subject: "Plumbing riser diagram missing isolation valves",
    question:
      "The domestic water riser diagram for Tower A does not show isolation valves at each floor branch. Please confirm if valves are required per BCIM standard specification.",
    discipline: Discipline.PLUMBING,
    priority: RfiPriority.LOW,
  },
  {
    subject: "HVAC chiller plant room ventilation rate",
    question:
      "Confirm the required air changes per hour for the chiller plant room ventilation — current design shows 8 ACH, project specification references 10 ACH minimum.",
    discipline: Discipline.HVAC,
    priority: RfiPriority.MEDIUM,
  },
  {
    subject: "QAQC hold point for post-tension stressing",
    question:
      "Please confirm the hold point sequence for post-tension cable stressing on the transfer slab — QAQC inspection was not scheduled prior to grouting on Level 3.",
    discipline: Discipline.QAQC,
    priority: RfiPriority.CRITICAL,
  },
];

async function seedRfis(projectId: string, users: { id: string; name: string }[]) {
  const now = Date.now();
  const statuses = [RfiStatus.OPEN, RfiStatus.OPEN, RfiStatus.ANSWERED, RfiStatus.ANSWERED, RfiStatus.CLOSED];

  for (let i = 0; i < RFI_TEMPLATES.length; i++) {
    const t = RFI_TEMPLATES[i];
    const status = pick(statuses, i + projectId.length);
    const raisedBy = pick(users, i);
    const assignedTo = pick(users, i + 3);
    const daysAgo = randomBetween(1, 25);
    const createdAt = new Date(now - daysAgo * 24 * 60 * 60 * 1000);
    const dueDate = new Date(createdAt.getTime() + randomBetween(3, 14) * 24 * 60 * 60 * 1000);

    await prisma.rfi.create({
      data: {
        rfiNo: `RFI-${projectId.slice(-4).toUpperCase()}-${String(i + 1).padStart(3, "0")}`,
        subject: t.subject,
        question: t.question,
        response:
          status !== RfiStatus.OPEN
            ? "Reviewed with design team — refer to attached revised detail and proceed per the clarified spec. Confirmed compliant with project requirements."
            : null,
        discipline: t.discipline,
        priority: t.priority,
        status,
        dueDate,
        projectId,
        raisedById: raisedBy.id,
        assignedToId: assignedTo.id,
        createdAt,
        answeredAt: status !== RfiStatus.OPEN ? new Date(createdAt.getTime() + 2 * 24 * 60 * 60 * 1000) : null,
        closedAt: status === RfiStatus.CLOSED ? new Date(createdAt.getTime() + 4 * 24 * 60 * 60 * 1000) : null,
      },
    });
  }
}

async function main() {
  console.log("Seeding database...");

  await prisma.rfi.deleteMany();
  await prisma.activity.deleteMany();
  await prisma.comment.deleteMany();
  await prisma.documentApproval.deleteMany();
  await prisma.documentVersion.deleteMany();
  await prisma.document.deleteMany();
  await prisma.folder.deleteMany();
  await prisma.documentCategory.deleteMany();
  await prisma.project.deleteMany();
  await prisma.user.deleteMany();

  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 10);
  const users = await Promise.all(
    USERS.map((u) => prisma.user.create({ data: { ...u, passwordHash } }))
  );
  const userByName = Object.fromEntries(users.map((u) => [u.name, u]));

  const categories = await Promise.all(
    CATEGORIES.map((name) => prisma.documentCategory.create({ data: { name } }))
  );

  for (const def of PROJECT_DEFS) {
    const { project, documentCount } = await seedProject(def, users, userByName, categories);
    await seedRfis(project.id, users);
    console.log(`  - ${project.name}: ${documentCount} documents, ${RFI_TEMPLATES.length} RFIs`);
  }

  console.log("Seed complete.");
  console.log(`\nDemo login — any seeded email below, password: ${DEMO_PASSWORD}`);
  USERS.forEach((u) => console.log(`  - ${u.email} (${u.role})`));
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
