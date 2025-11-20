import { Observable } from "rxjs";

export type UnwrapObservable<T> = T extends Observable<infer U> ? U : T;
export type UnwrapIterable<T> = T extends Iterable<infer U> ? U : T;
