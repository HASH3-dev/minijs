import { Component, Inject, signal, unwrap, Watch } from "@mini/core";
import { AlertService } from "../../../../shared/components";
import { PersistentSate, UseURLStorage } from "@mini/common";

type TodoItem = {
  id: string;
  text: string;
  done: boolean;
};

export class Todo extends Component {
  @Inject(AlertService) alertService!: AlertService;

  @PersistentSate(new UseURLStorage())
  private text = signal("");

  @PersistentSate(new UseURLStorage())
  list = signal<TodoItem[]>([]);

  async addItem() {
    const text = await unwrap(this.text);
    if (!text) {
      this.alertService.alert("Please enter a text");
      return;
    }

    const item = {
      id: Date.now().toString(),
      text,
      done: false,
    };

    this.list.set((prev) => [...prev, item]);
    this.text.set("");
  }

  removeItem(id: string) {
    this.list.set((prev) => prev.filter((item) => item.id !== id));
  }

  checkItem(id: string) {
    this.list.set((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          return {
            ...item,
            done: !item.done,
          };
        }
        return item;
      })
    );
  }

  setText(text: string) {
    this.text.set(text);
  }

  @Watch("list")
  onListChange(list: TodoItem[]) {
    console.log(list);
  }

  render() {
    return (
      <main className="flex flex-col gap-10 items-center">
        <h1 className="text-3xl font-bold self-start">Todo List</h1>

        <div className="flex gap-2 items-center">
          <input
            value={this.text}
            onInput={(e: any) => this.setText(e.target.value)}
            placeholder="Do the dishes..."
            className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
          />

          <button
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-xl cursor-pointer"
            onClick={() => this.addItem()}
          >
            Add item
          </button>
        </div>

        <ul className="flex flex-col gap-2 max-w-80 w-full">
          <p>
            {this.list
              .length()
              .map((e) => e > 0 && `${e} items`)
              .orElse(() => "No items")}
          </p>
          {this.list
            .map((item) => (
              <li className="flex bg-slate-100 items-center gap-2 border border-slate-300 rounded-lg px-4 py-2 w-full">
                <input
                  type="checkbox"
                  checked={item.done}
                  onChange={() => this.checkItem(item.id)}
                />
                <span className={item.done ? "line-through" : ""}>
                  {item.text}
                </span>
                <button
                  onClick={() => this.removeItem(item.id)}
                  className="ml-auto cursor-pointer text-red-500 hover:text-red-600"
                >
                  x
                </button>
              </li>
            ))
            .orElse(() => (
              <span>You don't have any items.</span>
            ))}
        </ul>
      </main>
    );
  }
}
