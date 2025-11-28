export class InjectionToken<T> {
  constructor(public readonly description: string) {}

  toString() {
    return Symbol(this.description);
  }
}
