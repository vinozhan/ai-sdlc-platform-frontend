import {
  Server,
  CheckCircle2,
  AlertCircle,
  GitCompare,
  Terminal,
  Cpu,
  Sparkles,
  RefreshCw,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, Badge, Button, Progress, Table, Th, Td } from "@/shared/ui/primitives";
import { useUiStore } from "@/store/ui";
import { buildStatus } from "../fixtures/codeData";
import { LivePreviewPanel } from "./LivePreviewPanel";

export function BuildValidation() {
  const addToast = useUiStore((s) => s.addToast);
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Cpu className="h-4 w-4 text-blue-400" />
              Frontend Build
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-emerald-400" />
              <span className="text-sm font-medium text-white">Success</span>
            </div>
            <div className="space-y-1 text-xs text-slate-400">
              <p>Duration: {buildStatus.frontend.duration}</p>
              <p>Errors: {buildStatus.frontend.errors}</p>
              <p>Warnings: {buildStatus.frontend.warnings}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Server className="h-4 w-4 text-blue-400" />
              Backend Build
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-emerald-400" />
              <span className="text-sm font-medium text-white">Success</span>
            </div>
            <div className="space-y-1 text-xs text-slate-400">
              <p>Duration: {buildStatus.backend.duration}</p>
              <p>Errors: {buildStatus.backend.errors}</p>
              <p>Warnings: {buildStatus.backend.warnings}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GitCompare className="h-4 w-4 text-blue-400" />
              Integration Tests
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-amber-400" />
              <span className="text-sm font-medium text-white">1 Failed</span>
            </div>
            <Progress value={(buildStatus.integration.passed / buildStatus.integration.total) * 100} color="#3b82f6" />
            <p className="text-xs text-slate-400">
              {buildStatus.integration.passed}/{buildStatus.integration.total} passed
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="min-h-[360px]">
        <LivePreviewPanel status="synced" />
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Terminal className="h-4 w-4 text-blue-400" />
              Error Console
            </CardTitle>
            <Button size="sm" variant="outline" onClick={() => addToast({ type: "success", title: "Build re-triggered" })}>
              <RefreshCw className="h-3 w-3" /> Rebuild
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg bg-slate-950 p-3 font-mono text-xs">
            <p className="text-emerald-400">[INFO] Building nexuspay-frontend 1.0.0</p>
            <p className="text-emerald-400">[INFO] Compiling 42 source files...</p>
            <p className="text-amber-400">[WARN] PaymentForm.tsx:45 - Unused variable 'temp'</p>
            <p className="text-emerald-400">[INFO] Build successful in 42s</p>
            <p className="text-emerald-400">[INFO] Building nexuspay-backend 1.0.0</p>
            <p className="text-emerald-400">[INFO] Compiling 28 source files...</p>
            <p className="text-amber-400">[WARN] PaymentService.java:128 - Deprecated API usage</p>
            <p className="text-emerald-400">[INFO] BUILD SUCCESS</p>
            <p className="text-red-400">[FAIL] IntegrationTest.testPaymentRefund - Expected 200, got 201</p>
            <p className="text-slate-500">
              <span className="inline-flex items-center gap-1">
                <Sparkles className="h-3 w-3 text-blue-400" /> AI Fix: Update assertion to expect 201 (CREATED) - refund creates new record
              </span>
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Integration Test Results</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <thead>
              <tr>
                <Th>Test</Th>
                <Th>Contract</Th>
                <Th>Expected</Th>
                <Th>Actual</Th>
                <Th>Status</Th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <Td>testCreatePayment</Td>
                <Td className="font-mono">POST /api/v1/payments</Td>
                <Td>201</Td>
                <Td>201</Td>
                <Td><Badge variant="success">Pass</Badge></Td>
              </tr>
              <tr>
                <Td>testGetPayment</Td>
                <Td className="font-mono">GET /api/v1/payments/{`{id}`}</Td>
                <Td>200</Td>
                <Td>200</Td>
                <Td><Badge variant="success">Pass</Badge></Td>
              </tr>
              <tr>
                <Td>testPaymentRefund</Td>
                <Td className="font-mono">POST /api/v1/payments/{`{id}`}/refund</Td>
                <Td>200</Td>
                <Td>201</Td>
                <Td><Badge variant="error">Fail</Badge></Td>
              </tr>
              <tr>
                <Td>testKycSubmit</Td>
                <Td className="font-mono">POST /api/v1/kyc/submit</Td>
                <Td>202</Td>
                <Td>202</Td>
                <Td><Badge variant="success">Pass</Badge></Td>
              </tr>
            </tbody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
