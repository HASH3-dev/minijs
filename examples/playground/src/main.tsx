import "./styles.css";
import { App } from "./App";

const app = document.getElementById("app")!;

// The @mini/jsx runtime's JSX factory returns a DOM Node for class components.
app.appendChild((<App />) as any);
