import { useState, useMemo } from "react";
import { useParams } from "react-router-dom";
import type { ProjectStatus } from "@/store/useStore";
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
} from "recharts";
import {
  ShieldAlert,
  Wrench,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Bug,
  Activity,
  ScrollText,
  ShieldCheck,
  Lock,
  History,
  RotateCcw,
  ThumbsUp,
  ThumbsDown,
  CheckCheck,
  Sparkles,
  Eye,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, Badge, Button, Progress, CodeBlock, Table, Th, Td } from "@/components/ui/primitives";
import { PhaseSectionHeader, getPhaseProgress } from "@/components/project/PhaseSectionHeader";
import { ChevronStepper } from "@/components/ui/ChevronStepper";
import { testResults, failingTests, approvalQueue, auditLog, vulnerabilities, cvssRadar } from "@/data/mockData";
import { useStore } from "@/store/useStore";
import { cn } from "@/utils/cn";
import { TestTabPanel } from "@/components/testing/TestTabPanel";

const testingPhaseSteps = [
  { id: "dashboard", label: "Tests" },
  { id: "healing", label: "Self-Healing" },
  { id: "security", label: "Security" },
  { id: "governance", label: "Governance" },
];

function getTestingProgressId(status: ProjectStatus): string {
  switch (status) {
    case "complete":
    case "deploy":
      return "done";
    case "testing":
      return "governance";
    default:
      return "dashboard";
  }
}

function SelfHealingRepair() {
  const [selectedTest, setSelectedTest] = useState(failingTests[0]);
  const { addToast } = useStore();

  const statusConfig = {
    "real-regression": { color: "#ef4444", label: "Real Regression", icon: XCircle, action: "Route to Developer" },
    brittle: { color: "#f59e0b", label: "Brittle Test", icon: Wrench, action: "AI Repair Candidate" },
    healed: { color: "#10b981", label: "Healed", icon: CheckCircle2, action: "Previously Fixed" },
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Card className="border-red-500/30">
          <CardContent className="flex items-center gap-3 p-4">
            <XCircle className="h-8 w-8 text-red-400" />
            <div>
              <p className="text-2xl font-bold text-white">{failingTests.filter((t) => t.status === "real-regression").length}</p>
              <p className="text-xs text-slate-400">Real Regressions</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-amber-500/30">
          <CardContent className="flex items-center gap-3 p-4">
            <Wrench className="h-8 w-8 text-amber-400" />
            <div>
              <p className="text-2xl font-bold text-white">{failingTests.filter((t) => t.status === "brittle").length}</p>
              <p className="text-xs text-slate-400">Brittle Tests</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-emerald-500/30">
          <CardContent className="flex items-center gap-3 p-4">
            <CheckCircle2 className="h-8 w-8 text-emerald-400" />
            <div>
              <p className="text-2xl font-bold text-white">{failingTests.filter((t) => t.status === "healed").length}</p>
              <p className="text-xs text-slate-400">Healed</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-blue-500/30">
          <CardContent className="flex items-center gap-3 p-4">
            <Sparkles className="h-8 w-8 text-blue-400" />
            <div>
              <p className="text-2xl font-bold text-white">{approvalQueue.filter((a) => a.status === "pending").length}</p>
              <p className="text-xs text-slate-400">Awaiting Approval</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bug className="h-4 w-4 text-blue-400" />
              Failure Inbox
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {failingTests.map((test) => {
              const config = statusConfig[test.status as keyof typeof statusConfig];
              const Icon = config.icon;
              return (
                <button
                  key={test.id}
                  onClick={() => setSelectedTest(test)}
                  className={cn(
                    "w-full rounded-lg border p-3 text-left transition-colors",
                    selectedTest.id === test.id ? "border-blue-500/40 bg-blue-500/5" : "border-slate-800 hover:border-slate-700"
                  )}
                >
                  <div className="flex items-center gap-2">
                    <Icon className="h-4 w-4" style={{ color: config.color }} />
                    <span className="text-xs font-medium text-slate-200">{test.name}</span>
                  </div>
                  <p className="mt-1 text-[11px] text-slate-500">{test.error}</p>
                  <div className="mt-1.5 flex items-center justify-between">
                    <Badge variant={test.status === "real-regression" ? "error" : test.status === "brittle" ? "warning" : "success"}>
                      {config.label}
                    </Badge>
                    <span className="text-[10px] text-slate-600">{test.lastRun}</span>
                  </div>
                </button>
              );
            })}
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="font-mono text-xs">{selectedTest.name}</CardTitle>
              <Badge variant={selectedTest.status === "real-regression" ? "error" : selectedTest.status === "brittle" ? "warning" : "success"}>
                {statusConfig[selectedTest.status as keyof typeof statusConfig].label}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {selectedTest.status === "brittle" && (() => {
              const guard = selectedTest.honestyGuard!;
              const origCode = selectedTest.originalCode ?? "";
              const propCode = selectedTest.proposedCode ?? "";
              return (
              <>
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  <div>
                    <p className="mb-1 text-xs font-semibold text-red-300">Original Test</p>
                    <CodeBlock code={origCode} language="java" className="max-h-48 text-[10px]" />
                  </div>
                  <div>
                    <p className="mb-1 text-xs font-semibold text-emerald-300">Proposed Repair</p>
                    <CodeBlock code={propCode} language="java" className="max-h-48 text-[10px]" />
                  </div>
                </div>

                <div className="rounded-lg border border-blue-500/30 bg-blue-500/5 p-3">
                  <p className="mb-2 text-xs font-semibold text-blue-300">🛡️ Honesty Guard Status</p>
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 text-xs">
                      {guard.passesUnchanged ? (
                        <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-400" />
                      )}
                      <span className="text-slate-300">Passes unchanged code</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      {guard.killsMutant ? (
                        <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-400" />
                      )}
                      <span className="text-slate-300">Kills injected mutant</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      {guard.integrity ? (
                        <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-400" />
                      )}
                      <span className="text-slate-300">
                        Integrity check {guard.integrity ? "passed" : "failed"}
                        {!guard.integrity && " — blocks acceptance"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="rounded-lg border border-slate-800 p-3">
                  <p className="mb-1 text-xs font-semibold text-slate-400">🤖 AI Explanation</p>
                  <p className="text-xs text-slate-300">{selectedTest.explanation}</p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="c3"
                    size="sm"
                    disabled={!guard.integrity}
                    onClick={() => addToast({ type: "success", title: "Repair approved", message: "Test repair sent to merge queue" })}
                  >
                    <ThumbsUp className="h-3 w-3" /> Approve Repair
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => addToast({ type: "warning", title: "Repair rejected", message: "Test repair rejected by developer" })}
                  >
                    <ThumbsDown className="h-3 w-3" /> Reject
                  </Button>
                  {!guard.integrity && (
                    <span className="flex items-center text-xs text-red-400">
                      <AlertTriangle className="mr-1 h-3 w-3" />
                      Blocked: integrity check failed
                    </span>
                  )}
                </div>
              </>
              );
            })()}

            {selectedTest.status === "real-regression" && (
              <div className="rounded-lg border border-red-500/30 bg-red-500/5 p-4">
                <div className="flex items-center gap-2">
                  <XCircle className="h-5 w-5 text-red-400" />
                  <p className="text-sm font-semibold text-red-300">Real Regression Detected</p>
                </div>
                <p className="mt-2 text-xs text-slate-300">{selectedTest.explanation}</p>
                <Button variant="error" size="sm" className="mt-3">
                  <Bug className="h-3 w-3" /> Route to Developer
                </Button>
              </div>
            )}

            {selectedTest.status === "healed" && (
              <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/5 p-4">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                  <p className="text-sm font-semibold text-emerald-300">Successfully Healed</p>
                </div>
                <p className="mt-2 text-xs text-slate-300">{selectedTest.explanation}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCheck className="h-4 w-4 text-blue-400" />
              Approval Workflow
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {approvalQueue.map((item) => (
              <div key={item.id} className="rounded-lg border border-slate-800 p-3">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs text-slate-300">{item.testId}</span>
                  <Badge variant={item.status === "pending" ? "warning" : "success"}>{item.status}</Badge>
                </div>
                <p className="mt-1 text-xs text-slate-500">Proposed by {item.proposedBy} · {item.createdAt}</p>
                <p className="mt-1 text-xs text-slate-400">{item.qaComment}</p>
                {item.devComment && (
                  <p className="mt-1 text-xs text-emerald-400">Dev: {item.devComment}</p>
                )}
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-blue-400" />
              Mutation Testing Results
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/5 p-3 text-center">
                <p className="text-3xl font-bold text-emerald-400">{testResults.mutation.killed}</p>
                <p className="text-xs text-slate-400">Mutants Killed</p>
              </div>
              <div className="rounded-lg border border-red-500/30 bg-red-500/5 p-3 text-center">
                <p className="text-3xl font-bold text-red-400">{testResults.mutation.survived}</p>
                <p className="text-xs text-slate-400">Mutants Survived</p>
              </div>
            </div>
            <div className="mt-3">
              <div className="mb-1 flex justify-between text-xs">
                <span className="text-slate-400">Mutation Score</span>
                <span className="text-blue-400">{testResults.mutation.coverage}%</span>
              </div>
              <Progress value={testResults.mutation.coverage} color="#2563eb" />
            </div>
            <div className="mt-3 flex items-center justify-between rounded-lg border border-slate-800 p-2">
              <span className="text-xs text-slate-400">PIT/Stryker Integration</span>
              <Badge variant="success">
                <CheckCircle2 className="h-3 w-3" /> Active
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function SecurityScanning() {
  const [selectedVuln, setSelectedVuln] = useState(vulnerabilities[1]);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Card className="border-red-500/30">
          <CardContent className="p-4">
            <p className="text-xs text-slate-400">Critical</p>
            <p className="text-2xl font-bold text-red-400">{vulnerabilities.filter((v) => v.severity === "critical").length}</p>
          </CardContent>
        </Card>
        <Card className="border-orange-500/30">
          <CardContent className="p-4">
            <p className="text-xs text-slate-400">High</p>
            <p className="text-2xl font-bold text-orange-400">{vulnerabilities.filter((v) => v.severity === "high").length}</p>
          </CardContent>
        </Card>
        <Card className="border-amber-500/30">
          <CardContent className="p-4">
            <p className="text-xs text-slate-400">Medium</p>
            <p className="text-2xl font-bold text-amber-400">{vulnerabilities.filter((v) => v.severity === "medium").length}</p>
          </CardContent>
        </Card>
        <Card className="border-slate-600">
          <CardContent className="p-4">
            <p className="text-xs text-slate-400">Low</p>
            <p className="text-2xl font-bold text-slate-400">{vulnerabilities.filter((v) => v.severity === "low").length}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShieldAlert className="h-4 w-4 text-blue-400" />
              Vulnerability Dashboard
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <thead>
                <tr>
                  <Th>CWE</Th>
                  <Th>Name</Th>
                  <Th>Severity</Th>
                  <Th>CVSS</Th>
                  <Th>Location</Th>
                  <Th>Status</Th>
                </tr>
              </thead>
              <tbody>
                {vulnerabilities.map((v) => (
                  <tr
                    key={v.id}
                    onClick={() => setSelectedVuln(v)}
                    className={cn("cursor-pointer", selectedVuln.id === v.id && "bg-blue-500/5")}
                  >
                    <Td className="font-mono text-xs">{v.cwe}</Td>
                    <Td className="text-xs">{v.name}</Td>
                    <Td>
                      <Badge variant={v.severity === "critical" ? "error" : v.severity === "high" ? "warning" : v.severity === "medium" ? "info" : "default"}>
                        {v.severity}
                      </Badge>
                    </Td>
                    <Td className="text-xs font-mono">{v.cvss}</Td>
                    <Td className="font-mono text-[10px]">{v.file}:{v.line}</Td>
                    <Td>
                      <Badge variant={v.status === "open" ? "error" : "success"}>{v.status}</Badge>
                    </Td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-blue-400" />
              CVSS Radar
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={cvssRadar}>
                  <PolarGrid stroke="#334155" />
                  <PolarAngleAxis dataKey="axis" tick={{ fill: "#64748b", fontSize: 9 }} />
                  <PolarRadiusAxis angle={90} domain={[0, 10]} tick={{ fill: "#475569", fontSize: 8 }} />
                  <Radar name="CVSS" dataKey="value" stroke="#2563eb" fill="#2563eb" fillOpacity={0.3} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Lock className="h-4 w-4 text-blue-400" />
              Remediation Panel — {selectedVuln.cwe}
            </CardTitle>
            <Badge variant={selectedVuln.severity === "critical" ? "error" : selectedVuln.severity === "high" ? "warning" : "info"}>
              {selectedVuln.severity}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="rounded-lg border border-slate-800 p-3">
              <p className="text-xs font-semibold text-slate-400">Trained Model</p>
              <p className="mt-1 text-sm text-white">Precision: {selectedVuln.precision}</p>
              <p className="text-xs text-slate-500">Recall: {selectedVuln.recall}</p>
            </div>
            <div className="rounded-lg border border-slate-800 p-3">
              <p className="text-xs font-semibold text-slate-400">LLM</p>
              <p className="mt-1 text-sm text-white">Precision: {(selectedVuln.precision - 0.05).toFixed(2)}</p>
              <p className="text-xs text-slate-500">Recall: {(selectedVuln.recall - 0.03).toFixed(2)}</p>
            </div>
            <div className="rounded-lg border border-blue-500/30 bg-blue-500/5 p-3">
              <p className="text-xs font-semibold text-blue-300">Combined</p>
              <p className="mt-1 text-sm text-white">Precision: {(selectedVuln.precision + 0.03).toFixed(2)}</p>
              <p className="text-xs text-slate-500">Recall: {(selectedVuln.recall + 0.02).toFixed(2)}</p>
            </div>
          </div>

          <div className="rounded-lg border border-blue-500/30 bg-blue-500/5 p-3">
            <p className="mb-1 text-xs font-semibold text-blue-300">🤖 AI-Generated Fix</p>
            <p className="text-xs text-slate-300">
              Add parameterized query to prevent SQL injection. Use prepared statements with JPA repository
              methods instead of native string concatenation.
            </p>
            <CodeBlock
              code={`// Before (vulnerable)
@Query("SELECT * FROM users WHERE email = '" + email + "'")
List<User> findByEmail(String email);

// After (fixed)
@Query("SELECT * FROM users WHERE email = :email")
List<User> findByEmail(@Param("email") String email);`}
              language="java"
              className="mt-2 text-[10px]"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <Button variant="c3" size="sm">
              <Sparkles className="h-3 w-3" /> Apply Fix
            </Button>
            <Button variant="outline" size="sm">
              <RotateCcw className="h-3 w-3" /> Rollback
            </Button>
            <div className="ml-auto flex gap-2">
              <Badge variant="default">Cost: Low</Badge>
              <Badge variant="default">Latency: 120ms</Badge>
              <Badge variant="success">Privacy: Local</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function GovernanceAudit() {
  const gates = [
    { name: "QA Proposes", status: "complete", icon: Eye },
    { name: "Dev Approves", status: "active", icon: CheckCheck },
    { name: "C2 Implements", status: "pending", icon: Wrench },
    { name: "C3 Re-verifies", status: "pending", icon: ShieldCheck },
  ];

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-blue-400" />
            Approval Gates
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="-mx-2 overflow-x-auto px-2 pb-1">
            <div className="flex min-w-[640px] items-center gap-2">
            {gates.map((gate, i) => {
              const Icon = gate.icon;
              return (
                <div key={gate.name} className="flex flex-1 items-center gap-2">
                  <div
                    className={cn(
                      "flex flex-1 items-center gap-2 rounded-lg border p-3",
                      gate.status === "complete" && "border-emerald-500/30 bg-emerald-500/5",
                      gate.status === "active" && "border-blue-500/30 bg-blue-500/5",
                      gate.status === "pending" && "border-slate-800 bg-slate-900/50"
                    )}
                  >
                    <Icon
                      className="h-5 w-5"
                      style={{ color: gate.status === "complete" ? "#10b981" : gate.status === "active" ? "#2563eb" : "#475569" }}
                    />
                    <div>
                      <p className="text-xs font-medium text-white">{gate.name}</p>
                      <p className="text-[10px] capitalize text-slate-500">{gate.status}</p>
                    </div>
                  </div>
                  {i < gates.length - 1 && (
                    <div className={cn("h-px w-4", gate.status === "complete" ? "bg-emerald-500/40" : "bg-slate-700")} />
                  )}
                </div>
              );
            })}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <ScrollText className="h-4 w-4 text-blue-400" />
              Audit Log
            </CardTitle>
            <Button size="sm" variant="outline">
              <History className="h-3 w-3" /> Export
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <thead>
              <tr>
                <Th>Timestamp</Th>
                <Th>Actor</Th>
                <Th>Action</Th>
                <Th>Target</Th>
                <Th>Details</Th>
              </tr>
            </thead>
            <tbody>
              {auditLog.map((log) => (
                <tr key={log.id}>
                  <Td className="font-mono text-[10px] text-slate-500">{log.timestamp}</Td>
                  <Td className="text-xs">{log.actor}</Td>
                  <Td>
                    <Badge variant="default">{log.action}</Badge>
                  </Td>
                  <Td className="font-mono text-[10px]">{log.target}</Td>
                  <Td className="text-xs text-slate-400">{log.details}</Td>
                </tr>
              ))}
            </tbody>
          </Table>
        </CardContent>
      </Card>

      <Card className="border-red-500/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <RotateCcw className="h-4 w-4 text-red-400" />
            Rollback Controls
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-between">
          <div>
            <p className="text-sm text-white">Rollback to last verified state</p>
            <p className="text-xs text-slate-400">Last verified: Sprint 23, Build #1847 · All tests passing</p>
          </div>
          <Button variant="error" size="sm">
            <RotateCcw className="h-3 w-3" /> Rollback
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

export function TestingSecurity() {
  const { projectId } = useParams();
  const { theme, projects, activeProjectId } = useStore();
  const isDark = theme === "dark";
  const [activeTab, setActiveTab] = useState("dashboard");

  const project = useMemo(
    () => projects.find((p) => p.id === (activeProjectId ?? projectId)),
    [projects, activeProjectId, projectId]
  );

  const progressId = project ? getTestingProgressId(project.status) : activeTab;

  return (
    <div className="w-full space-y-5 p-4 sm:p-6 md:p-8">
      <PhaseSectionHeader
        title="Testing & Security"
        subtitle={
          project && ["deploy", "complete"].includes(project.status)
            ? "All testing and security stages complete — browse any step below"
            : "Automated tests, self-healing repairs, vulnerability scanning, and governance"
        }
        progress={project ? getPhaseProgress(project, "testing") : 0}
        isDark={isDark}
      />

      <ChevronStepper
        steps={testingPhaseSteps}
        progressId={progressId}
        selectedId={activeTab}
        isDark={isDark}
        onStepClick={setActiveTab}
      />

      {activeTab === "dashboard" && <TestTabPanel />}
      {activeTab === "healing" && <SelfHealingRepair />}
      {activeTab === "security" && <SecurityScanning />}
      {activeTab === "governance" && <GovernanceAudit />}
    </div>
  );
}
