import { OperatorFunction } from "rxjs";

/**
 * Configuration for a watch decorator
 */
export interface WatchConfig {
  /** Name of the property to watch */
  propertyName: string;
  /** Method to execute when the property changes */
  method: Function;
  /** Array of RxJS pipes to apply to the observable */
  pipes?: OperatorFunction<any, any>[];
  /** Skip the first value emitted by the observable */
  skipInitialValue?: boolean;
}
