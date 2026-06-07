<template>
  <div class="notification_container">
    <div
      class="img"
      @click.stop="
        () => {
          if (notification.Users[0]) showUserCard(notification.Users[0])
        }
      "
    >
      <img id="avatar" :src="getPath(avatarUrl)" />
    </div>
    <div id="notification" class="notification">
      <div
        id="notification_title"
        v-richText="() => parse(notification.msg_title)"
        class="notification_title"
      ></div>
      <div id="notification_message" class="notification_message" @click="showComment">
        <div id="notification_icon" class="notification_icon">
          <img id="notification_icon" :src="getPath(msg_icon_url)" />
        </div>
        <div id="notification_text" class="notification_text">
          <!-- 我认为是在没必要专门像APP一样渲染邮件，所以暂时这样 -->
          <!-- I think it's unnecessary to render emails like an app, so I'll do it this way for now -->
          <n-ellipsis
            v-richText="() => parse(notification.msg)"
            expand-trigger="click"
            line-clamp="2"
            :tooltip="false"
          >
          </n-ellipsis>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts" vapor>
import { ref, computed, onMounted, watch } from 'vue'
import parse from '@services/pltxt2htm/advancedParser'
import { NEllipsis } from 'naive-ui'
import showUserCard from '@popup/userProfileDialog.ts'
import { getUserUrl } from '@services/utils.ts'
import { getPath } from '@services/utils'
import type { Message } from '@services/../pl-serve-type-main/type/main'

interface NotificationItemMessage extends Message {
  msg_title: string
  msg: string
  msg_type: number
}

const props = defineProps<{
  notification: NotificationItemMessage
}>()

const avatarUrl = ref('/@base/assets/user/default-avatar.png')
const fetchAvatar = async () => {
  avatarUrl.value =
    props.notification.msg_type === 1
      ? '/@base/assets/messages/Message-Unread.png'
      : await getUserUrl({
          ID: props.notification.Users[0] ?? '',
          Avatar: props.notification.UserAvatar,
        })
}
onMounted(fetchAvatar)
watch(() => props.notification.Users[0], fetchAvatar)

const msg_icon_url = computed(() => {
  switch (props.notification.msg_type) {
    case 1:
      return '/@base/assets/icons/notifications_system.png'
    case 3:
      return '/@base/assets/icons/notifications_comments.png'
    case 2:
      return '/@base/assets/icons/notifications_followers.png'
    case 4:
      return '/@base/assets/icons/notifications_projects.png'
    case 5:
      return '/@base/assets/icons/notifications_admin.png'
    default:
      return ''
  }
})

// 跳转到对话上下文，以后会直接跳转到这句对话的索引所在
// Jump to the context of the conversation, and later it will directly jump to the index where this sentence is located
function showComment() {
  if (props.notification.msg_type === 3) {
    window.open(
      `${getPath('/@root')}/c/${
        props.notification.Fields?.Discussion
          ? 'Discussion'
          : props.notification.Fields?.Experiment
            ? 'Experiment'
            : 'User'
      }/${
        props.notification.Fields?.ExperimentID ||
        props.notification.Fields?.DiscussionID ||
        props.notification.Fields?.UserID
      }/${
        props.notification.Fields?.Discussion ||
        props.notification.Fields?.Experiment ||
        props.notification.Fields.User
      }`,
      '_self',
    )
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
  content: '';
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
