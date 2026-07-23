# SDLC AI — Intelligent Software Development Lifecycle Platform

A comprehensive React-based web application providing an AI-assisted end-to-end SDLC automation pipeline with 4 integrated components and continuous AI-powered traceability.

## Quick Start

```bash
npm install
npm run dev      # Start development server
npm run build    # Build for production
npm run preview  # Preview production build
```

## Architecture Overview

### Tech Stack
- **Framework:** React 19 + TypeScript
- **Styling:** Tailwind CSS v4 + custom component library
- **State Management:** Zustand
- **Routing:** React Router v7
- **Data Visualization:** Recharts
- **Graph Visualization:** React Flow (SAG builder)
- **Build Tool:** Vite + vite-plugin-singlefile

### Project Structure
```
src/
├── components/
│   ├── layout/        # Sidebar, TopBar, TraceabilityRibbon, CommandPalette, Toasts
│   └── ui/            # Reusable primitives (Card, Badge, Button, Tabs, etc.)
├── data/
│   └── mockData.ts    # Comprehensive mock data simulating all AI backend responses
├── pages/
│   ├── Dashboard.tsx          # Unified command center
│   ├── RequirementsDesign.tsx # Component 1 (Green)
│   ├── CodeGeneration.tsx     # Component 2 (Blue)
│   ├── TestingSecurity.tsx    # Component 3 (Purple)
│   ├── DeploymentDependency.tsx # Component 4 (Orange)
│   └── Traceability.tsx       # Full SDLC artifact graph
├── store/
│   └── useStore.ts    # Zustand global state
└── App.tsx            # Router + layout shell
```

## Components

### Dashboard
Unified command center with sprint overview, burndown charts, active pipeline status, recent alerts, AI insights panel, and component health rings.

### Component 1: Requirements & Design (Green)
- **Requirements Ingestion:** Drag-and-drop upload with NLP parsing progress and extracted entities
- **SAG Builder:** Interactive React Flow graph with 20+ nodes, property inspector, and validation
- **Design Intelligence:** Architecture pattern recommender with confidence scores
- **UML Gallery:** Mermaid.js diagrams (Class, ER, Activity, Sequence, Object)
- **Wireframe Studio:** Drag-and-drop builder with fidelity toggle
- **Sprint Planning:** Backlog table, Fibonacci story points, Kanban board

### Component 2: Code Generation (Blue)
- **Sprint Scope:** Backlog reader with wireframe/SAG input panel
- **Contract Designer:** OpenAPI-style editor with rule-based vs LLM validation
- **Frontend Studio:** React/Angular toggle with live preview
- **Backend Studio:** Spring Boot/Node.js with DB mapping
- **Build Validation:** Real-time build status and integration test results

### Component 3: Testing & Security (Purple)
- **Test Dashboard:** Coverage heatmap, trend charts, mutation testing
- **Self-Healing Repair:** Brittle test detection with Honesty Guard validation
- **Security Scanning:** CWE classification, CVSS radar, AI remediation
- **Governance:** Approval gates, audit logs, rollback controls

### Component 4: Deployment & Dependency (Orange)
- **Repository Manager:** GitHub integration with dependency tree
- **Breaking Change Prediction:** Risk scoring with rule + LLM fusion
- **Deployment Pipeline:** CI/CD visualizer with Docker/K8s manifests
- **Deployment Monitor:** Production health metrics and release notes

### Traceability View
Full-screen interactive SDLC graph showing artifact relationships, change impact propagation, and AI feedback loops.

## Design System
- **Primary:** Deep blue (#1e3a5f)
- **Accents:** C1 Green (#22c55e), C2 Blue (#3b82f6), C3 Purple (#8b5cf6), C4 Orange (#f97316)
- **Typography:** Inter (UI), JetBrains Mono (code)
- **Theme:** Dark mode (slate-950 base)

## Keyboard Shortcuts
- `Ctrl/Cmd + K` — Open command palette
- `Esc` — Close modals/panels

## Mock Data
The platform includes comprehensive mock data simulating:
- 4 sample projects with full SDLC artifact chains
- 21-node SAG graph for visualization
- Test results with passing/failing states and mutation testing
- 5 dependency updates with varied risk levels
- Approval workflow states and audit logs
