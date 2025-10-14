import { Application } from "@mini/core";
import { Alert } from "../../components/Alert";

export class AlertService {
  alert(text: string) {
    const node = Application.render(Alert, { name: text });
    document.body.appendChild(node);

    setTimeout(() => {
      document.body.removeChild(node);
    }, 15000);
  }
}
