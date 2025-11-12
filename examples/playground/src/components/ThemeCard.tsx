import { Component, Resolver, UseResolvers } from "@mini/core";
import { Inject, Injectable } from "@mini/core";
import { ThemeService } from "../services/theme/ThemeService.Abstract";
import { BehaviorSubject, from, map, Observable } from "rxjs";

interface User {
  id: number;
  name: string;
}

@Injectable()
class UserResolver implements Resolver<User | null> {
  resolve(): Observable<User | null> {
    return from<Promise<User | null>>(
      new Promise((resolve, reject) => {
        setTimeout(() => {
          // resolve(null);
          resolve({ id: 1, name: "John Doe" });
          // reject(new Error("User not found"));
        }, 3000);
      })
    );
  }
}

@UseResolvers([UserResolver])
export class ThemedCard extends Component {
  @Inject(ThemeService) theme!: ThemeService;

  @Inject(UserResolver) user!: BehaviorSubject<User | null>;

  renderLoading() {
    return <div>Loading...</div>;
  }

  renderError() {
    return <div>Error loading user</div>;
  }

  renderEmpty() {
    return <div>No user found</div>;
  }

  render() {
    const cardClass = this.theme.getCardClass();
    const textClass = this.theme.getTextClass();
    const buttonClass = this.theme.getButtonClass();

    return (
      <div class={`rounded-xl shadow-lg p-6 border-2 ${cardClass}`}>
        <h3 class="text-2xl font-bold mb-2">{this.theme.getThemeName()}</h3>
        <p class={`mb-4 ${textClass}`}>
          This card uses the injected ThemeService to determine its styling.
        </p>
        <p>Hello {this.user.pipe(map((user) => user?.name))}</p>
        <div class="space-y-2">
          <div class={`p-3 rounded-lg border ${buttonClass}`}>
            <p class="text-sm font-medium">
              Card Class:{" "}
              <code class="text-xs">{cardClass.substring(0, 30)}...</code>
            </p>
          </div>
          <div class={`p-3 rounded-lg border ${buttonClass}`}>
            <p class="text-sm font-medium">
              Text Class: <code class="text-xs">{textClass}</code>
            </p>
          </div>
        </div>
      </div>
    );
  }
}
