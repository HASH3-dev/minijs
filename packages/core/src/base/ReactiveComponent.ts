import { BehaviorSubject, Observable, Subject } from "rxjs";

/**
 * Unified lifecycle phases
 * Combines both state and events into a single stream
 */
export enum LifecyclePhase {
  /** Component instantiated */
  Created = "created",
  /** Before render() is called (for Guards, Resolvers) */
  BeforeMount = "beforeMount",
  /** Component mounted to DOM */
  Mounted = "mounted",
  /** After mount (for @Mount, @Watch decorators) */
  AfterMount = "afterMount",
  /** Before component destruction (for cleanup) */
  BeforeDestroy = "beforeDestroy",
  /** Component destroyed */
  Destroyed = "destroyed",
}

/**
 * Base class providing reactive lifecycle management
 * Emits lifecycle phases that plugins can subscribe to
 */
export abstract class ReactiveComponent {
  private _lifecycle$ = new BehaviorSubject<LifecyclePhase>(
    LifecyclePhase.Created
  );
  private _error$ = new Subject<Error>();

  /**
   * Observable of lifecycle phases
   * Emits when component transitions through phases
   * Plugins subscribe to this to execute at specific moments
   */
  get lifecycle$(): Observable<LifecyclePhase> {
    return this._lifecycle$.asObservable();
  }

  /**
   * Observable of component errors
   */
  get error$(): Observable<Error> {
    return this._error$.asObservable();
  }

  /**
   * Get current lifecycle phase
   */
  get lifecyclePhase(): LifecyclePhase {
    return this._lifecycle$.value;
  }

  /**
   * Emit a lifecycle phase
   * @internal - Called by Component at key moments
   */
  protected _emitPhase(phase: LifecyclePhase): void {
    this._lifecycle$.next(phase);
  }

  /**
   * Emit an error
   * @internal
   */
  protected _emitError(error: Error): void {
    this._error$.next(error);
  }
}
