import { VSCodeFileTree } from "@/shared/code-viewer/VSCodeFileTree";
import { VSCodeEditor } from "@/shared/code-viewer/VSCodeEditor";
import { frontendCode, frontendFileContents } from "../fixtures/codeData";
import { useEditorTabs } from "../hooks";

export function FrontendStudio() {
  const defaultPath = frontendCode.files[0].path;
  const { tabs, activePath, openFile, closeTab, setActivePath } = useEditorTabs(defaultPath);

  return (
    <div className="grid h-auto grid-cols-1 gap-4 md:h-[560px] md:grid-cols-3">
      <VSCodeFileTree
        title="Explorer"
        files={frontendCode.files}
        selectedPath={activePath}
        onSelect={openFile}
      />

      <div className="min-h-[320px] md:col-span-2 md:min-h-0">
        <VSCodeEditor
          tabs={tabs}
          activePath={activePath}
          contents={frontendFileContents}
          onSelectTab={setActivePath}
          onCloseTab={closeTab}
        />
      </div>
    </div>
  );
}
