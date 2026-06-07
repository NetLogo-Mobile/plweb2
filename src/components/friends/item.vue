<template>
  <div style="padding: 0px 10px">
    <div class="user-item" @click="showUserCard(user.ID)">
      <img class="avatar" :src="avararUrl" />
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

<script setup lang="ts" vapor>
import { ref, onMounted } from 'vue'
import type { User } from '@services/../pl-serve-type-main/type/main'
import showUserCard from '@popup/userProfileDialog.ts'
import { getPath } from '@services/utils'
import { getData } from '@services/api/getData'
import { getUserUrl } from '@services/utils'
const { user } = defineProps<{
  user: User
}>()
const iconPath = ref(getPath('/@base/assets/user/Status-None.png'))
const avararUrl = getUserUrl(user)

async function getIconPath() {
  const re = await getData('/Users/GetUser', { ID: user.ID })
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

onMounted(async () => {
  const p = await getIconPath()
  iconPath.value = getPath(p)
})
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
