import { Application, RenderResult } from "@mini/core";
import { Injectable } from "@mini/core";
import { Alert } from "../Alert.component";

@Injectable()
export class AlertService {
  alert(text: string) {
    const renderResult = Application.render(
      Alert,
      { name: text },
      {
        parent: [...Application.componentInstances].find(
          (c) => c.constructor.name === "Playground"
        ),
      }
    );

    renderResult.appendTo(document.body);

    // Remove from DOM after 5 seconds
    setTimeout(() => {
      renderResult.destroy();
    }, 5000);
  }
}
