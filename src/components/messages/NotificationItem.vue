<template>
  <div class="notification_container">
    <div class="img" @click.stop="showUserCard(notification.uid)">
      <img id="avatar" :src="getPath(avatarUrl)" />
    </div>
    <div id="notification" class="notification" @click="showComment">
      <div
        id="notification_title"
        class="notification_title"
        v-html="parse(notification.msg_title, true)"
      ></div>
      <div id="notification_message" class="notification_message">
        <div id="notification_icon" class="notification_icon">
          <img id="notification_icon" :src="getPath(msg_icon_url)" />
        </div>
        <div id="notification_text" class="notification_text">
          <!-- 我认为是在没必要专门像APP一样渲染邮件，所以暂时这样 -->
          <!-- I think it's unnecessary to render emails like an app, so I'll do it this way for now -->
          <n-ellipsis
            expand-trigger="click"
            line-clamp="2"
            :tooltip="false"
            v-html="parse(notification.msg, true)"
          >
          </n-ellipsis>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from "vue";
import parse from "@services/commonParser.ts";
import { NEllipsis } from "naive-ui";
import showUserCard from "@popup/userProfileDialog.ts";
import { getAvatarUrl } from "@services/getUserCurentAvatarByID";
import { getPath } from "@services/utils";

const props = defineProps<{
  notification: {
    msg: string;
    msg_title: string;
    msg_type: number;
    tid: string;
    category: string;
    name: string;
    uid: string;
  };
}>();

const avatarUrl = ref("/@base/assets/user/default-avatar.png");
const fetchAvatar = async () => {
  avatarUrl.value =
    props.notification.msg_type === 1
      ? "/@base/assets/messages/Message-Unread.png"
      : await getAvatarUrl(props.notification.uid);
};
onMounted(fetchAvatar);
watch(() => props.notification.uid, fetchAvatar);

const msg_icon_url = computed(() => {
  switch (props.notification.msg_type) {
    case 1:
      return "/@base/assets/icons/notifications_system.png";
    case 2:
      return "/@base/assets/icons/notifications_comments.png";
    case 3:
      return "/@base/assets/icons/notifications_followers.png";
    case 4:
      return "/@base/assets/icons/notifications_projects.png";
    case 5:
      return "/@base/assets/icons/notifications_admin.png";
    default:
      return "";
  }
});

function showComment() {
  if (props.notification.msg_type === 2) {
    window.open(
      `${getPath("/@root")}/Comments/${props.notification.category}/${props.notification.tid}/${props.notification.name}`,
      "_self",
    );
  }
}
</script>

<style scoped>
.notification_container {
  height: fit-content;
  padding: 0.5em 0 0.5em 0.5em;
  display: flex;
  flex-direction: row;
  gap: 10px;
  width: 90%;
  box-sizing: border-box;
  overflow: hidden;
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
  font-size: 1.1em;
  margin-right: auto;
  font-weight: 700;
  white-space: nowrap;
}

#notification_message {
  width: 100%;
  height: fit-content;
  display: flex;
  flex-direction: row;
  gap: 5px;
}

#notification_text {
  font-size: 0.9em;
  text-align: left;
  height: fit-content;
}

#icon {
  height: 16px;
  width: 16px;
}

#notification_container:hover {
  background-color: #f0f0f0;
}
</style>
