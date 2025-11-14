import { Observable, distinctUntilChanged, map, mergeMap, tap } from "rxjs";
import { Component } from "../../../base/Component";
import { PARENT_COMPONENT } from "../../../constants";
import { toObservable } from "../../../helpers";
import { signal } from "../../Signal";
import { Mount } from "../../Mount";
import { LOAD_DATA_STATE } from "../constants";

export class Loader extends Component<{ fragment: string }> {
  fragment = signal<string | null>(null);

  @Mount()
  setup() {
    return (
      (this[PARENT_COMPONENT] as any)?.[LOAD_DATA_STATE] as Observable<
        Record<string, any>
      >
    ).pipe(
      map((fragmentElement) => fragmentElement[this.props.fragment]),
      distinctUntilChanged(),
      tap((fragment) => {
        this.fragment.next(fragment);
      })
    );
  }

  render() {
    return this.fragment.pipe(mergeMap(toObservable));
  }
}
