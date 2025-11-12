/**
 * Dependency Injection Example
 * Demonstrates reactive DI with theme switching
 */
import {
  Component,
  Inject,
  Injectable,
  Mount,
  Provider,
  Resolver,
  signal,
  unwrap,
  UseResolvers,
} from "@mini/core";
import { BehaviorSubject, map } from "rxjs";
import { ThemeService } from "../services/theme/ThemeService.Abstract";
import { DarkTheme } from "../services/theme/ThemeService.DarkTheme";
import { LightTheme } from "../services/theme/ThemeService.LightTheme";
import { ThemedCard } from "./ThemeCard";

// ===== Main DI Demo Component with Theme Toggle =====

interface User {
  id: number;
  name: string;
}

@Injectable()
class UserResolver implements Resolver<User | null> {
  resolve(): Promise<User | null> {
    // return from<Promise<User | null>>(
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        resolve({ id: 1, name: "John Doe" });
        // reject(new Error("User not found"));
      }, 3000);
    });
    // );
  }
}

@UseResolvers([UserResolver])
export class DIExample extends Component {
  private theme = signal<"dark" | "light">("light");

  @Inject(UserResolver) user!: BehaviorSubject<User | null>;

  constructor() {
    super();
    console.log("[DIExample] constructor() called");
  }

  @Mount()
  onMount() {
    console.log("[DIExample] onMount() called", unwrap(this.user));
  }

  toggleTheme() {
    const current = unwrap(this.theme);
    this.theme.next(current === "dark" ? "light" : "dark");
    console.log(`Theme switched to: ${this.theme.value}`);
  }

  providersFactory() {
    return [
      {
        provide: ThemeService,
        useClass: unwrap(this.theme) === "dark" ? DarkTheme : LightTheme,
      },
    ];
  }

  renderLoading() {
    return <div>Loading...</div>;
  }

  render() {
    return (
      <div class="space-y-6">
        <p>{unwrap(this.user)?.name}</p>
        <div class="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-6 text-white">
          <h2 class="text-3xl font-bold mb-2">
            💉 Reactive Dependency Injection
          </h2>
          <p class="text-blue-100 mb-4">
            Switch themes to see DI in action with different implementations
          </p>
          <button
            onClick={() => this.toggleTheme()}
            class="bg-white text-purple-600 font-semibold px-6 py-3 rounded-lg hover:bg-blue-50 transition shadow-md"
          >
            Toggle Theme
          </button>
        </div>

        {/* Reactive Provider that changes based on signal */}
        {this.theme.pipe(
          map(() => (
            <Provider values={this.providersFactory()}>
              <ThemedCard />
            </Provider>
          ))
        )}

        <div class="bg-slate-100 rounded-xl p-6 border border-slate-300">
          <h3 class="text-lg font-bold text-slate-800 mb-3">
            🎯 What's Happening:
          </h3>
          <ol class="space-y-2 text-sm text-slate-700 list-decimal list-inside">
            <li>
              <strong>Signal</strong> holds the current theme ("dark" or
              "light")
            </li>
            <li>
              <strong>Pipe + Map</strong> transforms the signal into JSX with
              the right Provider
            </li>
            <li>
              <strong>Provider</strong> injects either DarkTheme or LightTheme
            </li>
            <li>
              <strong>ThemedCard</strong> uses @Inject to get the ThemeService
            </li>
            <li>
              <strong>Button</strong> toggles the signal, causing a re-render
              with new DI
            </li>
          </ol>
        </div>

        <div class="bg-green-50 border border-green-200 rounded-xl p-6">
          <h3 class="text-lg font-bold text-green-800 mb-3">
            ✨ Key Concepts:
          </h3>
          <ul class="space-y-2 text-sm text-green-900">
            <li class="flex items-start">
              <span class="text-green-600 mr-2 font-bold">→</span>
              <span>
                <strong>Liskov Substitution:</strong> Abstract ThemeService can
                be replaced with DarkTheme or LightTheme
              </span>
            </li>
            <li class="flex items-start">
              <span class="text-green-600 mr-2 font-bold">→</span>
              <span>
                <strong>Reactive DI:</strong> Provider changes dynamically based
                on signal value
              </span>
            </li>
            <li class="flex items-start">
              <span class="text-green-600 mr-2 font-bold">→</span>
              <span>
                <strong>Decoupling:</strong> ThemedCard doesn't know which theme
                it's using
              </span>
            </li>
          </ul>
        </div>
      </div>
    );
  }
}
