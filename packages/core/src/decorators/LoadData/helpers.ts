import { Component } from "../../base/Component";
import { RENDER_STATE } from "../../constants";
import { RenderState } from "../../types";

/**
 * Helper to get current LoadData state
 * @param component Component instance
 * @returns Current state
 */
export function getLoadDataState(component: Component): RenderState {
  return component[RENDER_STATE]?.state || RenderState.IDLE;
}
