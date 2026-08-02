/** Fixture data migrated from legacy data/mockData.ts */
export const sprintData = {
  name: "Sprint 24",
  goal: "Implement payment gateway integration & KYC flow",
  startDate: "2025-01-13",
  endDate: "2025-01-27",
  totalPoints: 89,
  completedPoints: 54,
  burndown: [
    { day: 1, ideal: 89, actual: 89 },
    { day: 2, ideal: 80, actual: 85 },
    { day: 3, ideal: 71, actual: 78 },
    { day: 4, ideal: 62, actual: 70 },
    { day: 5, ideal: 53, actual: 65 },
    { day: 6, ideal: 44, actual: 58 },
    { day: 7, ideal: 35, actual: 50 },
    { day: 8, ideal: 26, actual: 44 },
    { day: 9, ideal: 17, actual: 38 },
    { day: 10, ideal: 8, actual: 35 },
  ],
  velocity: [
    { sprint: "S20", points: 72 },
    { sprint: "S21", points: 85 },
    { sprint: "S22", points: 78 },
    { sprint: "S23", points: 91 },
    { sprint: "S24", points: 54 },
  ],
  team: [
    { name: "A. Chen", role: "Frontend", capacity: 40, allocated: 32 },
    { name: "M. Rodriguez", role: "Backend", capacity: 40, allocated: 38 },
    { name: "S. Patel", role: "QA", capacity: 32, allocated: 28 },
    { name: "J. Kim", role: "DevOps", capacity: 40, allocated: 24 },
    { name: "L. Müller", role: "Designer", capacity: 32, allocated: 20 },
  ],
};

export const backlog = [
  {
    id: "US-101",
    epic: "Payment Gateway",
    title: "As a user, I want to add a credit card",
    storyPoints: 8,
    status: "done",
    assignee: "A. Chen",
    priority: "high",
  },
  {
    id: "US-102",
    epic: "Payment Gateway",
    title: "As a user, I want to pay with Apple Pay",
    storyPoints: 13,
    status: "in-progress",
    assignee: "M. Rodriguez",
    priority: "high",
  },
  {
    id: "US-103",
    epic: "KYC Flow",
    title: "As a user, I want to verify my identity",
    storyPoints: 21,
    status: "in-progress",
    assignee: "A. Chen",
    priority: "critical",
  },
  {
    id: "US-104",
    epic: "KYC Flow",
    title: "As an admin, I want to review KYC submissions",
    storyPoints: 5,
    status: "todo",
    assignee: "S. Patel",
    priority: "medium",
  },
  {
    id: "US-105",
    epic: "Notifications",
    title: "As a user, I want push notifications",
    storyPoints: 3,
    status: "todo",
    assignee: "J. Kim",
    priority: "low",
  },
  {
    id: "US-106",
    epic: "Payment Gateway",
    title: "As a user, I want to view transaction history",
    storyPoints: 8,
    status: "todo",
    assignee: "M. Rodriguez",
    priority: "medium",
  },
];

// ===== SAG GRAPH DATA (20+ nodes) =====
export interface SAGNode {
  id: string;
  type: "actor" | "entity" | "module" | "constraint";
  label: string;
  position: { x: number; y: number };
  properties: Record<string, string>;
  validated: boolean;
}

export interface SAGEdge {
  id: string;
  source: string;
  target: string;
  label: string;
  type: string;
}

export const sagNodes: SAGNode[] = [
  { id: "a1", type: "actor", label: "Customer", position: { x: 0, y: 120 }, properties: { role: "End user", auth: "OAuth2" }, validated: true },
  { id: "a2", type: "actor", label: "Admin", position: { x: 0, y: 320 }, properties: { role: "Administrator", auth: "SAML" }, validated: true },
  { id: "a3", type: "actor", label: "Payment Gateway", position: { x: 0, y: 520 }, properties: { role: "External system", auth: "API Key" }, validated: true },
  { id: "m1", type: "module", label: "Auth Service", position: { x: 300, y: 80 }, properties: { tech: "Spring Boot", port: "8081" }, validated: true },
  { id: "m2", type: "module", label: "Payment Service", position: { x: 300, y: 240 }, properties: { tech: "Spring Boot", port: "8082" }, validated: true },
  { id: "m3", type: "module", label: "KYC Service", position: { x: 300, y: 400 }, properties: { tech: "Node.js", port: "3001" }, validated: false },
  { id: "m4", type: "module", label: "Notification Service", position: { x: 300, y: 560 }, properties: { tech: "Node.js", port: "3002" }, validated: true },
  { id: "m5", type: "module", label: "API Gateway", position: { x: 560, y: 160 }, properties: { tech: "Kong", port: "8000" }, validated: true },
  { id: "m6", type: "module", label: "Frontend App", position: { x: 560, y: 360 }, properties: { tech: "React", port: "3000" }, validated: true },
  { id: "e1", type: "entity", label: "User", position: { x: 820, y: 60 }, properties: { table: "users", fields: "12" }, validated: true },
  { id: "e2", type: "entity", label: "Transaction", position: { x: 820, y: 220 }, properties: { table: "transactions", fields: "18" }, validated: true },
  { id: "e3", type: "entity", label: "KYC Record", position: { x: 820, y: 380 }, properties: { table: "kyc_records", fields: "9" }, validated: false },
  { id: "e4", type: "entity", label: "Notification", position: { x: 820, y: 540 }, properties: { table: "notifications", fields: "7" }, validated: true },
  { id: "e5", type: "entity", label: "Audit Log", position: { x: 1080, y: 140 }, properties: { table: "audit_logs", fields: "6" }, validated: true },
  { id: "e6", type: "entity", label: "Session", position: { x: 1080, y: 300 }, properties: { table: "sessions", fields: "5" }, validated: true },
  { id: "c1", type: "constraint", label: "PCI-DSS", position: { x: 1080, y: 460 }, properties: { standard: "PCI-DSS 4.0", scope: "Payment" }, validated: true },
  { id: "c2", type: "constraint", label: "GDPR", position: { x: 1080, y: 600 }, properties: { standard: "GDPR", scope: "PII" }, validated: true },
  { id: "c3", type: "constraint", label: "SOC2", position: { x: 560, y: 560 }, properties: { standard: "SOC 2 Type II", scope: "Global" }, validated: true },
  { id: "m7", type: "module", label: "Analytics Engine", position: { x: 560, y: 520 }, properties: { tech: "Python", port: "8083" }, validated: false },
  { id: "a4", type: "actor", label: "Analytics Dashboard", position: { x: 0, y: 700 }, properties: { role: "Internal tool", auth: "SSO" }, validated: true },
  { id: "e7", type: "entity", label: "Metric", position: { x: 820, y: 700 }, properties: { table: "metrics", fields: "11" }, validated: true },
];

export const sagEdges: SAGEdge[] = [
  { id: "e1", source: "a1", target: "m5", label: "authenticates", type: "flow" },
  { id: "e2", source: "a1", target: "m6", label: "uses", type: "flow" },
  { id: "e3", source: "a2", target: "m5", label: "manages", type: "flow" },
  { id: "e4", source: "a3", target: "m2", label: "integrates", type: "flow" },
  { id: "e5", source: "m5", target: "m1", label: "routes", type: "flow" },
  { id: "e6", source: "m5", target: "m2", label: "routes", type: "flow" },
  { id: "e7", source: "m5", target: "m3", label: "routes", type: "flow" },
  { id: "e8", source: "m6", target: "m5", label: "calls", type: "flow" },
  { id: "e9", source: "m1", target: "e1", label: "reads/writes", type: "data" },
  { id: "e10", source: "m2", target: "e2", label: "reads/writes", type: "data" },
  { id: "e11", source: "m3", target: "e3", label: "reads/writes", type: "data" },
  { id: "e12", source: "m4", target: "e4", label: "reads/writes", type: "data" },
  { id: "e13", source: "m1", target: "e6", label: "creates", type: "data" },
  { id: "e14", source: "m2", target: "c1", label: "complies", type: "constraint" },
  { id: "e15", source: "m3", target: "c2", label: "complies", type: "constraint" },
  { id: "e16", source: "m7", target: "e7", label: "writes", type: "data" },
  { id: "e17", source: "a4", target: "m7", label: "uses", type: "flow" },
  { id: "e18", source: "m5", target: "e5", label: "logs", type: "data" },
  { id: "e19", source: "m6", target: "c3", label: "complies", type: "constraint" },
  { id: "e20", source: "m4", target: "m7", label: "feeds", type: "flow" },
];

// ===== EXTRACTED ENTITIES =====
export const extractedEntities = {
  actors: ["Customer", "Admin", "Payment Gateway", "Analytics Dashboard"],
  entities: ["User", "Transaction", "KYC Record", "Notification", "Audit Log", "Session", "Metric"],
  actions: ["authenticate", "process payment", "verify identity", "send notification", "log event", "analyze metrics"],
  relationships: [
    "Customer authenticates via Auth Service",
    "Payment Service integrates with Payment Gateway",
    "KYC Service complies with GDPR",
    "Analytics Engine reads from Notification Service",
  ],
};

// ===== ARCHITECTURE PATTERNS =====
export const architecturePatterns = [
  {
    id: "microservices",
    name: "Microservices",
    confidence: 92,
    explanation: "Highly recommended for distributed payment systems with independent scaling needs.",
    pros: ["Independent deployment", "Technology flexibility", "Fault isolation"],
    cons: ["Complex orchestration", "Distributed transactions", "Operational overhead"],
    color: "#22c55e",
  },
  {
    id: "modular-monolith",
    name: "Modular Monolith",
    confidence: 78,
    explanation: "Strong candidate for current team size, balancing modularity with simplicity.",
    pros: ["Simpler operations", "Faster development", "Easy refactoring"],
    cons: ["Shared database", "Scaling limits", "Module boundaries"],
    color: "#3b82f6",
  },
  {
    id: "clean",
    name: "Clean Architecture",
    confidence: 85,
    explanation: "Excellent for testability and dependency rule enforcement across services.",
    pros: ["Testability", "Framework independence", "Clear boundaries"],
    cons: ["More boilerplate", "Steeper learning curve"],
    color: "#2563eb",
  },
  {
    id: "layered",
    name: "Layered",
    confidence: 64,
    explanation: "Suitable but may not fully address distributed system concerns.",
    pros: ["Simple to understand", "Easy to implement"],
    cons: ["Tight coupling", "Scaling challenges"],
    color: "#f97316",
  },
  {
    id: "mvc",
    name: "MVC",
    confidence: 45,
    explanation: "Foundational pattern but insufficient alone for this complexity.",
    pros: ["Separation of concerns", "Well-known"],
    cons: ["Fat controllers", "Scaling limits"],
    color: "#ef4444",
  },
];

export { umlDiagramList, umlDiagrams, type UMLDiagramDefinition } from "./umlDiagrams";
