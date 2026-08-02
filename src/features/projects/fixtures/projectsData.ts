import type { Project } from "@/types/project";

const daysAgo = (d: number) => new Date(Date.now() - d * 86400000).toISOString();

export const MOCK_PROJECTS: Project[] = [
  {
    id: "p1",
    name: "NexusPay Banking",
    description: "Digital banking with payments, KYC, and fraud detection",
    status: "testing",
    createdAt: daysAgo(18),
    updatedAt: daysAgo(0),
    requirementText:
      "The system shall allow customers to make payments using credit cards and digital wallets. Integrate Stripe and PayPal. KYC verification is required before processing payments above $1000. All transactions must be audited.",
    files: ["NexusPay-SRS-v2.pdf"],
    requirementChat: [],
    reqPhase: "done",
    progress: 72,
    techStack: ["React", "Spring Boot", "PostgreSQL", "Kubernetes"],
    color: "#2563eb",
  },
  {
    id: "p2",
    name: "MediTrack EHR",
    description: "Electronic health records with HL7 integration",
    status: "code",
    createdAt: daysAgo(12),
    updatedAt: daysAgo(1),
    requirementText:
      "Build an EHR system for clinics with patient records, appointments, prescriptions, and HL7 FHIR interoperability. Role-based access for doctors, nurses, and admins.",
    files: ["MediTrack-Requirements.docx"],
    requirementChat: [],
    reqPhase: "done",
    progress: 54,
    techStack: ["Angular", "Node.js", "MongoDB", "Docker"],
    color: "#22c55e",
  },
  {
    id: "p3",
    name: "ShopFlow Commerce",
    description: "Headless commerce platform with microservices",
    status: "design",
    createdAt: daysAgo(8),
    updatedAt: daysAgo(2),
    requirementText:
      "Create a headless e-commerce platform with product catalog, cart, checkout, inventory sync, and order management. Support multi-tenant storefronts.",
    files: [],
    requirementChat: [],
    reqPhase: "done",
    progress: 38,
    techStack: ["React", "Express", "Redis", "AWS"],
    color: "#3b82f6",
  },
  {
    id: "p4",
    name: "NotifyHub",
    description: "Multi-channel notification orchestration service",
    status: "deploy",
    createdAt: daysAgo(25),
    updatedAt: daysAgo(3),
    requirementText:
      "Design a notification service supporting email, SMS, and push. Include templates, delivery tracking, retries, and preference management.",
    files: ["notify-brief.md"],
    requirementChat: [],
    reqPhase: "done",
    progress: 91,
    techStack: ["React", "Node.js", "PostgreSQL"],
    color: "#f97316",
  },
];

export const PROJECT_COLORS = ["#f97316", "#2563eb", "#3b82f6", "#22c55e", "#ec4899", "#06b6d4"];
