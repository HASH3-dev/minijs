/**
 * Configuration for a watch decorator
 */
export interface WatchConfig {
  /** Name of the property to watch */
  propertyName: string;
  /** Method to execute when the property changes */
  method: Function;
}
