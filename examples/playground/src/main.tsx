import "./styles.css";
import { Application } from "@mini/core";
import { App } from "./App";
import { Home } from "./view/Home";
import { Alert } from "./components/Alert";

// Create application with two-phase rendering (fixes DI issues)
// const application = new Application(<App />);
const application = new Application(<Home />);
application.mount("#app");
