import { Injectable, PersistentSate, signal, UseURLStorage } from "@mini/core";

@Injectable()
export class CounterService {
  @PersistentSate(new UseURLStorage())
  count = signal(0);

  increment() {
    this.count.set((c) => c + 1);
  }

  decrement() {
    this.count.set((c) => c - 1);
  }
}
