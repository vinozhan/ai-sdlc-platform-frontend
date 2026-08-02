import { Database } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/primitives";
import { VSCodeFileTree } from "@/shared/code-viewer/VSCodeFileTree";
import { VSCodeEditor } from "@/shared/code-viewer/VSCodeEditor";
import { backendCode, backendFileContents } from "../fixtures/codeData";
import { useEditorTabs } from "../hooks";

const mappings = [
  { entity: "Payment", table: "payments", fields: 18 },
  { entity: "User", table: "users", fields: 12 },
  { entity: "KYC Record", table: "kyc_records", fields: 9 },
  { entity: "Transaction", table: "transactions", fields: 18 },
];

export function BackendStudio() {
  const defaultPath = backendCode.files[0].path;
  const { tabs, activePath, openFile, closeTab, setActivePath } = useEditorTabs(defaultPath);

  return (
    <div className="space-y-4">
      <div className="grid h-auto grid-cols-1 gap-4 md:h-[560px] md:grid-cols-3">
        <VSCodeFileTree
          title="Backend Files"
          files={backendCode.files}
          selectedPath={activePath}
          onSelect={openFile}
        />

        <div className="min-h-[320px] md:col-span-2 md:min-h-0">
          <VSCodeEditor
            tabs={tabs}
            activePath={activePath}
            contents={backendFileContents}
            onSelectTab={setActivePath}
            onCloseTab={closeTab}
          />
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-4 w-4 text-blue-400" />
            DB Mapping
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {mappings.map((m) => (
              <div key={m.entity} className="rounded-lg border border-slate-800 p-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-slate-200">{m.entity}</span>
                  <Database className="h-3 w-3 text-blue-400" />
                </div>
                <p className="mt-1 font-mono text-[10px] text-slate-500">
                  {m.table} · {m.fields} fields
                </p>
              </div>
            ))}
          </div>
          <div className="mt-3 rounded-lg border border-blue-500/30 bg-blue-500/5 p-3">
            <p className="text-xs font-semibold text-blue-300">API Endpoints</p>
            <p className="mt-1 text-xs text-slate-300">4 endpoints generated · 3 validated</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
