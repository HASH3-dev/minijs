import { Application, RenderResult } from "@mini/core";
import { Injectable } from "@mini/core";
import { Alert } from "../../components/Alert";

@Injectable()
export class AlertService {
  alert(text: string) {
    console.log("[AlertService] Adding alert", [
      ...Application.componentInstances,
    ]);
    const renderResult = Application.render(
      Alert,
      { name: text },
      {
        parent: [...Application.componentInstances].find(
          (c) => c.constructor.name === "App"
        ),
      }
    );

    // Append to DOM after 1 second
    // setTimeout(() => {
    renderResult.appendTo(document.body);
    console.log("[AlertService] Alert added to DOM", renderResult);
    // });

    // Remove from DOM after 5 seconds
    setTimeout(() => {
      renderResult.destroy();
      console.log("[AlertService] Alert removed and destroyed");
    }, 5000);
  }
}
