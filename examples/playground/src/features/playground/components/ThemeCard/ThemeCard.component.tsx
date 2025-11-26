import {
  Component,
  Inject,
  Injectable,
  Resolver,
  Signal,
  UseResolvers,
} from "@mini/core";
import { from, Observable } from "rxjs";
import { ThemeService } from "../../../../shared/services";

interface User {
  id: number;
  name: string;
  address?: {
    street: string;
  };
}

@Injectable()
class UserResolver implements Resolver<User> {
  resolve(): Observable<User> {
    return from<Promise<User>>(
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

  @Inject(UserResolver) user!: Signal<User>;

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
      <div className={`rounded-xl shadow-lg p-6 border-2 ${cardClass}`}>
        <h3 className="text-2xl font-bold mb-2">{this.theme.getThemeName()}</h3>
        <p className={`mb-4 ${textClass}`}>
          This card uses the injected ThemeService to determine its styling.
        </p>
        <p>Hello {this.user.get("name").orElse(() => "World")}</p>
        <div className="space-y-2">
          <div className={`p-3 rounded-lg border ${buttonClass}`}>
            <p className="text-sm font-medium">
              Card Class:{" "}
              <code className="text-xs">{cardClass.substring(0, 30)}...</code>
            </p>
          </div>
          <div className={`p-3 rounded-lg border ${buttonClass}`}>
            <p className="text-sm font-medium">
              Text Class: <code className="text-xs">{textClass}</code>
            </p>
          </div>
        </div>
      </div>
    );
  }
}
