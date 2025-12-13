<template>
  <div id="notification_container" @click="handleReply">
    <div class="img">
      <img
        id="avatar"
        :src="avatarUrl"
        @click.stop="showUserCard(message.userID)"
      />
    </div>
    <div id="notification" class="notification">
      <div id="notification_title" class="notification_title">
        <div class="name">{{ message.msg_title }}</div>
        <div class="time">{{ formatDate(message.id, true) }}</div>
        <div
          v-if="currentUserId === message.userID"
          class="delete"
          @click.stop="deleteMsg"
        >
          delete
        </div>
      </div>
      <div id="notification_message" class="notification_message">
        <div
          id="notification_text"
          v-richText="() => parse(message.msg)"
          class="notification_text"
        ></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from "vue";
import parse from "@services/pltxt2htm/advancedParser";
import showUserCard from "@popup/userProfileDialog.ts";
import { getAvatarUrl } from "@services/getUserCurentAvatarByID";
import storageManager from "@storage/index.ts";
import { formatDate, getPath } from "@services/utils";

const props = defineProps<{
  message: {
    id: string;
    userID: string;
    msg: string;
    msg_title: string;
    type: string;
  };
}>();

const emit = defineEmits(["msgClick", "deleteMsg"]);
const currentUserId = storageManager.getObj("userInfo")?.value?.ID || "";
const avatarUrl = ref(getPath("/assets/user/default-avatar.png"));

const setCurrentAvatar = async () => {
  // console.log(props.message.userID === "");
  if (props.message.userID !== "") {
    // 有些地方是匿名的，所以userID为空，不设置心得头像就会沿用默认头像
    // Some places are anonymous, so if userID is empty, the default avatar will be used.
    avatarUrl.value = await getAvatarUrl(props.message.userID);
  }
};

onMounted(setCurrentAvatar);
watch(() => props.message.userID, setCurrentAvatar);

function handleReply() {
  emit("msgClick", props.message);
}

// 删除消息需要将n事件上报到父组件，因为其具有数据所有权
//The delete message needs to report the  event to the parent component, because it has ownership of the data.
function deleteMsg() {
  emit("deleteMsg", props.message);
}
</script>

<style scoped>
#notification_container {
  height: fit-content;
  width: calc(100% - 5px);
  margin-left: 5px;
  margin-top: 5px;
  display: flex;
  flex-direction: row;
  gap: 10px;
  background: white;
}

#notification_container:hover {
  background-color: #f0f0f0;
}

#avatar {
  height: 60px;
  width: 60px;
  border-radius: 50%;
}

#avatar::after {
  content: "";
  mix-blend-mode: luminosity;
}

#notification {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 5px;
}

#notification_icon {
  width: 20px;
  height: 20px;
  top: 2px;
  background-color: transparent;
  display: flex;
}

#notification_title {
  display: flex;
  width: 100%;
  flex-direction: row;
  font-size: 1em;
  margin-right: auto;
  font-weight: 700;
  white-space: nowrap;
}

.delete {
  margin-left: auto;
  padding-right: 15px;
  color: red;
  font-weight: lighter;
}

#notification_message {
  width: 100%;
  height: fit-content;
  display: flex;
  flex-direction: row;
  gap: 5px;
}

#notification_text {
  font-size: 1em;
  text-align: left;
  height: fit-content;
  /* overflow-wrap: break-word; */
  max-width: 100%;
  white-space: wrap;
  overflow: hidden;
  text-overflow: hidden;
}

#icon {
  height: 16px;
  width: 16px;
}

#notification_container:hover {
  background-color: #f0f0f0;
}

.time {
  margin-left: 5px;
  font-weight: normal;
  color: grey;
}

div {
  box-sizing: border-box;
}
</style>
