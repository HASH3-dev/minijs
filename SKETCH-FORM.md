```typescript
import { Component, signal } from "@mini/core";
import {
  FormGroup,
  FormControl,
  Validators,
  FormError,
  FormSubmit
} from "@mini/forms";

export class SignupForm extends Component {
  form = new FormGroup(
    "signup" // identifier
    {
      name: new FormControl("", [Validators.required()])
      email: new FormControl("", [Validators.required(), Validators.email()]),
      password: new FormControl("", [
        Validators.required(),
        Validators.minLength(8),
        Validators.pattern("password regex here"),
      ]),
      confirmPassword: new FormControl("", [Validators.required()]),
    },
    {
      validators: [Validators.fieldsMatch("password", "confirmPassword")],
    }
  );

  @FormSubmit("signup") // submit handles error updates
  handleSubmit(e: Event) {
    e.preventDefault();
    console.log(this.form.values())
    console.log(this.form.get("email").value)
  }

  render() {
    return (
      <form onSubmit={this.handleSubmit}>
        <div>
          <Input control={this.form.get("name")} />
          <FormError error={this.form.get("name").errors} />
        </div>

        <div>
          <Input control={this.form.get("email")} />
          <FormError error={this.form.get("email").errors} />
        </div>

        <div>
          <Input
            control={this.form.get("password")} type="password"
          />
          <FormError error={this.form.get("password").errors} />
        </div>

        <div>
          <Input
            control={this.form.get("confirmPassword")} type="password"
          />
          <FormError error={this.form.get("confirmPassword").errors} />
        </div>

        <button type="submit" disabled={this.form.invalid$}>
          {this.form.pending$ ? "Submitting..." : "Sign Up"}
        </button>
      </form>
    );
  }
}
```
