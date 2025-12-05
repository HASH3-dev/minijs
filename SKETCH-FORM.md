```tsx
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
  @ValidateOn(FormTrigger.input)
  @InputLabel('Name')
  name = ''; // default

  @IsString()
  @IsEmail()
  @Transform(({ val }) => val.trim())
  @InputLabel('Email')
  email = '';

  @IsCPF()
  @Transform(({ val }) => val.trim())
  @InputMask('999.999.999-99') // mascaras de inputs via decorator
  @InputLabel('CPF')
  cpf = '';

  @IsString()
  @MinLength(8)
  @MaxLength(255)
  @Matches('regex here')
  @InputType('password')
  @InputLabel('Password')
  password = '';

  @IsString()
  @FieldsMatch('password', { message: "Passwords doesn't match" }) //custom validator
  @InputType('password')
  @InputLabel('Confirm Password')
  confirmPassword = '';
}

export class SignupForm extends Component {
  form = new FormController(SignupFormSchema, {
    trigger: FormTrigger.blur, // onBlur | onInput | onSubmit
  });

  enabledSubmit = combineLatest(
      [
        this.form.requiredFields.isValid$,
        this.form.requiredFields.isDirty$,
        this.form.requiredFields.isTouched$,
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
    console.log(this.form.values$.get('email')) // retorna signal do campo específico);

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
      <form
        {...this.form.bind()}
        onSubmit={() => this.handleSubmit()}
      >
        <div>
          <label for='name'>Name</label>
          <input {...this.form.bind('name', { validateOn: FormTrigger.input })} />
          {this.form.fields$.get('name.errors$').map(error => <p>{error}</p>)}
        </div>

        <div>
          <label for='email'>Email</label>
          <input {...this.form.bind('email')} />
          {this.form.fields$.get('email.errors$').map(error => <p>{error}</p>)}
        </div>

        <div>
          <label for='cpf'>CPF</label>
          <input {...this.form.bind('cpf')} />
          {this.form.fields$.get('cpf.errors$').map(error => <p>{error}</p>)}
        </div>

        <div>
          <label for='password'>Password</label>
          <input
            type='password'
            {...this.form.bind('password')}
          />
          {this.form.fields$.get('password.errors$').map(error => <p>{error}</p>)}
        </div>


        <div>
          <label for='confirmPassword'>Confirm Password</label>
          <input
            type='password'
            {...this.form.bind('confirmPassword')}
          />
          {this.form.fields$.get('confirmPassword.errors$').map(error => <p>{error}</p>)}
        </div>

        <button
          type='submit'
          disabled={this.enabledSubmit}
        >
          <Loader fragment='submitting' />
        </button>
        {this.form.errors$.map(error => <p>{error}</p>)}
      </form>
    );
  }


  // OR
  render() {
    return (
      <form
        {...this.form.bind()}
        onSubmit={this.handleSubmit}
      >
        {this.form.fields$.map(([fieldName, field]) => (
          <div key={fieldName}>
            <label for={fieldName}>{field.label}</label>
            <input {...field.bind()} />
            {field.errors$.map(error => <p>{error}</p>)}
          </div>
        ))}
        <button
          type='submit'
          disabled={this.enabledSubmit}
        >
          <Loader fragment='submitting' />
        </button>
        {this.form.errors$.map(error => <p>{error}</p>)}
      </form>
    );
  }

  // OR for debug purposes
  render() {
    return (
      <AutoForm form={this.form} submit={this.handleSubmit} />
    )
  }
}
```
