import { Component, Inject } from "@mini/core";

export class Alert extends Component<{ name: string }> {
  @Inject(Symbol.for("name")) name!: string;

  render() {
    return (
      <div className="border border-gray-400 px-4 py-2 rounded-lg fixed top-4 right-4 bg-white">
        {this.props.name} {this.name}
      </div>
    );
  }
}
