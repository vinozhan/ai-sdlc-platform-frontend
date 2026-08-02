import { lazy, Suspense, type ReactNode } from "react";
import { Navigate, Route, Routes, useParams } from "react-router-dom";
import { AppShell } from "@/app/layout/AppShell";
import { ProjectShell } from "@/app/layout/ProjectShell";
import { CommandPalette, Toasts } from "@/app/layout/Overlays";
import { AuthGuard } from "@/app/guards/AuthGuard";
import { ProjectGuard } from "@/app/guards/ProjectGuard";
import { Landing } from "@/features/marketing";
import { Login } from "@/features/auth";
import { Home, Projects, NewProject } from "@/features/projects";

const SettingsPage = lazy(() => import("@/features/settings"));
const RequirementsPage = lazy(() => import("@/features/requirements"));
const CodeGeneration = lazy(() => import("@/features/code-generation"));
const TestingSecurity = lazy(() => import("@/features/testing"));
const DeploymentDependency = lazy(() => import("@/features/deployment"));
const ActivityLog = lazy(() => import("@/features/activity"));

function RouteFallback() {
  return (
    <div className="flex min-h-[40vh] items-center justify-center p-8">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
    </div>
  );
}

function Lazy({ children }: { children: ReactNode }) {
  return <Suspense fallback={<RouteFallback />}>{children}</Suspense>;
}

function ProjectPhaseRedirect() {
  const { projectId } = useParams();
  return <Navigate to={`/projects/${projectId}/requirements`} replace />;
}

function GuardedProject({ children }: { children: ReactNode }) {
  return (
    <ProjectGuard>
      <ProjectShell>
        <Lazy>{children}</Lazy>
      </ProjectShell>
    </ProjectGuard>
  );
}

function AuthenticatedApp() {
  return (
    <AuthGuard>
      <AppShell>
        <Routes>
          <Route path="/workspace" element={<Home />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/projects/new" element={<NewProject />} />
          <Route
            path="/projects/:projectId/requirements"
            element={
              <GuardedProject>
                <RequirementsPage />
              </GuardedProject>
            }
          />
          <Route
            path="/projects/:projectId/code"
            element={
              <GuardedProject>
                <div className="p-2">
                  <CodeGeneration />
                </div>
              </GuardedProject>
            }
          />
          <Route
            path="/projects/:projectId/testing"
            element={
              <GuardedProject>
                <div className="p-2">
                  <TestingSecurity />
                </div>
              </GuardedProject>
            }
          />
          <Route
            path="/projects/:projectId/deployment"
            element={
              <GuardedProject>
                <div className="p-2">
                  <DeploymentDependency />
                </div>
              </GuardedProject>
            }
          />
          <Route
            path="/projects/:projectId/traceability"
            element={
              <GuardedProject>
                <div className="p-2">
                  <ActivityLog />
                </div>
              </GuardedProject>
            }
          />
          <Route path="/projects/:projectId/*" element={<ProjectPhaseRedirect />} />
          <Route
            path="/settings"
            element={
              <Lazy>
                <SettingsPage />
              </Lazy>
            }
          />
          <Route path="*" element={<Navigate to="/workspace" replace />} />
        </Routes>
      </AppShell>
      <CommandPalette />
      <Toasts />
    </AuthGuard>
  );
}

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/*" element={<AuthenticatedApp />} />
    </Routes>
  );
}
