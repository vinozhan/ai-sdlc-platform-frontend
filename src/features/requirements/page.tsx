import { useEffect } from "react";
import { Navigate, useParams } from "react-router-dom";
import { useSessionStore } from "@/store/session";
import { useProject } from "@/entities/project";
import { useRequirementsPipeline } from "./hooks";
import { RequirementsInput } from "./components/RequirementsInput";
import { RequirementsResults } from "./components/RequirementsResults";

export function RequirementsPage() {
  const { projectId = "" } = useParams();
  const project = useProject(projectId);
  const startRequirementsPipeline = useRequirementsPipeline((s) => s.startRequirementsPipeline);
  const setActiveProjectId = useSessionStore((s) => s.setActiveProjectId);

  useEffect(() => {
    if (project) setActiveProjectId(project.id);
  }, [project, setActiveProjectId]);

  if (!project) return <Navigate to="/projects" replace />;

  if (project.reqPhase === "input") {
    return (
      <RequirementsInput
        project={project}
        onSubmit={(text, files) => startRequirementsPipeline(projectId, text, files)}
      />
    );
  }

  return <RequirementsResults project={project} />;
}

export function Page() {
  return <RequirementsPage />;
}

export default RequirementsPage;
