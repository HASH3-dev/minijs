import { Component } from "@mini/core";
import { Route } from "@mini/router";

@Route("/")
export class Footer extends Component {
  render() {
    return (
      <div className="flex gap-3">
        <button className="px-6 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-medium rounded-lg transition shadow-sm hover:shadow active:scale-95">
          Cancel
        </button>
        <button className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium rounded-lg transition shadow-md hover:shadow-lg active:scale-95">
          OK
        </button>
      </div>
    );
  }
}
