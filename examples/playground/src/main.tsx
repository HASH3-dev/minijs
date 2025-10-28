import "./styles.css";

import { Application } from "@mini/core";
import { App } from "./App";

// Create application with two-phase rendering (fixes DI issues)
const application = new Application(<App />);
application.mount("#app");
