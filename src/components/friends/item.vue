<template>
  <div style="padding: 0px 10px">
    <div class="user-item" @click="showUserCard(user.ID)">
      <UserAvatar class="avatar" :src="avatarUrl" :user="user" :alt="user.Nickname" />
      <div class="info">
        <div class="username">{{ user.Nickname }}</div>
        <div class="signature">
          {{ user.Signature || $t('user.noSignature') }}
        </div>
      </div>
      <div class="icon">
        <img :src="iconPath" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import UserAvatar from '../utils/UserAvatar.vue'
import type { FramedUser } from '../../services/avatarFrames'
import type { User } from '@services/../pl-serve-type-main/type/main'
import showUserCard from '@popup/userProfileDialog.ts'
import { getPath } from '@services/utils'
import { getData } from '@services/api/getData'
import { getUserUrl } from '@services/utils'
const { user } = defineProps<{
  user: User & FramedUser
}>()
const iconPath = ref(getPath('/@base/assets/user/Status-None.png'))
const avatarUrl = computed(() => getUserUrl(user))

async function getIconPath(id: string) {
  const re = await getData('/Users/GetUser', { ID: id })
  if (!re.Data) return '/@base/assets/user/Status-None.png'
  return getIcon(Number(re.Data.Relation))
}

function getIcon(relation: number) {
  switch (relation) {
    case 1:
      return '/@base/assets/user/Status-Following.png'
    case 2:
      return '/@base/assets/user/Status-Followed.png'
    case 3:
      return '/@base/assets/user/Status-Friend.png'
    default:
      return '/@base/assets/user/Status-None.png'
  }
}

watch(
  () => user.ID,
  async (id, _previous, onCleanup) => {
    let stale = false
    onCleanup(() => {
      stale = true
    })
    iconPath.value = getPath('/@base/assets/user/Status-None.png')
    try {
      const p = await getIconPath(id)
      if (!stale) iconPath.value = getPath(p)
    } catch {
      // Keep the neutral relationship icon when the existing lookup fails.
    }
  },
  { immediate: true },
)
</script>

<style scoped>
.user-item {
  height: 60px;
  display: flex;
  align-items: center;
  border-radius: 8px;
  transition: background 0.2s;
  cursor: pointer;
  background-color: white;
  margin: 10px 0 10px 15px;
}

.avatar {
  width: 63px;
  height: 63px;
  border-radius: 50%;
  margin-right: 12px;
  margin-left: -15px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-size: cover;
  background-repeat: no-repeat;
}

.info {
  flex: 1;
  min-width: 0;
  text-align: left;
}

.username {
  margin-bottom: 4px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.signature {
  font-size: 12px;
  color: #666;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.icon {
  height: 25px;
  width: 25px;
  margin-right: 20px;
}

.icon > img {
  width: 100%;
}
</style>
