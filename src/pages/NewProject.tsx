import { useNavigate } from "react-router-dom";
import { useStore } from "@/store/useStore";
import { ProjectCreatePrompt } from "@/components/project/ProjectCreatePrompt";

export function NewProject() {
  const navigate = useNavigate();
  const { theme, settings, createProject, startRequirementsPipeline, addToast } = useStore();
  const isDark = theme === "dark";
  const firstName = settings.profile.name.split(" ")[0] || "there";

  const handleCreate = (text: string) => {
    const name = text.length > 48 ? `${text.slice(0, 48)}…` : text;
    const project = createProject(name, text);
    startRequirementsPipeline(project.id, text);
    addToast({ type: "success", title: "Project created", message: name });
    navigate(`/projects/${project.id}/requirements`);
  };

  return (
    <div className="relative flex min-h-full w-full flex-col justify-center px-6 pb-12 pt-10 md:px-8 md:pt-14">
      <ProjectCreatePrompt firstName={firstName} isDark={isDark} onSubmit={handleCreate} autoFocus />
    </div>
  );
}
