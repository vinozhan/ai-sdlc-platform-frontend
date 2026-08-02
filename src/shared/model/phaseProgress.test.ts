import { describe, expect, it } from "vitest";
import { getPhaseProgress } from "./phaseProgress";
import type { Project } from "@/types/project";

function project(partial: Partial<Project>): Project {
  return {
    id: "p1",
    name: "Test",
    description: "",
    status: "draft",
    createdAt: "",
    updatedAt: "",
    requirementText: "",
    requirementChat: [],
    files: [],
    reqPhase: "input",
    progress: 0,
    techStack: [],
    color: "#000",
    ...partial,
  };
}

describe("getPhaseProgress", () => {
  it("maps requirements phases to percent", () => {
    expect(getPhaseProgress(project({ reqPhase: "input" }), "requirements")).toBe(0);
    expect(getPhaseProgress(project({ reqPhase: "done" }), "requirements")).toBe(100);
  });

  it("maps code status", () => {
    expect(getPhaseProgress(project({ status: "code" }), "code")).toBe(72);
    expect(getPhaseProgress(project({ status: "testing" }), "code")).toBe(100);
  });

  it("maps deployment status", () => {
    expect(getPhaseProgress(project({ status: "deploy" }), "deployment")).toBe(40);
    expect(getPhaseProgress(project({ status: "complete" }), "deployment")).toBe(100);
  });
});
