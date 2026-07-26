import { useState } from "react";
import {
  FileCode2,
  Server,
  FileJson,
  CheckCircle2,
  AlertCircle,
  GitCompare,
  Terminal,
  Cpu,
  Database,
  Layers,
  Eye,
  Sparkles,
  RefreshCw,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, Badge, Button, Tabs, Progress, CodeBlock, Table, Th, Td } from "@/components/ui/primitives";
import { apiContracts, frontendCode, backendCode, buildStatus, backlog } from "@/data/mockData";
import { useStore } from "@/store/useStore";
import { cn } from "@/utils/cn";

function SprintScope() {
  const [selected, setSelected] = useState<string[]>(["US-101", "US-102", "US-103"]);
  const toggle = (id: string) =>
    setSelected((prev) => (prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]));

  return (
    <div className="grid grid-cols-2 gap-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileCode2 className="h-4 w-4 text-blue-400" />
            Sprint Backlog & Scope
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {backlog.map((item) => (
            <label
              key={item.id}
              className={cn(
                "flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition-colors",
                selected.includes(item.id) ? "border-blue-500/40 bg-blue-500/5" : "border-slate-800 hover:border-slate-700"
              )}
            >
              <input
                type="checkbox"
                checked={selected.includes(item.id)}
                onChange={() => toggle(item.id)}
                className="h-4 w-4 rounded border-slate-600 bg-slate-800 accent-blue-500"
              />
              <div className="min-w-0 flex-1">
                <p className="text-sm text-slate-200">{item.title}</p>
                <p className="text-xs text-slate-500">{item.id} · {item.epic}</p>
              </div>
              <Badge variant="c2">{item.storyPoints} pts</Badge>
            </label>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Layers className="h-4 w-4 text-blue-400" />
            Wireframe & SAG Input
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-lg border border-slate-800 bg-slate-950 p-3">
              <p className="mb-2 text-xs font-semibold text-slate-400">Wireframe Screens</p>
              <div className="space-y-2">
                {["Payment Form", "KYC Verification", "Transaction History"].map((s) => (
                  <div key={s} className="flex items-center gap-2 rounded bg-slate-900 p-2">
                    <div className="h-8 w-8 rounded bg-blue-500/10" />
                    <span className="text-xs text-slate-300">{s}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-lg border border-slate-800 bg-slate-950 p-3">
              <p className="mb-2 text-xs font-semibold text-slate-400">SAG Subgraph</p>
              <div className="space-y-2">
                {["Payment Service", "KYC Service", "API Gateway", "User Entity"].map((s) => (
                  <div key={s} className="flex items-center gap-2 rounded bg-slate-900 p-2">
                    <div className="h-2 w-2 rounded-full bg-blue-400" />
                    <span className="text-xs text-slate-300">{s}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="mt-3 rounded-lg border border-blue-500/30 bg-blue-500/5 p-3">
            <p className="text-xs font-semibold text-blue-300">Generation Scope</p>
            <p className="mt-1 text-xs text-slate-300">
              {selected.length} stories selected · Estimated 42 files to generate · 3 API contracts
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function ContractDesigner() {
  const [selectedContract, setSelectedContract] = useState(apiContracts[0]);
  const [validationMode, setValidationMode] = useState<"rule" | "llm">("rule");

  return (
    <div className="grid grid-cols-3 gap-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileJson className="h-4 w-4 text-blue-400" />
            API Contracts
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {apiContracts.map((c) => (
            <button
              key={c.id}
              onClick={() => setSelectedContract(c)}
              className={cn(
                "w-full rounded-lg border p-3 text-left transition-colors",
                selectedContract.id === c.id ? "border-blue-500/40 bg-blue-500/5" : "border-slate-800 hover:border-slate-700"
              )}
            >
              <div className="flex items-center gap-2">
                <Badge variant={c.method === "POST" ? "success" : c.method === "GET" ? "info" : "error"}>
                  {c.method}
                </Badge>
                <span className="font-mono text-xs text-slate-300">{c.path}</span>
              </div>
              <p className="mt-1 text-xs text-slate-500">{c.summary}</p>
              <div className="mt-2 flex items-center gap-2">
                <Progress value={c.agreementScore} color="#3b82f6" className="flex-1" />
                <span className="text-xs text-slate-400">{c.agreementScore}%</span>
              </div>
            </button>
          ))}
        </CardContent>
      </Card>

      <Card className="col-span-2">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Contract Editor — {selectedContract.path}</CardTitle>
            <div className="flex gap-1 rounded-lg bg-slate-950 p-1">
              <button
                onClick={() => setValidationMode("rule")}
                className={cn("rounded px-2 py-1 text-xs", validationMode === "rule" ? "bg-slate-700 text-white" : "text-slate-400")}
              >
                Rule-Based
              </button>
              <button
                onClick={() => setValidationMode("llm")}
                className={cn("rounded px-2 py-1 text-xs", validationMode === "llm" ? "bg-slate-700 text-white" : "text-slate-400")}
              >
                LLM
              </button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="mb-1 text-xs font-semibold text-slate-400">Request Schema</p>
              <CodeBlock
                code={JSON.stringify(selectedContract.requestSchema, null, 2)}
                language="json"
                className="max-h-40"
              />
            </div>
            <div>
              <p className="mb-1 text-xs font-semibold text-slate-400">Response Schema</p>
              <CodeBlock
                code={JSON.stringify(selectedContract.responseSchema, null, 2)}
                language="json"
                className="max-h-40"
              />
            </div>
          </div>

          <div className="rounded-lg border border-slate-800 p-3">
            <p className="mb-2 text-xs font-semibold text-slate-400">
              {validationMode === "rule" ? "Rule-Based Validation" : "LLM-Based Validation"}
            </p>
            <div className="space-y-2">
              {validationMode === "rule" ? (
                <>
                  <div className="flex items-center gap-2 text-xs">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                    <span className="text-slate-300">Request schema is valid JSON</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                    <span className="text-slate-300">All field types are supported</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                    <span className="text-slate-300">Response schema matches endpoint purpose</span>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-center gap-2 text-xs">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                    <span className="text-slate-300">Endpoint naming follows REST conventions</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <AlertCircle className="h-4 w-4 text-amber-400" />
                    <span className="text-slate-300">Consider adding rate limiting to POST endpoint</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                    <span className="text-slate-300">Schema fields align with SAG entities</span>
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between rounded-lg border border-blue-500/30 bg-blue-500/5 p-3">
            <div>
              <p className="text-xs font-semibold text-blue-300">Contract Agreement Score</p>
              <p className="text-2xl font-bold text-white">{selectedContract.agreementScore}%</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-slate-400">Frontend-Backend Alignment</p>
              <Badge variant={selectedContract.agreementScore > 90 ? "success" : "warning"}>
                {selectedContract.agreementScore > 90 ? "Excellent" : "Needs Work"}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function FrontendStudio() {
  const [framework, setFramework] = useState<"react" | "angular">("react");
  const [selectedFile, setSelectedFile] = useState(frontendCode.files[0]);

  return (
    <div className="grid grid-cols-4 gap-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileCode2 className="h-4 w-4 text-blue-400" />
            File Tree
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-1">
          <div className="mb-2 flex gap-1 rounded-lg bg-slate-950 p-1">
            <button
              onClick={() => setFramework("react")}
              className={cn("flex-1 rounded py-1 text-xs", framework === "react" ? "bg-slate-700 text-white" : "text-slate-400")}
            >
              React
            </button>
            <button
              onClick={() => setFramework("angular")}
              className={cn("flex-1 rounded py-1 text-xs", framework === "angular" ? "bg-slate-700 text-white" : "text-slate-400")}
            >
              Angular
            </button>
          </div>
          {frontendCode.files.map((f) => (
            <button
              key={f.path}
              onClick={() => setSelectedFile(f)}
              className={cn(
                "flex w-full items-center gap-2 rounded px-2 py-1.5 text-left text-xs",
                selectedFile.path === f.path ? "bg-blue-500/10 text-blue-300" : "text-slate-400 hover:bg-slate-800"
              )}
            >
              <FileCode2 className="h-3 w-3" />
              <span className="truncate">{f.path.split("/").pop()}</span>
              <span className="ml-auto text-[10px] text-slate-600">{f.lines}</span>
            </button>
          ))}
        </CardContent>
      </Card>

      <Card className="col-span-2">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="font-mono text-xs">{selectedFile.path}</CardTitle>
            <Badge variant="c2">{selectedFile.type}</Badge>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <CodeBlock code={frontendCode.code} language="typescript" className="max-h-[400px] rounded-none border-0" />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-4 w-4 text-blue-400" />
            Live Preview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border border-slate-800 bg-slate-100 p-4">
            <div className="mb-3 rounded bg-slate-700 px-3 py-2 text-center text-xs font-medium text-white">
              Payment Form
            </div>
            <div className="space-y-2">
              <input className="w-full rounded border border-slate-300 px-2 py-1.5 text-xs text-slate-700" placeholder="Card number" defaultValue="4242 4242 4242 4242" />
              <div className="flex gap-2">
                <input className="w-1/2 rounded border border-slate-300 px-2 py-1.5 text-xs text-slate-700" placeholder="MM/YY" />
                <input className="w-1/2 rounded border border-slate-300 px-2 py-1.5 text-xs text-slate-700" placeholder="CVC" />
              </div>
              <button className="w-full rounded bg-blue-600 py-2 text-xs font-medium text-white">
                Pay $149.99
              </button>
            </div>
          </div>
          <p className="mt-2 text-center text-[10px] text-slate-500">Click wireframe element to map code</p>
        </CardContent>
      </Card>
    </div>
  );
}

function BackendStudio() {
  const [framework, setFramework] = useState<"spring" | "node">("spring");
  const [selectedFile, setSelectedFile] = useState(backendCode.files[0]);

  return (
    <div className="grid grid-cols-4 gap-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Server className="h-4 w-4 text-blue-400" />
            Backend Files
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-1">
          <div className="mb-2 flex gap-1 rounded-lg bg-slate-950 p-1">
            <button
              onClick={() => setFramework("spring")}
              className={cn("flex-1 rounded py-1 text-xs", framework === "spring" ? "bg-slate-700 text-white" : "text-slate-400")}
            >
              Spring Boot
            </button>
            <button
              onClick={() => setFramework("node")}
              className={cn("flex-1 rounded py-1 text-xs", framework === "node" ? "bg-slate-700 text-white" : "text-slate-400")}
            >
              Node.js
            </button>
          </div>
          {backendCode.files.map((f) => (
            <button
              key={f.path}
              onClick={() => setSelectedFile(f)}
              className={cn(
                "flex w-full items-center gap-2 rounded px-2 py-1.5 text-left text-xs",
                selectedFile.path === f.path ? "bg-blue-500/10 text-blue-300" : "text-slate-400 hover:bg-slate-800"
              )}
            >
              <Server className="h-3 w-3" />
              <span className="truncate">{f.path.split("/").pop()}</span>
              <Badge variant="default" className="ml-auto">{f.type}</Badge>
            </button>
          ))}
        </CardContent>
      </Card>

      <Card className="col-span-2">
        <CardHeader>
          <CardTitle className="font-mono text-xs">{selectedFile.path}</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <CodeBlock code={backendCode.code} language="java" className="max-h-[400px] rounded-none border-0" />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-4 w-4 text-blue-400" />
            DB Mapping
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {[
            { entity: "Payment", table: "payments", fields: 18 },
            { entity: "User", table: "users", fields: 12 },
            { entity: "KYC Record", table: "kyc_records", fields: 9 },
            { entity: "Transaction", table: "transactions", fields: 18 },
          ].map((m) => (
            <div key={m.entity} className="rounded-lg border border-slate-800 p-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-200">{m.entity}</span>
                <Database className="h-3 w-3 text-blue-400" />
              </div>
              <p className="mt-1 font-mono text-[10px] text-slate-500">{m.table} · {m.fields} fields</p>
            </div>
          ))}
          <div className="rounded-lg border border-blue-500/30 bg-blue-500/5 p-2">
            <p className="text-xs font-semibold text-blue-300">API Endpoints</p>
            <p className="mt-1 text-xs text-slate-300">4 endpoints generated · 3 validated</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function BuildValidation() {
  const { addToast } = useStore();
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-4">
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
                <Sparkles className="h-3 w-3 text-blue-400" /> AI Fix: Update assertion to expect 201 (CREATED) — refund creates new record
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

export function CodeGeneration() {
  const [activeTab, setActiveTab] = useState("scope");

  const tabs = [
    { id: "scope", label: "Backlog", icon: <Layers className="h-3.5 w-3.5" /> },
    { id: "contract", label: "API Contracts", icon: <FileJson className="h-3.5 w-3.5" /> },
    { id: "frontend", label: "Frontend", icon: <FileCode2 className="h-3.5 w-3.5" /> },
    { id: "backend", label: "Backend", icon: <Server className="h-3.5 w-3.5" /> },
    { id: "build", label: "Build", icon: <Terminal className="h-3.5 w-3.5" /> },
  ];

  return (
    <div className="space-y-5 p-4 md:p-6">
      <Tabs tabs={tabs} active={activeTab} onChange={setActiveTab} />

      {activeTab === "scope" && <SprintScope />}
      {activeTab === "contract" && <ContractDesigner />}
      {activeTab === "frontend" && <FrontendStudio />}
      {activeTab === "backend" && <BackendStudio />}
      {activeTab === "build" && <BuildValidation />}
    </div>
  );
}
