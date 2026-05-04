<template>
  <BiLayout>
    <template #left>
      <div
        ref="nickname"
        class="cover"
        :style="{
          backgroundImage: `url(${coverUrl})`,
        }"
      >
        <div>
          <img :src="returnImagePath" class="return" @click="goBack" />
          <div
            v-richText="() => parseInline(data.Subject)"
            class="title"
            @click="copySubject"
          ></div>
          <div class="tagContainer">
            <Tag
              v-if="route.params.category"
              :tag="('C-' + route.params.category) as string"
              style="color: aquamarine; font-weight: bold"
              :category="data.Category"
            />
            <Tag
              v-for="(tag, index) in data.Tags.filter((t) => !!t)"
              :key="index"
              :tag="tag"
              :category="data.Category"
            />
          </div>
        </div>
        <div style="margin-top: auto" class="coverBottom">
          <div class="interactionPanel">
            <div class="counterBtn" @click.stop="toggleFavorite">
              <span class="counterIcon">{{ isStarred ? "★" : "☆" }}</span>
              <span>{{ data.Stars }}</span>
            </div>
            <div class="supportRow">
              <div class="counterBtn supportBtn" @click.stop="toggleSupport">
                <span class="counterIcon">{{ isSupported ? "♥" : "♡" }}</span>
              </div>
              <div class="supportersList">
                <img
                  v-for="supporter in visibleSupporters"
                  :key="supporter.id"
                  :src="supporter.avatarUrl"
                  :alt="supporter.nickname"
                  class="supporterAvatar"
                  @click.stop="openSupporterCard(supporter.id)"
                />
                <button
                  v-if="remainingSupporterCount > 0"
                  class="supporterOverflow"
                  type="button"
                  @click.stop="openSupportersModal"
                >
                  +{{ remainingSupporterCount }}
                </button>
              </div>
            </div>
          </div>
          <div
            class="btns"
            style="display: flex; justify-content: space-around"
          >
            <n-button type="info" strong round disabled class="enter">
              {{ t("expeSummary.enterExp") }}
            </n-button>
          </div>
        </div>
      </div>
    </template>

    <template #right>
      <div class="context">
        <n-tabs
          v-model:value="selectedTab"
          justify-content="space-evenly"
          type="line"
        >
          <n-tab-pane name="Intro" :tab="t('expeSummary.introTab')">
            <div class="gray">
              <div
                style="
                  display: flex;
                  height: 60px;
                  background-color: white;
                  border-radius: 10px;
                  margin: 5px;
                "
                @click="showUserCard(data.User.ID)"
              >
                <img
                  :src="avatarUrl"
                  style="margin: auto 10px; height: 90%; border-radius: 50%"
                />
                <div style="text-align: left">
                  <p
                    style="
                      color: #007bff;
                      margin: 2% 0 2% 0;
                      width: 100%;
                      font-size: 16px;
                    "
                  >
                    {{ data.User.Nickname }}
                  </p>
                  <p
                    v-richText="() => parseInline(data.User.Signature)"
                    style="color: gray; margin: 0%; width: 100%"
                  ></p>
                </div>
              </div>
              <div
                style="
                  margin-top: 3%;
                  background-color: white;
                  border-radius: 10px;
                  padding: 10px;
                  margin: 5px;
                "
              >
                <h3
                  style="
                    color: #007bff;
                    text-align: left;
                    margin-top: 2px;
                    margin-bottom: 2px;
                  "
                >
                  {{ t("expeSummary.intro") }}
                </h3>

                <div
                  v-richText="
                    () =>
                      parse(
                        Array.isArray(data.Description)
                          ? data.Description.join('\n')
                          : data.Description,
                        {
                          project: data.Subject,
                          visitorId: storageManager.getObj('userInfo').value.ID,
                          authorId: data.User.ID,
                          coauthorIds: data.Coauthors,
                        },
                      )
                  "
                  class="intro"
                ></div>
                <div>
                  {{ t("expeSummary.wordCount") }}
                </div>
              </div>
            </div>
          </n-tab-pane>
          <n-tab-pane
            name="Comment"
            :tab="`${t('expeSummary.comments')}(${data.Comments})`"
          >
            <div class="right-bottom-container">
              <div class="message-wrapper">
                <MessageList
                  :ID="route.params.id as string"
                  :Category="
                    route.params.category as
                      | 'Experiment'
                      | 'User'
                      | 'Discussion'
                  "
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
                  :maxlength="400"
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
  <n-modal v-model:show="showSupportersModal" preset="dialog">
    <template #header>{{ t("expeSummary.supportersTitle") }}</template>
    <div class="supportersDialogList">
      <div
        v-for="supporter in supporters"
        :key="supporter.id"
        class="supporterItem"
        @click="openSupporterCard(supporter.id)"
      >
        <img
          :src="supporter.avatarUrl"
          :alt="supporter.nickname"
          class="supporterItemAvatar"
        />
        <span>{{ supporter.nickname }}</span>
      </div>
    </div>
  </n-modal>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, onActivated } from "vue";
import { useRoute } from "vue-router";
import { getData } from "@services/api/getData.ts";
import { showAPiError } from "@popup/index.ts";
import { removeToken } from "@services/utils.ts";
import { NTabs, NTabPane, NInput, NButton, NModal } from "naive-ui";
import Tag from "../components/utils/TagLarger.vue";
import MessageList from "../components/messages/MessageList.vue";
import parse from "@services/pltxt2htm/advancedParser";
import parseInline from "@services/pltxt2htm/commonParser";
import showUserCard from "@popup/userProfileDialog.ts";
import postComment from "@services/postComment.ts";
import { getCoverUrl, getUserUrl, getPath } from "@services/utils.ts";
import { getAvatarUrl } from "@services/getUserCurentAvatarByID.ts";
import BiLayout from "../layout/BiLayout.vue";
import "../layout/BiLayout.css";
import { useI18n } from "vue-i18n";
import showActionSheet from "@popup/actionSheet.ts";
import { showMessage } from "@popup/naiveui";
import storageManager from "@storage/index.ts";
import type {
  Category,
  CommentResult,
  SupporterRecord,
} from "@services/../pl-serve-type-main/type/main";

const comment = ref("");
const isLoading = ref(false);
const upDate = ref(1);
// 用于使用watch触发刷新 To trigger a refresh using watch
const replyID = ref("");
const selectedTab = ref("Intro");
const route = useRoute();
const { t } = useI18n();
const isStarred = ref(false);
const isSupported = ref(false);
const showSupportersModal = ref(false);
const returnImagePath = ref(
  getPath("/@base/assets/library/Navigation-Return.png"),
);
type Supporter = {
  id: string;
  nickname: string;
  avatarUrl: string;
};
const supporters = ref<Supporter[]>([]);
const visibleSupporters = computed(() => supporters.value.slice(0, 11));
const remainingSupporterCount = computed(() =>
  Math.max(0, data.value.Supports - visibleSupporters.value.length),
);

const data = ref({
  Type: 0,
  ParentID: null,
  ParentName: null,
  ParentCategory: null,
  ContentID: "642cf37a494746375aae306a",
  Editor: null,
  Coauthors: [],
  Description: ["Loading..."],
  LocalizedDescription: null,
  Tags: ["C-Loading"],
  Visits: 0,
  Stars: 0,
  Supports: 0,
  Remixes: 0,
  Comments: 0,
  Price: 0,
  Popularity: 0,
  ID: "",
  Category: "Discussion",
  Subject: "Loading...",
  LocalizedSubject: null,
  Image: 0,
  ImageRegion: 0,
  User: {
    ID: "0",
    Nickname: "Loading...",
    Signature: "Loading...",
    Avatar: 0,
    AvatarRegion: 0,
    Decoration: 0,
    Verification: "Banned",
  },
});

let coverUrl = ref(getPath("/@base/assets/messages/Experiment-Default.png"));
let avatarUrl = ref(getUserUrl(data.value.User));
async function fetchSummary() {
  const res = await getData(`/Contents/GetSummary`, {
    ContentID: route.params.id,
    Category: route.params.category,
  });
  if (res.Status !== 200) {
    showAPiError(
      t("errors.apiErrorTitle"),
      t("errors.apiErrorMessage", {
        path: "/Contents/GetSummary",
        status: res.Status,
        message: res?.Message || "",
      }),
      fetchSummary,
    );
    const _req = removeToken({
      ContentID: route.params.id,
      Category: route.params.category,
    });
    const _res = removeToken(res);
    window.$ErrorLogger.captureApiError(
      "POST",
      "/Contents/GetSummary",
      res.Status,
      _res,
      _req,
    );
    console.error(`/Contents/GetSummary returned ${res.Status}`, _res);
    return;
  }
  data.value = res.Data;
  avatarUrl.value = getUserUrl(data.value.User);
  await fetchSupporters(30);
  // Civitas-john always procrastinate on addressing the request to solve the anti-leeching issue.
  // That's why the below occurs
  await fetch(getCoverUrl(res.Data), {
    referrerPolicy: "no-referrer",
    mode: "no-cors",
  });
  coverUrl.value = getCoverUrl(res.Data);
}

function normalizeSupporters(
  input: unknown,
): SupporterRecord[] {
  if (!input) return [];
  if (Array.isArray(input)) return input as SupporterRecord[];
  if (typeof input === "object" && input !== null && "$values" in input) {
    const values = (input as { $values?: unknown }).$values;
    if (Array.isArray(values)) return values as SupporterRecord[];
  }
  return [];
}

async function mapSupporter(item: SupporterRecord): Promise<Supporter> {
  const profile = item.User ?? item;
  const id = String(profile.ID || item.UserID || "");
  const nickname = String(profile.Nickname || profile.Name || id || "Unknown");
  let avatarUrl = getPath("/@base/assets/user/default-avatar.png");
  const avatar = profile.Avatar;
  if (id && typeof avatar === "number") {
    avatarUrl = getUserUrl({
      ID: id,
      Avatar: avatar,
      AvatarRegion: Number(profile.AvatarRegion || 0),
    });
  } else if (id) {
    avatarUrl = await getAvatarUrl(id);
  }
  return { id, nickname, avatarUrl };
}

async function fetchSupporters(take = 50) {
  const supportersRes = await getData("/Contents/GetSupporters", {
    ContentID: route.params.id as string,
    Category: route.params.category as string,
    Skip: 0,
    Take: take,
  });
  if (supportersRes.Status !== 200) {
    return;
  }
  const list = normalizeSupporters(supportersRes.Data);
  supporters.value = await Promise.all(list.map((item) => mapSupporter(item)));
  const myID = storageManager.getObj("userInfo")?.value?.ID;
  isSupported.value = Boolean(myID && supporters.value.some((s) => s.id === myID));
}

async function toggleFavorite() {
  const targetStatus = !isStarred.value;
  const res = await getData("/Contents/StarContent", {
    ContentID: route.params.id as string,
    Category: route.params.category as string,
    Status: targetStatus,
    Type: "Star",
  });
  if (res.Status !== 200) {
    showMessage("error", res.Message || t("errors.unknownError"), {
      duration: 2000,
    });
    return;
  }
  isStarred.value = targetStatus;
  data.value.Stars += targetStatus ? 1 : -1;
}

async function toggleSupport() {
  const targetStatus = !isSupported.value;
  const res = await getData("/Contents/StarContent", {
    ContentID: route.params.id as string,
    Category: route.params.category as string,
    Status: targetStatus,
    Type: "Support",
  });
  if (res.Status !== 200) {
    showMessage("error", res.Message || t("errors.unknownError"), {
      duration: 2000,
    });
    return;
  }
  isSupported.value = targetStatus;
  data.value.Supports += targetStatus ? 1 : -1;
  await fetchSupporters(30);
}

function openSupporterCard(id: string) {
  if (!id) return;
  showUserCard(id);
}

async function openSupportersModal() {
  await fetchSupporters(200);
  showSupportersModal.value = true;
}

onMounted(() => {
  fetchSummary();
});

function handleMsgClick(item: CommentResult) {
  replyID.value = item.UserID;
  comment.value = `${t("ui.messages.replyToUser")}@${item.Nickname}: `;
}

async function handleEnter() {
  await postComment(
    comment,
    isLoading,
    route.params.category as Category,
    route.params.id as string,
    replyID,
    upDate,
  );
}

function goBack() {
  window.history.back();
}

function copy(text: string) {
  navigator.clipboard
    .writeText(text)
    .then(() => {
      showMessage("info", t("ui.messages.copySuccess"), { duration: 1000 });
    })
    .catch(() => {
      showMessage("error", t("ui.messages.copyFailed"), { duration: 2000 });
    });
}
// eslint-disable-next-line max-lines-per-function
function copySubject() {
  let list = [
    { label: t("expeSummary.copyID") },
    { label: t("expeSummary.copyInternalLink") },
    { label: t("expeSummary.copyExternalLink") },
  ];
  if (data.value.User.ID === storageManager.getObj("userInfo")?.value?.ID) {
    list.push({ label: t("expeSummary.changeCover") });
  }
  // eslint-disable-next-line max-lines-per-function
  showActionSheet(list, (idx) => {
    if (idx === 0) {
      copy(data.value.ID);
    } else if (idx === 1) {
      copy(
        `<${(route.params.category as string).toLowerCase()}=${route.params.id}>${data.value.Subject}</${(route.params.category as string).toLowerCase()}>`,
      );
    } else if (idx === 2) {
      copy(
        `<external=${window.location.href}>${data.value.Subject}[web]</external>`,
      );
    } else if (idx === 3) {
      try {
        // ask user to select an image
        const input = document.createElement("input");
        input.type = "file";
        input.accept = "image/*";
        // eslint-disable-next-line max-lines-per-function
        input.onchange = async (e: Event) => {
          try {
            const target = e.target as HTMLInputElement | null;
            const file = target?.files?.[0];
            if (!file) return;
            const summaryRes = await getData(`/Contents/GetSummary`, {
              ContentID: route.params.id,
              Category: route.params.category,
            });
            if (summaryRes.Status !== 200) {
              showAPiError(
                t("errors.apiErrorTitle"),
                t("errors.apiErrorMessage", {
                  path: "/Contents/GetSummary",
                  status: summaryRes.Status,
                  message: summaryRes?.Message || "",
                }),
                async () => {
                  return getData(`/Contents/GetSummary`, {
                    ContentID: route.params.id,
                    Category: route.params.category,
                  });
                },
              );
              const _req = removeToken({
                ContentID: route.params.id,
                Category: route.params.category,
              });
              const _res = removeToken(summaryRes);
              window.$ErrorLogger.captureApiError(
                "POST",
                "/Contents/GetSummary",
                summaryRes.Status,
                _res,
                _req,
              );
              console.error(
                `/Contents/GetSummary returned ${summaryRes.Status}`,
                _res,
              );
              return;
            }
            const imageIndex = (summaryRes.Data.Image || 0) + 1;
            const confirmRes = await getData(`/Contents/ConfirmExperiment`, {
              Category: route.params.category,
              SummaryID: route.params.id,
              Image: imageIndex,
              Extension: ".png",
            });
            if (confirmRes.Status !== 200) {
              showAPiError(
                t("errors.apiErrorTitle"),
                t("errors.apiErrorMessage", {
                  path: "/Contents/ConfirmExperiment",
                  status: confirmRes.Status,
                  message: confirmRes?.Message || "",
                }),
                async () => {
                  return getData(`/Contents/ConfirmExperiment`, {
                    Category: route.params.category,
                    SummaryID: route.params.id,
                    Image: imageIndex,
                    Extension: ".png",
                  });
                },
              );
              const _req = removeToken({
                Category: route.params.category,
                SummaryID: route.params.id,
                Image: imageIndex,
                Extension: ".png",
              });
              const _res = removeToken(confirmRes);
              window.$ErrorLogger.captureApiError(
                "POST",
                "/Contents/ConfirmExperiment",
                confirmRes.Status,
                _res,
                _req,
              );
              console.error(
                `/Contents/ConfirmExperiment returned ${confirmRes.Status}`,
                _res,
              );
              return;
            }
            const submitRes = await getData(`/Contents/SubmitExperiment`, {
              Request: {
                FileSize: 0 - Math.abs(file.size),
                Extension: ".jpg",
              },
              Summary: summaryRes.Data,
            });
            if (submitRes.Status !== 200) {
              showAPiError(
                t("errors.apiErrorTitle"),
                t("errors.apiErrorMessage", {
                  path: "/Contents/SubmitExperiment",
                  status: submitRes.Status,
                  message: submitRes?.Message || "",
                }),
                async () => {
                  return getData(`/Contents/SubmitExperiment`, {
                    Request: {
                      FileSize: 0 - Math.abs(file.size),
                      Extension: ".jpg",
                    },
                    Summary: summaryRes.Data,
                  });
                },
              );
              const _req = removeToken({
                Request: {
                  FileSize: 0 - Math.abs(file.size),
                  Extension: ".jpg",
                },
                Summary: summaryRes.Data,
              });
              const _res = removeToken(submitRes);
              window.$ErrorLogger.captureApiError(
                "POST",
                "/Contents/SubmitExperiment",
                submitRes.Status,
                _res,
                _req,
              );
              console.error(
                `/Contents/SubmitExperiment returned ${submitRes.Status}`,
                _res,
              );
              return;
            }
            try {
              const form = new FormData();
              form.append(
                "authorization",
                submitRes.Data?.Token?.Authorization || "",
              );
              form.append("policy", submitRes.Data?.Token?.Policy || "");
              form.append("file", file, "cover.jpg");
              await fetch("https://v0.api.upyun.com/qphysics", {
                method: "POST",
                body: form,
              });
              const confirmRes2 = await getData(`/Contents/ConfirmExperiment`, {
                Category: route.params.category,
                SummaryID: route.params.id,
                Image: imageIndex,
                Extension: ".png",
              });
              if (confirmRes2.Status !== 200) {
                showAPiError(
                  t("errors.apiErrorTitle"),
                  t("errors.apiErrorMessage", {
                    path: "/Contents/ConfirmExperiment",
                    status: confirmRes2.Status,
                    message: confirmRes2?.Message || "",
                  }),
                  async () => {
                    return getData(`/Contents/ConfirmExperiment`, {
                      Category: route.params.category,
                      SummaryID: route.params.id,
                      Image: imageIndex,
                      Extension: ".png",
                    });
                  },
                );
                const _req = removeToken({
                  Category: route.params.category,
                  SummaryID: route.params.id,
                  Image: imageIndex,
                  Extension: ".png",
                });
                const _res = removeToken(confirmRes2);
                window.$ErrorLogger.captureApiError(
                  "POST",
                  "/Contents/ConfirmExperiment",
                  confirmRes2.Status,
                  _res,
                  _req,
                );
                console.error(
                  `/Contents/ConfirmExperiment returned ${confirmRes2.Status}`,
                  _res,
                );
                return;
              }
            } catch (_upErr) {
              showMessage("error", t("ui.messages.uploadFailed"), {
                duration: 2000,
              });
              return;
            }
            showMessage("success", t("ui.messages.uploadSuccess"), {
              duration: 2000,
            });
            // refresh current cover (using existing utility function)
            setTimeout(async () => {
              const refreshed = await getData(`/Contents/GetSummary`, {
                ContentID: route.params.id,
                Category: route.params.category,
              });
              if (refreshed.Status !== 200) {
                showAPiError(
                  t("errors.apiErrorTitle"),
                  t("errors.apiErrorMessage", {
                    path: "/Contents/GetSummary",
                    status: refreshed.Status,
                    message: refreshed?.Message || "",
                  }),
                  async () => {
                    return getData(`/Contents/GetSummary`, {
                      ContentID: route.params.id,
                      Category: route.params.category,
                    });
                  },
                );
                const _req = removeToken({
                  ContentID: route.params.id,
                  Category: route.params.category,
                });
                const _res = removeToken(refreshed);
                window.$ErrorLogger.captureApiError(
                  "POST",
                  "/Contents/GetSummary",
                  refreshed.Status,
                  _res,
                  _req,
                );
                console.error(
                  `/Contents/GetSummary returned ${refreshed.Status}`,
                  _res,
                );
                return;
              }
              coverUrl.value = getCoverUrl(refreshed.Data);
            }, 800);
          } catch (_err) {
            showMessage(
              "error",
              t("ui.messages.changeCoverFailed"),
              { duration: 2000 },
            );
          }
        };
        input.click();
      } catch (_error) {
        showMessage("error", t("errors.unknownError"), {
          duration: 2000,
        });
      }
    }
  });
}

onActivated(() => {
  window.$Logger.logPageView({
    pageLink: `/${route.params.category}/${route.params.id}/`,
    timeStamp: Date.now(),
  });
});
</script>

<style scoped>
/* Be careful with inline CSS  */
.return {
  width: 2.7em;
}

.tagContainer {
  position: absolute;
  z-index: 100;
}
.title {
  color: white;
  font-size: 1.7em;
  text-align: left;
  position: relative;
  z-index: 30;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.cover {
  padding: 20px;
  position: absolute;
  height: 100%;
  width: 100%;
  background-repeat: no-repeat;
  background-size: cover;
  background-position: 40% 70%;
  background-color: #333;
}

.interactionPanel {
  position: absolute;
  left: 20px;
  bottom: 120px;
  display: none;
  flex-direction: column;
  gap: 14px;
  z-index: 120;
}

.counterBtn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  min-height: 42px;
  border-radius: 22px;
  background: rgba(0, 0, 0, 0.42);
  color: #fff;
  font-size: 28px;
  line-height: 1;
  padding: 8px 20px;
  cursor: pointer;
  user-select: none;
}

.counterIcon {
  font-size: 44px;
  line-height: 0.7;
}

.supportRow {
  display: flex;
  align-items: center;
  gap: 10px;
}

.supportBtn {
  min-width: 42px;
  justify-content: center;
}

.supportersList {
  display: flex;
  align-items: center;
}

.supporterAvatar,
.supporterOverflow {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  border: 2px solid rgba(255, 255, 255, 0.2);
  margin-left: -10px;
}

.supporterAvatar:first-child,
.supporterOverflow:first-child {
  margin-left: 0;
}

.supporterOverflow {
  color: #fff;
  background: rgba(20, 86, 150, 0.78);
  border: none;
  font-size: 18px;
  cursor: pointer;
}

.supportersDialogList {
  max-height: 52vh;
  overflow-y: auto;
}

.supporterItem {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 0;
  cursor: pointer;
}

.supporterItemAvatar {
  width: 38px;
  height: 38px;
  border-radius: 50%;
}

.context {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
}

.intro :deep(img) {
  max-width: 100%;
  height: auto;
}

.context .n-tabs {
  flex: 1 1 auto;
  min-height: 0;
  display: flex;
  flex-direction: column;
}

.context .n-tab-pane,
.context .n-tab-pane__content {
  flex: 1 1 auto;
  min-height: 0;
  display: flex;
  flex-direction: column;
}

.enter {
  display: none;
}

.gray {
  width: 98%;
  margin: 5px;
  flex: 1 1 auto;
  overflow-y: auto;
  border-radius: 10px;
  background-color: #eee;
  margin-bottom: 10px;
}

@media (min-aspect-ratio: 1/1) {
  .gray {
    width: calc(100% - 30px);
  }

  .title {
    font-size: x-large;
  }

  .enter {
    display: flex;
    position: absolute;
    padding: 10px 10%;
    width: 80%;
    bottom: 50px;
  }

  .interactionPanel {
    display: flex;
  }
}

@media (max-aspect-ratio: 1/1) {
  .return {
    display: block;
  }
}

.sendComment {
  width: 97%;
  margin: 0 auto;
}

div {
  box-sizing: border-box;
}
</style>
