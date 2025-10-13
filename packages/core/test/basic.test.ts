import { describe, it, expect } from "vitest";
import { Component, State, Prop, Memo } from "../src/index";

class C extends Component {
  @State() count = 0;
  @Prop() name = "mini";
  private _x = 1;
  @Memo() get double(){ return this.count * 2; }
  render(){ return null; }
}

describe("@mini/core", () => {
  it("State updates", () => {
    const c = new C();
    c.count = 2;
    // @ts-expect-error readonly
    // c.name = "x";
    expect(c.double).toBe(4);
    expect(c.name).toBe("mini");
  });
});
