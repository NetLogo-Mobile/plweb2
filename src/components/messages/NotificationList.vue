<template>
  <infiniteScroll :has-more="!noMore" :initial-items="items" @load="handleLoad">
    <template #default="slotProps">
      <div v-for="item in slotProps.items as NotificationItem[]" :key="item.id">
        <Notification :notification="item" />
        <n-divider style="margin: 0" />
      </div>
    </template>
  </infiniteScroll>
</template>

<script setup lang="ts">
import { ref, onActivated } from "vue";
import Notification from "./NotificationItem.vue";
import { getData } from "@services/api/getData.ts";
import { showMessage } from "@popup/naiveui";
import InfiniteScroll from "../utils/infiniteScroll.vue";
import { NDivider } from "naive-ui";
import { useI18n } from "vue-i18n";
import storageManager from "@storage/index.ts";

onActivated(() => {
  window.$Logger.logPageView({
    pageLink: `/Social/Notifications/${convertUIIndexToCategoryID(notificationTypeIndexOfUI)}/`,
    timeStamp: Date.now(),
  });
});

const { locale, t } = useI18n();

interface NotificationItem {
  id: string;
  msg_title: string;
  msg: string;
  msg_type: number;
  category: string;
  tid: string;
  name: string;
  uid: string;
}

interface PMessage {
  Fields: {
    User?: string;
    UserID?: string;
    Discussion?: string;
    DiscussionID?: string;
    Experiment?: string;
    ExperimentID?: string;
    Content: string;
    TargetName?: string; // 当前登录者的名称，the nickname of the current user
    Unitl: string;
    Editor: string;
  };
  Users: string[];
  UserNames: string[];
  Numbers: {
    Gold: string;
  };
  ID: string;
  TemplateID: string;
  CategoryID: number;
}

const items = ref<NotificationItem[]>([]);
const loading = ref(false);
let skip = ref(0); // 获取消息API的必要参数 A necessary parameter for the GetMessages API
const noMore = ref(false);
let templates: any = [
  {
    ID: "5c90f172a2409b51dc5cb945",
    Identifier: "Letter-Test",
    CategoryID: 1,
    Management: false,
    Subject: {
      Chinese: "一封测试邮件 {Users}",
      English: "A letter for test {Users}",
      ChineseTraditional: "一封測試郵件 {Users}",
      German: "Ein Brief für den Test {Benutzer}",
      French: "Une lettre pour le test {Utilisateurs}",
      Japanese: "テスト用の手紙{Users}",
      Italian: "Una lettera per il test {Utenti}",
      Polish: null,
      Spanish: null,
      Ukrainian: null,
    },
    Content: {
      Chinese: "这是一封测试邮件，用于测试所有功能。{Users}",
      English: "This is a letter for test to test every features. {Users}",
      ChineseTraditional: "這是一封測試郵件，用於測試所有功能。 {Users}",
      German: "Dies ist ein Testbrief zum Testen aller Funktionen. {Benutzer}",
      French:
        "Ceci est une lettre de test pour tester toutes les fonctionnalités. {Utilisateurs}",
      Japanese:
        "これはすべての機能をテストするためのテスト用の手紙です。 {ユーザー}",
      Italian:
        "Questa è una lettera per test per testare tutte le funzionalità. {} utenti",
      Polish: null,
      Spanish: null,
      Ukrainian: null,
    },
    Description: null,
    Bonuses: {
      Fragment: 1,
    },
    Action: null,
    CombineLimit: 0,
    AvailableFrom: 1546322400000,
    AvailableUntil: 1893477600000,
    Push: 0,
  },
]; // 仅仅是为了类型推断  Only for type inference

const { notificationTypeIndexOfUI } = defineProps<{
  notificationTypeIndexOfUI: number;
}>();

// 以下两个函数是API糟糕设计的糟糕解决方案，既然厄能跑，不建议尝试修改
// These two functions are bad solutions to the bad design of the API. Since it can run, it is not recommended to try to modify them.
function convertCategoryIDToUIIndex(n: number) {
  return n === 2 ? 3 : n === 3 ? 2 : n;
}

function convertUIIndexToCategoryID(n: number) {
  return n === 3 ? 2 : n === 2 ? 3 : n;
}

function fillInTemplate(data: string, message: PMessage) {
  const re = data
    .replace(
      /{Users}/g,
      message.Users.map(
        (user: any, index: any) =>
          `<user=${user}>${message.UserNames[index]}</user>`,
      ).join(" "),
    )
    .replace(
      /{Experiment}/g,
      message.Fields?.Discussion
        ? `<discussion=${message.Fields?.DiscussionID}>${message.Fields?.Discussion}</discussion>`
        : `<experiment${message.Fields?.ExperimentID}>${message.Fields?.Experiment}</experiment>`,
    )
    .replace(/{\$Content}/g, message.Fields.Content)
    .replace(
      /{\$TargetName}/g,
      message.Fields.TargetName ||
        storageManager.getObj("userInfo").value?.nickName,
    )
    .replace(/{\$Until}/g, message.Fields.Unitl)
    .replace(/{\$Editor}/g, message.Fields.Editor)
    .replace(/{\$Gold}/g, message.Numbers?.Gold)
    .replace(/undefined/g, "");
  return re;
}

// 处理加载事件
// eslint-disable-next-line max-lines-per-function
const handleLoad = async (noTemplates = true) => {
  if (!storageManager.getObj("userInfo").value?.ID) return;
  if (loading.value) return; // Lock
  if (noMore.value) return;
  loading.value = true;
  try {
    const getMessagesResponse = await getData("/Messages/GetMessages", {
      CategoryID: convertUIIndexToCategoryID(notificationTypeIndexOfUI),
      Take: 20,
      Skip: skip.value,
      NoTemplates: noTemplates,
    });

    if (!noTemplates) {
      templates = getMessagesResponse.Data.Templates;
    }

    const messages = getMessagesResponse.Data.Messages as PMessage[];

    if (messages.length === 0) {
      noMore.value = true;
      showMessage("warning", t("ui.messages.noMore"), { duration: 2000 });
    }

    // eslint-disable-next-line complexity
    const defaultItems = messages.map((message) => {
      const template = templates.find((t: any) => t.ID === message.TemplateID);

      const lang = (
        [
          "Chinese",
          "English",
          "ChineseTraditional",
          "German",
          "French",
          "Japanese",
          "Italian",
          "Polish",
          "Spanish",
          "Ukrainian",
        ].includes(locale.value)
          ? locale.value
          : "Chinese"
      ) as keyof typeof template.Subject;
      return {
        id: message.ID,
        msg_title: fillInTemplate(template.Subject[lang], message),
        msg: fillInTemplate(template.Content[lang], message),
        msg_type: convertCategoryIDToUIIndex(message.CategoryID),
        category: message.Fields?.User
          ? "User"
          : message.Fields?.Discussion
            ? "Discussion"
            : "Experiment",
        tid:
          message.Fields?.UserID ||
          message.Fields?.DiscussionID ||
          message.Fields?.ExperimentID ||
          "",
        name:
          message.Fields?.Discussion ||
          message.Fields?.Experiment ||
          message.Fields?.User ||
          "",
        uid: message.Users[0] || "",
      };
    });

    items.value = [...items.value, ...defaultItems];
    loading.value = false;
    skip.value += 20;
  } catch (error) {
    showMessage("error", String(error), { duration: 5000 });
  }
};

handleLoad(false);
</script>

<style scoped>
.text {
  text-align: center;
  color: #888;
}
</style>
