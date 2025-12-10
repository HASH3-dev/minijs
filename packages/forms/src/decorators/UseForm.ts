import {
  Component,
  ServiceClass,
  ServiceInstance,
  SERVICE_COMPONENT,
} from "@mini/core";
import { FormController } from "../FormController";
import { FormControllerOptions } from "../types";

/**
 * Decorator to create and manage a FormController instance
 * Automatically handles lifecycle and passes the host component
 * Works with both Component instances and ServiceClass instances
 *
 * @param schemaClass - The form schema class with validation decorators
 * @param options - Form controller options
 *
 * @example
 * class SignupForm extends Component {
 *   @UseForm(SignupFormSchema, { trigger: FormTrigger.blur })
 *   form!: FormController<SignupFormSchema>;
 *
 *   render() {
 *     return (
 *       <form {...this.form.bind()}>
 *         <input {...this.form.bindField('email')} />
 *       </form>
 *     );
 *   }
 * }
 */
export function UseForm<T>(
  schemaClass: new () => T,
  options: FormControllerOptions = {}
): PropertyDecorator {
  return function (target: any, propertyKey: string | symbol) {
    let formController: FormController<T> | null = null;
    let instance: Component | ServiceClass<ServiceInstance> | null = null;

    Object.defineProperty(target, propertyKey, {
      get(this: Component | ServiceClass<ServiceInstance>) {
        if (instance === this && formController) return formController;
        // Get the component instance
        const componentInstance =
          this instanceof Component ? this : (this as any)[SERVICE_COMPONENT];

        if (!componentInstance) {
          throw new Error(
            "@UseForm decorator requires a Component instance or ServiceClass with SERVICE_COMPONENT"
          );
        }

        console.log("CREATING FORM CONTROLLER");
        // Create the FormController with the component instance
        formController = new FormController<T>(
          schemaClass,
          options,
          componentInstance
        );

        instance = this;

        return formController;
      },
      enumerable: true,
      configurable: true,
    });
  };
}
