import "./globals.css";

import { Application } from "@mini/core";
import { App } from "./App";

const application = new Application(App);
application.mount("#app");
