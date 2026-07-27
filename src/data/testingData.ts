// Testing & Security phase — one coherent run.
//
// Every number in this file is derived from the same run: Sprint 24, Build 1852.
// 223 tests ran, 217 passed, 6 failed, 3 were skipped. The six failures are the
// six entries in the failure inbox, and the module table adds up to them.

import type { FileEntry } from "@/components/code/buildFileTree";

export const testingRun = {
  sprint: "Sprint 24",
  build: 1852,
  branch: "main",
  startedAt: "2025-01-21 14:41",
  finishedAt: "2025-01-21 14:44",
  duration: "3m 12s",
  frontendRunner: "Vitest 2.1.4",
  backendRunner: "JUnit 5 · Gradle 8.7",
  lastVerified: {
    sprint: "Sprint 23",
    build: 1847,
    at: "2025-01-20 11:06",
    note: "211 tests, all passing",
  },
};

/* ========================================================================== *
 * 1 — Tests
 * ========================================================================== */

export type SuiteModule = {
  id: string;
  name: string;
  side: "backend" | "frontend";
  runner: "JUnit 5" | "Vitest";
  passed: number;
  failed: number;
  skipped: number;
  duration: string;
  requirements: string[];
  failureIds: string[];
};

export const suiteModules: SuiteModule[] = [
  {
    id: "payments",
    name: "Payments",
    side: "backend",
    runner: "JUnit 5",
    passed: 68,
    failed: 3,
    skipped: 1,
    duration: "48s",
    requirements: ["US-101", "US-106"],
    failureIds: ["f1", "f2", "f3"],
  },
  {
    id: "kyc",
    name: "KYC",
    side: "backend",
    runner: "JUnit 5",
    passed: 41,
    failed: 1,
    skipped: 0,
    duration: "39s",
    requirements: ["US-103", "US-104"],
    failureIds: ["f4"],
  },
  {
    id: "auth",
    name: "Auth",
    side: "backend",
    runner: "JUnit 5",
    passed: 33,
    failed: 0,
    skipped: 1,
    duration: "31s",
    requirements: ["US-101"],
    failureIds: [],
  },
  {
    id: "notifications",
    name: "Notifications",
    side: "backend",
    runner: "JUnit 5",
    passed: 22,
    failed: 1,
    skipped: 0,
    duration: "18s",
    requirements: ["US-105"],
    failureIds: ["f5"],
  },
  {
    id: "payment-ui",
    name: "Payment UI",
    side: "frontend",
    runner: "Vitest",
    passed: 34,
    failed: 1,
    skipped: 1,
    duration: "9s",
    requirements: ["US-101", "US-103"],
    failureIds: ["f6"],
  },
  {
    id: "shared-ui",
    name: "Shared UI",
    side: "frontend",
    runner: "Vitest",
    passed: 19,
    failed: 0,
    skipped: 0,
    duration: "5s",
    requirements: ["US-106"],
    failureIds: [],
  },
];

export function suiteTotals(modules: SuiteModule[]) {
  const passed = modules.reduce((n, m) => n + m.passed, 0);
  const failed = modules.reduce((n, m) => n + m.failed, 0);
  const skipped = modules.reduce((n, m) => n + m.skipped, 0);
  const run = passed + failed;
  return { passed, failed, skipped, run, passRate: run === 0 ? 0 : (passed / run) * 100 };
}

export type ConsoleLine = {
  kind: "cmd" | "info" | "pass" | "fail" | "skip" | "detail" | "summary" | "muted";
  text: string;
};

export const runTranscript: ConsoleLine[] = [
  { kind: "cmd", text: "payflow test --all --coverage --mutation" },
  { kind: "info", text: `frontend · ${testingRun.frontendRunner}` },
  { kind: "pass", text: "src/__tests__/TransactionList.test.tsx · 19 tests · 5.0s" },
  { kind: "pass", text: "src/hooks/__tests__/usePayment.test.ts · 12 tests · 2.4s" },
  { kind: "fail", text: "src/__tests__/PaymentForm.test.tsx > shows a validation error for an expired card" },
  { kind: "detail", text: 'Unable to find text "Card expired" · PaymentForm.test.tsx:31' },
  { kind: "skip", text: "src/__tests__/PaymentForm.test.tsx > pays with a saved wallet · skipped, wallet API not wired" },
  { kind: "info", text: `backend · ${testingRun.backendRunner}` },
  { kind: "pass", text: "com.payflow.auth.AuthControllerTest · 33 tests · 31s" },
  { kind: "fail", text: "com.payflow.payments.PaymentControllerTest > shouldRefundPayment" },
  { kind: "detail", text: "expected status 200 but was 201 · PaymentControllerTest.java:46" },
  { kind: "fail", text: "com.payflow.payments.PaymentServiceTest > shouldSplitSettlementFees" },
  { kind: "detail", text: "no value present for feeBreakdown · PaymentServiceTest.java:33" },
  { kind: "fail", text: "com.payflow.payments.PaymentServiceTest > shouldRejectPaymentAboveKycLimit" },
  { kind: "detail", text: "expected KycRequiredException, nothing was thrown · PaymentServiceTest.java:51" },
  { kind: "fail", text: "com.payflow.kyc.KycServiceTest > shouldVerifyDocument" },
  { kind: "detail", text: "verify(document) was never called · KycServiceTest.java:28" },
  { kind: "fail", text: "com.payflow.notifications.NotificationServiceTest > shouldRetryFailedEmail" },
  { kind: "detail", text: "expected 3 delivery attempts but got 1 · NotificationServiceTest.java:31" },
  { kind: "summary", text: "223 tests run · 217 passed · 6 failed · 3 skipped · 3m 12s" },
  { kind: "muted", text: "line coverage 87.2% · branch coverage 74.1% · handing 6 failures to triage" },
];

/* ========================================================================== *
 * 2 — Healing: the failure inbox is the only approval queue
 * ========================================================================== */

export type Triage = "brittle" | "regression" | "healed";

export type GuardCheck = { pass: boolean; detail: string };

export type Repair = {
  proposedAt: string;
  language: "java" | "tsx";
  original: string;
  proposed: string;
  guard: { unchanged: GuardCheck; planted: GuardCheck };
  verdictLine: string;
  why: string;
};

export type FailureItem = {
  id: string;
  test: string;
  moduleId: string;
  runner: "JUnit 5" | "Vitest";
  triage: Triage;
  /** brittle: awaiting your approval, or blocked by the guard and escalated */
  state: "awaiting-approval" | "blocked" | "escalated" | "healed";
  reason: string;
  age: string;
  at: string;
  build: number;
  requirement: { id: string; title: string };
  file: string;
  line: number;
  owner?: string;
  repair?: Repair;
  note?: string;
};

export const failures: FailureItem[] = [
  {
    id: "f1",
    test: "PaymentControllerTest.shouldRefundPayment",
    moduleId: "payments",
    runner: "JUnit 5",
    triage: "brittle",
    state: "awaiting-approval",
    reason: "Expected status 200 but got 201",
    age: "13 min ago",
    at: "2025-01-21 14:43",
    build: 1852,
    requirement: { id: "US-101", title: "As a user, I want to add a credit card" },
    file: "backend/src/test/java/com/payflow/payments/PaymentControllerTest.java",
    line: 46,
    repair: {
      proposedAt: "2025-01-21 14:46",
      language: "java",
      original: `@Test
void shouldRefundPayment() throws Exception {
    Payment payment = seedCapturedPayment();

    mockMvc.perform(post("/api/v1/payments/{id}/refund", payment.getId()))
        .andExpect(status().isOk());
}`,
      proposed: `@Test
void shouldRefundPayment() throws Exception {
    Payment payment = seedCapturedPayment();

    mockMvc.perform(post("/api/v1/payments/{id}/refund", payment.getId()))
        .andExpect(status().isCreated())
        .andExpect(jsonPath("$.status").value("REFUNDED"))
        .andExpect(jsonPath("$.refundId").isNotEmpty());
}`,
      guard: {
        unchanged: { pass: true, detail: "Ran the repaired test against today's code · 1 test · 1 passed" },
        planted: {
          pass: true,
          detail: "Planted a bug that answers 201 with an empty body · 1 test · 1 failed · caught",
        },
      },
      verdictLine: "Repair holds. It still catches the planted bug.",
      why: "Refunds used to update the payment in place. They now create a refund record, so the endpoint answers 201 Created and returns a refund id. The test only ever checked the status code, so it went stale the moment the endpoint changed shape. The repair checks the new code and the two fields the endpoint promises.",
    },
  },
  {
    id: "f2",
    test: "PaymentServiceTest.shouldSplitSettlementFees",
    moduleId: "payments",
    runner: "JUnit 5",
    triage: "brittle",
    state: "awaiting-approval",
    reason: "No value present for feeBreakdown",
    age: "13 min ago",
    at: "2025-01-21 14:43",
    build: 1852,
    requirement: { id: "US-106", title: "As a user, I want to view transaction history" },
    file: "backend/src/test/java/com/payflow/payments/PaymentServiceTest.java",
    line: 33,
    repair: {
      proposedAt: "2025-01-21 14:47",
      language: "java",
      original: `@Test
void shouldSplitSettlementFees() {
    Payment payment = paymentService.capture(request(12_000L, "USD"));

    FeeBreakdown fees = payment.getFeeBreakdown();
    assertEquals(348L, fees.platformFee());
}`,
      proposed: `@Test
void shouldSplitSettlementFees() {
    Payment payment = paymentService.capture(request(12_000L, "USD"));

    FeeBreakdown fees = payment.feeBreakdown()
        .orElseThrow(() -> new AssertionError("captured payment has no fees"));
    assertEquals(348L, fees.platformFee());
    assertEquals(11_652L, fees.netToMerchant());
}`,
      guard: {
        unchanged: { pass: true, detail: "Ran the repaired test against today's code · 1 test · 1 passed" },
        planted: {
          pass: true,
          detail: "Planted a bug that keeps the platform fee and zeroes the merchant's net · 1 test · 1 failed · caught",
        },
      },
      verdictLine: "Repair holds. It still catches the planted bug.",
      why: "getFeeBreakdown() became feeBreakdown() and returns an Optional now, so the old call no longer compiles. The repair unwraps it with a message that says what went wrong, and also checks the merchant's net amount — a number the old test never looked at.",
    },
  },
  {
    id: "f3",
    test: "PaymentServiceTest.shouldRejectPaymentAboveKycLimit",
    moduleId: "payments",
    runner: "JUnit 5",
    triage: "regression",
    state: "escalated",
    reason: "Expected KycRequiredException, nothing was thrown",
    age: "13 min ago",
    at: "2025-01-21 14:43",
    build: 1852,
    requirement: { id: "US-103", title: "As a user, I want to verify my identity" },
    file: "backend/src/test/java/com/payflow/payments/PaymentServiceTest.java",
    line: 51,
    owner: "M. Rodriguez",
    note: "A $1,400 payment from an unverified customer went through. The KYC check moved behind a feature flag in Build 1851 and the flag is off in this environment, so the rule is not being applied. The test is correct and was left untouched — this is a real regression, routed to M. Rodriguez.",
  },
  {
    id: "f4",
    test: "KycServiceTest.shouldVerifyDocument",
    moduleId: "kyc",
    runner: "JUnit 5",
    triage: "brittle",
    state: "blocked",
    reason: "verify(document) was never called",
    age: "13 min ago",
    at: "2025-01-21 14:43",
    build: 1852,
    requirement: { id: "US-103", title: "As a user, I want to verify my identity" },
    file: "backend/src/test/java/com/payflow/kyc/KycServiceTest.java",
    line: 28,
    owner: "A. Chen",
    repair: {
      proposedAt: "2025-01-21 14:47",
      language: "java",
      original: `@Test
void shouldVerifyDocument() {
    kycService.verify(document);

    verify(documentVerifier).verify(document);
}`,
      proposed: `@Test
void shouldVerifyDocument() {
    kycService.verify(document);

    verify(documentVerifier).verify(document, VerificationContext.DEFAULT);
}`,
      guard: {
        unchanged: { pass: true, detail: "Ran the repaired test against today's code · 1 test · 1 passed" },
        planted: {
          pass: false,
          detail: "Planted a bug that returns UNVERIFIED for a valid document · 1 test · 1 passed · the bug went through",
        },
      },
      verdictLine: "Repair rejected. It no longer catches a planted bug, so it would hide the failure instead of reporting it.",
      why: "verify() takes a verification context now, so the old call no longer matches and the test fails to compile. The repair fixes the call — but it only checks that the verifier was called, not what it answered. A service that accepted an unverified document would still pass. Escalated to A. Chen with the proposal attached.",
    },
  },
  {
    id: "f5",
    test: "NotificationServiceTest.shouldRetryFailedEmail",
    moduleId: "notifications",
    runner: "JUnit 5",
    triage: "regression",
    state: "escalated",
    reason: "Expected 3 delivery attempts but got 1",
    age: "13 min ago",
    at: "2025-01-21 14:43",
    build: 1852,
    requirement: { id: "US-105", title: "As a user, I want push notifications" },
    file: "backend/src/test/java/com/payflow/notifications/NotificationServiceTest.java",
    line: 31,
    owner: "J. Kim",
    note: "The retry policy stopped after the first attempt. The mail client's own retry was removed in Build 1852 and nothing replaced it, so a failed receipt email is now dropped silently. The test is correct and was left untouched — this is a real regression, routed to J. Kim.",
  },
  {
    id: "f6",
    test: "PaymentForm.test.tsx > shows a validation error for an expired card",
    moduleId: "payment-ui",
    runner: "Vitest",
    triage: "brittle",
    state: "awaiting-approval",
    reason: 'Unable to find text "Card expired"',
    age: "13 min ago",
    at: "2025-01-21 14:43",
    build: 1852,
    requirement: { id: "US-101", title: "As a user, I want to add a credit card" },
    file: "frontend/src/__tests__/PaymentForm.test.tsx",
    line: 31,
    repair: {
      proposedAt: "2025-01-21 14:48",
      language: "tsx",
      original: `await userEvent.type(screen.getByPlaceholderText("MM / YY"), "01 / 20");
await userEvent.click(screen.getByRole("button", { name: /pay/i }));

expect(screen.getByText("Card expired")).toBeInTheDocument();`,
      proposed: `await userEvent.type(screen.getByPlaceholderText("MM / YY"), "01 / 20");
await userEvent.click(screen.getByRole("button", { name: /pay/i }));

expect(await screen.findByRole("alert")).toHaveTextContent(/expired/i);
expect(onSubmit).not.toHaveBeenCalled();`,
      guard: {
        unchanged: { pass: true, detail: "Ran the repaired test against today's code · 1 test · 1 passed" },
        planted: {
          pass: true,
          detail: "Planted a bug that shows the alert and submits anyway · 1 test · 1 failed · caught",
        },
      },
      verdictLine: "Repair holds. It still catches the planted bug.",
      why: 'The error copy changed from "Card expired" to "This card has expired". The old test matched the exact sentence, so a wording change read as a broken feature. The repair matches the alert the form renders and checks that the payment was not submitted — the behaviour this test exists to protect.',
    },
  },
  {
    id: "f7",
    test: "AuthControllerTest.shouldRejectExpiredToken",
    moduleId: "auth",
    runner: "JUnit 5",
    triage: "healed",
    state: "healed",
    reason: "Was: expected 401 but got 403",
    age: "yesterday",
    at: "2025-01-20 16:34",
    build: 1851,
    requirement: { id: "US-101", title: "As a user, I want to add a credit card" },
    file: "backend/src/test/java/com/payflow/auth/AuthControllerTest.java",
    line: 33,
    note: "Expired tokens answer 401 now, not 403. S. Patel approved the repair on 20 Jan at 16:20 and the test has passed in every run since, including this one.",
  },
  {
    id: "f8",
    test: "PaymentForm.test.tsx > formats the amount with the account currency",
    moduleId: "payment-ui",
    runner: "Vitest",
    triage: "healed",
    state: "healed",
    reason: "Was: expected “$149.99”, found “€149.99”",
    age: "yesterday",
    at: "2025-01-20 16:34",
    build: 1851,
    requirement: { id: "US-106", title: "As a user, I want to view transaction history" },
    file: "frontend/src/__tests__/PaymentForm.test.tsx",
    line: 21,
    note: "The button label follows the account currency instead of always printing dollars. S. Patel approved the repair on 20 Jan at 16:21; it has passed in every run since.",
  },
];

/* ========================================================================== *
 * Generated test files — the real repository tree, filtered to tests
 * ========================================================================== */

export const testFiles: FileEntry[] = [
  { path: "frontend/src/__tests__/PaymentForm.test.tsx", type: "test", lines: 44, tags: ["healed"] },
  { path: "frontend/src/__tests__/TransactionList.test.tsx", type: "test", lines: 30 },
  { path: "frontend/src/hooks/__tests__/usePayment.test.ts", type: "test", lines: 21 },
  { path: "backend/src/test/java/com/payflow/payments/PaymentControllerTest.java", type: "test", lines: 48 },
  { path: "backend/src/test/java/com/payflow/payments/PaymentServiceTest.java", type: "test", lines: 58 },
  { path: "backend/src/test/java/com/payflow/kyc/KycServiceTest.java", type: "test", lines: 30 },
  { path: "backend/src/test/java/com/payflow/auth/AuthControllerTest.java", type: "test", lines: 35, tags: ["healed"] },
  { path: "backend/src/test/java/com/payflow/notifications/NotificationServiceTest.java", type: "test", lines: 33 },
];

/** Which requirement each test file protects, and its state in this run. */
export const testFileMeta: Record<string, { requirement: string; requirementTitle: string; failureId?: string; healedId?: string }> = {
  "frontend/src/__tests__/PaymentForm.test.tsx": {
    requirement: "US-101",
    requirementTitle: "As a user, I want to add a credit card",
    failureId: "f6",
    healedId: "f8",
  },
  "frontend/src/__tests__/TransactionList.test.tsx": {
    requirement: "US-106",
    requirementTitle: "As a user, I want to view transaction history",
  },
  "frontend/src/hooks/__tests__/usePayment.test.ts": {
    requirement: "US-101",
    requirementTitle: "As a user, I want to add a credit card",
  },
  "backend/src/test/java/com/payflow/payments/PaymentControllerTest.java": {
    requirement: "US-101",
    requirementTitle: "As a user, I want to add a credit card",
    failureId: "f1",
  },
  "backend/src/test/java/com/payflow/payments/PaymentServiceTest.java": {
    requirement: "US-106",
    requirementTitle: "As a user, I want to view transaction history",
    failureId: "f2",
  },
  "backend/src/test/java/com/payflow/kyc/KycServiceTest.java": {
    requirement: "US-103",
    requirementTitle: "As a user, I want to verify my identity",
    failureId: "f4",
  },
  "backend/src/test/java/com/payflow/auth/AuthControllerTest.java": {
    requirement: "US-101",
    requirementTitle: "As a user, I want to add a credit card",
    healedId: "f7",
  },
  "backend/src/test/java/com/payflow/notifications/NotificationServiceTest.java": {
    requirement: "US-105",
    requirementTitle: "As a user, I want push notifications",
    failureId: "f5",
  },
};

export const testFileContents: Record<string, string> = {
  "frontend/src/__tests__/PaymentForm.test.tsx": `import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { PaymentForm } from "../components/PaymentForm";

// Written from US-101 "As a user, I want to add a credit card"
describe("PaymentForm", () => {
  const onSubmit = vi.fn();

  it("renders the card fields", () => {
    render(<PaymentForm amount={149.99} currency="USD" onSubmit={onSubmit} />);

    expect(screen.getByPlaceholderText("Card number")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("MM / YY")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("CVC")).toBeInTheDocument();
  });

  it("formats the amount with the account currency", () => {
    render(<PaymentForm amount={149.99} currency="EUR" onSubmit={onSubmit} />);

    expect(screen.getByRole("button", { name: "Pay €149.99" })).toBeInTheDocument();
  });

  it("shows a validation error for an expired card", async () => {
    render(<PaymentForm amount={149.99} currency="USD" onSubmit={onSubmit} />);

    await userEvent.type(screen.getByPlaceholderText("Card number"), "4242424242424242");
    await userEvent.type(screen.getByPlaceholderText("MM / YY"), "01 / 20");
    await userEvent.click(screen.getByRole("button", { name: /pay/i }));

    expect(screen.getByText("Card expired")).toBeInTheDocument();
  });

  it("submits once the card is valid", async () => {
    render(<PaymentForm amount={149.99} currency="USD" onSubmit={onSubmit} />);

    await userEvent.type(screen.getByPlaceholderText("Card number"), "4242424242424242");
    await userEvent.type(screen.getByPlaceholderText("MM / YY"), "04 / 29");
    await userEvent.type(screen.getByPlaceholderText("CVC"), "123");
    await userEvent.click(screen.getByRole("button", { name: /pay/i }));

    expect(onSubmit).toHaveBeenCalledWith({ amount: 149.99, currency: "USD" });
  });
});`,
  "frontend/src/__tests__/TransactionList.test.tsx": `import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { TransactionList } from "../components/TransactionList";

// Written from US-106 "As a user, I want to view transaction history"
const rows = [
  { id: "TXN-9001", amount: 149.99, currency: "USD", status: "SETTLED", createdAt: "2025-01-19T10:02:00Z" },
  { id: "TXN-9002", amount: 24.5, currency: "USD", status: "REFUNDED", createdAt: "2025-01-20T08:41:00Z" },
];

describe("TransactionList", () => {
  it("lists the newest transaction first", () => {
    render(<TransactionList transactions={rows} />);

    const ids = screen.getAllByTestId("txn-id").map((el) => el.textContent);
    expect(ids).toEqual(["TXN-9002", "TXN-9001"]);
  });

  it("labels a refund", () => {
    render(<TransactionList transactions={rows} />);

    expect(screen.getByText("Refunded")).toBeInTheDocument();
  });

  it("shows an empty state when there is nothing to list", () => {
    render(<TransactionList transactions={[]} />);

    expect(screen.getByText("No transactions yet")).toBeInTheDocument();
  });
});`,
  "frontend/src/hooks/__tests__/usePayment.test.ts": `import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { usePayment } from "../usePayment";
import * as api from "../../services/paymentApi";

// Written from US-101 "As a user, I want to add a credit card"
describe("usePayment", () => {
  beforeEach(() => vi.restoreAllMocks());

  it("reports the error message when the gateway rejects the card", async () => {
    vi.spyOn(api, "createPayment").mockRejectedValue(new Error("Card declined"));
    const { result } = renderHook(() => usePayment());

    await act(async () => {
      await expect(result.current.processPayment({ amount: 10, currency: "USD" })).rejects.toThrow();
    });

    expect(result.current.error).toBe("Card declined");
    expect(result.current.loading).toBe(false);
  });
});`,
  "backend/src/test/java/com/payflow/payments/PaymentControllerTest.java": `package com.payflow.payments;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.web.servlet.MockMvc;

// Written from US-101 "As a user, I want to add a credit card"
@SpringBootTest
@AutoConfigureMockMvc
class PaymentControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private PaymentFixtures fixtures;

    @Test
    void shouldCreatePayment() throws Exception {
        mockMvc.perform(post("/api/v1/payments")
                .contentType("application/json")
                .content("""
                    { "amount": 14999, "currency": "USD", "source": "tok_visa" }
                    """))
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.status").value("CAPTURED"));
    }

    @Test
    void shouldReturn404ForUnknownPayment() throws Exception {
        mockMvc.perform(post("/api/v1/payments/{id}/refund", "PAY-does-not-exist"))
            .andExpect(status().isNotFound());
    }

    @Test
    void shouldRefundPayment() throws Exception {
        Payment payment = fixtures.seedCapturedPayment();

        mockMvc.perform(post("/api/v1/payments/{id}/refund", payment.getId()))
            .andExpect(status().isOk());
    }
}`,
  "backend/src/test/java/com/payflow/payments/PaymentServiceTest.java": `package com.payflow.payments;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

import com.payflow.kyc.KycRequiredException;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

// Written from US-106 "As a user, I want to view transaction history"
// and US-103 "As a user, I want to verify my identity"
@SpringBootTest
@Transactional
class PaymentServiceTest {

    @Autowired
    private PaymentService paymentService;

    @Test
    void shouldCapturePayment() {
        Payment payment = paymentService.capture(request(14_999L, "USD"));

        assertEquals(PaymentStatus.CAPTURED, payment.getStatus());
        assertEquals(14_999L, payment.getAmountMinor());
    }

    @Test
    void shouldSplitSettlementFees() {
        Payment payment = paymentService.capture(request(12_000L, "USD"));

        FeeBreakdown fees = payment.getFeeBreakdown();
        assertEquals(348L, fees.platformFee());
    }

    @Test
    void shouldRecordRefundAgainstOriginalPayment() {
        Payment payment = paymentService.capture(request(4_000L, "USD"));

        Refund refund = paymentService.refund(payment.getId());

        assertEquals(payment.getId(), refund.paymentId());
        assertEquals(4_000L, refund.amountMinor());
    }

    @Test
    void shouldRejectPaymentAboveKycLimit() {
        Customer unverified = customers.unverified();

        assertThrows(KycRequiredException.class,
            () -> paymentService.capture(request(140_000L, "USD", unverified)));
    }

    private PaymentRequest request(long amountMinor, String currency) {
        return new PaymentRequest(amountMinor, currency, "tok_visa", customers.verified());
    }
}`,
  "backend/src/test/java/com/payflow/kyc/KycServiceTest.java": `package com.payflow.kyc;

import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

// Written from US-103 "As a user, I want to verify my identity"
@ExtendWith(MockitoExtension.class)
class KycServiceTest {

    @Mock
    private DocumentVerifier documentVerifier;

    @InjectMocks
    private KycService kycService;

    private final Document document = Document.passport("P-4521", "2031-04-01");

    @Test
    void shouldVerifyDocument() {
        kycService.verify(document);

        verify(documentVerifier).verify(document);
    }
}`,
  "backend/src/test/java/com/payflow/auth/AuthControllerTest.java": `package com.payflow.auth;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.web.servlet.MockMvc;

// Written from US-101 "As a user, I want to add a credit card"
@SpringBootTest
@AutoConfigureMockMvc
class AuthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private TokenFixtures tokens;

    @Test
    void shouldAllowValidToken() throws Exception {
        mockMvc.perform(get("/api/v1/me").header("Authorization", tokens.valid()))
            .andExpect(status().isOk());
    }

    // Repaired 20 Jan, approved by S. Patel: expired tokens answer 401, not 403.
    @Test
    void shouldRejectExpiredToken() throws Exception {
        mockMvc.perform(get("/api/v1/me").header("Authorization", tokens.expired()))
            .andExpect(status().isUnauthorized());
    }
}`,
  "backend/src/test/java/com/payflow/notifications/NotificationServiceTest.java": `package com.payflow.notifications;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

// Written from US-105 "As a user, I want push notifications"
@ExtendWith(MockitoExtension.class)
class NotificationServiceTest {

    @Mock
    private MailClient mailClient;

    @InjectMocks
    private NotificationService notificationService;

    @Test
    void shouldRetryFailedEmail() {
        when(mailClient.send(any())).thenThrow(new MailException("smtp timeout"));

        notificationService.sendReceipt("USR-4521", "TXN-9001");

        verify(mailClient, times(3)).send(any());
    }
}`,
};

/* ========================================================================== *
 * 3 — Quality
 * ========================================================================== */

export type Quality = {
  line: { percent: number; covered: number; total: number };
  branch: { percent: number; covered: number; total: number };
  mutation: { total: number; killed: number; survived: number; score: number };
  tool: string;
  byModule: { name: string; line: number; branch: number; covered: number; total: number }[];
  survivors: { location: string; change: string; note: string }[];
  trend: { build: number; line: number; branch: number }[];
  trendNote: string;
};

export const quality: Quality = {
  line: { percent: 87.2, covered: 7344, total: 8424 },
  branch: { percent: 74.1, covered: 1982, total: 2674 },
  mutation: { total: 312, killed: 284, survived: 28, score: 91 },
  tool: "PIT 1.16 · Stryker 8.6",
  byModule: [
    { name: "payments/PaymentService.java", line: 94, branch: 82, covered: 1512, total: 1608 },
    { name: "payments/PaymentController.java", line: 91, branch: 78, covered: 782, total: 859 },
    { name: "auth/AuthService.java", line: 89, branch: 74, covered: 1104, total: 1240 },
    { name: "components/PaymentForm.tsx", line: 92, branch: 80, covered: 664, total: 722 },
    { name: "hooks/usePayment.ts", line: 85, branch: 70, covered: 289, total: 340 },
    { name: "kyc/KycService.java", line: 76, branch: 61, covered: 918, total: 1208 },
    { name: "notifications/NotificationService.java", line: 68, branch: 52, covered: 574, total: 844 },
  ],
  survivors: [
    {
      location: "notifications/NotificationService.java:118",
      change: "attempts >= maxAttempts became attempts > maxAttempts",
      note: "One extra delivery attempt, and no test noticed.",
    },
    {
      location: "kyc/KycService.java:64",
      change: "removed the expiry check on the document date",
      note: "An expired passport would verify, and no test noticed.",
    },
    {
      location: "hooks/usePayment.ts:41",
      change: "swallowed the error instead of re-throwing it",
      note: "A declined card would look like a success, and no test noticed.",
    },
  ],
  trend: [
    { build: 1846, line: 78, branch: 64 },
    { build: 1847, line: 79, branch: 66 },
    { build: 1848, line: 81, branch: 68 },
    { build: 1849, line: 82, branch: 69 },
    { build: 1851, line: 85, branch: 72 },
    { build: 1852, line: 87, branch: 74 },
  ],
  trendNote: "Build 1850 failed to compile, so it recorded no coverage.",
};

/* ========================================================================== *
 * 4 — Security
 * ========================================================================== */

export type Severity = "critical" | "high" | "medium" | "low";
export type FindingStatus = "open" | "fix-proposed" | "re-verifying" | "verified" | "dismissed";
export type Detector = "local" | "reviewer";

export type Finding = {
  id: string;
  cwe: string;
  name: string;
  severity: Severity;
  cvss: number;
  file: string;
  line: number;
  status: FindingStatus;
  foundBy: Detector[];
  explanation: string;
  fix?: { before: string; after: string; language: "java" | "tsx"; summary: string };
  openReason?: string;
};

export const findings: Finding[] = [
  {
    id: "v1",
    cwe: "CWE-79",
    name: "Cross-site scripting",
    severity: "high",
    cvss: 7.4,
    file: "backend/src/main/java/com/payflow/payments/PaymentController.java",
    line: 42,
    status: "fix-proposed",
    foundBy: ["local", "reviewer"],
    explanation:
      "The payment description a customer types is written straight into the confirmation email template. A description containing a script tag is rendered as markup when the customer opens that email in a browser client.",
    fix: {
      language: "java",
      summary: "Escape the description before it reaches the template.",
      before: `model.addAttribute("description", request.getDescription());
return new ModelAndView("email/receipt", model.asMap());`,
      after: `model.addAttribute("description", HtmlUtils.htmlEscape(request.getDescription()));
return new ModelAndView("email/receipt", model.asMap());`,
    },
  },
  {
    id: "v2",
    cwe: "CWE-89",
    name: "SQL injection",
    severity: "critical",
    cvss: 9.1,
    file: "backend/src/main/java/com/payflow/user/UserRepository.java",
    line: 88,
    status: "verified",
    foundBy: ["local", "reviewer"],
    explanation:
      "The customer lookup builds its SQL by concatenating the email argument, so an email of ' OR '1'='1 returns every row in the users table. The address comes from an unauthenticated password-reset form.",
    fix: {
      language: "java",
      summary: "Send the email as a parameter instead of pasting it into the statement.",
      before: `String sql = "SELECT * FROM users WHERE email = '" + email + "'";
return jdbcTemplate.query(sql, userRowMapper);`,
      after: `String sql = "SELECT * FROM users WHERE email = ?";
return jdbcTemplate.query(sql, userRowMapper, email);`,
    },
  },
  {
    id: "v3",
    cwe: "CWE-352",
    name: "Cross-site request forgery",
    severity: "medium",
    cvss: 5.2,
    file: "backend/src/main/java/com/payflow/auth/AuthController.java",
    line: 31,
    status: "verified",
    foundBy: ["local"],
    explanation:
      "The session refresh endpoint accepts a POST with no CSRF token, so any other site a signed-in customer visits can keep their session alive in the background.",
    fix: {
      language: "java",
      summary: "Turn CSRF protection back on for the auth chain.",
      before: `http.csrf(csrf -> csrf.disable())
    .authorizeHttpRequests(auth -> auth.requestMatchers("/api/v1/auth/**").permitAll());`,
      after: `http.csrf(csrf -> csrf.csrfTokenRepository(CookieCsrfTokenRepository.withHttpOnlyFalse()))
    .authorizeHttpRequests(auth -> auth.requestMatchers("/api/v1/auth/**").permitAll());`,
    },
  },
  {
    id: "v4",
    cwe: "CWE-200",
    name: "Information exposure",
    severity: "medium",
    cvss: 4.8,
    file: "backend/src/main/java/com/payflow/support/ErrorHandler.java",
    line: 15,
    status: "open",
    foundBy: ["reviewer"],
    explanation:
      "The global error handler returns the stack trace in the response body. It names internal classes, the ORM, and the database driver version, which tells an attacker what to aim at.",
    openReason:
      "No fix proposed yet. This handler shapes the error response for every endpoint, so the replacement needs an owner's decision on what clients get instead.",
  },
  {
    id: "v5",
    cwe: "CWE-611",
    name: "XML external entity",
    severity: "low",
    cvss: 3.1,
    file: "backend/src/main/java/com/payflow/settlement/XmlParser.java",
    line: 22,
    status: "open",
    foundBy: ["local"],
    explanation:
      "The settlement file parser resolves external entities, so a crafted bank file can make the server read a local file or call out to another host. Files arrive from one trusted bank over SFTP, which is why this is scored low.",
    openReason: "No fix proposed yet. Waiting on the settlement owner to confirm no bank file relies on entity expansion.",
  },
  {
    id: "v6",
    cwe: "CWE-502",
    name: "Unsafe deserialization",
    severity: "critical",
    cvss: 8.8,
    file: "backend/src/main/java/com/payflow/auth/SessionManager.java",
    line: 67,
    status: "re-verifying",
    foundBy: ["local", "reviewer"],
    explanation:
      "Session data from the cookie is read with Java's native ObjectInputStream. A crafted cookie can construct arbitrary objects while it is being read, which is remote code execution before any of our own code runs.",
    fix: {
      language: "java",
      summary: "Read the session as JSON with a fixed type instead of a native object stream.",
      before: `ObjectInputStream in = new ObjectInputStream(new ByteArrayInputStream(bytes));
return (Session) in.readObject();`,
      after: `return sessionJson.readValue(bytes, Session.class);
// sessionJson: ObjectMapper with default typing disabled`,
    },
  },
];

export const severityOrder: Severity[] = ["critical", "high", "medium", "low"];

export const detectorNames: Record<Detector, string> = {
  local: "Local model",
  reviewer: "AI reviewer",
};

/** Model-level numbers from the offline evaluation set — not per-finding confidence. */
export const detectorComparison = {
  caption:
    "Measured on 1,240 labelled Java and TypeScript files on 14 Jan 2025. These are model-level numbers for the detectors, not confidence in any single finding.",
  rows: [
    { detector: "Local model", precision: 0.89, recall: 0.84, f1: 0.86, cost: "$0.00", latency: "0.4s", offline: true },
    { detector: "AI reviewer", precision: 0.92, recall: 0.9, f1: 0.91, cost: "$0.31", latency: "6.2s", offline: false },
    { detector: "Both, combined", precision: 0.94, recall: 0.96, f1: 0.95, cost: "$0.31", latency: "6.6s", offline: false },
  ],
};

/* ========================================================================== *
 * 5 — Fix and re-verify: two proofs per applied fix
 * ========================================================================== */

export type ProofState = "pass" | "fail" | "running" | "pending" | "errored";

export type AppliedFix = {
  findingId: string;
  appliedBy: string;
  appliedAt: string;
  scan: { state: ProofState; detail: string; at?: string };
  suite: { state: ProofState; detail: string; at?: string };
  verdict: string;
};

export const appliedFixes: AppliedFix[] = [
  {
    findingId: "v2",
    appliedBy: "S. Patel",
    appliedAt: "2025-01-21 15:02",
    scan: {
      state: "pass",
      at: "15:04",
      detail: "1,412 files re-scanned · CWE-89 no longer reported at UserRepository.java:88 · no new findings",
    },
    suite: {
      state: "pass",
      at: "15:09",
      detail: "223 tests run · 217 passed · 6 failed · the same 6 as before the fix, no new failures",
    },
    verdict: "Fixed and re-verified.",
  },
  {
    findingId: "v3",
    appliedBy: "S. Patel",
    appliedAt: "2025-01-21 15:05",
    scan: {
      state: "pass",
      at: "15:07",
      detail: "1,412 files re-scanned · CWE-352 no longer reported at AuthController.java:31 · no new findings",
    },
    suite: {
      state: "pass",
      at: "15:11",
      detail: "223 tests run · 217 passed · 6 failed · the same 6 as before the fix, no new failures",
    },
    verdict: "Fixed and re-verified.",
  },
  {
    findingId: "v6",
    appliedBy: "A. Chen",
    appliedAt: "2025-01-21 15:14",
    scan: {
      state: "pass",
      at: "15:16",
      detail: "1,412 files re-scanned · CWE-502 no longer reported at SessionManager.java:67 · no new findings",
    },
    suite: {
      state: "running",
      detail: "148 of 223 tests run",
    },
    verdict: "Not verified yet — waiting on the suite re-run.",
  },
];

/* ========================================================================== *
 * 6 — Report and approval
 * ========================================================================== */

export type AuditActorKind = "human" | "agent" | "guard";

export type AuditEntry = {
  id: string;
  at: string;
  actor: string;
  actorKind: AuditActorKind;
  action: string;
  target: string;
  detail: string;
};

export const auditTrail: AuditEntry[] = [
  {
    id: "a13",
    at: "2025-01-21 15:16",
    actor: "Security agent",
    actorKind: "agent",
    action: "Re-scanned",
    target: "SessionManager.java",
    detail: "CWE-502 no longer reported. Suite re-run still going.",
  },
  {
    id: "a12",
    at: "2025-01-21 15:14",
    actor: "A. Chen",
    actorKind: "human",
    action: "Applied fix",
    target: "SessionManager.java:67",
    detail: "Reads the session as JSON with a fixed type instead of a native object stream.",
  },
  {
    id: "a11",
    at: "2025-01-21 15:11",
    actor: "Testing agent",
    actorKind: "agent",
    action: "Re-ran suite",
    target: "Build 1852",
    detail: "217 passed, 6 failed — the same 6 as before the CSRF fix.",
  },
  {
    id: "a10",
    at: "2025-01-21 15:05",
    actor: "S. Patel",
    actorKind: "human",
    action: "Applied fix",
    target: "AuthController.java:31",
    detail: "Turned CSRF protection back on for the auth chain.",
  },
  {
    id: "a9",
    at: "2025-01-21 15:02",
    actor: "S. Patel",
    actorKind: "human",
    action: "Applied fix",
    target: "UserRepository.java:88",
    detail: "Parameterised the customer lookup.",
  },
  {
    id: "a8",
    at: "2025-01-21 15:01",
    actor: "Security agent",
    actorKind: "agent",
    action: "Finished scan",
    target: "Build 1852",
    detail: "6 findings: 2 critical, 1 high, 2 medium, 1 low. Both detectors agreed on 3.",
  },
  {
    id: "a7",
    at: "2025-01-21 14:48",
    actor: "Healing agent",
    actorKind: "agent",
    action: "Proposed repair",
    target: "PaymentForm.test.tsx",
    detail: "Matches the alert the form renders instead of the exact sentence.",
  },
  {
    id: "a6",
    at: "2025-01-21 14:47",
    actor: "Honesty guard",
    actorKind: "guard",
    action: "Rejected repair",
    target: "KycServiceTest.shouldVerifyDocument",
    detail: "The repair stopped checking what verification answered, so a planted bug went through. Escalated to A. Chen.",
  },
  {
    id: "a5",
    at: "2025-01-21 14:46",
    actor: "Healing agent",
    actorKind: "agent",
    action: "Proposed repair",
    target: "PaymentControllerTest.shouldRefundPayment",
    detail: "Expects 201 Created and checks the refund id the endpoint now returns.",
  },
  {
    id: "a4",
    at: "2025-01-21 14:45",
    actor: "Healing agent",
    actorKind: "agent",
    action: "Escalated failures",
    target: "2 real regressions",
    detail: "Left both tests untouched. Routed to M. Rodriguez and J. Kim.",
  },
  {
    id: "a3",
    at: "2025-01-21 14:44",
    actor: "Healing agent",
    actorKind: "agent",
    action: "Triaged failures",
    target: "6 failures",
    detail: "4 brittle tests, 2 real regressions.",
  },
  {
    id: "a2",
    at: "2025-01-21 14:44",
    actor: "Testing agent",
    actorKind: "agent",
    action: "Ran suite",
    target: "Build 1852",
    detail: "223 tests run, 217 passed, 6 failed, 3 skipped.",
  },
  {
    id: "a1",
    at: "2025-01-21 09:12",
    actor: "Testing agent",
    actorKind: "agent",
    action: "Wrote tests",
    target: "Payments, KYC",
    detail: "14 new tests from US-101, US-103 and US-106.",
  },
  {
    id: "a0",
    at: "2025-01-20 16:34",
    actor: "Testing agent",
    actorKind: "agent",
    action: "Re-ran suite",
    target: "Build 1851",
    detail: "Both approved repairs pass. AuthControllerTest and PaymentForm are healed.",
  },
];

/** How a repair or a fix travels once you approve it. Plain names, no codes. */
export const decisionChain = [
  { id: "propose", label: "Testing proposes", detail: "Repairs and fixes arrive with their evidence attached." },
  { id: "approve", label: "You approve", detail: "One decision per item, in the failure inbox and the findings table." },
  { id: "implement", label: "Code Generation implements", detail: "Approved changes land on the branch." },
  { id: "reverify", label: "Testing re-verifies", detail: "Scan and suite run again on the new build." },
];

/* ========================================================================== *
 * Running state — the transcript streams in this order
 * ========================================================================== */

export const streamingTranscript: ConsoleLine[] = [
  { kind: "cmd", text: "payflow test --all --coverage --mutation" },
  { kind: "muted", text: "resolving 223 tests from 8 files · Build 1852 · main" },
  { kind: "info", text: `frontend · ${testingRun.frontendRunner}` },
  { kind: "pass", text: "src/__tests__/TransactionList.test.tsx · 19 tests · 5.0s" },
  { kind: "pass", text: "src/hooks/__tests__/usePayment.test.ts · 12 tests · 2.4s" },
  { kind: "fail", text: "src/__tests__/PaymentForm.test.tsx > shows a validation error for an expired card" },
  { kind: "detail", text: 'Unable to find text "Card expired" · PaymentForm.test.tsx:31' },
  { kind: "skip", text: "src/__tests__/PaymentForm.test.tsx > pays with a saved wallet · skipped" },
  { kind: "info", text: `backend · ${testingRun.backendRunner}` },
  { kind: "pass", text: "com.payflow.auth.AuthControllerTest · 33 tests · 31s" },
  { kind: "fail", text: "com.payflow.payments.PaymentControllerTest > shouldRefundPayment" },
  { kind: "detail", text: "expected status 200 but was 201 · PaymentControllerTest.java:46" },
  { kind: "fail", text: "com.payflow.payments.PaymentServiceTest > shouldSplitSettlementFees" },
  { kind: "detail", text: "no value present for feeBreakdown · PaymentServiceTest.java:33" },
  { kind: "fail", text: "com.payflow.payments.PaymentServiceTest > shouldRejectPaymentAboveKycLimit" },
  { kind: "detail", text: "expected KycRequiredException, nothing was thrown · PaymentServiceTest.java:51" },
  { kind: "fail", text: "com.payflow.kyc.KycServiceTest > shouldVerifyDocument" },
  { kind: "detail", text: "verify(document) was never called · KycServiceTest.java:28" },
  { kind: "fail", text: "com.payflow.notifications.NotificationServiceTest > shouldRetryFailedEmail" },
  { kind: "detail", text: "expected 3 delivery attempts but got 1 · NotificationServiceTest.java:31" },
  { kind: "pass", text: "com.payflow.payments · 68 remaining tests · 48s" },
  { kind: "summary", text: "223 tests run · 217 passed · 6 failed · 3 skipped · 3m 12s" },
  { kind: "muted", text: "line coverage 87.2% · branch coverage 74.1% · handing 6 failures to triage" },
];

/* ========================================================================== *
 * The all-green run — a later build where every failure and finding is closed
 * ========================================================================== */

export const greenRun = {
  build: 1854,
  finishedAt: "2025-01-22 09:41",
  duration: "3m 04s",
  quality: {
    line: { percent: 93.4, covered: 7924, total: 8484 },
    branch: { percent: 84.2, covered: 2278, total: 2705 },
    mutation: { total: 312, killed: 301, survived: 11, score: 96 },
  },
  /** The two findings that had no proposal on Build 1852 got one before this build. */
  lateFixes: {
    v4: {
      language: "java" as const,
      summary: "Answer with a problem-details body and keep the trace in the server log.",
      before: `return ResponseEntity.status(500).body(ex.getStackTrace());`,
      after: `log.error("unhandled error, ref {}", ref, ex);
return ResponseEntity.status(500).body(new ProblemDetail(ref, "Something went wrong"));`,
    },
    v5: {
      language: "java" as const,
      summary: "Turn off DTDs and external entities on the parser factory.",
      before: `DocumentBuilderFactory factory = DocumentBuilderFactory.newInstance();`,
      after: `DocumentBuilderFactory factory = DocumentBuilderFactory.newInstance();
factory.setFeature("http://apache.org/xml/features/disallow-doctype-decl", true);`,
    },
  },
  transcript: [
    { kind: "cmd", text: "payflow test --all --coverage --mutation" },
    { kind: "info", text: `frontend · ${testingRun.frontendRunner}` },
    { kind: "pass", text: "src/__tests__/PaymentForm.test.tsx · 21 tests · 6.1s" },
    { kind: "pass", text: "src/__tests__/TransactionList.test.tsx · 19 tests · 5.0s" },
    { kind: "pass", text: "src/hooks/__tests__/usePayment.test.ts · 14 tests · 2.6s" },
    { kind: "info", text: `backend · ${testingRun.backendRunner}` },
    { kind: "pass", text: "com.payflow.auth.AuthControllerTest · 34 tests · 30s" },
    { kind: "pass", text: "com.payflow.payments · 72 tests · 47s" },
    { kind: "pass", text: "com.payflow.kyc.KycServiceTest · 42 tests · 38s" },
    { kind: "pass", text: "com.payflow.notifications.NotificationServiceTest · 23 tests · 18s" },
    { kind: "summary", text: "223 tests run · 223 passed · 0 failed · 0 skipped · 3m 04s" },
    { kind: "muted", text: "line coverage 93.4% · branch coverage 84.2% · nothing to triage" },
  ] as ConsoleLine[],
};

/** Progress the streaming console reports, line by line, for the summary strip. */
export const streamProgress: Record<number, { passed: number; failed: number }> = {
  3: { passed: 19, failed: 0 },
  4: { passed: 31, failed: 0 },
  5: { passed: 31, failed: 1 },
  9: { passed: 64, failed: 1 },
  10: { passed: 64, failed: 2 },
  12: { passed: 64, failed: 3 },
  14: { passed: 64, failed: 4 },
  16: { passed: 105, failed: 5 },
  18: { passed: 127, failed: 6 },
  20: { passed: 217, failed: 6 },
};
