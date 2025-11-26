import { Resource } from "../types";

// Import all resource modules
import { coreConceptsResources } from "./core-concepts";
import { signalsResources } from "./signals";
import { decoratorsResources } from "./decorators";
import { projectStructureResources } from "./project-structure";
import { componentsResources } from "./components";
import { diResources } from "./dependency-injection";
import { routingResources } from "./routing";
import { bestPracticesResources } from "./best-practices";

// Combine all resources
export const resources: Resource[] = [
  ...coreConceptsResources,
  ...signalsResources,
  ...decoratorsResources,
  ...projectStructureResources,
  ...componentsResources,
  ...diResources,
  ...routingResources,
  ...bestPracticesResources,
];
