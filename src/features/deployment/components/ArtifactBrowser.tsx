import { FileCode2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/primitives";
import { VSCodeEditor, type EditorTab } from "@/shared/code-viewer/VSCodeEditor";
import { VSCodeFileTree } from "@/shared/code-viewer/VSCodeFileTree";
import { releaseContents, releaseFiles } from "../fixtures/releaseArtifacts";

type ArtifactBrowserProps = {
  tabs: EditorTab[];
  activePath: string;
  onSelectFile: (path: string) => void;
  onSelectTab: (path: string) => void;
  onCloseTab: (path: string) => void;
};

export function ArtifactBrowser({
  tabs,
  activePath,
  onSelectFile,
  onSelectTab,
  onCloseTab,
}: ArtifactBrowserProps) {
  return (
    <Card className="lg:col-span-2">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileCode2 className="h-4 w-4 text-orange-400" />
          Release configuration
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid h-auto grid-cols-1 gap-3 md:h-[440px] md:grid-cols-3">
          <VSCodeFileTree
            title="Explorer"
            files={releaseFiles.map((f) => ({ path: f.path, type: f.type }))}
            selectedPath={activePath}
            onSelect={onSelectFile}
          />
          <div className="min-h-[260px] md:col-span-2">
            <VSCodeEditor
              tabs={tabs}
              activePath={activePath}
              contents={releaseContents}
              onSelectTab={onSelectTab}
              onCloseTab={onCloseTab}
              copyable
              showLanguage
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
