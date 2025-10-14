import { Component } from "@mini/core";

export class Alert extends Component<{ name: string }> {
  render() {
    return (
      <div class="border border-gray-400 px-4 py-2 rounded-lg absolute top-4 right-4">
        {this.props.name}
      </div>
    );
  }
}
