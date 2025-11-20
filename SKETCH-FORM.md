```typescript
import { Component, signal } from '@mini/core';
import { Form, FormController, FormField, FieldError, FormTrigger, InputMask } from '@mini/forms';
import {
  IsString,
  IsEmail,
  MinLength,
  MaxLength,
  Transform,
  Matches,
} from 'class-validator';
import { FieldsMatch } from '@/custom-validators';
import { distinctUntilChanged, combineLatest, pluck } from 'rxjs';

class SignupFormSchema {
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  @Transform(({ val }) => val.trim())
  name = ''; // default

  @IsString()
  @IsEmail()
  @Transform(({ val }) => val.trim())
  email = '';

  @IsCPF()
  @Transform(({ val }) => val.trim())
  @InputMask('999.999.999-99') // mascaras de inputs via decorator
  cpf = '';

  @IsString()
  @MinLength(8)
  @MaxLength(255)
  @Matches('regex here')
  password = '';

  @IsString()
  @FieldsMatch('password', { message: "Passwords doesn't match" }) //custom validator
  confirmPassword = '';
}

export class SignupForm extends Component {
  form = new FormController(SignupFormSchema, {
    trigger: FormTrigger.blur, // onBlur | onInput | onSubmit
  });
  enabledSubmit = combineLatest(
      [
        this.form.isValid$,
        this.form.isDirty$,
        this.form.isTouched$,
      ],
      ([isValid, isDirty, isTouched]) => isValid && isDirty && isTouched
    )

  @LoadData({label: 'submitting'})
  async handleSubmit(e: Event) {
    e.preventDefault();
    console.log(this.form.values$);
    console.log(this.form.isValid$);
    console.log(this.form.isDirty$);
    console.log(this.form.isTouched$);
    console.log(this.form.submitsAttempts$ /* quantas vezes o form foi submetido */);
    console.log(this.form.errors$ /* erros dos fields do formulario */);
    console.log(this.form.serverErrors$ /* erros do backend */);
    console.log(this.form.fields$ /* signal de todos os campos do form com informação individual de cada campo
    touched, dirty, valid, error */);
    console.log(this.form.requiredFields /* retorna um subset do form com somente os requiredFields, mas ainda é uma instancia de FormController */);
    console.log(this.form.get('email')) // retorna signal do campo específico);

    return this.api.send(await this.form.values$);
  }

  @LoadFragment({label: 'submitting', state: [FragmentState.LOADING]})
  sending() {
    return "Submitting...";
  }

  @LoadFragment({label: 'submitting', state: [FragmentState.SUCCESS, FragmentState.ERROR, FragmentState.IDLE]})
  sendEnd() {
    return "Sign Up";
  }

  @Watch('form.values$', [pluck(['email']), distinctUntilChanged()])
  onEmailChange(email: string) {
    console.log('o email mudou', email);
  }

  render() {
    return (
      <Form
        form={this.form}
        onSubmit={this.handleSubmit}
      >
        <FormField control='name' trigger={FormTrigger.input}> {/* specific trigger */}
          {props => (
            <div>
              <label for='name'>Name</label>
              <input
                {...props}
              />
              <FieldError error={props.error} />
            </div>
          )}
        </FormField>

        <FormField control='email'>
          {props => (
            <div>
              <label for='email'>Email</label>
              <input {...props} />
              <FieldError error={props.error} />
            </div>
          )}
        </FormField>

        <FormField control='cpf'>
          {props => (
            <div>
              <label for='cpf'>CPF</label>
              <input {...props} />
              <FieldError error={props.error} />
            </div>
          )}
        </FormField>

        <FormField control='password'>
          {props => (
            <div>
              <label for='password'>Password</label>
              <input
                type='password'
                {...props}
              />
              <FieldError error={props.error} />
            </div>
          )}
        </FormField>

        <FormField control='confirmPassword'>
          {props => (
            <div>
              <label for='confirmPassword'>Confirm Password</label>
              <input
                type='password'
                {...props}
              />
              <FieldError error={props.error} />
            </div>
          )}
        </FormField>

        <button
          type='submit'
          disabled={this.enabledSubmit}
        >
          <Loader fragment='submitting' />
        </button>
        {this.form.errors$.map(error => <p>{error}</p>)}
      </Form>
    );
  }
}
```
