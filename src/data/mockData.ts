// Comprehensive mock data layer simulating all AI backend responses

export type ComponentKey = "c1" | "c2" | "c3" | "c4";

export interface Project {
  id: string;
  name: string;
  description: string;
  techStack: string[];
  progress: number;
  artifacts: number;
}

export const projects: Project[] = [
  {
    id: "p1",
    name: "NexusPay Banking Platform",
    description: "Next-gen digital banking with AI fraud detection",
    techStack: ["React", "Spring Boot", "PostgreSQL", "Kubernetes"],
    progress: 68,
    artifacts: 142,
  },
  {
    id: "p2",
    name: "MediTrack EHR System",
    description: "Electronic health records with HL7 integration",
    techStack: ["Angular", "Node.js", "MongoDB", "Docker"],
    progress: 45,
    artifacts: 98,
  },
  {
    id: "p3",
    name: "ShopFlow E-Commerce",
    description: "Headless commerce platform with microservices",
    techStack: ["React", "Express", "Redis", "AWS"],
    progress: 82,
    artifacts: 211,
  },
  {
    id: "p4",
    name: "DataLens Analytics",
    description: "Real-time BI dashboard with ML insights",
    techStack: ["React", "Python", "ClickHouse", "Grafana"],
    progress: 33,
    artifacts: 67,
  },
];

// ===== SPRINT DATA =====
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

// ===== UML DIAGRAMS (Mermaid) — see src/data/umlDiagrams.ts =====
export { umlDiagramList, umlDiagrams } from "@/data/umlDiagrams";

// ===== CODE GENERATION DATA =====
export const apiContracts = [
  {
    id: "api-1",
    method: "POST",
    path: "/api/v1/payments",
    summary: "Create a new payment",
    requestSchema: { amount: "number", currency: "string", source: "string" },
    responseSchema: { id: "string", status: "string", createdAt: "string" },
    status: "validated",
    agreementScore: 94,
  },
  {
    id: "api-2",
    method: "GET",
    path: "/api/v1/payments/{id}",
    summary: "Retrieve payment details",
    requestSchema: { id: "string" },
    responseSchema: { id: "string", amount: "number", status: "string" },
    status: "validated",
    agreementScore: 97,
  },
  {
    id: "api-3",
    method: "POST",
    path: "/api/v1/kyc/submit",
    summary: "Submit KYC verification",
    requestSchema: { userId: "string", documents: "array" },
    responseSchema: { id: "string", status: "string" },
    status: "draft",
    agreementScore: 78,
  },
  {
    id: "api-4",
    method: "DELETE",
    path: "/api/v1/users/{id}",
    summary: "Delete user account",
    requestSchema: { id: "string" },
    responseSchema: { success: "boolean" },
    status: "review",
    agreementScore: 82,
  },
];

export const frontendCode = {
  files: [
    { path: "src/components/PaymentForm.tsx", type: "component", lines: 142 },
    { path: "src/services/paymentApi.ts", type: "service", lines: 88 },
    { path: "src/hooks/usePayment.ts", type: "hook", lines: 56 },
    { path: "src/styles/payment.css", type: "style", lines: 34 },
    { path: "src/__tests__/PaymentForm.test.tsx", type: "test", lines: 124 },
  ],
  code: `import { useState } from "react";
import { usePayment } from "../hooks/usePayment";

interface PaymentFormProps {
  amount: number;
  currency: string;
}

export function PaymentForm({ amount, currency }: PaymentFormProps) {
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvc, setCvc] = useState("");
  const { processPayment, loading, error } = usePayment();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await processPayment({ amount, currency, source: cardNumber });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input
        value={cardNumber}
        onChange={(e) => setCardNumber(e.target.value)}
        placeholder="Card number"
      />
      <input value={expiry} onChange={(e) => setExpiry(e.target.value)} />
      <input value={cvc} onChange={(e) => setCvc(e.target.value)} />
      <button type="submit" disabled={loading}>
        {loading ? "Processing..." : "Pay Now"}
      </button>
      {error && <p className="error">{error}</p>}
    </form>
  );
}`,
};

export const backendCode = {
  files: [
    { path: "src/main/java/com/pay/PaymentController.java", type: "controller", lines: 86 },
    { path: "src/main/java/com/pay/PaymentService.java", type: "service", lines: 154 },
    { path: "src/main/java/com/pay/PaymentRepository.java", type: "repository", lines: 42 },
    { path: "src/main/java/com/pay/Payment.java", type: "entity", lines: 68 },
    { path: "src/main/java/com/pay/PaymentDTO.java", type: "dto", lines: 38 },
  ],
  code: `@RestController
@RequestMapping("/api/v1/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;

    @PostMapping
    public ResponseEntity<PaymentDTO> createPayment(
            @Valid @RequestBody PaymentRequest request) {
        Payment payment = paymentService.processPayment(request);
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(PaymentDTO.from(payment));
    }

    @GetMapping("/{id}")
    public ResponseEntity<PaymentDTO> getPayment(@PathVariable String id) {
        return paymentService.findById(id)
            .map(p -> ResponseEntity.ok(PaymentDTO.from(p)))
            .orElse(ResponseEntity.notFound().build());
    }
}`,
};

export const frontendFileContents: Record<string, string> = {
  "src/components/PaymentForm.tsx": frontendCode.code,
  "src/services/paymentApi.ts": `import type { PaymentRequest, PaymentResponse } from "../types/payment";

const API_BASE = import.meta.env.VITE_API_URL ?? "/api/v1";

export async function createPayment(payload: PaymentRequest): Promise<PaymentResponse> {
  const res = await fetch(\`\${API_BASE}/payments\`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Payment failed");
  return res.json();
}

export async function getPayment(id: string): Promise<PaymentResponse> {
  const res = await fetch(\`\${API_BASE}/payments/\${id}\`);
  if (!res.ok) throw new Error("Not found");
  return res.json();
}`,
  "src/hooks/usePayment.ts": `import { useState, useCallback } from "react";
import { createPayment } from "../services/paymentApi";

export function usePayment() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const processPayment = useCallback(async (payload: Parameters<typeof createPayment>[0]) => {
    setLoading(true);
    setError(null);
    try {
      return await createPayment(payload);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
      throw e;
    } finally {
      setLoading(false);
    }
  }, []);

  return { processPayment, loading, error };
}`,
  "src/styles/payment.css": `.payment-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  max-width: 420px;
}

.payment-form input {
  border: 1px solid #cbd5e1;
  border-radius: 0.5rem;
  padding: 0.625rem 0.75rem;
}

.payment-form .error {
  color: #ef4444;
  font-size: 0.875rem;
}`,
  "src/__tests__/PaymentForm.test.tsx": `import { render, screen } from "@testing-library/react";
import { PaymentForm } from "../components/PaymentForm";

describe("PaymentForm", () => {
  it("renders card inputs", () => {
    render(<PaymentForm amount={149.99} currency="USD" />);
    expect(screen.getByPlaceholderText("Card number")).toBeInTheDocument();
  });
});`,
};

export const backendFileContents: Record<string, string> = {
  "src/main/java/com/pay/PaymentController.java": backendCode.code,
  "src/main/java/com/pay/PaymentService.java": `@Service
@RequiredArgsConstructor
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final KycService kycService;

    @Transactional
    public Payment processPayment(PaymentRequest request) {
        kycService.verifyCustomer(request.getCustomerId());
        Payment payment = Payment.from(request);
        return paymentRepository.save(payment);
    }

    public Optional<Payment> findById(String id) {
        return paymentRepository.findById(id);
    }
}`,
  "src/main/java/com/pay/PaymentRepository.java": `@Repository
public interface PaymentRepository extends JpaRepository<Payment, String> {
    List<Payment> findByCustomerId(String customerId);
    Optional<Payment> findByExternalRef(String externalRef);
}`,
  "src/main/java/com/pay/Payment.java": `@Entity
@Table(name = "payments")
@Data
public class Payment {
    @Id
    private String id;
    private String customerId;
    private BigDecimal amount;
    private String currency;
    private PaymentStatus status;
    private Instant createdAt;
}`,
  "src/main/java/com/pay/PaymentDTO.java": `public record PaymentDTO(
    String id,
    BigDecimal amount,
    String currency,
    String status
) {
    public static PaymentDTO from(Payment payment) {
        return new PaymentDTO(
            payment.getId(),
            payment.getAmount(),
            payment.getCurrency(),
            payment.getStatus().name()
        );
    }
}`,
};

export type TechStackRecommendation = {
  id: string;
  layer: string;
  recommended: string;
  version: string;
  rationale: string;
  confidence: number;
  alternatives: { name: string; reason: string }[];
};

export const techStackRecommendations: TechStackRecommendation[] = [
  {
    id: "frontend",
    layer: "Frontend",
    recommended: "React",
    version: "19 + TypeScript + Vite",
    rationale: "Payment UI requires rich form interactions, component reuse across KYC and checkout flows, and strong ecosystem support for PCI-aware client patterns.",
    confidence: 94,
    alternatives: [
      { name: "Angular", reason: "Strong for enterprise forms but heavier bundle and slower iteration for this sprint scope." },
      { name: "Vue", reason: "Good DX, but team standards and existing wireframe tooling align better with React." },
    ],
  },
  {
    id: "backend",
    layer: "Backend",
    recommended: "Spring Boot",
    version: "3.2 + Java 21",
    rationale: "Financial APIs benefit from Spring Security, mature JPA integration, and transactional guarantees required for payment processing.",
    confidence: 91,
    alternatives: [
      { name: "Node.js (NestJS)", reason: "Faster prototyping but weaker typing and audit patterns for regulated payment flows." },
      { name: ".NET", reason: "Excellent for enterprise, but existing team skills and deployment targets favor JVM stack." },
    ],
  },
  {
    id: "database",
    layer: "Database",
    recommended: "PostgreSQL",
    version: "16",
    rationale: "ACID compliance, JSON support for audit metadata, and proven performance for transaction-heavy workloads.",
    confidence: 96,
    alternatives: [
      { name: "MongoDB", reason: "Flexible schema but weaker transactional guarantees for payment ledger consistency." },
      { name: "MySQL", reason: "Solid choice; PostgreSQL preferred for advanced indexing and JSON operators." },
    ],
  },
  {
    id: "infra",
    layer: "Infra / DevOps",
    recommended: "Kubernetes",
    version: "AKS + GitHub Actions",
    rationale: "Multi-service payment platform needs horizontal scaling, rolling deploys, and environment parity from dev to production.",
    confidence: 88,
    alternatives: [
      { name: "Docker Compose", reason: "Fine for local dev; insufficient for production HA and auto-scaling." },
      { name: "Serverless", reason: "Good for edge APIs; core payment services need persistent connections and longer transactions." },
    ],
  },
];

export const buildStatus = {
  frontend: { status: "success", duration: "42s", errors: 0, warnings: 2 },
  backend: { status: "success", duration: "1m 18s", errors: 0, warnings: 5 },
  integration: { passed: 24, failed: 1, total: 25 },
};

// ===== TESTING & SECURITY DATA =====
export const testResults = {
  unit: { total: 184, passed: 178, failed: 4, skipped: 2, coverage: 87 },
  integration: { total: 42, passed: 39, failed: 2, skipped: 1, coverage: 76 },
  mutation: { total: 312, killed: 284, survived: 18, coverage: 91 },
  coverageTrend: [
    { day: "Mon", coverage: 78 },
    { day: "Tue", coverage: 80 },
    { day: "Wed", coverage: 82 },
    { day: "Thu", coverage: 85 },
    { day: "Fri", coverage: 87 },
  ],
  coverageHeatmap: Array.from({ length: 12 }, (_, i) =>
    Array.from({ length: 8 }, (_, j) => ({
      line: i * 8 + j + 1,
      covered: Math.random() > 0.15,
      branch: Math.random() > 0.4,
    }))
  ),
};

export const failingTests = [
  {
    id: "t1",
    name: "PaymentServiceTest.shouldProcessRefund",
    category: "integration",
    status: "brittle",
    error: "Expected status 200 but got 201",
    lastRun: "2 min ago",
    originalCode: `@Test
void shouldProcessRefund() {
    Payment payment = createTestPayment();
    paymentService.refund(payment.getId());
    assertEquals("REFUNDED", payment.getStatus());
}`,
    proposedCode: `@Test
void shouldProcessRefund() {
    Payment payment = createTestPayment();
    String refundId = paymentService.refund(payment.getId());
    Payment refunded = paymentService.findById(payment.getId());
    assertEquals("REFUNDED", refunded.getStatus());
    assertNotNull(refundId);
}`,
    honestyGuard: { passesUnchanged: true, killsMutant: true, integrity: true },
    explanation: "The refund method now returns a refund ID. The test was stale — it checked the in-memory object instead of re-fetching. The repair re-fetches the payment and asserts the new return value.",
  },
  {
    id: "t2",
    name: "UserControllerTest.shouldReturn404ForMissingUser",
    category: "unit",
    status: "real-regression",
    error: "Expected 404 but got 500",
    lastRun: "5 min ago",
    explanation: "This is a genuine regression — the controller throws an unhandled exception instead of returning 404. Route to developer.",
  },
  {
    id: "t3",
    name: "NotificationServiceTest.shouldSendEmail",
    category: "unit",
    status: "healed",
    error: "Previously failing — repaired in Sprint 23",
    lastRun: "1 day ago",
    explanation: "Healed: email template path was updated. Repair verified and merged.",
  },
  {
    id: "t4",
    name: "KYCServiceTest.shouldVerifyDocument",
    category: "integration",
    status: "brittle",
    error: "Mock response format changed",
    lastRun: "8 min ago",
    originalCode: `verify(mockVerifier).verify(doc);`,
    proposedCode: `verify(mockVerifier).verify(doc, VerificationContext.DEFAULT);`,
    honestyGuard: { passesUnchanged: true, killsMutant: true, integrity: false },
    explanation: "The verify method signature changed to include a context parameter. The repair updates the mock call. NOTE: integrity check failed — the repair does not assert the returned verification result.",
  },
];

export const approvalQueue = [
  { id: "ap-1", testId: "t1", proposedBy: "AI-Healer", status: "pending", createdAt: "2 min ago", qaComment: "Stale test — method signature changed" },
  { id: "ap-2", testId: "t4", proposedBy: "AI-Healer", status: "pending", createdAt: "8 min ago", qaComment: "Mock update needed" },
  { id: "ap-3", testId: "t3", proposedBy: "AI-Healer", status: "approved", createdAt: "1 day ago", devComment: "Looks good, verified locally" },
];

export const auditLog = [
  { id: "log-1", timestamp: "2025-01-20 14:32:11", actor: "AI-Healer", action: "PROPOSE_REPAIR", target: "PaymentServiceTest.shouldProcessRefund", details: "Proposed test repair for stale assertion" },
  { id: "log-2", timestamp: "2025-01-20 14:35:42", actor: "S. Patel (QA)", action: "REVIEW", target: "ap-1", details: "Approved repair proposal" },
  { id: "log-3", timestamp: "2025-01-20 14:38:01", actor: "M. Rodriguez (Dev)", action: "APPROVE", target: "ap-1", details: "Approved — verified locally" },
  { id: "log-4", timestamp: "2025-01-20 14:40:15", actor: "System", action: "APPLY_REPAIR", target: "PaymentServiceTest", details: "Applied approved repair to main branch" },
  { id: "log-5", timestamp: "2025-01-20 15:01:22", actor: "AI-Security", action: "SCAN_COMPLETE", target: "PaymentController", details: "Found 1 medium CWE-79 XSS in input validation" },
  { id: "log-6", timestamp: "2025-01-20 15:05:30", actor: "AI-Healer", action: "PROPOSE_REPAIR", target: "KYCServiceTest.shouldVerifyDocument", details: "Mock signature update" },
];

export const vulnerabilities = [
  { id: "v1", cwe: "CWE-79", name: "Cross-Site Scripting", severity: "high", cvss: 7.4, file: "PaymentController.java", line: 42, status: "open", precision: 0.92, recall: 0.88 },
  { id: "v2", cwe: "CWE-89", name: "SQL Injection", severity: "critical", cvss: 9.1, file: "UserRepository.java", line: 88, status: "open", precision: 0.96, recall: 0.94 },
  { id: "v3", cwe: "CWE-352", name: "CSRF", severity: "medium", cvss: 5.2, file: "AuthController.java", line: 31, status: "mitigated", precision: 0.85, recall: 0.80 },
  { id: "v4", cwe: "CWE-200", name: "Information Exposure", severity: "medium", cvss: 4.8, file: "ErrorHandler.java", line: 15, status: "open", precision: 0.78, recall: 0.72 },
  { id: "v5", cwe: "CWE-611", name: "XXE", severity: "low", cvss: 3.1, file: "XmlParser.java", line: 22, status: "open", precision: 0.70, recall: 0.65 },
  { id: "v6", cwe: "CWE-502", name: "Deserialization", severity: "critical", cvss: 8.8, file: "SessionManager.java", line: 67, status: "open", precision: 0.94, recall: 0.91 },
];

export const cvssRadar = [
  { axis: "Confidentiality", value: 8.5 },
  { axis: "Integrity", value: 7.2 },
  { axis: "Availability", value: 6.8 },
  { axis: "Access Vector", value: 9.0 },
  { axis: "Access Complexity", value: 4.5 },
  { axis: "Authentication", value: 7.8 },
];

// ===== DEPLOYMENT DATA =====
export const repositories = [
  { id: "r1", name: "nexuspay-frontend", branch: "main", techStack: ["React", "TypeScript", "Vite"], structure: "frontend", lastCommit: "2h ago", status: "connected" },
  { id: "r2", name: "nexuspay-backend", branch: "main", techStack: ["Spring Boot", "Java", "PostgreSQL"], structure: "backend", lastCommit: "1h ago", status: "connected" },
  { id: "r3", name: "nexuspay-infra", branch: "main", techStack: ["Docker", "Kubernetes", "Terraform"], structure: "infrastructure", lastCommit: "5h ago", status: "connected" },
];

export const dependencyTree = {
  name: "nexuspay-backend",
  children: [
    {
      name: "spring-boot-starter-web",
      version: "3.2.1",
      children: [
        { name: "spring-web", version: "6.1.2" },
        { name: "spring-webmvc", version: "6.1.2" },
        { name: "tomcat-embed-core", version: "10.1.15" },
      ],
    },
    {
      name: "spring-boot-starter-data-jpa",
      version: "3.2.1",
      children: [
        { name: "hibernate-core", version: "6.4.1" },
        { name: "spring-data-jpa", version: "3.2.1" },
      ],
    },
    {
      name: "spring-security-crypto",
      version: "6.2.1",
      children: [{ name: "bouncycastle", version: "1.77" }],
    },
    {
      name: "jackson-databind",
      version: "2.16.0",
      children: [
        { name: "jackson-core", version: "2.16.0" },
        { name: "jackson-annotations", version: "2.16.0" },
      ],
    },
  ],
};

export const dependencyUpdates = [
  {
    id: "du1",
    package: "spring-boot-starter-web",
    currentVersion: "3.2.1",
    proposedVersion: "3.3.0",
    semver: "minor",
    risk: "medium",
    probability: 35,
    changelog: "Adds new actuator endpoints, updates Tomcat to 10.1.18. No breaking API changes in core web module.",
    affectedFunctions: 2,
    impactedFiles: ["PaymentController.java", "AuthController.java"],
    migrationGuide: "No code changes required. Update pom.xml version and run integration tests.",
    ruleScore: 30,
    llmScore: 40,
    fusedScore: 35,
  },
  {
    id: "du2",
    package: "jackson-databind",
    currentVersion: "2.16.0",
    proposedVersion: "2.17.0",
    semver: "minor",
    risk: "high",
    probability: 72,
    changelog: "BREAKING: Changes default deserialization behavior for polymorphic types. @JsonTypeInfo handling modified. Several deprecated methods removed.",
    affectedFunctions: 5,
    impactedFiles: ["PaymentDTO.java", "UserDTO.java", "KycRecordDTO.java", "AuditLog.java", "Session.java"],
    migrationGuide: "1. Review all @JsonTypeInfo annotations\n2. Update polymorphic deserialization\n3. Replace removed deprecated methods\n4. Run full test suite",
    ruleScore: 65,
    llmScore: 78,
    fusedScore: 72,
  },
  {
    id: "du3",
    package: "hibernate-core",
    currentVersion: "6.4.1",
    proposedVersion: "6.4.2",
    semver: "patch",
    risk: "low",
    probability: 8,
    changelog: "Bug fix release. Fixes NPE in CriteriaBuilder and improves batch fetching performance.",
    affectedFunctions: 0,
    impactedFiles: [],
    migrationGuide: "Safe to apply. No code changes needed.",
    ruleScore: 5,
    llmScore: 10,
    fusedScore: 8,
  },
  {
    id: "du4",
    package: "spring-security-crypto",
    currentVersion: "6.2.1",
    proposedVersion: "7.0.0",
    semver: "major",
    risk: "high",
    probability: 88,
    changelog: "MAJOR: Package relocation from org.springframework.security.crypto to org.springframework.security.crypto.v2. Password encoder API changed. BCrypt default strength increased.",
    affectedFunctions: 8,
    impactedFiles: ["SecurityConfig.java", "UserService.java", "PasswordEncoder.java", "AuthService.java"],
    migrationGuide: "1. Update all import statements\n2. Migrate PasswordEncoder to new API\n3. Re-hash existing passwords on next login\n4. Update security configuration",
    ruleScore: 85,
    llmScore: 90,
    fusedScore: 88,
  },
  {
    id: "du5",
    package: "tomcat-embed-core",
    currentVersion: "10.1.15",
    proposedVersion: "10.1.18",
    semver: "patch",
    risk: "low",
    probability: 12,
    changelog: "Security patch. Fixes CVE-2024-1234 (request smuggling). No API changes.",
    affectedFunctions: 0,
    impactedFiles: [],
    migrationGuide: "Apply immediately. No code changes needed.",
    ruleScore: 10,
    llmScore: 14,
    fusedScore: 12,
  },
];

export const pipelineStages = [
  { id: "build", name: "Build", status: "success", duration: "42s", icon: "hammer" },
  { id: "test", name: "Test", status: "success", duration: "3m 12s", icon: "flask" },
  { id: "security", name: "Security Scan", status: "success", duration: "1m 48s", icon: "shield" },
  { id: "deploy", name: "Deploy", status: "running", duration: "1m 05s", icon: "rocket" },
];

export const deploymentTargets = {
  frontend: { target: "Vercel", url: "https://nexuspay.app", status: "healthy", uptime: "99.98%", responseTime: "142ms" },
  backend: { target: "Azure AKS", url: "https://api.nexuspay.app", status: "healthy", uptime: "99.95%", responseTime: "89ms" },
};

export const productionMetrics = [
  { time: "14:00", uptime: 99.98, responseTime: 142, errorRate: 0.02 },
  { time: "14:15", uptime: 99.97, responseTime: 156, errorRate: 0.03 },
  { time: "14:30", uptime: 99.99, responseTime: 138, errorRate: 0.01 },
  { time: "14:45", uptime: 99.96, responseTime: 178, errorRate: 0.04 },
  { time: "15:00", uptime: 99.98, responseTime: 145, errorRate: 0.02 },
  { time: "15:15", uptime: 99.99, responseTime: 134, errorRate: 0.01 },
];

// ===== ALERTS =====
export const alerts = [
  { id: "al1", type: "security", severity: "critical", title: "SQL Injection in UserRepository", component: "c3", message: "CWE-89 detected in UserRepository.java:88", time: "2 min ago" },
  { id: "al2", type: "test", severity: "warning", title: "Brittle test detected", component: "c3", message: "PaymentServiceTest.shouldProcessRefund marked for AI repair", time: "5 min ago" },
  { id: "al3", type: "deployment", severity: "high", title: "Breaking change predicted", component: "c4", message: "spring-security-crypto 7.0.0 — 88% probability of breaking changes", time: "12 min ago" },
  { id: "al4", type: "approval", severity: "info", title: "Approval request", component: "c3", message: "2 test repair proposals awaiting developer approval", time: "15 min ago" },
  { id: "al5", type: "test", severity: "error", title: "Integration test failed", component: "c3", message: "UserControllerTest.shouldReturn404 — real regression detected", time: "20 min ago" },
  { id: "al6", type: "deployment", severity: "warning", title: "Deployment in progress", component: "c4", message: "Deploy stage running — 65% complete", time: "1 min ago" },
];

// ===== ACTIVITY LOG =====
export type ActivityLogCategory =
  | "requirement"
  | "design"
  | "code"
  | "test"
  | "security"
  | "deploy"
  | "approval";

export type ActivityLogEntry = {
  id: string;
  timestamp: string;
  displayDate: string;
  title: string;
  description: string;
  actor: string;
  category: ActivityLogCategory;
  metric?: string;
  metricTone?: "success" | "neutral" | "warning" | "error";
  artifactRef?: string;
};

export const activityLogEntries: ActivityLogEntry[] = [
  {
    id: "act-1",
    timestamp: "2026-01-20T15:05:30",
    displayDate: "Jan 20, 2026",
    title: "Test repair applied",
    description: "PaymentServiceTest.shouldProcessRefund — approved repair merged to main",
    actor: "System",
    category: "approval",
    metric: "1 test healed",
    metricTone: "success",
    artifactRef: "PaymentServiceTest",
  },
  {
    id: "act-2",
    timestamp: "2026-01-20T15:01:22",
    displayDate: "Jan 20, 2026",
    title: "Security scan completed",
    description: "PaymentController scanned — 1 medium CWE-79 XSS in input validation",
    actor: "AI-Security",
    category: "security",
    metric: "CVSS 7.4 · High",
    metricTone: "warning",
    artifactRef: "PaymentController.java:42",
  },
  {
    id: "act-3",
    timestamp: "2026-01-20T14:40:15",
    displayDate: "Jan 20, 2026",
    title: "Developer approved repair",
    description: "Repair proposal ap-1 verified locally by M. Rodriguez",
    actor: "M. Rodriguez (Dev)",
    category: "approval",
    artifactRef: "ap-1",
  },
  {
    id: "act-4",
    timestamp: "2026-01-20T14:35:42",
    displayDate: "Jan 20, 2026",
    title: "QA review completed",
    description: "Brittle test repair proposal approved for PaymentServiceTest",
    actor: "S. Patel (QA)",
    category: "approval",
    artifactRef: "PaymentServiceTest.shouldProcessRefund",
  },
  {
    id: "act-5",
    timestamp: "2026-01-20T14:32:11",
    displayDate: "Jan 20, 2026",
    title: "AI proposed test repair",
    description: "Stale assertion detected — proposed fix for refund status code",
    actor: "AI-Healer",
    category: "test",
    metric: "1 brittle test",
    metricTone: "warning",
    artifactRef: "PaymentServiceTest.shouldProcessRefund",
  },
  {
    id: "act-6",
    timestamp: "2026-01-18T11:22:00",
    displayDate: "Jan 18, 2026",
    title: "Production deployment healthy",
    description: "Frontend (Vercel) and Backend (Azure AKS) targets reporting healthy",
    actor: "CI/CD Pipeline",
    category: "deploy",
    metric: "99.97% uptime",
    metricTone: "success",
    artifactRef: "dep-2",
  },
  {
    id: "act-7",
    timestamp: "2026-01-18T10:45:00",
    displayDate: "Jan 18, 2026",
    title: "Build validation completed",
    description: "Frontend and backend builds succeeded; 1 integration test failed",
    actor: "Build Agent",
    category: "test",
    metric: "11/12 tests passed",
    metricTone: "warning",
    artifactRef: "testPaymentRefund",
  },
  {
    id: "act-8",
    timestamp: "2026-01-17T16:30:00",
    displayDate: "Jan 17, 2026",
    title: "Backend code generated",
    description: "PaymentController, PaymentService, KYC Controller, and REST API contract created",
    actor: "AI Agent",
    category: "code",
    metric: "4 endpoints · 28 files",
    metricTone: "neutral",
    artifactRef: "code-1",
  },
  {
    id: "act-9",
    timestamp: "2026-01-17T14:10:00",
    displayDate: "Jan 17, 2026",
    title: "Frontend code generated",
    description: "React components including PaymentForm.tsx generated from wireframes",
    actor: "AI Agent",
    category: "code",
    metric: "42 source files",
    metricTone: "neutral",
    artifactRef: "PaymentForm.tsx",
  },
  {
    id: "act-10",
    timestamp: "2026-01-16T09:00:00",
    displayDate: "Jan 16, 2026",
    title: "Wireframe design approved",
    description: "Payment Form checkout flow approved after mockup review",
    actor: "Alex Chen",
    category: "design",
    metric: "4 screens · Sprint 2",
    metricTone: "success",
    artifactRef: "wire-1",
  },
  {
    id: "act-11",
    timestamp: "2026-01-15T11:45:00",
    displayDate: "Jan 15, 2026",
    title: "Architecture validated",
    description: "Semantic Architecture Graph and UML class diagram validated at 94% confidence",
    actor: "AI Agent",
    category: "design",
    metric: "Microservices · 94%",
    metricTone: "success",
    artifactRef: "sag-1",
  },
  {
    id: "act-12",
    timestamp: "2026-01-14T08:30:00",
    displayDate: "Jan 14, 2026",
    title: "Requirements parsed",
    description: "28 requirements extracted from payment-gateway-srs.pdf across 12 sections",
    actor: "AI Agent",
    category: "requirement",
    metric: "96% confidence",
    metricTone: "success",
    artifactRef: "req-1",
  },
  {
    id: "act-13",
    timestamp: "2026-01-14T08:00:00",
    displayDate: "Jan 14, 2026",
    title: "Project created",
    description: "Payment Processing and KYC Verification scope initialized from SRS upload",
    actor: "Alex Chen",
    category: "requirement",
    artifactRef: "payment-gateway-srs.pdf",
  },
];

// ===== TRACEABILITY GRAPH =====
export const traceabilityArtifacts = [
  { id: "req-1", type: "requirement", label: "Payment Processing", status: "approved", component: "c1", x: 0, y: 100 },
  { id: "req-2", type: "requirement", label: "KYC Verification", status: "approved", component: "c1", x: 0, y: 250 },
  { id: "sag-1", type: "design", label: "Payment SAG", status: "validated", component: "c1", x: 200, y: 100 },
  { id: "sag-2", type: "design", label: "KYC SAG", status: "validated", component: "c1", x: 200, y: 250 },
  { id: "uml-1", type: "design", label: "Class Diagram", status: "validated", component: "c1", x: 200, y: 400 },
  { id: "wire-1", type: "design", label: "Payment Wireframe", status: "approved", component: "c1", x: 200, y: 550 },
  { id: "code-1", type: "development", label: "PaymentController", status: "generated", component: "c2", x: 400, y: 100 },
  { id: "code-2", type: "development", label: "PaymentService", status: "generated", component: "c2", x: 400, y: 250 },
  { id: "code-3", type: "development", label: "KYC Controller", status: "generated", component: "c2", x: 400, y: 400 },
  { id: "api-1", type: "development", label: "REST API Contract", status: "validated", component: "c2", x: 400, y: 550 },
  { id: "test-1", type: "testing", label: "Unit Tests", status: "passing", component: "c3", x: 600, y: 100 },
  { id: "test-2", type: "testing", label: "Integration Tests", status: "failing", component: "c3", x: 600, y: 250 },
  { id: "test-3", type: "testing", label: "Security Scan", status: "findings", component: "c3", x: 600, y: 400 },
  { id: "test-4", type: "testing", label: "Mutation Tests", status: "passing", component: "c3", x: 600, y: 550 },
  { id: "dep-1", type: "deployment", label: "CI/CD Pipeline", status: "running", component: "c4", x: 800, y: 100 },
  { id: "dep-2", type: "deployment", label: "Production Deploy", status: "healthy", component: "c4", x: 800, y: 250 },
  { id: "dep-3", type: "deployment", label: "Dependency Report", status: "warning", component: "c4", x: 800, y: 400 },
  { id: "dep-4", type: "deployment", label: "Risk Report", status: "warning", component: "c4", x: 800, y: 550 },
];

export const traceabilityLinks = [
  { source: "req-1", target: "sag-1" },
  { source: "req-2", target: "sag-2" },
  { source: "req-1", target: "uml-1" },
  { source: "req-1", target: "wire-1" },
  { source: "sag-1", target: "code-1" },
  { source: "sag-1", target: "code-2" },
  { source: "sag-2", target: "code-3" },
  { source: "sag-1", target: "api-1" },
  { source: "code-1", target: "test-1" },
  { source: "code-2", target: "test-2" },
  { source: "code-3", target: "test-3" },
  { source: "api-1", target: "test-1" },
  { source: "test-1", target: "dep-1" },
  { source: "test-2", target: "dep-1" },
  { source: "test-3", target: "dep-3" },
  { source: "dep-1", target: "dep-2" },
  { source: "dep-3", target: "dep-4" },
  { source: "test-2", target: "code-2", feedback: true },
  { source: "dep-3", target: "req-1", feedback: true },
];

// ===== COMPONENT HEALTH =====
export const componentHealth = [
  { id: "c1", name: "Requirements & Design", color: "#22c55e", load: 62, status: "optimal", artifacts: 48 },
  { id: "c2", name: "Code Generation", color: "#3b82f6", load: 78, status: "busy", artifacts: 124 },
  { id: "c3", name: "Testing & Security", color: "#2563eb", load: 85, status: "critical", artifacts: 312 },
  { id: "c4", name: "Deployment & Dependency", color: "#f97316", load: 45, status: "optimal", artifacts: 56 },
];

// ===== PIPELINE STATUS =====
export const pipelineStatus = [
  { stage: "Requirements", status: "complete", component: "c1", icon: "📄" },
  { stage: "Design", status: "complete", component: "c1", icon: "✏️" },
  { stage: "Code", status: "complete", component: "c2", icon: "</>" },
  { stage: "Test", status: "active", component: "c3", icon: "🧪" },
  { stage: "Deploy", status: "pending", component: "c4", icon: "🚀" },
];
