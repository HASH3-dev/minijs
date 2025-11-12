import {
  Component,
  Inject,
  LoadData,
  Loader,
  LoadFragment,
  Mount,
  RenderState,
} from "@mini/core";
import { ApiService } from "./Modal/services/ApiService";
import { Route, RouterService, RouteSwitcher } from "@mini/router";
import { map } from "rxjs";

@Route("/loading-content")
export class LoadingContent extends Component {
  @Inject(ApiService) api!: ApiService;
  @Inject(RouterService) router!: RouterService;

  years = "years";

  @Mount()
  @LoadData({ label: "Name", isEmpty: (e: string | null | undefined) => !e })
  loadUserName() {
    return new Promise<string>((resolve) => {
      setTimeout(() => {
        resolve("Jaykon");
      }, 1000);
    });
  }

  @Mount()
  @LoadData({ label: "Age" })
  loadUserAge() {
    console.log("loading content on mount");
    return new Promise<number>((resolve) => {
      setTimeout(() => {
        resolve(37);
      }, 3000);
    });
  }

  @LoadFragment({
    states: [RenderState.LOADING],
    label: "Name",
    transformParams: () => ["name"],
  })
  @LoadFragment({
    states: [RenderState.LOADING],
    label: "Age",
    transformParams: () => ["age"],
  })
  loadFragment(label: string) {
    return `Loading ${label}...`;
  }

  @LoadFragment({
    states: [RenderState.ERROR],
    label: "Age",
    transformParams: (e) => [e, "age"],
  })
  @LoadFragment({
    states: [RenderState.ERROR, RenderState.EMPTY],
    label: "Name",
    transformParams: (e) => [e, "name"],
  })
  errorFragment(error: any, label: string) {
    console.log(label, error);
    return <div>Error to load {label}</div>;
  }

  @LoadFragment<LoadingContent>({
    states: [RenderState.SUCCESS],
    label: "Age",
    transformParams: (e, _) => [e, _.years],
  })
  async ageSuccessFragment(data: any, unit: string) {
    // console.log(
    //   "fetch async request on success age fragment",
    //   await this.api.fetchUsers()
    // );
    return (
      <span className="font-bold text-red-500">
        {data} {unit}
      </span>
    );
  }

  renderLoading() {
    return <div>Loading...</div>;
  }

  async render() {
    console.log(
      "fetch async request on main LoadingContent render",
      await this.api.fetchUsers()
    );

    return (
      <div className="rounded border border-gray-200 p-4">
        <p>
          Name: <Loader fragment="Name" />
        </p>
        <p>
          Age: <Loader fragment="Age" />
        </p>
        <div className="flex gap-2 mt-4">
          <button
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            onClick={() => this.loadUserName()}
          >
            Load Name
          </button>
          <button
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            onClick={() => this.loadUserAge()}
          >
            Load Age
          </button>
        </div>
        <RouteSwitcher
          fallback={
            <button
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mt-5"
              onClick={() =>
                this.router.push("/another/loading-content/1231231")
              }
            >
              Mudar
            </button>
          }
        >
          {() => [ParamRouterComponent, RouterComponent]}
        </RouteSwitcher>
      </div>
    );
  }
}

@Route("/:id")
class ParamRouterComponent extends Component {
  @Inject(RouterService) router!: RouterService;

  @Mount()
  log() {
    console.log(this.router);
  }

  render() {
    return (
      <div>
        <p>Oi fulano {this.router.params$.pipe(map((e) => e.id))}</p>

        <div className="flex gap-2 mt-4">
          <button
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            onClick={() => this.router.push("/another/loading-content")}
          >
            Um acima
          </button>
          <button
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            onClick={() =>
              this.router.push("/another/loading-content/8979854769568")
            }
          >
            Um ao lado
          </button>
        </div>
      </div>
    );
  }
}

@Route("/")
class RouterComponent extends Component {
  @Inject(RouterService) router!: RouterService;

  render() {
    return (
      <div>
        <p>Oi sem param</p>
        <button
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          onClick={() => this.router.push("/")}
        >
          Voltar
        </button>
      </div>
    );
  }
}
