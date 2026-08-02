import { useNavigate } from "react-router-dom";
import { useUiStore } from "@/store/ui";
import { useProjectMutations } from "../hooks";
import { useSettings } from "@/entities/settings";
import { useRequirementsPipeline } from "@/entities/requirements";
import { ProjectCreatePrompt } from "../components/ProjectCreatePrompt";

export function NewProject() {
  const navigate = useNavigate();
  const theme = useUiStore((s) => s.theme);
  const addToast = useUiStore((s) => s.addToast);
  const settings = useSettings();
  const { createProjectSync } = useProjectMutations();
  const startRequirementsPipeline = useRequirementsPipeline((s) => s.startRequirementsPipeline);
  const isDark = theme === "dark";
  const firstName = settings.profile.name.split(" ")[0] || "there";

  const handleCreate = async (text: string) => {
    const name = text.length > 48 ? `${text.slice(0, 48)}…` : text;
    const project = await createProjectSync(name, text);
    startRequirementsPipeline(project.id, text);
    addToast({ type: "success", title: "Project created", message: name });
    navigate(`/projects/${project.id}/requirements`);
  };

  return (
    <div className="relative flex min-h-full w-full flex-col justify-center px-4 pb-12 pt-8 sm:px-6 md:px-8 md:pt-14">
      <ProjectCreatePrompt firstName={firstName} isDark={isDark} onSubmit={handleCreate} autoFocus />
    </div>
  );
}
