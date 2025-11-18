import { Component, MiniElement } from "@mini/core";

interface Props extends MiniElement<HTMLButtonElement> {}

export class Button extends Component<Props> {
  render() {
    return (
      <button
        className={
          "bg-linear-to-r from-blue-600 to-purple-600 text-white font-semibold py-3 px-6 rounded-lg hover:from-blue-700 hover:to-purple-700 transition shadow-md hover:shadow-lg " +
          this.props.className
        }
        onClick={this.props.onClick}
      >
        {this.children}
      </button>
    );
  }
}
