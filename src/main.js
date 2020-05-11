import App from "./App.svelte";

//CSS
import "../public/uikit";
import "../public/global.css";

// JS
import "../public/uikit.js";

const app = new App({
  target: document.body,
});

export default app;
