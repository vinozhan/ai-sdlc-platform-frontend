/** Fixture data migrated from legacy data/mockData.ts */
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
// Lives in src/data/testingData.ts - one coherent run, so the counts in the
// suite table, the failure inbox and the report cannot disagree.
// Compatibility exports used by TestingSecurity and legacy components.

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
