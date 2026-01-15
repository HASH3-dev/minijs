```tsx

@Server()
@Injectable()
export class UserService {
  @Inject(DB) db!: DB;

  @Action({
    middlewares: [
      LoggedUser(),
      Role('ADMIN'),
    ]
  })
  updateUser(update: UpdateUserDto, @Ctx('user') user: User): Promise<UserDto> {
    const id = user.id;
    return this.db.updateUser(id, update);
  }

  @Action()
  signup(data: SignupFormSchema): Promise<UserDto> {
    return this.db.createUser(data);
  }

  @Action()
  async signin(data: SigninFormSchema): Promise<string> {
    const user = await this.db.findUser(data);
    if(!user) throw new Error('User not found');
    return jwt.sign(user);
  }
}

@UseProviders([
  UserService,
])
export class App extends Component {
  render() {
    return <SignupForm />;
  }
}

export class SignupForm extends Component {
  form = new FormController(SignupFormSchema, {
    trigger: FormTrigger.blur, // onBlur | onInput | onSubmit
  });
  @Inject(UserService) userService!: UserService

  enabledSubmit = combineLatest(
      [
        this.form.requiredFields.isValid$,
        this.form.requiredFields.isDirty$,
        this.form.requiredFields.isTouched$,
      ],
      ([isValid, isDirty, isTouched]) => isValid && isDirty && isTouched
    )

  @LoadData()
  async handleSubmit(e: Event) {
    e.preventDefault();
    if(!(await this.form.isValid$)) return;

    return this.userService.signup(await this.form.values$);
  }


  renderLoading() {
    return (
      <div>Loading...</div>
    )
  }

  render() {
    return (
      <AutoForm form={this.form} submit={this.handleSubmit} />
    )
  }
}
```
