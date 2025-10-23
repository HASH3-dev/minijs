
```typescript
```

```typescript
const application = new Application(<App />);
application.mount("#app");
```


```typescript
@Route('/')
@UseProviders([UserService])
export class App extends Component {

  render() {
    return (
      <RouteSwitcher>
        <LandingPage />
        <LoginPage />
        <RegisterPage />
        <LoggedArea />
      </RouteSwitcher>
    );
  }
}
```

```typescript
@Route('/')
export class LandingPage extends Component {

  render() {
    return <main>...</main>
  }
}
```

```typescript
export class AuthGuard extends Guard {
  @Inject(UserService) userService: UserService;

  canActivate() {
    return this.userService.isAuthenticated();
  }
}
```

```typescript
export class UserResolver extends Resolver {
  @Inject(UserService) userService: UserService;

  async resolve(): Promise<UserData> {
    const userData = await this.userService.fetchUserData();
    return userData;
  }
}
```

```typescript
@Route('/app')
@UseGuards([AuthGuard])
@UseResolvers([UserResolver])
export class LoggedArea extends Component {

  renderLoading() {  // carregando
    return <MainSkeleton />;
  }

  renderError() {    // erro
    return <ErrorPage />;
  }

  renderEmpty() { // sem dados
    return <EmptyPage />;
  }

  render() {
    return <>
      <DashboardPage />
    </>
  }
}
```

```typescript
@Route('/')
export class DashboardPage extends Component {

  @Inject(UserResolver) user!: UserResolver;

  render() {
    return <main>
      Olá {this.user.name}
      <Header />
      <Sidebar />
      <MainContent>
        <RouteSwitcher>
          <Chart1 />
          <Chart2 />
          <Chart3 />
        </RouteSwitcher>
      </MainContent>
    </main>
  }
}
```

```typescript
@Route('/')
export class Chart1 extends Component {
  @Inject(ApiService) api: ApiService;

  @PersistentState([UseURLStorage])
  filters = signal<FiltersState>(null);
  data = signal<any>(null);


  @Mount() // forma 1 de se fazer
  handleFilterChange() {
    this.filters.pipe(
      takeUntil(this.$.unmount$),
      switchMap(filters => this.fetchData(filters)),
      tap(data => this.data.next(data))
    ).subscribe();
  }

  @Watch('filters') // forma 2 de se fazer
  async handleFilterChange() {
    const data = await this.fetchData(this.filters);
    this.data.next(data);
  }

  @LoadData()
  fetchData(filters: FiltersState) {
    return this.api.getChart1Data(filters);
  }

  renderLoading() {  // carregando
    return this.basicElements(<Chart1Skeleton />);
  }

  renderError() {  // carregando
    return this.basicElements(<GenericError />);
  }

  renderEmpty() {  // carregando
    return this.basicElements(<Chart1Empty />);
  }

  render() {
    return this.basicElements(<Chart1Content data={this.data} />);
  }

  private basicElements(children: any) {
    return <section>
      <Filters state={this.filters} onSubmit={(filters) => this.filters.next(filters)} />
      {children}
    </section>
  }
}
```

```typescript
@Route('/chart2')
export class Chart2 extends Component {

  render() {
    return <section>
    ...
    </section>
  }
}
```

```typescript
@Route('/chart3')
export class Chart3 extends Component {

  render() {
    return <section>
    ...
    </section>
  }
}
```
