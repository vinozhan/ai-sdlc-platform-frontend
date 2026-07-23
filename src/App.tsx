import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { CommandPalette, Toasts } from "@/components/layout/Overlays";
import { Home } from "@/pages/Home";
import { Projects } from "@/pages/Projects";
import { NewProject } from "@/pages/NewProject";
import { SettingsPage } from "@/pages/Settings";
import { ProjectWorkspace } from "@/pages/ProjectWorkspace";

export default function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/projects/new" element={<NewProject />} />
          <Route path="/projects/:projectId/*" element={<ProjectWorkspace />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
      <CommandPalette />
      <Toasts />
    </BrowserRouter>
  );
}
