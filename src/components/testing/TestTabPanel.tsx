import { useCallback, useState } from "react";
import {
  Activity,
  CheckCircle2,
  XCircle,
  Copy,
  Download,
  Play,
  Server,
  Monitor,
  FileCode2,
  LayoutGrid,
  Code2,
} from "lucide-react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle, Badge, Button, Progress, Table, Th, Td } from "@/components/ui/primitives";
import { VSCodeFileTree } from "@/components/code/VSCodeFileTree";
import { VSCodeEditor, type EditorTab } from "@/components/code/VSCodeEditor";
import {
  testScenarios,
  testSummaryCategories,
  testFileContents,
  getScenarioFiles,
  type TestScenario,
} from "@/data/testScenarios";
import { testResults } from "@/data/mockData";
import { useStore } from "@/store/useStore";
import { cn } from "@/utils/cn";

type SubTab = "overview" | "source";

function useEditorTabs(defaultPath: string) {
  const [tabs, setTabs] = useState<EditorTab[]>([{ path: defaultPath }]);
  const [activePath, setActivePath] = useState(defaultPath);

  const openFile = useCallback((path: string) => {
    setTabs((prev) => (prev.some((t) => t.path === path) ? prev : [...prev, { path }]));
    setActivePath(path);
  }, []);

  const closeTab = useCallback(
    (path: string) => {
      setTabs((prev) => {
        const next = prev.filter((t) => t.path !== path);
        if (next.length === 0) return prev;
        if (activePath === path) setActivePath(next[next.length - 1].path);
        return next;
      });
    },
    [activePath]
  );

  return { tabs, activePath, openFile, closeTab, setActivePath };
}

function SubTabToggle({ tab, onChange, isDark }: { tab: SubTab; onChange: (t: SubTab) => void; isDark: boolean }) {
  const items: { id: SubTab; label: string; icon: typeof LayoutGrid }[] = [
    { id: "overview", label: "Overview", icon: LayoutGrid },
    { id: "source", label: "Source Code", icon: Code2 },
  ];

  return (
    <div
      className={cn(
        "inline-flex rounded-lg border p-0.5",
        isDark ? "border-white/10 bg-white/[0.04]" : "border-slate-200 bg-slate-100/80"
      )}
    >
      {items.map(({ id, label, icon: Icon }) => (
        <button
          key={id}
          type="button"
          onClick={() => onChange(id)}
          className={cn(
            "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
            tab === id
              ? isDark
                ? "bg-white/10 text-white shadow-sm"
                : "bg-white text-slate-900 shadow-sm"
              : isDark
                ? "text-slate-400 hover:text-slate-200"
                : "text-slate-500 hover:text-slate-700"
          )}
        >
          <Icon className="h-3.5 w-3.5" />
          {label}
        </button>
      ))}
    </div>
  );
}

function LayerExecutionCard({
  title,
  layer,
  exec,
  isDark,
  icon: Icon,
}: {
  title: string;
  layer: "frontend" | "backend";
  exec: TestScenario["frontend"];
  isDark: boolean;
  icon: typeof Monitor;
}) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-sm">
          <Icon className={cn("h-4 w-4", layer === "frontend" ? "text-blue-400" : "text-emerald-400")} />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between">
          <Badge variant={exec.status === "pass" ? "success" : exec.status === "fail" ? "error" : "warning"}>
            {exec.status === "pass" ? "Passed" : exec.status === "fail" ? "Failed" : "Running"}
          </Badge>
          <span className={cn("text-xs", isDark ? "text-slate-500" : "text-slate-400")}>{exec.duration}</span>
        </div>
        {exec.coverage > 0 && (
          <>
            <div className="flex justify-between text-xs">
              <span className={isDark ? "text-slate-500" : "text-slate-400"}>Coverage</span>
              <span className={cn("font-semibold", isDark ? "text-white" : "text-slate-900")}>{exec.coverage}%</span>
            </div>
            <Progress value={exec.coverage} color={layer === "frontend" ? "#3b82f6" : "#10b981"} />
          </>
        )}
        <div className="flex flex-wrap gap-1.5 text-xs">
          <Badge variant="success">{exec.passed} passed</Badge>
          {exec.failed > 0 && <Badge variant="error">{exec.failed} failed</Badge>}
          {exec.skipped > 0 && <Badge variant="default">{exec.skipped} skipped</Badge>}
        </div>
      </CardContent>
    </Card>
  );
}

function TestOverview({
  scenario,
  isDark,
  onSelectScenario,
}: {
  scenario: TestScenario;
  isDark: boolean;
  onSelectScenario: (id: string) => void;
}) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {testSummaryCategories.map((cat) => (
          <Card key={cat.name}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm">
                <span>{cat.icon}</span>
                {cat.name}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-end justify-between">
                <div>
                  <p className={cn("text-2xl font-bold", isDark ? "text-white" : "text-slate-900")}>{cat.data.passed}</p>
                  <p className={cn("text-xs", isDark ? "text-slate-500" : "text-slate-400")}>of {cat.data.total} passed</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold" style={{ color: cat.color }}>
                    {cat.data.coverage}%
                  </p>
                  <p className={cn("text-xs", isDark ? "text-slate-500" : "text-slate-400")}>coverage</p>
                </div>
              </div>
              <Progress value={(cat.data.passed / cat.data.total) * 100} color={cat.color} />
              <div className="flex flex-wrap gap-2 text-xs">
                <Badge variant="success">{cat.data.passed} passed</Badge>
                {cat.data.failed > 0 && <Badge variant="error">{cat.data.failed} failed</Badge>}
                {"skipped" in cat.data && cat.data.skipped > 0 && (
                  <Badge variant="default">{cat.data.skipped} skipped</Badge>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Test Scenarios</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {testScenarios.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => onSelectScenario(s.id)}
              className={cn(
                "flex w-full items-start justify-between gap-3 rounded-lg border p-3 text-left transition-colors",
                scenario.id === s.id
                  ? isDark
                    ? "border-blue-500/40 bg-blue-500/5"
                    : "border-blue-200 bg-blue-50"
                  : isDark
                    ? "border-white/10 hover:border-white/20"
                    : "border-slate-200 hover:border-slate-300"
              )}
            >
              <div>
                <p className={cn("text-sm font-medium", isDark ? "text-white" : "text-slate-900")}>{s.name}</p>
                <p className={cn("mt-0.5 text-xs", isDark ? "text-slate-500" : "text-slate-400")}>{s.description}</p>
              </div>
              <div className="flex shrink-0 flex-col items-end gap-1">
                <Badge variant={s.status === "pass" ? "success" : s.status === "fail" ? "error" : "warning"}>
                  {s.status}
                </Badge>
                <Badge variant="default">{s.category}</Badge>
              </div>
            </button>
          ))}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <LayerExecutionCard title="Frontend Execution" layer="frontend" exec={scenario.frontend} isDark={isDark} icon={Monitor} />
        <LayerExecutionCard title="Backend Execution" layer="backend" exec={scenario.backend} isDark={isDark} icon={Server} />
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm">Test Case Results - {scenario.name}</CardTitle>
            <Button size="sm" variant="outline">
              <Play className="h-3 w-3" /> Run scenario
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <thead>
              <tr>
                <Th>Test case</Th>
                <Th>Layer</Th>
                <Th>Duration</Th>
                <Th>Status</Th>
              </tr>
            </thead>
            <tbody>
              {scenario.testCases.map((tc) => (
                <tr key={tc.id}>
                  <Td className="font-mono text-xs">{tc.name}</Td>
                  <Td>
                    <Badge variant={tc.layer === "frontend" ? "c2" : "c1"}>{tc.layer}</Badge>
                  </Td>
                  <Td className="text-xs text-slate-400">{tc.duration}</Td>
                  <Td>
                    {tc.status === "pass" ? (
                      <span className="flex items-center gap-1 text-xs text-emerald-500">
                        <CheckCircle2 className="h-3.5 w-3.5" /> Pass
                      </span>
                    ) : tc.status === "fail" ? (
                      <span className="flex items-center gap-1 text-xs text-red-400">
                        <XCircle className="h-3.5 w-3.5" /> Fail
                      </span>
                    ) : (
                      <Badge variant="default">Skip</Badge>
                    )}
                  </Td>
                </tr>
              ))}
            </tbody>
          </Table>
          {scenario.testCases.some((t) => t.error) && (
            <div className={cn("border-t px-4 py-3", isDark ? "border-white/10 bg-red-500/5" : "border-slate-100 bg-red-50")}>
              {scenario.testCases
                .filter((t) => t.error)
                .map((t) => (
                  <p key={t.id} className="text-xs text-red-400">
                    <strong>{t.name}:</strong> {t.error}
                  </p>
                ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm">
            <Activity className="h-4 w-4 text-blue-400" />
            Coverage Trend
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={testResults.coverageTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke={isDark ? "#1e293b" : "#e2e8f0"} />
                <XAxis dataKey="day" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} domain={[70, 100]} />
                <Tooltip contentStyle={{ background: isDark ? "#0f172a" : "#fff", border: "1px solid #334155", borderRadius: 8 }} />
                <Line type="monotone" dataKey="coverage" stroke="#2563eb" strokeWidth={2} dot={{ fill: "#2563eb", r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function TestSourceCode({ scenario, isDark }: { scenario: TestScenario; isDark: boolean }) {
  const { addToast } = useStore();
  const files = getScenarioFiles(scenario);
  const defaultPath = files[0]?.path ?? "src/__tests__/PaymentForm.test.tsx";
  const { tabs, activePath, openFile, closeTab, setActivePath } = useEditorTabs(defaultPath);
  const code = testFileContents[activePath] ?? "";

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    addToast({ type: "success", title: "Copied", message: activePath.split("/").pop() ?? "File copied" });
  };

  const handleDownload = () => {
    const blob = new Blob([code], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = activePath.split("/").pop() ?? "source.txt";
    link.click();
    URL.revokeObjectURL(url);
    addToast({ type: "success", title: "Downloaded", message: link.download });
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className={cn("text-sm", isDark ? "text-slate-400" : "text-slate-500")}>
          Source for <strong className={isDark ? "text-slate-200" : "text-slate-700"}>{scenario.name}</strong> - frontend & backend test scripts
        </p>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={handleCopy}>
            <Copy className="h-3.5 w-3.5" /> Copy
          </Button>
          <Button size="sm" variant="outline" onClick={handleDownload}>
            <Download className="h-3.5 w-3.5" /> Download
          </Button>
        </div>
      </div>

      <div className="grid min-h-[360px] grid-cols-1 gap-4 lg:h-[560px] lg:grid-cols-3">
        <VSCodeFileTree
          title="Test Files"
          files={files}
          selectedPath={activePath}
          onSelect={openFile}
          className="min-h-[200px] lg:min-h-0"
        />

        <div className="min-h-[280px] lg:col-span-2 lg:min-h-0">
          <VSCodeEditor
            tabs={tabs}
            activePath={activePath}
            contents={testFileContents}
            onSelectTab={setActivePath}
            onCloseTab={closeTab}
          />
        </div>
      </div>

      <div className={cn("flex flex-wrap gap-3 rounded-lg border px-4 py-2 text-xs", isDark ? "border-white/10 text-slate-500" : "border-slate-200 text-slate-500")}>
        <span className="flex items-center gap-1"><FileCode2 className="h-3.5 w-3.5" /> Unit test scripts</span>
        <span className="flex items-center gap-1"><FileCode2 className="h-3.5 w-3.5" /> Integration test scripts</span>
        <span className="flex items-center gap-1"><FileCode2 className="h-3.5 w-3.5" /> API contract tests</span>
        <span className={isDark ? "text-slate-600" : "text-slate-300"}>|</span>
        <span>Full source - no truncation</span>
      </div>
    </div>
  );
}

export function TestTabPanel() {
  const { theme } = useStore();
  const isDark = theme === "dark";
  const [subTab, setSubTab] = useState<SubTab>("overview");
  const [scenarioId, setScenarioId] = useState(testScenarios[0].id);

  const scenario = testScenarios.find((s) => s.id === scenarioId) ?? testScenarios[0];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <SubTabToggle tab={subTab} onChange={setSubTab} isDark={isDark} />
        <Badge variant="default">{scenario.name}</Badge>
      </div>

      {subTab === "overview" ? (
        <TestOverview scenario={scenario} isDark={isDark} onSelectScenario={setScenarioId} />
      ) : (
        <TestSourceCode key={scenario.id} scenario={scenario} isDark={isDark} />
      )}
    </div>
  );
}
