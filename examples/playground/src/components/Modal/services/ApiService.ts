import { Inject, Injectable } from "@mini/core/jsx-runtime";
import { MODAL } from "../constants";

@Injectable()
export class ApiService {
  @Inject(MODAL) modal!: boolean;

  async fetchUsers() {
    return new Promise((resolve) =>
      setTimeout(
        () =>
          resolve([
            {
              id: 1,
              name: "John Doe",
              modal: this.modal,
            },
          ]),
        500
      )
    );
  }
}
