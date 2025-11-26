import "./styles/globals.css";

import { Application } from "@mini/core";
import { AppRouter } from "./AppRouter";

const application = new Application(AppRouter);
application.mount("#app");
