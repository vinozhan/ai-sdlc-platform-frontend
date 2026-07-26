import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { CommandPalette, Toasts } from "@/components/layout/Overlays";
import { Landing } from "@/pages/Landing";
import { Login } from "@/pages/Login";
import { Home } from "@/pages/Home";
import { Projects } from "@/pages/Projects";
import { NewProject } from "@/pages/NewProject";
import { SettingsPage } from "@/pages/Settings";
import { ProjectWorkspace } from "@/pages/ProjectWorkspace";
import { useStore } from "@/store/useStore";

function AppShell() {
  const isAuthenticated = useStore((s) => s.isAuthenticated);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <>
      <Layout>
        <Routes>
          <Route path="/workspace" element={<Home />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/projects/new" element={<NewProject />} />
          <Route path="/projects/:projectId/*" element={<ProjectWorkspace />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Routes>
      </Layout>
      <CommandPalette />
      <Toasts />
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/*" element={<AppShell />} />
      </Routes>
    </BrowserRouter>
  );
}
