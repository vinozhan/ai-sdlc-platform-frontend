import { SprintScope } from "./SprintScope";
import { TechStackTab } from "./TechStackTab";
import { ContractDesigner } from "./ContractDesigner";
import { FrontendStudio } from "./FrontendStudio";
import { BackendStudio } from "./BackendStudio";
import { BuildValidation } from "./BuildValidation";

export function CodeWorkspace({ activeTab }: { activeTab: string }) {
  switch (activeTab) {
    case "scope":
      return <SprintScope />;
    case "techstack":
      return <TechStackTab />;
    case "contract":
      return <ContractDesigner />;
    case "frontend":
      return <FrontendStudio />;
    case "backend":
      return <BackendStudio />;
    case "build":
      return <BuildValidation />;
    default:
      return null;
  }
}
