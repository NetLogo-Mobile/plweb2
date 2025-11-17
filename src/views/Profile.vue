<template>
  <BiLayout>
    <template #left>
      <div
        class="cover"
        :style="{
          backgroundImage: `url(${coverUrl})`,
          backgroundRepeat: 'no-repeat',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }"
      >
        <div class="userInfo">
          <img
            src="/assets/library/Navigation-Return.png"
            style="width: 2.7em"
            class="return"
            @click="goBack"
          />
          <div
            style="color: white; font-size: 2em; text-align: left"
            @click="copyUser()"
          >
            {{ userData.User.Nickname }}
          </div>
          <Tag
            category="User"
            :tag="
              userData.User?.Verification
                ? 'C-' + userData.User?.Verification
                : 'C-user'
            "
            style="color: aquamarine; font-weight: bold"
          ></Tag>
          <Tag
            category="User"
            :tag="
              t('profile.fans', { count: userData.Statistic.FollowerCount })
            "
          ></Tag>
          <Tag
            category="User"
            :tag="
              t('profile.follows', { count: userData.Statistic.FollowingCount })
            "
          ></Tag>
        </div>
        <div v-if="userData.Statistic?.Cover" class="coverProject coverBottom">
          <router-link
            :to="
              '/experimentSummary/' +
              userData.Statistic.Cover?.Category +
              '/' +
              userData.Statistic.Cover?.ID
            "
            style="
              color: white;
              text-align: left;
              text-decoration: none;
              z-index: 30;
              position: relative;
            "
          >
            <p style="margin: 0; font-size: smaller">
              {{ t("profile.coverTip") }}
            </p>
            <p style="margin: 0; font-size: medium">
              {{ userData.Statistic.Cover?.Subject }}
            </p>
          </router-link>
        </div>
      </div>
    </template>
    <template #right>
      <div class="container">
        <n-tabs
          v-model:value="selectedTab"
          justify-content="space-evenly"
          type="line"
        >
          <n-tab-pane name="Intro" :tab="t('profile.works')" animated>
            <div id="project-list" class="projects">
              <div v-for="[t, d] in Object.entries(expData)" :key="t">
                <Block
                  v-if="d.length > 0"
                  :title="t"
                  :data="d"
                  :block-type="d[0].Category"
                  :link="EncodeAPITargetLink(getLink(t))"
                />
              </div>
            </div>
          </n-tab-pane>
          <n-tab-pane
            name="Comment"
            :tab="
              t('profile.comments', { count: userData.Statistic.CommentCount })
            "
          >
            <div class="right-bottom-container">
              <div class="message-wrapper">
                <MessageList
                  :ID="route.params.id as string"
                  :Category="'User'"
                  :upDate="upDate"
                  @msgClick="handleMsgClick"
                />
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
            </div>
          </n-tab-pane>
        </n-tabs>
      </div>
    </template>
  </BiLayout>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRoute } from "vue-router";
import { getData } from "@services/api/getData.ts";
import { NTabs, NTabPane, NInput } from "naive-ui";
import Tag from "../components/utils/TagLarger.vue";
import MessageList from "../components/messages/MessageList.vue";
import Block from "../components/blocks/Block.vue";
import postComment from "@services/postComment.ts";
import BiLayout from "../layout/BiLayout.vue";
import "../layout/BiLayout.css";
import {
  getCoverUrl,
  getUserUrl,
  EncodeAPITargetLink,
} from "@services/utils.ts";
import { useI18n } from "vue-i18n";
import showActionSheet from "@popup/actionSheet.ts";
import { showMessage } from "@popup/naiveui";

const { t } = useI18n();
let comment = ref("");
let isLoading = ref(false);
let upDate = ref(1);
let replyID = ref("");

const selectedTab = ref("Intro");
const route = useRoute();

let coverUrl = ref("");

let userData = ref({
  User: {
    ID: "",
    Nickname: "Loading...",
    Signature: "",
    Verification: "loading...",
    Avatar: 322,
    AvatarRegion: 0,
    Decoration: 0,
    Gold: 17900,
    Diamond: 2683,
    Fragment: 116,
    Level: 25,
    Experience: 62225,
    Prestige: 18,
    Subscription: 1,
    SubscriptionUntil: "",
    IsBinded: true,
    Regions: [1],
  },
  Statistic: {
    Cover: {
      ID: "",
      Category: "",
      Subject: "",
      Image: 1,
    },
    CommentCount: 0,
    ExperimentCount: 0,
    FollowerCount: 0,
    FollowingCount: 0,
  },
});

interface ExpDataType {
  [key: string]: any[];
}
let expData = ref<ExpDataType>({});

onMounted(async () => {
  const expRes = await getData(`/Contents/GetProfile`, {
    ID: route.params.id,
  });
  expData.value = expRes.Data.Experiments;
  const userRes = await getData(`/Users/GetUser`, {
    ID: route.params.id,
  });
  userData.value = userRes.Data;
  // Civitas-john always procrastinate on addressing the request to solve the anti-leeching issue.
  // That's why the below occurs
  const _url = userData.value.Statistic.Cover
    ? getCoverUrl(userData.value.Statistic.Cover)
    : getUserUrl(userRes.Data.User);
  await fetch(_url, {
    referrerPolicy: "no-referrer",
    mode: "no-cors",
  });
  coverUrl.value = _url;
  window.$Logger.logPageView({
    pageLink: `/User/${route.params.id}/`,
    timeStamp: Date.now(),
  });
});

function handleMsgClick(item: any) {
  replyID.value = item.userID;
  comment.value = `回复@${item.msg_title}: `;
}

async function handleEnter() {
  await postComment(
    comment,
    isLoading,
    "User",
    route.params.id as string,
    replyID,
    upDate,
  );
}

function goBack() {
  window.history.back();
}

function getLink(name: string) {
  switch (name) {
    case "Latest-Experiments":
      return `experiments://UserID/${route.params.id}`;
    case "Featured-Experiments":
      return `experiments://UserID/${route.params.id}/Tags/精选`;
    case "Latest-Discussions":
      return `discussions://UserID/${route.params.id}`;
    case "Featured-Discussions":
      return `discussions://UserID/${route.params.id}/Tags/精选`;
    case "Popular-Discussions":
      return `discussions://UserID/${route.params.id}/Sort/2`;
    case "Popular-Experiments":
      return `experiments://UserID/${route.params.id}/Sort/2`;
    default:
      return `discussions://user${route.params.id}`;
  }
}

function copy(text: string) {
  navigator.clipboard
    .writeText(text)
    .then(() => {
      showMessage("info", "copied", { duration: 1000 });
    })
    .catch(() => {
      showMessage("error", "failed to copy text", { duration: 2000 });
    });
}

function copyUser() {
  showActionSheet(
    [
      { label: t("profile.copyID") },
      { label: t("profile.copyInternalLink") },
      { label: t("profile.copyExternalLink") },
    ],
    (idx) => {
      if (idx === 0) {
        copy(userData.value.User.ID);
      } else if (idx === 1) {
        copy(
          `<user=${userData.value.User.ID}>${userData.value.User.Nickname}</user>`,
        );
      } else if (idx === 2) {
        copy(
          `<external=${window.location.href}>${userData.value.User.Nickname}[web]</external>`,
        );
      }
    },
  );
}
</script>

<style scoped>
.userInfo {
  text-align: left;
  z-index: 10;
  position: relative;
}
.container {
  text-align: center;
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
  position: relative;
}

.cover {
  position: absolute;
  height: 100%;
  width: 100%;
  padding: 20px;
}

.projects {
  width: 98%;
  margin: 5px;
  flex: 1 1 auto;
  min-height: 0;
  display: flex;
  flex-direction: column;
  gap: 5px;
  overflow-y: auto;
  padding: 10px 10px 50px;
  background-color: rgba(128, 128, 128, 0.05);
  border-radius: 6px;
}

.container .n-tabs {
  flex: 1 1 auto;
  min-height: 0;
  display: flex;
  flex-direction: column;
}

.container .n-tab-pane,
.container .n-tab-pane__content {
  flex: 1 1 auto;
  min-height: 0;
  display: flex;
  flex-direction: column;
}

.coverProject {
  position: absolute;
  bottom: 30px;
  left: 20px;
  right: 20px;
  color: white;
  height: 55px;
  background-color: rgba(128, 128, 128, 0.4);
  border-radius: 10px;
  padding: 8px;
}

@media (max-aspect-ratio: 1/1) {
  .return {
    display: none;
  }
}

div {
  box-sizing: border-box;
}
</style>
