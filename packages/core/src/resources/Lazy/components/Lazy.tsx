import { signal } from "../../Signal";
import { Component } from "../../../base/Component";
import { map } from "rxjs";

interface LazyProps {
  /** Component to lazy load */
  component?: Component;
  /** Source of the component to lazy load
   * @example
   * src="path/to/component#componentName"
   */
  src?: string;
}

export class Lazy extends Component<LazyProps> {
  private loadeComponent = signal(false);

  load() {
    this.loadeComponent.next(true);
  }

  async render() {
    return this.loadeComponent.pipe(
      map((loaded) => {
        if (loaded) {
          return this.loadComponent();
        }
        return null;
      })
    );
  }

  private loadComponent() {
    if (this.props.src) {
      const [src, component = "default"] = this.props.src.split("#");
      return import(/* @vite-ignore */ `${src}.js`).then(
        (module) => module[component]
      );
    } else if (this.props.component) {
      return this.props.component;
    }

    throw new Error(
      "Lazy component must have either 'component' or 'src' prop"
    );
  }
}
