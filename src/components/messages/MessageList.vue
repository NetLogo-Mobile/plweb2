<template>
  <InfiniteScroll
    :has-more="!noMore"
    :initial-items="items"
    :marginTop="0"
    @load="handleLoad"
  >
    <template #default="{ items }">
      <div v-for="item in items as PMessageItem[]" :key="item.id">
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
import { ref, watch, nextTick, onMounted } from "vue";
import MessageItem from "./MessageItem.vue";
import { getData } from "@services/api/getData.ts";
import type { PropType } from "vue";
import { showMessage } from "@popup/naiveui";
import InfiniteScroll from "../utils/infiniteScroll.vue";
import { useI18n } from "vue-i18n";
import storageManager from "@storage/index.ts";
import { checkLogin } from "@services/utils.ts";
import { NDivider } from "naive-ui";

interface PMessageItem {
  id: string;
  userID: string;
  msg_title: string;
  msg: string;
  type: string;
}

const { ID, Category, upDate } = defineProps({
  ID: String,
  Category: {
    type: String as PropType<"Discussion" | "Experiment" | "User">,
    required: true,
  },
  upDate: Number,
});

let items = ref<PMessageItem[]>([]); // 前端的消息列表  front-end message list
const loading = ref(false);
let noMore = ref(false);
let skip = ref(0);
let from: any = null;
const { t } = useI18n();

const emit = defineEmits(["msgClick"]);

async function deleteMsg(message: PMessageItem) {
  const index = items.value.findIndex((item: any) => item.id === message.id);
  let removed: PMessageItem[] = [];
  if (index !== -1) {
    removed = items.value.splice(index, 1);
    // splice方法会直接改动数据的
    // method splice will directly modify the data
    removed = [...removed];
  }
  try {
    const re = await getData("/Messages/RemoveComment", {
      TargetType: message.type,
      CommentID: message.id,
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
      label: message.type,
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

function handleMsgClick(message: PMessageItem) {
  emit("msgClick", message);
}

const handleLoad = async () => {
  if (
    storageManager.getObj("userInfo")?.value?.loginStatus === false &&
    Category === "User"
  ) {
    return;
  }
  if (loading.value || noMore.value === true) return;
  loading.value = true;
  const getMessagesResponse = await getData("/Messages/GetComments", {
    TargetID: ID,
    TargetType: Category,
    CommentID: from || "",
    Take: 20,
    Skip: skip.value || 0,
  });

  const messages = getMessagesResponse.Data.Comments;
  const _length = messages.length;
  if (from) messages.shift();
  from = messages[messages.length - 1]?.ID;

  const defaultItems = messages.map(
    (message: any): PMessageItem => ({
      id: message.ID,
      userID: message.UserID,
      msg_title: message.Nickname,
      msg: message.Content,
      type: Category,
    }),
  );

  items.value = [...items.value, ...defaultItems];
  loading.value = false;
  skip.value += 20;
  if (_length < 20) {
    noMore.value = true;
    showMessage("warning", t("ui.messages.noMore"), { duration: 1000 });
  }
  await nextTick();
};

handleLoad();
watch(
  () => upDate,
  () => {
    items.value = [];
    skip.value = 0;
    noMore.value = false;
    from = null;
    handleLoad();
  },
);

window.$Logger.logPageView({
  pageLink: `/${Category}/${ID}/Comments/`,
  timeStamp: Date.now(),
});

onMounted(() => {
  if (Category === "User") checkLogin();
});
</script>

<style scoped>
.text {
  text-align: center;
  color: #888;
}
</style>
