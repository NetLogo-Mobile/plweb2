<template>
  <InfiniteScroll
    :has-more="!noMore"
    :initial-items="items"
    :marginTop="0"
    @load="handleLoad"
  >
    <template #default="{ items }">
      <div v-for="item in items as CommentResult[]" :key="item.ID">
        <MessageItem
          :message="item"
          @msgClick="handleMsgClick"
          @deleteMsg="deleteMsg"
        />
        <n-divider style="margin: 0" />
      </div>
    </template>
  </InfiniteScroll>
</template>

<script setup lang="ts">
import { ref, watch, nextTick } from "vue";
import MessageItem from "./MessageItem.vue";
import { getData } from "@services/api/getData.ts";
import { showAPiError } from "@popup/index.ts";
import { removeToken } from "@services/utils.ts";
import { showMessage } from "@popup/naiveui";
import InfiniteScroll from "../utils/infiniteScroll.vue";
import { useI18n } from "vue-i18n";
import { checkLogin } from "@services/utils.ts";
import { NDivider } from "naive-ui";
import type {
  Category as CategoryType,
  CommentResult,
} from "@services/../pl-serve-type-main/type/main";

type PMessageItem = CommentResult;

const { ID, Category, upDate } = defineProps<{
  ID: string;
  Category: CategoryType | "User";
  upDate?: number;
}>();

let items = ref<PMessageItem[]>([]); // 前端的消息列表  front-end message list
const loading = ref(false);
let noMore = ref(false);
let skip = ref(0);
let from: CommentResult["ID"] | null = null;
const { t } = useI18n();

const emit = defineEmits(["msgClick"]);

async function fetchComments(options?: {
  from?: CommentResult["ID"] | null;
  skip?: number;
}) {
  return getData("/Messages/GetComments", {
    TargetID: ID,
    TargetType: Category,
    CommentID: options?.from || "",
    Take: 20,
    Skip: options?.skip || 0,
  });
}

async function deleteMsg(message: CommentResult) {
  const index = items.value.findIndex((item) => item.ID === message.ID);
  let removed: CommentResult[] = [];
  if (index !== -1) {
    removed = items.value.splice(index, 1);
    // splice方法会直接改动数据的
    // method splice will directly modify the data
    removed = [...removed];
  }
  try {
    const re = await getData("/Messages/RemoveComment", {
      TargetType: Category,
      CommentID: message.ID,
    });
    // 删除未成功，加回列表原有位置
    // if the delete failed, add the removed item back to the original position
    if (re.Status !== 200 && index !== -1 && removed[0]) {
      items.value.splice(index, 0, removed[0]);
      showMessage("error", t("messagesI18n.errorOnDelete"), { duration: 2000 });
    }
    window.$Logger.logEvent({
      category: "Community",
      action: "Remove",
      label: Category,
      timestamp: Date.now(),
    });
  } catch (error) {
    showMessage(
      "error",
      t("error.unknownError") + (error ? `: ${String(error)}` : ""),
      { duration: 2000 },
    );
  }
}

function handleMsgClick(message: CommentResult) {
  emit("msgClick", message);
}

const handleLoad = async () => {
  if (
    // CheckLogin without popup for the sake of avoiding API Handling errors
    checkLogin(false) === false &&
    Category === "User"
  ) {
    return;
  }
  if (loading.value || noMore.value === true) return;
  loading.value = true;
  const getMessagesResponse = await fetchComments({
    from,
    skip: skip.value || 0,
  });

  if (getMessagesResponse.Status !== 200 || !getMessagesResponse.Data) {
    showAPiError(
      t("errors.apiErrorTitle"),
      t("errors.apiErrorMessage", {
        path: "/Messages/GetComments",
        status: getMessagesResponse.Status,
        message: getMessagesResponse?.Message || "",
      }),
      async () => {
        return fetchComments({
          from,
          skip: skip.value || 0,
        });
      },
    );
    const _req = removeToken({
      TargetID: ID,
      TargetType: Category,
      CommentID: from || "",
      Take: 20,
      Skip: skip.value || 0,
    });
    const _res = removeToken(getMessagesResponse);
    window.$ErrorLogger.captureApiError(
      "POST",
      "/Messages/GetComments",
      getMessagesResponse.Status,
      _res,
      _req,
    );
    console.error(
      `/Messages/GetComments returned ${getMessagesResponse.Status}`,
      _res,
    );
    loading.value = false;
    return;
  }

  const messages = getMessagesResponse.Data.Comments;
  const _length = messages.length;
  if (from) messages.shift();
  from = messages[messages.length - 1]?.ID ?? null;

  items.value = [...items.value, ...messages];
  loading.value = false;
  skip.value += 20;
  if (_length < 20) {
    noMore.value = true;
    showMessage("warning", t("ui.messages.noMore"), { duration: 1000 });
  }
  await nextTick();
};

if (Category === "User") checkLogin();
// CheckLogin with popup for the sake of leading user
handleLoad();

watch(
  () => upDate,
  async () => {
    const latestResponse = await fetchComments({ from: null, skip: 0 });
    if (latestResponse.Status !== 200 || !latestResponse.Data?.Comments) {
      return;
    }
    const latestComments = latestResponse.Data.Comments;
    const existingIds = new Set(items.value.map((item) => item.ID));
    const commentsToPrepend = latestComments.filter(
      (item) => !existingIds.has(item.ID),
    );

    if (commentsToPrepend.length > 0) {
      items.value = [...commentsToPrepend, ...items.value];
    }
  },
);

window.$Logger.logPageView({
  pageLink: `/${Category}/${ID}/Comments/`,
  timeStamp: Date.now(),
});
</script>

<style scoped>
.text {
  text-align: center;
  color: #888;
}
</style>
