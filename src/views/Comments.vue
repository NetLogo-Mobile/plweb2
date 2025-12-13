<template>
  <Header>
    <div class="header">
      <img
        src="/assets/library/Navigation-Return.png"
        style="width: 3em"
        @click="goBack"
      />
      <div class="title">
        {{ title }}
      </div>
      <img
        src="/assets/library/Button-Category.png"
        style="width: 3em; margin-left: auto"
      />
    </div>
  </Header>
  <div class="list">
    <MessagesList
      :Category="route.params.category as 'Discussion' | 'Experiment' | 'User'"
      :ID="route.params.id as string"
      :upDate="upDate"
      @msgClick="handleMsgClick"
    ></MessagesList>
  </div>
  <div class="sendComment">
    <n-input
      v-model:value="comment"
      style="text-align: left"
      type="text"
      :placeholder="t('comments.placeholder')"
      show-count
      :maxlength="300"
      :loading="isLoading"
      @keyup.enter="handleEnter"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import MessagesList from "../components/messages/MessageList.vue";
import { useRoute } from "vue-router";
import Header from "../components/utils/Header.vue";
import parse from "@services/pltxt2htm/commonParser";
import postComment from "@services/postComment.ts";
import { useI18n } from "vue-i18n";
import { NInput } from "naive-ui";

const { t } = useI18n();
const route = useRoute();
let isLoading = ref(false);
let replyID = ref("");
let upDate = ref(0);
let title = ref(
  `${parse(route.params.name as string)} 的 ${route.params.category === "User" ? t("comments.home") : t("comments.area")}`,
);
let comment = ref(""); // 输入的内容 Input content

const goBack = () => {
  window.history.back();
};

function handleMsgClick(item: any) {
  replyID.value = item.userID;
  comment.value = `回复@${item.msg_title}: `;
  // Replace it with i18n later
}

const handleEnter = async () => {
  await postComment(
    comment,
    isLoading,
    route.params.category as string,
    route.params.id as string,
    replyID,
    upDate,
  );
};
</script>

<style scoped>
.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  width: 100%;
  padding-right: 20px;
}

.title {
  font: 1.4em sans-serif;
  white-space: nowrap;
  z-index: 0;
}

.list {
  padding-left: 5px;
  padding-top: 60px;
  height: calc(100dvh - 50px);
}

.sendComment {
  width: 97%;
  margin: 0 auto;
}

@media (min-aspect-ratio: 1/1) {
  .list {
    padding-left: 20px;
  }
}
</style>
