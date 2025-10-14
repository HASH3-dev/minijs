import { Component, signal, unwrap } from "@mini/core";
import { Inject, Provide } from "@mini/di";
import { map } from "rxjs";
import { AlertService } from "../services/alert/AlertService";

type TodoItem = {
  id: string;
  text: string;
  done: boolean;
};

@Provide([AlertService])
export class Todo extends Component {
  @Inject(AlertService) alertService!: AlertService;

  private text = signal("");
  private list = signal<TodoItem[]>([]);

  addItem() {
    const text = unwrap(this.text);
    if (!text) {
      this.alertService.alert("Please enter a text");
      return;
    }

    const item = {
      id: Date.now().toString(),
      text,
      done: false,
    };

    const prev = unwrap(this.list);
    this.list.next([...prev, item]);
  }

  setText(text: string) {
    this.text.next(text);
  }

  render() {
    return (
      <main class="flex flex-col gap-10 items-center pt-10">
        <h1 class="text-3xl font-bold">todo list</h1>

        <div className="flex gap-2 items-center">
          <input
            value={this.text}
            onInput={(e: any) => this.setText(e.target.value)}
            placeholder="Do the dishes..."
            class="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
          />

          <button
            class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-xl cursor-pointer"
            onClick={() => this.addItem()}
          >
            Add item
          </button>
        </div>

        <ul class="flex flex-col gap-2">
          {this.list.pipe(
            map((list) =>
              list.map((item) => (
                <li class="flex items-center gap-2">
                  <input type="checkbox" checked={item.done} />
                  <span>{item.text}</span>
                </li>
              ))
            )
          )}
        </ul>
      </main>
    );
  }
}
