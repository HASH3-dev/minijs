/**
 * Types for LoadData decorator
 */

import { RenderState } from "../../types";
import { LifecyclePhase } from "../../base/ReactiveComponent";

/**
 * Configuration for @LoadData decorator
 */
export interface LoadDataConfig {
  label?: string;
  isEmpty?: (data: any) => boolean;
  autoLoad?: boolean;
  loadPhase?: LifecyclePhase;
}

export interface LoadFragmentConfig {
  states: RenderState[];
  label: string;
}
