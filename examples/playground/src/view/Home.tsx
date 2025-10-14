import { Component } from "@mini/core";

import { Todo } from "../components/Todo";

export class Home extends Component {
  render() {
    return (
      <div>
        <Todo />
      </div>
    );
  }
}
