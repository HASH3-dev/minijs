import "reflect-metadata";
import {
  FORM_VALIDATE_ON_METADATA,
  FORM_INPUT_LABEL_METADATA,
  FORM_INPUT_MASK_METADATA,
  FORM_INPUT_TYPE_METADATA,
  FORM_INPUT_OPTIONS_METADATA,
  FORM_OPTIONAL_METADATA,
  FieldMetadata,
} from "../types";

/**
 * Helper function to get all field metadata from a schema class
 * @param schemaClass - The schema class to extract metadata from
 * @returns A map of field names to their metadata
 */
export function getFieldsMetadata(
  schemaClass: any
): Map<string, FieldMetadata> {
  const instance = new schemaClass();
  const prototype = Object.getPrototypeOf(instance);
  const fieldsMetadata = new Map<string, FieldMetadata>();

  // Get all property names from the instance
  const propertyNames = Object.getOwnPropertyNames(instance);

  for (const propertyKey of propertyNames) {
    const validateOn = Reflect.getMetadata(
      FORM_VALIDATE_ON_METADATA,
      prototype,
      propertyKey
    );
    const label = Reflect.getMetadata(
      FORM_INPUT_LABEL_METADATA,
      prototype,
      propertyKey
    );
    const mask = Reflect.getMetadata(
      FORM_INPUT_MASK_METADATA,
      prototype,
      propertyKey
    );
    const type = Reflect.getMetadata(
      FORM_INPUT_TYPE_METADATA,
      prototype,
      propertyKey
    );
    const options = Reflect.getMetadata(
      FORM_INPUT_OPTIONS_METADATA,
      prototype,
      propertyKey
    );

    // Get design type (for TypeScript type information)
    const designType = Reflect.getMetadata(
      "design:type",
      prototype,
      propertyKey
    );

    // Check if field is required - read from the same target as other metadata
    const isOptional = Reflect.getMetadata(
      FORM_OPTIONAL_METADATA,
      prototype,
      propertyKey
    );
    const required = !isOptional;

    fieldsMetadata.set(propertyKey, {
      propertyKey,
      validateOn,
      label: label || propertyKey,
      mask,
      type,
      options,
      defaultValue: instance[propertyKey],
      required,
      designType,
    });
  }

  return fieldsMetadata;
}
