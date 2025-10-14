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
    this.text.next("");
  }

  removeItem(id: string) {
    const prev = unwrap(this.list);
    const updated = prev.filter((item) => item.id !== id);
    this.list.next(updated);
  }

  checkItem(id: string) {
    const prev = unwrap(this.list);
    const updated = prev.map((item) => {
      if (item.id === id) {
        return {
          ...item,
          done: !item.done,
        };
      }
      return item;
    });
    this.list.next(updated);
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

        <ul class="flex flex-col gap-2 max-w-80 w-full">
          {this.list.pipe(
            map((list) =>
              list.length === 0 ? <span>You don't have any items.</span> : null
            )
          )}

          {this.list.pipe(
            map((list) =>
              list.map((item) => (
                <li class="flex bg-slate-100 items-center gap-2 border border-slate-300 rounded-lg px-4 py-2 w-full">
                  <input
                    type="checkbox"
                    checked={item.done}
                    onChange={() => this.checkItem(item.id)}
                  />
                  <span class={item.done ? "line-through" : ""}>
                    {item.text}
                  </span>
                  <button
                    onClick={() => this.removeItem(item.id)}
                    class="ml-auto cursor-pointer text-red-500 hover:text-red-600"
                  >
                    x
                  </button>
                </li>
              ))
            )
          )}
        </ul>
      </main>
    );
  }
}
