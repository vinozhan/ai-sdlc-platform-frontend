import {
  frontendFileContents,
  backendFileContents,
  testResults,
} from "@/data/mockData";

export type TestCaseResult = {
  id: string;
  name: string;
  layer: "frontend" | "backend";
  status: "pass" | "fail" | "skip";
  duration: string;
  error?: string;
};

export type LayerExecution = {
  status: "pass" | "fail" | "running";
  duration: string;
  coverage: number;
  passed: number;
  failed: number;
  skipped: number;
  total: number;
};

export type TestScenario = {
  id: string;
  name: string;
  description: string;
  category: "unit" | "integration" | "api";
  status: "pass" | "fail" | "partial";
  frontend: LayerExecution;
  backend: LayerExecution;
  testCases: TestCaseResult[];
  filePaths: string[];
};

const paymentServiceTest = `@SpringBootTest
@AutoConfigureMockMvc
class PaymentServiceTest {

    @Autowired
    private PaymentService paymentService;

    @MockBean
    private PaymentGateway paymentGateway;

    @Test
    void shouldProcessPayment() {
        PaymentRequest request = new PaymentRequest("cust-1", new BigDecimal("149.99"), "USD");
        when(paymentGateway.charge(any())).thenReturn(new ChargeResult("ch_123", "succeeded"));

        Payment payment = paymentService.processPayment(request);

        assertNotNull(payment.getId());
        assertEquals(PaymentStatus.COMPLETED, payment.getStatus());
    }

    @Test
    void shouldProcessRefund() {
        Payment payment = createTestPayment();
        String refundId = paymentService.refund(payment.getId());
        Payment refunded = paymentService.findById(payment.getId()).orElseThrow();
        assertEquals(PaymentStatus.REFUNDED, refunded.getStatus());
        assertNotNull(refundId);
    }
}`;

const paymentControllerTest = `@WebMvcTest(PaymentController.class)
class PaymentControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private PaymentService paymentService;

    @Test
    void shouldCreatePayment() throws Exception {
        Payment payment = new Payment();
        payment.setId("pay-1");
        when(paymentService.processPayment(any())).thenReturn(payment);

        mockMvc.perform(post("/api/v1/payments")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\\"amount\\":149.99,\\"currency\\":\\"USD\\"}"))
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.id").value("pay-1"));
    }

    @Test
    void shouldReturn404ForMissingPayment() throws Exception {
        when(paymentService.findById("missing")).thenReturn(Optional.empty());

        mockMvc.perform(get("/api/v1/payments/missing"))
            .andExpect(status().isNotFound());
    }
}`;

const paymentIntegrationTest = `@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
class PaymentIntegrationTest {

    @Autowired
    private TestRestTemplate restTemplate;

    @Test
    void testCreatePayment() {
        ResponseEntity<PaymentDTO> response = restTemplate.postForEntity(
            "/api/v1/payments",
            Map.of("amount", 68.0, "currency", "USD", "customerId", "cust-42"),
            PaymentDTO.class
        );
        assertEquals(HttpStatus.CREATED, response.getStatusCode());
    }

    @Test
    void testPaymentRefund() {
        ResponseEntity<PaymentDTO> response = restTemplate.postForEntity(
            "/api/v1/payments/pay-99/refund",
            null,
            PaymentDTO.class
        );
        assertEquals(HttpStatus.CREATED, response.getStatusCode());
    }
}`;

const paymentFormTestFull = `import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { vi } from "vitest";
import { PaymentForm } from "../components/PaymentForm";
import * as paymentApi from "../services/paymentApi";

describe("PaymentForm", () => {
  beforeEach(() => {
    vi.spyOn(paymentApi, "createPayment").mockResolvedValue({
      id: "pay-001",
      status: "completed",
      amount: 149.99,
      currency: "USD",
    });
  });

  it("renders card inputs", () => {
    render(<PaymentForm amount={149.99} currency="USD" />);
    expect(screen.getByPlaceholderText("Card number")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /pay now/i })).toBeInTheDocument();
  });

  it("submits payment on valid form", async () => {
    render(<PaymentForm amount={149.99} currency="USD" />);
    fireEvent.change(screen.getByPlaceholderText("Card number"), {
      target: { value: "4242424242424242" },
    });
    fireEvent.click(screen.getByRole("button", { name: /pay now/i }));

    await waitFor(() => {
      expect(paymentApi.createPayment).toHaveBeenCalledWith(
        expect.objectContaining({ amount: 149.99, currency: "USD" })
      );
    });
  });

  it("shows error when API fails", async () => {
    vi.spyOn(paymentApi, "createPayment").mockRejectedValue(new Error("Payment failed"));
    render(<PaymentForm amount={149.99} currency="USD" />);
    fireEvent.click(screen.getByRole("button", { name: /pay now/i }));
    await waitFor(() => expect(screen.getByText(/payment failed/i)).toBeInTheDocument());
  });
});`;

const apiTestScript = `# API contract tests - Newman / REST Assured
# Run: npm run test:api

describe("POST /api/v1/payments", () => {
  it("returns 201 with payment id", async () => {
    const res = await fetch("/api/v1/payments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount: 68, currency: "USD", customerId: "cust-1" }),
    });
    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body.id).toBeDefined();
    expect(body.status).toBe("completed");
  });
});

describe("POST /api/v1/payments/{id}/refund", () => {
  it("returns 201 for refund", async () => {
    const res = await fetch("/api/v1/payments/pay-99/refund", { method: "POST" });
    expect(res.status).toBe(201);
  });
});`;

export const testFileContents: Record<string, string> = {
  ...frontendFileContents,
  ...backendFileContents,
  "src/__tests__/PaymentForm.test.tsx": paymentFormTestFull,
  "src/test/java/com/pay/PaymentServiceTest.java": paymentServiceTest,
  "src/test/java/com/pay/PaymentControllerTest.java": paymentControllerTest,
  "src/test/java/com/pay/PaymentIntegrationTest.java": paymentIntegrationTest,
  "tests/api/payments.api.test.ts": apiTestScript,
};

export const testFileTree = {
  frontend: [
    { path: "src/__tests__/PaymentForm.test.tsx", type: "test" },
    { path: "src/components/PaymentForm.tsx", type: "component" },
    { path: "src/services/paymentApi.ts", type: "service" },
    { path: "src/hooks/usePayment.ts", type: "hook" },
    { path: "tests/api/payments.api.test.ts", type: "test" },
  ],
  backend: [
    { path: "src/test/java/com/pay/PaymentServiceTest.java", type: "test" },
    { path: "src/test/java/com/pay/PaymentControllerTest.java", type: "test" },
    { path: "src/test/java/com/pay/PaymentIntegrationTest.java", type: "test" },
    { path: "src/main/java/com/pay/PaymentController.java", type: "controller" },
    { path: "src/main/java/com/pay/PaymentService.java", type: "service" },
  ],
};

export const testScenarios: TestScenario[] = [
  {
    id: "payment-checkout",
    name: "Payment Checkout Flow",
    description: "End-to-end payment form submission synced with POST /api/v1/payments",
    category: "integration",
    status: "pass",
    frontend: {
      status: "pass",
      duration: "4.2s",
      coverage: 89,
      passed: 3,
      failed: 0,
      skipped: 0,
      total: 3,
    },
    backend: {
      status: "pass",
      duration: "8.7s",
      coverage: 82,
      passed: 4,
      failed: 0,
      skipped: 0,
      total: 4,
    },
    testCases: [
      { id: "fe-1", name: "PaymentForm renders card inputs", layer: "frontend", status: "pass", duration: "42ms" },
      { id: "fe-2", name: "PaymentForm submits payment on valid form", layer: "frontend", status: "pass", duration: "128ms" },
      { id: "fe-3", name: "PaymentForm shows error when API fails", layer: "frontend", status: "pass", duration: "95ms" },
      { id: "be-1", name: "PaymentServiceTest.shouldProcessPayment", layer: "backend", status: "pass", duration: "312ms" },
      { id: "be-2", name: "PaymentControllerTest.shouldCreatePayment", layer: "backend", status: "pass", duration: "245ms" },
      { id: "be-3", name: "PaymentIntegrationTest.testCreatePayment", layer: "backend", status: "pass", duration: "1.2s" },
    ],
    filePaths: [
      "src/__tests__/PaymentForm.test.tsx",
      "src/components/PaymentForm.tsx",
      "src/services/paymentApi.ts",
      "src/test/java/com/pay/PaymentServiceTest.java",
      "src/test/java/com/pay/PaymentControllerTest.java",
      "src/test/java/com/pay/PaymentIntegrationTest.java",
    ],
  },
  {
    id: "payment-refund",
    name: "Payment Refund",
    description: "Refund API returns 201 - frontend and backend assertions synchronized",
    category: "integration",
    status: "fail",
    frontend: { status: "pass", duration: "2.1s", coverage: 76, passed: 1, failed: 0, skipped: 0, total: 1 },
    backend: { status: "fail", duration: "6.4s", coverage: 71, passed: 1, failed: 1, skipped: 0, total: 2 },
    testCases: [
      { id: "fe-r1", name: "Refund confirmation displayed", layer: "frontend", status: "pass", duration: "88ms" },
      { id: "be-r1", name: "PaymentServiceTest.shouldProcessRefund", layer: "backend", status: "fail", duration: "410ms", error: "Expected status 200 but got 201" },
      { id: "be-r2", name: "PaymentIntegrationTest.testPaymentRefund", layer: "backend", status: "pass", duration: "980ms" },
    ],
    filePaths: [
      "src/test/java/com/pay/PaymentServiceTest.java",
      "src/test/java/com/pay/PaymentIntegrationTest.java",
      "tests/api/payments.api.test.ts",
    ],
  },
  {
    id: "payment-api-contract",
    name: "API Contract Tests",
    description: "REST contract validation for payment endpoints",
    category: "api",
    status: "pass",
    frontend: { status: "pass", duration: "1.8s", coverage: 0, passed: 2, failed: 0, skipped: 0, total: 2 },
    backend: { status: "pass", duration: "3.2s", coverage: 0, passed: 2, failed: 0, skipped: 0, total: 2 },
    testCases: [
      { id: "api-1", name: "POST /api/v1/payments returns 201", layer: "frontend", status: "pass", duration: "156ms" },
      { id: "api-2", name: "POST /api/v1/payments/{id}/refund returns 201", layer: "frontend", status: "pass", duration: "134ms" },
      { id: "api-3", name: "PaymentControllerTest.shouldCreatePayment", layer: "backend", status: "pass", duration: "245ms" },
      { id: "api-4", name: "PaymentControllerTest.shouldReturn404ForMissingPayment", layer: "backend", status: "pass", duration: "198ms" },
    ],
    filePaths: [
      "tests/api/payments.api.test.ts",
      "src/test/java/com/pay/PaymentControllerTest.java",
      "src/main/java/com/pay/PaymentController.java",
    ],
  },
];

export const testSummaryCategories = [
  { name: "Unit Tests", data: testResults.unit, color: "#3b82f6", icon: "🧪" },
  { name: "Integration Tests", data: testResults.integration, color: "#2563eb", icon: "🔗" },
  { name: "Mutation Tests", data: { ...testResults.mutation, passed: testResults.mutation.killed, failed: testResults.mutation.survived, skipped: 0 }, color: "#f97316", icon: "🧬" },
];

export function getScenarioFiles(scenario: TestScenario): { path: string; type: string }[] {
  const paths = new Set(scenario.filePaths);
  return [
    ...testFileTree.frontend.filter((f) => paths.has(f.path)),
    ...testFileTree.backend.filter((f) => paths.has(f.path)),
  ];
}
