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
import { Route } from "@mini/router";

// @Route({ path: "/loading-content", exact: true })
export class LoadingContent extends Component {
  @Inject(ApiService) api!: ApiService;

  years = "years";
  // userName = signal<string | null>(null);
  // userAge = signal<number | null>(null);

  // loadUserData() {
  //   this.loadUserName().then((e) => this.userName.next(e));
  //   this.loadUserAge().then((e) => this.userAge.next(e));
  // }

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
      }, 1500);
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
    console.log(
      "fetch async request on success age fragment",
      await this.api.fetchUsers()
    );
    return (
      <span className="font-bold text-red-500">
        {data} {unit}
      </span>
    );
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
      </div>
    );
  }
}
