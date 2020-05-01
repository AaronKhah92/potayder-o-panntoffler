import App from "./App.svelte";

//CSS
import "../node_modules/uikit/dist/css/uikit.css";
import "../public/global.css";

// JS
import "../node_modules/uikit/dist/js/uikit";

const app = new App({
  target: document.body,
  props: {
    name: "world",
  },
});

export default app;
