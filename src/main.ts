import { createApp } from "vue";
import App from "./App.vue";
import router from "./router/index";
import i18n from "@i18n/index";
import ErrorLogger from "./services/errorLogger.ts";
import { LogManager } from "@api/logWriter.ts";

const app = createApp(App);
app.use(router);
app.use(i18n);

// mobile/embedded browser viewport-vh fix:
// set a CSS variable --vh to 1% of the innerHeight and update on resize.
// Use this in CSS as: height: calc(var(--vh) * 100);
// function setVh() {
//   try {
//     const vh = window.innerHeight * 0.01;
//     document.documentElement.style.setProperty("--vh", `${vh}px`);
//   } catch (e) {
//     // ignore
//   }
// }
// setVh();

app.mount("#app");
window.$ErrorLogger = new ErrorLogger(app);
window.$Logger = LogManager;
