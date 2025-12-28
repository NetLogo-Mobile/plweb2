<template>
  <!-- Also called: UserProfile(Not userProfileDialog) -->
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
        <!-- Top header row: Back button and Settings button (landscape only) -->
        <div class="cover-header">
          <img
            src="/assets/library/Navigation-Return.png"
            style="width: 2.7em"
            class="return"
            @click="goBack"
          />
          <!-- Settings button for own profile (landscape only) -->
          <button
            v-if="isOwnProfile"
            class="settings-btn settings-btn-header"
            :title="t('settings.settings')"
            @click="goToSettings"
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <!-- Modern settings icon -->
              <circle cx="12" cy="12" r="2.5" fill="white" />
              <path
                d="M12 2C11.7348 2 11.4804 2.1054 11.2929 2.2929C11.1054 2.4804 11 2.7348 11 3V4C11 4.2652 10.8946 4.5196 10.7071 4.7071C10.5196 4.8946 10.2652 5 10 5H9.5C9.2348 5 8.9804 4.8946 8.7929 4.7071C8.6054 4.5196 8.5 4.2652 8.5 4V3C8.5 2.7348 8.3946 2.4804 8.2071 2.2929C8.0196 2.1054 7.7652 2 7.5 2C6.5 2 5.5 2.5 5.5 3.5C5.5 4 5.8 4.5 6 5C4 6 2 8 2 10.5C2 14.09 5.13 17 9 17C9.45 17 9.87 16.96 10.29 16.88C10.4725 16.9533 10.6725 17 10.88 17H13.12C13.3275 17 13.5275 16.9533 13.71 16.88C14.13 16.96 14.55 17 15 17C18.87 17 22 14.09 22 10.5C22 8 20 6 18 5C18.2 4.5 18.5 4 18.5 3.5C18.5 2.5 17.5 2 16.5 2C16.2348 2 15.9804 2.1054 15.7929 2.2929C15.6054 2.4804 15.5 2.7348 15.5 3V4C15.5 4.2652 15.3946 4.5196 15.2071 4.7071C15.0196 4.8946 14.7652 5 14.5 5H14C13.7348 5 13.4804 4.8946 13.2929 4.7071C13.1054 4.5196 13 4.2652 13 4V3C13 2.7348 12.8946 2.4804 12.7071 2.2929C12.5196 2.1054 12.2652 2 12 2Z"
                fill="white"
              />
            </svg>
          </button>
        </div>
        <div class="userInfo">
          <!-- User name row with settings button (portrait only) -->
          <div class="user-name-row">
            <div
              style="color: white; font-size: 2em; text-align: left; flex: 1"
              @click="copyUser()"
            >
              {{ userData.User.Nickname }}
            </div>
            <!-- Settings button for own profile (portrait only) -->
            <button
              v-if="isOwnProfile"
              class="settings-btn settings-btn-portrait"
              :title="t('settings.settings')"
              @click="goToSettings"
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <!-- Modern settings icon -->
                <circle cx="12" cy="12" r="2.5" fill="white" />
                <path
                  d="M12 2C11.7348 2 11.4804 2.1054 11.2929 2.2929C11.1054 2.4804 11 2.7348 11 3V4C11 4.2652 10.8946 4.5196 10.7071 4.7071C10.5196 4.8946 10.2652 5 10 5H9.5C9.2348 5 8.9804 4.8946 8.7929 4.7071C8.6054 4.5196 8.5 4.2652 8.5 4V3C8.5 2.7348 8.3946 2.4804 8.2071 2.2929C8.0196 2.1054 7.7652 2 7.5 2C6.5 2 5.5 2.5 5.5 3.5C5.5 4 5.8 4.5 6 5C4 6 2 8 2 10.5C2 14.09 5.13 17 9 17C9.45 17 9.87 16.96 10.29 16.88C10.4725 16.9533 10.6725 17 10.88 17H13.12C13.3275 17 13.5275 16.9533 13.71 16.88C14.13 16.96 14.55 17 15 17C18.87 17 22 14.09 22 10.5C22 8 20 6 18 5C18.2 4.5 18.5 4 18.5 3.5C18.5 2.5 17.5 2 16.5 2C16.2348 2 15.9804 2.1054 15.7929 2.2929C15.6054 2.4804 15.5 2.7348 15.5 3V4C15.5 4.2652 15.3946 4.5196 15.2071 4.7071C15.0196 4.8946 14.7652 5 14.5 5H14C13.7348 5 13.4804 4.8946 13.2929 4.7071C13.1054 4.5196 13 4.2652 13 4V3C13 2.7348 12.8946 2.4804 12.7071 2.2929C12.5196 2.1054 12.2652 2 12 2Z"
                  fill="white"
                />
              </svg>
            </button>
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
import { useRoute, useRouter } from "vue-router";
import { getData } from "@services/api/getData.ts";
import { showAPiError } from "@popup/index.ts";
import { removeToken } from "@services/utils.ts";
import { NTabs, NTabPane, NInput } from "naive-ui";
import Tag from "../components/utils/TagLarger.vue";
import MessageList from "../components/messages/MessageList.vue";
import storageManager from "@services/storage";
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
let isOwnProfile = ref(false);

const selectedTab = ref("Intro");
const route = useRoute();
const router = useRouter();

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
    Gold: 0,
    Diamond: 0,
    Fragment: 0,
    Level: 0,
    Experience: 0,
    Prestige: 0,
    Subscription: 0,
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

// Despite called ExpDataType, expData actually contains disccusions as well
interface ExpDataType {
  [key: string]: any[];
  // key is the tab name, value is the array of experiments/discussions
  // Server will respond with up to 4 tabs, but we donnot konw their names in advance
}
let expData = ref<ExpDataType>({});

async function fetchProfile() {
  const expRes = await getData(`/Contents/GetProfile`, {
    ID: route.params.id,
  });
  if (expRes?.Status !== 200) {
    showAPiError(
      t("errors.apiErrorTitle"),
      t("errors.apiErrorMessage", {
        path: "/Contents/GetProfile",
        status: expRes?.Status,
        message: expRes?.Message || "",
      }),
      fetchProfile,
    );
    const _req = removeToken({ ID: route.params.id });
    const _res = removeToken(expRes);
    window.$ErrorLogger.captureApiError("POST", "/Contents/GetProfile", expRes?.Status, _res, _req);
    console.error(`/Contents/GetProfile returned ${expRes?.Status}`, _res);
    return;
  }
  expData.value = expRes.Data.Experiments;
  const userRes = await getData(`/Users/GetUser`, {
    ID: route.params.id,
  });
  userData.value = userRes.Data;

  // Check if viewing own profile
  const currentUser = storageManager.getObj("userInfo")?.value;
  if (currentUser && currentUser.ID === route.params.id) {
    isOwnProfile.value = true;
  }

  // Civitas-john always procrastinate on addressing the request to solve the anti-leeching issue.
  // That's why the below occurs
  // hmmm...When use in https://plweb.turtlesim.com,abti-leeching issue does not occur
  // So does it really works? No one knows...
  const _url = userData.value.Statistic.Cover
    ? getCoverUrl(userData.value.Statistic.Cover)
    : getUserUrl(userRes.Data.User);
  await fetch(_url, {
    // We annot get the response with mode: "no-cors"
    // But the browser will (缓存) cache the image anyway
    referrerPolicy: "no-referrer",
    mode: "no-cors",
  });
  coverUrl.value = _url;
  window.$Logger.logPageView({
    pageLink: `/User/${route.params.id}/`,
    timeStamp: Date.now(),
  });
}

onMounted(() => {
  fetchProfile();
});

function handleMsgClick(item: any) {
  replyID.value = item.userID;
  comment.value = `回复@${item.msg_title}: `;
  // Replace it with i18n later
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

function goToSettings() {
  router.push("/settings");
}

// Sort 2 means soted by popularity; Sort 1 means sorted by latest;Sort 3 means random sorted
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

// Copy text to clipboard
// It well be replaced with a better method later
// 此方法兼容性不足，日后替换
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

.user-name-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
}

.cover-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: relative;
  z-index: 15;
  gap: 8px;
  margin-bottom: 12px;
}

.settings-btn {
  background: rgba(255, 255, 255, 0.15);
  border: none;
  border-radius: 50%;
  width: 44px;
  height: 44px;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  flex-shrink: 0;
  backdrop-filter: blur(10px);
}

.settings-btn:hover {
  background: rgba(255, 255, 255, 0.25);
  transform: rotate(20deg);
}

.settings-btn:active {
  transform: rotate(20deg) scale(0.95);
}

.settings-btn svg {
  filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.3));
}

/* Landscape: Show header settings button, hide portrait button */
.settings-btn-header {
  display: flex;
}

.settings-btn-portrait {
  display: none;
}

/* Portrait: Hide header, show in user name row */
@media (max-aspect-ratio: 1/1) {
  .return {
    display: none;
  }
  
  .cover-header {
    display: none;
  }
  
  .settings-btn-header {
    display: none;
  }
  
  .settings-btn-portrait {
    display: flex;
  }
  
  .user-name-row {
    justify-content: flex-start;
  }
  
  .settings-btn {
    width: 40px;
    height: 40px;
  }
  
  .settings-btn svg {
    width: 20px;
    height: 20px;
  }
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
  
  .user-name-row {
    justify-content: flex-start;
  }
  
  .settings-btn {
    width: 40px;
    height: 40px;
  }
  
  .settings-btn svg {
    width: 20px;
    height: 20px;
  }
}

div {
  box-sizing: border-box;
}
</style>
