// Core classes
export { FormController } from "./FormController";
export { FormField } from "./FormField";

// Types
export {
  FormTrigger,
  FormControllerOptions,
  FormBindAttributes,
  FieldMetadata,
  FieldState,
  ValidationAdapter,
  ValidationResult,
} from "./types";

// Decorators
export {
  ValidateOn,
  InputLabel,
  InputMask,
  InputType,
  InputOptions,
  InputIsOptional,
  UseForm,
} from "./decorators";

// Validators
// Note: FieldsMatch requires class-validator to be installed
// Import directly from "./validators" when using class-validator
// export { FieldsMatch } from "./validators";

// Adapters
export { ClassValidatorAdapter, MaskAdapter, IMaskAdapter } from "./adapters";

// Components
export { AutoForm } from "./components";

// Utils
export { getFieldsMetadata } from "./utils";
