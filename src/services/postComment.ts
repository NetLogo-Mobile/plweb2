import { getData } from "./api/getData";
import { isRateLimitResponse } from "./api/Interceptor";
import type { Ref } from "vue";
import i18n from "@i18n/index";
import { showMessage } from "@popup/naiveui";
import type { Category } from "../pl-serve-type-main/type/main";

export default async function postComment(
  comment: Ref<string>,
  isLoading: Ref<boolean>,
  category: Category,
  id: string,
  replyID: Ref<string>,
  updateTrigger: Ref<number>,
) {
  const t = i18n.global.t;
  if (isLoading.value || !comment.value.trim()) return;

  isLoading.value = true;
  try {
    const response = await getData("/Messages/PostComment", {
      TargetID: id,
      TargetType: category,
      Content: comment.value,
      ReplyID: replyID.value,
      Language: i18n.global.locale.value,
      Special: null,
      ID: "",
      UserID: "",
    });

    window.$Logger.logEvent({
      category: "Community",
      action: "Comment",
      label: category,
      timestamp: Date.now(),
    });

    if (response.Status === 200) {
      comment.value = "";
      updateTrigger.value = Math.random();
    } else if (
      response.Status === 403 &&
      response.Message?.startsWith("Stopword.Blocked")
    ) {
      const index = Number(response.Message.split("|")[1]);
      const blockedMessage = comment.value.slice(index, 10);
      const errorMsg = t("errors.contentFilter").replace(
        "{word}",
        blockedMessage,
      );
      showMessage("error", errorMsg, { duration: 5000 });
    } else if (isRateLimitResponse(response)) {
      showMessage("error", t("ui.messages.rateLimitExceeded"), {
        duration: 4000,
      });
    }
  } catch (e) {
    console.error(e);
  } finally {
    isLoading.value = false;
  }
}
