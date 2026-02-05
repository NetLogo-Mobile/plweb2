import { createApp } from "vue";
import App from "./App.vue";
import router from "./router/index";
import i18n from "@i18n/index";
import ErrorLogger from "./services/errorLogger.ts";
import { LogManager } from "@api/logWriter.ts";
import type { DirectiveBinding } from "vue";
import "highlight.js/styles/github.css";

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

// Richtext Render
app.directive("richText", {
  mounted(el, binding: DirectiveBinding<() => Promise<string>>) {
    el.innerHTML = "rendering...";
    Promise.resolve(binding.value()).then((html) => {
      el.innerHTML = html;
    });
  },
  updated(el: HTMLElement, binding: DirectiveBinding<any>) {
    Promise.resolve(binding.value()).then((html) => {
      el.innerHTML = html;
    });
  },
});

app.mount("#app");
window.$ErrorLogger = new ErrorLogger(app);
window.$Logger = LogManager;
