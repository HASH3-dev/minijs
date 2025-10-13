import { Component } from "@mini/core";

export class Header extends Component {
  render() {
    return (
      <h3 class="text-2xl font-bold text-white flex items-center gap-2">
        <span class="text-3xl">📋</span>
        <span>Modal Header</span>
      </h3>
    );
  }
}
