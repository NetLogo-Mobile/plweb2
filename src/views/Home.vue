<template>
  <div id="home">
    <Header>
      <div class="user" @click="showModalFn">
        <img
          class="avatar"
          :src="
            user.avatarUrl || getPath('/@base/assets/user/default-avatar.png')
          "
          alt="Avatar"
        />
        <div class="user-info">
          <div class="username">{{ user.username }}</div>
          <div class="level">{{ $t("user.level") }} {{ user.level }}</div>
        </div>
        <div class="resources">
          <div class="resource">
            <img
              class="icon"
              :src="getPath('/@base/assets/icons/coins.png')"
              alt="Coins"
            />
            <span>{{ user.coins }}</span>
          </div>
          <div class="resource">
            <img
              class="icon gems"
              :src="getPath('/@base/assets/icons/gems.png')"
              alt="Gems"
            />
            <span>{{ user.gems }}</span>
          </div>
        </div>
      </div>
    </Header>
    <main>
      <div v-show="isLoading" class="loading"></div>
      <div v-show="!isLoading" class="block-container">
        <n-grid :x-gap="12" :y-gap="12" :cols="blockItemsPerRow">
          <!-- <n-gi>
            <Actions />
          </n-gi> -->
          <n-gi
            v-for="block in blocks.filter((i: any) => i.Summaries.length > 0)"
            :key="block.Subject"
          >
            <div class="block">
              <TopicBlock
                v-if="
                  block.$type.startsWith('Quantum.Models.Contents.TopicBlock')
                "
                type="Experiment"
                :projects="block.Summaries"
                :activityName="block.AuxiliaryText"
                :activityBackground="getPath('/@base/assets/support.png')"
                :projectsName="block.Subject"
                :link="EncodeAPITargetLink(block.TargetLink)"
              />
              <Block
                v-else
                type="Experiment"
                :data="block.Summaries.slice(0, maxProjectsPerBlock)"
                :title="block.Header"
                :link="EncodeAPITargetLink(block.TargetLink)"
              />
            </div>
          </n-gi>
        </n-grid>
      </div>
    </main>
  </div>
  <Footer></Footer>
</template>

<script setup lang="ts">
import { ref, onMounted, onActivated } from "vue";
import { NGi, NGrid } from "naive-ui";
import router from "../router";
import { EncodeAPITargetLink, getPath, getUserUrl } from "@services/utils";
import "../layout/loading.css";
import "../layout/startPage.css";
import sm from "@storage/index.ts";
import { useI18n } from "vue-i18n";
import Emitter from "@services/eventEmitter";
import { useResponsive } from "../layout/useResponsive.ts";
import { login } from "@api/getData";
import Header from "../components/utils/Header.vue";
import Footer from "../components/utils/Footer.vue";
import Block from "../components/blocks/Block.vue";
import TopicBlock from "../components/blocks/TopicBlock.vue";
import { showLoginModel } from "@popup/index";

const isLoading = ref(true);
const blocks = ref<any>([]);
const { t } = useI18n();

const _user = sm.getObj("userInfo")?.value;
const user =
  _user?.Avatar >= 1
    ? ref({
        coins: _user.Gold,
        gems: _user.Diamond,
        level: _user.Level,
        username: _user.Nickname,
        avatarUrl: getUserUrl(_user),
        ID: _user.ID,
      })
    : ref({
        coins: 0,
        gems: 0,
        level: 0,
        username: t("user.clickToLogin"),
        avatarUrl: getPath("/@base/assets/user/default-avatar.png"),
        ID: "",
      });

const { blockItemsPerRow, maxProjectsPerBlock } = useResponsive();

onMounted(async () => {
  const ua = sm.getObj("userAuthInfo");
  if (ua.status === "success" && ua.value?.token != null) {
    const res = await login(ua.value.token, ua.value.authCode, true);
    user.value = {
      coins: res.Data.User.Gold,
      gems: res.Data.User.Diamond,
      level: res.Data.User.Level,
      username: res.Data.User.Nickname,
      avatarUrl: getUserUrl(res.Data.User),
      ID: res.Data.User.ID,
    };
  }
  const res = await login(null, null);
  loadPageData(res);
});

onActivated(() => {
  window.$Logger.logPageView({
    pageLink: "/",
    timeStamp: Date.now(),
  });
});

Emitter.on("userLogin", (res) => {
  user.value = {
    coins: res.Data.User.Gold,
    gems: res.Data.User.Diamond,
    level: res.Data.User.Level,
    username: res.Data.User.Nickname,
    avatarUrl: getUserUrl(res.Data.User),
    ID: res.Data.User.ID,
  };
});

async function loadPageData(response: any) {
  isLoading.value = false;
  Emitter.emit("updateTagConfig", response.Data.ContentTags);
  blocks.value = [...response.Data.Library.Blocks];
  const userData = response.Data.User;
  if (user.value.avatarUrl.length < 30) {
    user.value = {
      coins: userData.Gold,
      gems: userData.Diamond,
      level: userData.Level,
      username: userData.Nickname || t("user.clickToLogin"),
      avatarUrl: getUserUrl(userData),
      ID: userData.ID,
    };
  }

  window.$Logger.logPageView({
    pageLink: "/Account/Login/",
    timeStamp: Date.now(),
  });
}

function showModalFn() {
  if (sm.getObj("userInfo").value?.Nickname) {
    router.push(`/profile/${user.value.ID}`);
    window.$Logger.logPageView({
      pageLink: "/Profile/",
      timeStamp: Date.now(),
    });
  } else {
    showLoginModel();
  }
}
</script>

<style scoped>
/* Header插槽 start */
.user {
  display: flex;
  align-items: center;
}

.avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
}

.user-info {
  flex-grow: 1;
  padding-left: 10px;
}

.username {
  white-space: nowrap;
  text-align: center;
}

.level {
  color: #777;
  white-space: nowrap;
}

.resources {
  display: flex;
  align-items: center;
}

.resource {
  display: flex;
  align-items: center;
  margin-left: 10px;
}

.icon {
  width: 20px;
  height: 20px;
  margin-right: 5px;
  margin-left: 5px;
}

.gems {
  height: 28px;
  width: 28px;
}
/* Header插槽 end */

.block {
  height: 100%;
}

.div {
  box-sizing: border-box;
}
</style>
