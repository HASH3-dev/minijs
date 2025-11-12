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

export interface LoadFragmentConfig<T> {
  states: RenderState[];
  label: string;
  transformParams?: (params: any[], instance: T) => any[];
}
