<template>
  <div class="container" :style="{ zIndex: 100 }" @click="close">
    <div class="user" @click.stop="">
      <div class="user-info">
        <img
          :src="avatar"
          alt="User Avatar"
          class="avatar"
          @click="jumpToUser(props.userid)"
        />
        <!-- 阻止冒泡，使得只有点击遮罩才关闭 -->
        <!-- Prevents bubbling, so that only clicking on the overlay will close it -->
        <p class="username">{{ name }}</p>
        <p class="snt">{{ snt || t("user.noSignature") }}</p>
      </div>
      <div class="stats">
        <div class="stat-item">
          <span>{{ t("userCard.following") + followingCount }}</span>
        </div>
        <div class="stat-item">
          <span>{{ t("userCard.follower") + followerCount }}</span>
        </div>
      </div>
      <div class="data">
        <div class="num">
          <div>{{ postCount }}</div>
          <div>{{ starCount }}</div>
          <div>{{ fragmentCount }}</div>
        </div>
        <div class="num">
          <img
            src="/assets/user/Image-Experiments.png"
            style="filter: brightness(0.9); height: 25px"
          />
          <img
            src="/assets/user/Image-Stars.png"
            style="filter: brightness(0.9); height: 25px"
          />
          <img
            src="/assets/user/Image-Prestige.png"
            style="filter: brightness(0.9); height: 25px"
          />
        </div>
      </div>
      <button v-show="!isFollowing" class="follow-button" @click="followUser">
        {{ t("userCard.follow") }}
      </button>
      <button
        v-show="isFollowing"
        class="unfollow-button"
        @click="unfollowUser"
      >
        {{ t("userCard.unFollow") }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { getData } from "@services/api/getData.ts";
import { getUserUrl, getPath } from "@services/utils";
import storageManager from "@services/storage/index.ts";
import { useI18n } from "vue-i18n";
import { showMessage } from "@popup/naiveui";

const props = defineProps<{
  userid: string;
  close: () => void;
}>();

const name = ref("loading...");
const snt = ref("loading...");
const avatar = ref(getPath("/assets/user/default-avatar.png"));
const followingCount = ref(0);
const followerCount = ref(0);
const postCount = ref(0);
const starCount = ref(0);
const fragmentCount = ref(0);
const isFollowing = ref(false);
const { t } = useI18n();
let ID = "";

const jumpToUser = (id: any) => {
  props.close();
  window.open(`${getPath("/@root")}/profile/${id}`, "_self");
};

onMounted(async () => {
  const re = await getData("/Users/GetUser", { ID: props.userid });
  const data = re.Data.User;
  name.value = data.Nickname;
  snt.value = data.Signature;
  avatar.value = getUserUrl(data);
  followingCount.value = re.Data.Statistic.FollowingCount;
  followerCount.value = re.Data.Statistic.FollowerCount;
  postCount.value = re.Data.Statistic.ExperimentCount;
  starCount.value = re.Data.Statistic.StarCount;
  ID = re.Data.User.ID;
  if (re.Data.Relation === 1 || re.Data.Relation === 3) {
    isFollowing.value = true;
  }
  fragmentCount.value = data.Fragment;
  const cacheResult = storageManager.getObj("userIDAndAvatarIDMap");
  const cache =
    cacheResult.status === "success" && cacheResult.value
      ? cacheResult.value
      : {};
  cache[data.ID] = [data.Avatar, Date.now()];
  storageManager.setObj("userIDAndAvatarIDMap", cache, 72 * 60 * 60 * 1000);
  window.$Logger.logPageView({
    pageLink: `/User/${ID}/Profile/`,
    timeStamp: Date.now(),
  });
});

async function followUser() {
  const re = await getData("/Users/Follow", {
    TargetID: ID,
    Action: 1,
  });
  if (re.Status === 200) {
    showMessage("success", t("ui.messages.followSuccess"));
    isFollowing.value = true;
  } else {
    if (re.Status === 400 && re.Data === "TargetID") {
      showMessage("error", t("userCard.cantFollowYourself"));
    } else {
      showMessage("error", re.Message);
    }
  }
  window.$Logger.logEvent({
    category: "Social",
    action: "Follow",
    label: ID,
    timestamp: Date.now(),
  });
}

async function unfollowUser() {
  const re = await getData("/Users/Follow", {
    TargetID: ID,
    Action: 0,
  });
  if (re.Status === 200) {
    showMessage("success", t("ui.messages.unfollowSuccess"));
    isFollowing.value = false;
  } else {
    showMessage("error", re.Message);
  }
  window.$Logger.logEvent({
    category: "Social",
    action: "Unfollow",
    label: ID,
    timestamp: Date.now(),
  });
}
</script>

<style scoped>
.container {
  position: absolute;
  left: 0;
  top: 0;
  height: 100dvh;
  width: 100%;
  background-color: rgba(0, 0, 0, 0.2);
}

.user {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  width: 300px;
  padding: 20px;
  background-color: #fff;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
}

.user-info {
  display: flex;
  align-items: center;
  flex-direction: column;
}

.avatar {
  width: 90px;
  height: 90px;
  border-radius: 50%;
  margin: 5px;
}

.username {
  font-size: 1.5em;
  margin: 5px;
  text-align: center;
}

.snt {
  font-size: 1em;
  color: #666;
  margin: 5px;
  text-align: center;
}

.stats {
  display: flex;
  justify-content: space-between;
}

.stat-item {
  flex: 1;
  text-align: center;
}

.data {
  display: flex;
  flex-direction: column;
  margin-top: 20px;
}

.num {
  display: flex;
  font-size: 1.2em;
  flex-direction: row;
  justify-content: space-around;
}

.follow-button {
  width: 100%;
  padding: 10px;
  margin-top: 20px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

.unfollow-button {
  width: 100%;
  padding: 10px;
  margin-top: 20px;
  background-color: #c8daf8;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}
</style>
