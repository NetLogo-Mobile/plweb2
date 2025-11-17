import { getData } from "./api/getData";
import type { Ref } from "vue";
import i18n from "./i18n/i18n";
import { showMessage } from "@popup/naiveui";

export default async function postComment(
  comment: Ref<string>,
  isLoading: Ref<boolean>,
  category: string,
  id: string,
  replyID: Ref<string>,
  updateTrigger: Ref<number>,
) {
  const t = i18n.global.t;
  try {
    if (isLoading.value) return;
    isLoading.value = true;

    const response = await getData("/Messages/PostComment", {
      TargetID: id,
      TargetType: category,
      Content: comment.value,
      ReplyID: replyID.value,
      Language: i18n.global.locale.value,
      Special: null,
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
    }
  } catch (e) {
    if (!(e === "频率过快")) console.error(e);
  } finally {
    isLoading.value = false;
  }
}
