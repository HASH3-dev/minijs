/** A Counter component using @mini/jsx reactive islands */
import {
  Component,
  Guard,
  Inject,
  Injectable,
  Mount,
  signal,
  unwrap,
  UseGuards,
} from "@mini/core";
import { finalize, Observable, of, tap } from "rxjs";
import { randomBoolean } from "../utils/randomBoolean";
import { Todo } from "./Todo";
import { WatchExample } from "./WatchExample";

@Injectable()
class CanActivate implements Guard {
  @Inject(Symbol.for("name")) name!: string;

  canActivate() {
    // return false;
    return new Promise<boolean>((resolve) =>
      setTimeout(() => resolve(randomBoolean()), 1000)
    );
  }

  fallback() {
    return <div className="text-red-500">I'm so sorry {this.name}</div>;
  }
}

@Injectable()
class Guard2 implements Guard {
  @Inject(Symbol.for("name")) name!: string;

  constructor(public text: string) {}

  canActivate() {
    return of(randomBoolean());
    // return new Promise<boolean>((resolve) =>
    //   setTimeout(() => resolve(true), 1000)
    // );
  }

  fallback() {
    return (
      <div className="text-red-500">
        {this.text} {this.name}
      </div>
    );
  }
}

/**
 * This component returns JSX built with the @mini/jsx runtime.
 * The text node that shows the count uses {this.count}, which is automatically
 * detected as a Cell by the JSX handler, so it updates automatically when the value changes.
 */
@UseGuards([CanActivate, new Guard2("infelizmente não deu")])
export class CounterJSX extends Component<{ name: Observable<string> }> {
  count = signal(0);

  @Inject(Symbol.for("name")) name!: string;

  @Mount()
  onMount() {
    return this.count.pipe(
      tap(() => console.log("count")),
      finalize(() => console.log("unmount"))
    );
  }

  @Mount()
  onMount2() {
    console.log("mount 2");
    this.$.unmount$.subscribe(() => console.log("unmount"));
  }

  render() {
    const inc = () => this.count.next(unwrap(this.count) + 1);
    const dec = () => this.count.next(unwrap(this.count) - 1);

    return (
      <>
        <div>
          {this.count.map((e) =>
            e > 3 ? <span>It is more than 3</span> : null
          )}
        </div>
        <section className="bg-white rounded-2xl shadow-lg p-6 border border-slate-200">
          <h2 className="text-2xl font-semibold text-slate-800 mb-4">
            Counter (JSX Reactive)
          </h2>

          <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl p-6 mb-4 text-center">
            <p className="text-white text-sm font-medium mb-2">Current Value</p>
            <p className="text-white text-5xl font-bold">{this.count}</p>
          </div>

          <div className="flex gap-3 mb-4">
            <button
              className="flex-1 bg-red-500 hover:bg-red-600 text-white font-semibold py-3 px-6 rounded-lg transition shadow-md hover:shadow-lg active:scale-95"
              onClick={dec}
            >
              -1
            </button>
            <button
              className="flex-1 bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-6 rounded-lg transition shadow-md hover:shadow-lg active:scale-95"
              onClick={inc}
            >
              +1
            </button>
          </div>

          <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
            <p className="text-sm text-slate-600 mb-2">
              Este texto é reativo automaticamente - o JSX detecta que{" "}
              <code className="bg-slate-200 px-2 py-1 rounded text-xs font-mono text-slate-800">
                count
              </code>{" "}
              é um Cell.
            </p>
            <p className="text-sm font-medium text-slate-700">
              User: <span className="text-indigo-600">{this.props.name}</span>
            </p>
          </div>
          <div className="mt-12 bg-white rounded-2xl shadow-lg p-6 border border-slate-200">
            <Todo />
          </div>
          <div className="mt-12 bg-white rounded-2xl shadow-lg p-6 border border-slate-200">
            <WatchExample />
          </div>
        </section>
      </>
    );
  }
}
