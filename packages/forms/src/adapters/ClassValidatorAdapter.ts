import { ValidationAdapter, ValidationResult } from "../types";

/**
 * Validation adapter for class-validator library
 */
export class ClassValidatorAdapter implements ValidationAdapter {
  private _validate: any;
  private _validateSync: any;
  private _plainToInstance: any;

  constructor() {
    // Dynamically import class-validator and class-transformer if available

    Promise.all([import("class-validator"), import("class-transformer")])
      .then(([classValidator, classTransformer]) => {
        this._validate = classValidator.validate;
        this._validateSync = classValidator.validateSync;
        this._plainToInstance = classTransformer.plainToInstance;
      })
      .catch((error) => {
        throw new Error(
          "class-validator and class-transformer are required for ClassValidatorAdapter. " +
            "Please install them: npm install class-validator class-transformer"
        );
      });
  }

  /**
   * Validate entire schema
   */
  async validate(schemaClass: any, data: any): Promise<ValidationResult> {
    const instance = this._plainToInstance(schemaClass, data);
    const validationErrors = await this._validate(instance);

    const errors: Record<string, string[]> = {};
    let valid = true;

    for (const error of validationErrors) {
      if (error.constraints) {
        errors[error.property] = Object.values(error.constraints);
        valid = false;
      }
    }

    return { valid, errors };
  }

  /**
   * Validate a single field
   */
  async validateField(
    schemaClass: any,
    fieldName: string,
    value: any
  ): Promise<string[]> {
    const instance = this._plainToInstance(schemaClass, { [fieldName]: value });
    const validationErrors = await this._validate(instance, {
      skipMissingProperties: true,
    });

    const fieldError = validationErrors.find(
      (error: any) => error.property === fieldName
    );

    if (fieldError && fieldError.constraints) {
      return Object.values(fieldError.constraints);
    }

    return [];
  }

  /**
   * Synchronous validation for entire schema
   */
  validateSync(schemaClass: any, data: any): ValidationResult {
    const instance = this._plainToInstance(schemaClass, data);
    const validationErrors = this._validateSync(instance);

    const errors: Record<string, string[]> = {};
    let valid = true;

    for (const error of validationErrors) {
      if (error.constraints) {
        errors[error.property] = Object.values(error.constraints);
        valid = false;
      }
    }

    return { valid, errors };
  }

  /**
   * Synchronous validation for a single field
   */
  validateFieldSync(schemaClass: any, fieldName: string, value: any): string[] {
    const instance = this._plainToInstance(schemaClass, { [fieldName]: value });
    const validationErrors = this._validateSync(instance, {
      skipMissingProperties: true,
    });

    const fieldError = validationErrors.find(
      (error: any) => error.property === fieldName
    );

    if (fieldError && fieldError.constraints) {
      return Object.values(fieldError.constraints);
    }

    return [];
  }
}
