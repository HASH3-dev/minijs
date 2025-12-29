```tsx

const HTTPConfig = new InjectorToken<HTTPConfigType>('HTTPConfig');

@UseProviders([{
  provide: HTTPConfig,
  useValue: { baseURL: 'https://api.example.com' }
}, {
  provide: HTTPService,
  useFactory: (config) => new HTTPService(new AxiosHttpAdapter(config)),
  deps: [HTTPConfig]
}])
export class App extends Component {
  render() {
    return <SignupForm />;
  }
}


@Injectable()
export class ApiService {
  @Inject(HTTPService) httpService!: HTTPService;
  private signup$ = signal<SignupFormSchema>();

  private signupFlow$ = this.signup$.pipe(
    switchMap((data) => this.httpService.post('/signup', data))
  );

  signup(data: SignupFormSchema) {
    this.signup$.set(data);
    return this.signupFlow$
  }
}


export class SignupForm extends Component {
  form = new FormController(SignupFormSchema, {
    trigger: FormTrigger.blur, // onBlur | onInput | onSubmit
  });
  @Inject(ApiService) api!: ApiService

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

    return this.api.signup(await this.form.values$);
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
