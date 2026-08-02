import fs from "node:fs";
import { execSync } from "node:child_process";

const restored = "src/_ProjectWorkspace.restore.tsx";
fs.writeFileSync(restored, execSync("git show HEAD:src/pages/ProjectWorkspace.tsx", { encoding: "utf8" }));

let full = fs.readFileSync(restored, "utf8");
const reps = [
  [/@\/utils\/cn/g, "@/shared/utils/cn"],
  [/@\/components\/ui\/primitives/g, "@/shared/ui/primitives"],
  [/@\/components\/ui\/ChevronStepper/g, "@/shared/ui/ChevronStepper"],
  [/@\/components\/sag\//g, "@/features/requirements/components/"],
  [/@\/components\/wireframes\//g, "@/features/requirements/components/"],
  [/@\/components\/uml\//g, "@/features/requirements/components/"],
  [/@\/components\/project\/PhaseSectionHeader/g, "@/shared/ui/PhaseSectionHeader"],
  [/@\/pages\/CodeGeneration/g, "@/features/code-generation/page"],
  [/@\/pages\/TestingSecurity/g, "@/features/testing/page"],
  [/@\/pages\/DeploymentDependency/g, "@/features/deployment/page"],
  [/@\/pages\/ActivityLog/g, "@/features/activity/page"],
];
for (const [re, to] of reps) full = full.replace(re, to);

// Replace mockData import with designData named imports used by requirements UI
full = full.replace(
  /import\s*\{[^}]+\}\s*from\s*["']@\/data\/mockData["'];?/,
  'import { extractedEntities, architecturePatterns, sagNodes, sagEdges, backlog, sprintData } from "@/features/requirements/fixtures/designData";',
);

const phaseStart = full.indexOf("const phaseMeta");
const statusStart = full.indexOf("\nfunction statusBadge");
const inputStart = full.indexOf("\nfunction RequirementsInput");
const wsStart = full.indexOf("\nexport function ProjectWorkspace");
if ([phaseStart, statusStart, inputStart, wsStart].some((i) => i < 0)) {
  throw new Error(`markers missing ${JSON.stringify({ phaseStart, statusStart, inputStart, wsStart })}`);
}

const phaseMeta = full.slice(phaseStart, statusStart);
const reqBody = full.slice(inputStart, wsStart);

const reqImports = `import { useEffect, useRef, useState } from "react";
import { Navigate } from "react-router-dom";
import {
  ArrowUp,
  Bot,
  FileText,
  Loader2,
  Mic,
  Paperclip,
  Plus,
  Sparkles,
  Upload,
  Network,
} from "lucide-react";
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  type Node,
  type Edge,
} from "reactflow";
import "reactflow/dist/style.css";
import { sagNodeTypes, sagNodeColors } from "@/features/requirements/components/SAGNode";
import { useStore, type Project, type ReqPhase } from "@/store/useStore";
import { extractedEntities, architecturePatterns, sagNodes, sagEdges, backlog, sprintData } from "@/features/requirements/fixtures/designData";
import { cn } from "@/shared/utils/cn";
import {
  Badge,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/ui/primitives";
import { ChevronStepper } from "@/shared/ui/ChevronStepper";
import { WireframesPanel } from "@/features/requirements/components/WireframesPanel";
import { UMLPanel } from "@/features/requirements/components/UMLPanel";
import { PhaseSectionHeader, getPhaseProgress } from "@/shared/ui/PhaseSectionHeader";
import { useProject } from "@/app/layout/ProjectShell";
`;

fs.writeFileSync(
  "src/features/requirements/page.tsx",
  `${reqImports}\n${phaseMeta}${reqBody}\nexport function Page() {\n  return <RequirementsPage />;\n}\nexport { RequirementsPage };\n`,
);

// Also refresh ProjectShell from original
const helpersStart = full.indexOf("function statusBadge");
const shellEnd = inputStart;
const shellImports = `import type { ReactNode } from "react";
import { Link, Navigate, useParams, useLocation } from "react-router-dom";
import {
  Code2,
  FileText,
  FlaskConical,
  GitBranch,
  Rocket,
} from "lucide-react";
import { useStore, type Project } from "@/store/useStore";
import { cn } from "@/shared/utils/cn";
import { Badge } from "@/shared/ui/primitives";
`;
const shellBody = full.slice(helpersStart, shellEnd).replace(/React\.ReactNode/g, "ReactNode");
fs.writeFileSync("src/app/layout/ProjectShell.tsx", `${shellImports}\n${shellBody}\nexport { ProjectShell, useProject };\n`);

fs.unlinkSync(restored);
console.log("fixed requirements + ProjectShell");
