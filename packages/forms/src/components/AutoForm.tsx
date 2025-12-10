import { Component } from "@mini/core";
import { map, of } from "rxjs";
import { FormController } from "../FormController";

interface AutoFormProps {
  form: FormController<any>;
  submit: (e: Event) => void | Promise<void>;
  submitLabel?: string;
}

/**
 * AutoForm component - automatically renders all form fields
 * Useful for quick prototyping and debugging
 *
 * @example
 * render() {
 *   return <AutoForm form={this.form} submit={this.handleSubmit} />;
 * }
 */
export class AutoForm extends Component<AutoFormProps> {
  render() {
    const { form, submit, submitLabel = "Submit" } = this.props;

    return (
      <form {...form.bind(submit)}>
        {form.fields$.map(([fieldName, field]) => (
          <div key={fieldName} style={{ marginBottom: "1rem" }}>
            <label for={fieldName}>
              {field.label}
              {field.required && <span>*</span>}
            </label>
            {of(field.bind()).pipe(
              map((e) => {
                switch (e.type) {
                  case "textarea":
                    return <textarea {...field.bind()} />;
                  case "select":
                    return (
                      <select {...field.bind()}>
                        <option value="">Select an option...</option>
                        {field.options?.map((option) => (
                          <option key={option} value={option.toString()}>
                            {option}
                          </option>
                        ))}
                      </select>
                    );
                  default:
                    return <input {...field.bind()} />;
                }
              })
            )}

            <div
              style={{
                marginTop: "0.25rem",
                display: field.errors$.pipe(
                  map((e) => (e.length > 0 ? "block" : "none"))
                ),
              }}
            >
              {field.errors$.map((error, idx) => (
                <p
                  key={idx}
                  style={{
                    color: "red",
                    fontSize: "0.875rem",
                    margin: "0.25rem 0",
                  }}
                >
                  {error}
                </p>
              ))}
            </div>
          </div>
        ))}
        <div
          style={{
            display: "flex",
            flexFlow: "row",
            justifyContent: "space-between",
          }}
        >
          <button
            type="button"
            style={{
              padding: "0.5rem 1rem",
              backgroundColor: "#ccc",
              color: "black",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
            onClick={() => form.reset()}
          >
            Reset
          </button>
          <button
            type="submit"
            style={{
              padding: "0.5rem 1rem",
              backgroundColor: "#007bff",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            {submitLabel}
          </button>
        </div>

        {/* Form-level errors */}

        <div
          style={{
            marginTop: "1rem",
            display: form.serverErrors$.pipe(
              map((e) => (e.size > 0 ? "block" : "none"))
            ),
          }}
        >
          {form.serverErrors$.map(([fieldName, errors]) => {
            return errors?.map((error, idx) => (
              <p
                key={`${fieldName}-${idx}`}
                style={{
                  color: "red",
                  fontSize: "0.875rem",
                  margin: "0.25rem 0",
                }}
              >
                {fieldName}: {error}
              </p>
            ));
          })}
        </div>
      </form>
    );
  }
}
