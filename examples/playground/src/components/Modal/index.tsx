import { Component, Child, ChildType, Mount } from "@mini/core";
import { Footer } from "./Footer";
import { Header } from "./Header";
import { Inject, Provide } from "@mini/di";
import { MODAL } from "./constants";

@Provide([{ provide: MODAL, useValue: true }])
export class Modal extends Component {
  @Child("header") header!: Header;
  @Child("footer") footer!: Footer;
  @Child() content!: ChildType;

  @Inject(MODAL) modal!: boolean;

  @Mount()
  mounted() {
    console.log("Modal mounted", this.modal);
  }

  render() {
    return (
      <>
        <div class="bg-white rounded-2xl shadow-xl border-2 border-slate-300 overflow-hidden">
          <div class="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4">
            {this.header}
          </div>
          <div class="px-6 py-5 bg-slate-50">{this.content}</div>
          <div class="bg-white px-6 py-4 border-t border-slate-200 flex justify-end">
            {this.footer}
          </div>
        </div>
      </>
    );
  }
}
