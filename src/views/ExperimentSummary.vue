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
            class="title"
            @click="copySubject"
            v-html="parseInline(data.Subject)"
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
                    style="color: gray; margin: 0%; width: 100%"
                    v-html="parseInline(data.User.Signature)"
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

                <div class="intro" v-html="parse(data.Description)"></div>
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
</template>

<script setup lang="ts">
import { ref, onMounted, onActivated } from "vue";
import { useRoute } from "vue-router";
import { getData } from "@services/api/getData.ts";
import { NTabs, NTabPane, NInput, NButton } from "naive-ui";
import Tag from "../components/utils/TagLarger.vue";
import MessageList from "../components/messages/MessageList.vue";
import parse from "@services/advancedParser.ts";
import parseInline from "@services/commonParser.ts";
import showUserCard from "@popup/userProfileDialog.ts";
import postComment from "@services/postComment.ts";
import { getCoverUrl, getUserUrl, getPath } from "@services/utils.ts";
import BiLayout from "../layout/BiLayout.vue";
import "../layout/BiLayout.css";
import { useI18n } from "vue-i18n";
import showActionSheet from "@popup/actionSheet.ts";
import { showMessage } from "@popup/naiveui";
import storageManager from "@storage/index.ts";

const comment = ref("");
const isLoading = ref(false);
const upDate = ref(1); // 用于使用watch触发刷新 To trigger a refresh using watch
const replyID = ref("");
const selectedTab = ref("Intro");
const route = useRoute();
const { t } = useI18n();
const returnImagePath = ref(
  getPath("/@base/assets/library/Navigation-Return.png"),
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
onMounted(async () => {
  const res = await getData(`/Contents/GetSummary`, {
    ContentID: route.params.id,
    Category: route.params.category,
  });
  data.value = res.Data;
  avatarUrl.value = getUserUrl(data.value.User);
  // Civitas-john always procrastinate on addressing the request to solve the anti-leeching issue.
  // That's why the below occurs
  await fetch(getCoverUrl(res.Data), {
    referrerPolicy: "no-referrer",
    mode: "no-cors",
  });
  coverUrl.value = getCoverUrl(res.Data);
});

function handleMsgClick(item: any) {
  replyID.value = item.userID;
  comment.value = `回复@${item.msg_title}: `;
}

async function handleEnter() {
  await postComment(
    comment,
    isLoading,
    route.params.category as string,
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
      showMessage("info", "copied", { duration: 1000 });
    })
    .catch(() => {
      showMessage("error", "failed to copy text", { duration: 2000 });
    });
}
// eslint-disable-next-line max-lines-per-function
function copySubject() {
  let list = [
    { label: t("expeSummary.copyID") },
    { label: t("expeSummary.copyInternalLink") },
    { label: t("expeSummary.copyExternalLink") },
  ];
  if (data.value.User.ID === storageManager.getObj("userInfo")?.value?.id) {
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
        input.onchange = async (e: any) => {
          try {
            const file = e.target.files && e.target.files[0];
            if (!file) return;
            const summaryRes = await getData(`/Contents/GetSummary`, {
              ContentID: route.params.id,
              Category: route.params.category,
            });
            const imageIndex = (summaryRes.Data.Image || 0) + 1;
            await getData(`/Contents/ConfirmExperiment`, {
              Category: route.params.category,
              SummaryID: route.params.id,
              Image: imageIndex,
              Extension: ".png",
            });
            const submitRes = await getData(`/Contents/SubmitExperiment`, {
              Request: {
                FileSize: 0 - Math.abs(file.size),
                Extension: ".jpg",
              },
              Summary: summaryRes.Data,
            });
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
              await getData(`/Contents/ConfirmExperiment`, {
                Category: route.params.category,
                SummaryID: route.params.id,
                Image: imageIndex,
                Extension: ".png",
              });
            } catch (_upErr) {
              showMessage("error", "Failed to upload file", { duration: 2000 });
              return;
            }
            showMessage("success", "Cover changed successfully", {
              duration: 2000,
            });
            // refresh current cover (using existing utility function)
            setTimeout(async () => {
              const refreshed = await getData(`/Contents/GetSummary`, {
                ContentID: route.params.id,
                Category: route.params.category,
              });
              coverUrl.value = getCoverUrl(refreshed.Data);
            }, 800);
          } catch (_err) {
            showMessage(
              "error",
              "Failed to change cover, please try again later",
              { duration: 2000 },
            );
          }
        };
        input.click();
      } catch (_error) {
        showMessage("error", "Unknown error, please try again later", {
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

.context {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
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
}

@media (max-aspect-ratio: 1/1) {
  .return {
    display: blobk;
    /* 等到做了收藏和支持，这里会被隐藏 */
    /* Wait until you do the collection and support, this will be hidden */
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
