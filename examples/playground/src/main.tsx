import "./styles/globals.css";

import { Application } from "@mini/core";
// import { App } from "./App";
import { AppRouter } from "./AppRouter";

// Create application with two-phase rendering (fixes DI issues)
const application = new Application(AppRouter);
application.mount("#app");

(window as any).Application = Application;
