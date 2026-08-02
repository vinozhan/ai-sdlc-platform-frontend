import { useState } from "react";
import { FileJson, CheckCircle2, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, Badge, Progress, CodeBlock } from "@/shared/ui/primitives";
import { cn } from "@/shared/utils/cn";
import { apiContracts } from "../fixtures/codeData";

export function ContractDesigner() {
  const [selectedContract, setSelectedContract] = useState(apiContracts[0]);
  const [validationMode, setValidationMode] = useState<"rule" | "llm">("rule");

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
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

      <Card className="lg:col-span-2">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Contract Editor - {selectedContract.path}</CardTitle>
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
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
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
