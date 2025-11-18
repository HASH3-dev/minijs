import { Component, Mount } from "@mini/core";
import { MODAL } from "./constants";
import { Inject } from "@mini/core";

export class Header extends Component {
  @Inject(MODAL)
  modal!: boolean;

  @Mount()
  mounted() {
    console.log("Header mounted", this.modal);
  }

  render() {
    return (
      <h3 className="text-2xl font-bold text-white flex items-center gap-2">
        <span className="text-3xl">📋</span>
        <span>Modal Header</span>
      </h3>
    );
  }
}
