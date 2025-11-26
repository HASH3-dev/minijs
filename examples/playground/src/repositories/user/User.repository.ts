import { Inject, Injectable } from "@mini/core";
import { MODAL } from "../../shared/components/Modal/constants";

@Injectable()
export class UserRepository {
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
        5000
      )
    );
  }
}
