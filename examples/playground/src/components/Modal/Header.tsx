import { Component, Mount } from "@mini/core";
import { MODAL } from "./constants";
import { Inject } from "@mini/di";

export class Header extends Component {
  @Inject(MODAL)
  modal!: boolean;

  @Mount()
  mounted() {
    console.log("Header mounted", this.modal);
  }

  render() {
    return (
      <h3 class="text-2xl font-bold text-white flex items-center gap-2">
        <span class="text-3xl">📋</span>
        <span>Modal Header</span>
      </h3>
    );
  }
}
