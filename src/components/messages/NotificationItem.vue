<template>
  <div class="notification_container">
    <div class="img" @click.stop="showNotificationUser">
      <img class="avatar" :src="getPath(avatarUrl)" alt="" />
    </div>
    <div class="notification">
      <div
        v-richText="() => parse(notification.msg_title)"
        class="notification_title"
      ></div>
      <div class="notification_message" @click="showComment">
        <div class="notification_icon">
          <img :src="getPath(msg_icon_url)" alt="" />
        </div>
        <div class="notification_text">
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

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
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
let avatarRequestId = 0

watch(
  () => [
    props.notification.msg_type,
    props.notification.Users[0],
    props.notification.UserAvatar,
  ],
  async () => {
    const requestId = ++avatarRequestId
    const nextAvatar =
      props.notification.msg_type === 1
        ? '/@base/assets/messages/Message-Unread.png'
        : await getUserUrl({
            ID: props.notification.Users[0] ?? '',
            Avatar: props.notification.UserAvatar,
          })
    if (requestId === avatarRequestId) avatarUrl.value = nextAvatar
  },
  { immediate: true },
)

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

function showNotificationUser() {
  const userId = props.notification.Users[0]
  if (userId) showUserCard(userId)
}

// 跳转到对话上下文，以后会直接跳转到这句对话的索引所在
// Jump to the context of the conversation, and later it will directly jump to the index where this sentence is located
function showComment() {
  if (props.notification.msg_type === 3) {
    const fields = props.notification.Fields
    const category = fields?.Discussion ? 'Discussion' : fields?.Experiment ? 'Experiment' : 'User'
    const targetId = fields?.ExperimentID || fields?.DiscussionID || fields?.UserID
    const targetName = fields?.Discussion || fields?.Experiment || fields?.User
    if (!targetId || !targetName) return

    window.open(
      `${getPath('/@root')}/c/${category}/${encodeURIComponent(targetId)}/${encodeURIComponent(targetName)}`,
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
