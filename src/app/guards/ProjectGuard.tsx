import type { ReactNode } from "react";
import { Navigate, useParams } from "react-router-dom";
import { useProject } from "@/entities/project";

export function ProjectGuard({ children }: { children: ReactNode }) {
  const { projectId } = useParams();
  const project = useProject(projectId);
  if (!project) {
    return <Navigate to="/projects" replace />;
  }
  return <>{children}</>;
}
