import {
  Child,
  Component,
  LOAD_DATA_STATE,
  LoadData,
  LoadFragment,
  Mount,
  PARENT_COMPONENT,
  RenderState,
  signal,
} from "@mini/core";
import { distinctUntilChanged, map, mergeMap, Observable, of, tap } from "rxjs";

export class LoadingContent extends Component {
  userName = signal<string | null>(null);
  userAge = signal<number | null>(null);

  @Mount()
  loadUserData() {
    this.loadUserName().then((e) => this.userName.next(e));
    this.loadUserAge().then((e) => this.userAge.next(e));
  }

  @LoadData({ label: "Name", isEmpty: (e: string | null | undefined) => !e })
  loadUserName() {
    return new Promise<string>((resolve) => {
      setTimeout(() => {
        resolve("John Doe");
      }, 1000);
    });
  }

  @LoadData({ label: "Age" })
  loadUserAge() {
    return new Promise<number>((resolve) => {
      setTimeout(() => {
        resolve(35);
      }, 1500);
    });
  }

  @LoadFragment({ states: [RenderState.LOADING], label: "Age" })
  ageLoadFragment() {
    return "Loading age...";
  }

  @LoadFragment({ states: [RenderState.LOADING], label: "Name" })
  nameLoadFragment() {
    return "Loading name...";
  }

  @LoadFragment({
    states: [RenderState.ERROR, RenderState.EMPTY],
    label: "Name",
  })
  nameErrorFragment(error: any) {
    console.log(error);
    return <div>Error to load name</div>;
  }

  @LoadFragment({ states: [RenderState.ERROR], label: "Age" })
  ageErrorFragment(error: any) {
    console.log(error);
    return <div>Error to load age</div>;
  }

  // renderLoading() {
  //   return (
  //     <div className="rounded border border-gray-200 p-4">
  //       <p>Loading...</p>
  //     </div>
  //   );
  // }

  render() {
    console.log("LoadingContent render");
    return (
      <div className="rounded border border-gray-200 p-4">
        <p>
          Name:{" "}
          <Loader fragment="Name" key="name">
            {this.userName}
          </Loader>
        </p>
        <p>
          Age:{" "}
          <Loader fragment="Age" key="age">
            {this.userAge}
          </Loader>
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

class Loader extends Component<{ fragment: string; key?: string }> {
  @Child() children: any;
  fragment = signal<string | null>(null);

  @Mount()
  setup() {
    return (
      (this[PARENT_COMPONENT] as any)?.[LOAD_DATA_STATE] as Observable<
        Record<string, any>
      >
    ).pipe(
      map((fragmentElement) => fragmentElement[this.props.fragment] || null),
      distinctUntilChanged(),
      tap((fragment) => {
        this.fragment.next(fragment);
      })
    );
  }

  render() {
    return (
      <div className="contents">
        {this.fragment.pipe(
          mergeMap((fragment) => (fragment ? of(fragment) : this.children))
        )}
      </div>
    );
  }
}
