import type { StageId } from "./types";

const deploymentSteps = [
  { id: "connect", label: "Connect" },
  { id: "dependencies", label: "Dependencies" },
  { id: "release", label: "Release" },
  { id: "verify", label: "Verify & approve" },
  { id: "live", label: "Live" },
];

export const stageIndex: Record<StageId, number> = {
  connect: 1,
  dependencies: 2,
  release: 3,
  verify: 4,
  live: 5,
};

export { deploymentSteps };
