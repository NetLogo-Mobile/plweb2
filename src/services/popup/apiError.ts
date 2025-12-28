import { createApp, ref } from "vue";
import type { Ref } from "vue";
import ApiErrorDialog from "../../components/popup/ApiErrorDialog.vue";
import i18n from "@i18n/index";
import { showMessage } from "./naiveui";

// Single dialog state for reuse (prevents stacking)
let current: {
  close: () => void;
  title: Ref<string>;
  message: Ref<string>;
  retry?: () => Promise<any> | void;
} | null = null;

export function showAPiError(
  title: string,
  message: string,
  retry?: () => Promise<any> | void,
) {
  // If there's already a dialog, update its content and retry handler and reuse it
  if (current) {
    current.title.value = title;
    current.message.value = message;
    current.retry = retry;
    return;
  }

  const titleRef = ref(title);
  const messageRef = ref(message);

  const div = document.createElement("div");
  document.body.appendChild(div);

  const app = createApp(ApiErrorDialog, {
    // pass refs so the component can display live updates
    titleRef,
    messageRef,
    confirmLabel: (i18n.global.t("ui.ok") as string) || "OK",
    cancelLabel: (i18n.global.t("ui.cancel") as string) || "Cancel",
    confirmingLabel: (i18n.global.t("ui.retrying") as string) || "Retrying...",
    onConfirm: async () => {
      if (!current?.retry) return;
      try {
        const res = await current.retry();
        if (res && typeof res === "object" && (res as any).Status === 200) {
          showMessage("success", (i18n.global.t("ui.retrySuccess") as string) || "Success");
          close();
        } else {
          showMessage("error", (i18n.global.t("ui.retryFailed") as string) || "Retry failed", { duration: 3000 });
        }
        return res;
      } catch (_e) {
        showMessage("error", (i18n.global.t("ui.retryFailed") as string) || "Retry failed", { duration: 3000 });
        return;
      }
    },
    close: close,
  });

  app.use(i18n);
  app.mount(div);

  function close() {
    try {
      app.unmount();
      div.remove();
    } catch (_e) {
      // ignore
    }
    if (current && current.close === close) current = null;
  }

  current = { close, title: titleRef, message: messageRef, retry };
}

