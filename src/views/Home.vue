<template>
  <div id="home">
    <Header>
      <div class="user" @click="showModalFn">
        <img
          class="avatar"
          :src="user.avatarUrl || getPath('/@base/assets/user/default-avatar.png')"
          alt="Avatar"
        />
        <div class="user-info">
          <div class="username">{{ user.username }}</div>
          <div class="level">{{ $t('user.level') }} {{ user.level }}</div>
        </div>
        <div class="resources">
          <div class="resource">
            <img class="icon" :src="getPath('/@base/assets/icons/coins.png')" alt="Coins" />
            <span>{{ user.coins }}</span>
          </div>
          <div class="resource">
            <img class="icon gems" :src="getPath('/@base/assets/icons/gems.png')" alt="Gems" />
            <span>{{ user.gems }}</span>
          </div>
        </div>
      </div>
      <template #right>
        <div v-if="!isPortrait && accountList.length > 0" class="quick-switch" @click.stop>
          <img class="switch-avatar" :src="user.avatarUrl" alt="Switch Account" @click="toggleSwitchPanel" />
          <div v-show="showSwitchPanel" class="switch-panel">
            <div
              v-for="account in accountList"
              :key="account.id"
              class="switch-item"
              @click="switchAccount(account)"
            >
              <img class="switch-item-avatar" :src="account.avatarUrl" :alt="account.nickname" />
              <span class="switch-item-name">{{ account.nickname }}</span>
            </div>
          </div>
        </div>
      </template>
    </Header>
    <main>
      <div v-show="isLoading" class="loading"></div>
      <div v-show="!isLoading" class="block-container">
        <n-grid :x-gap="12" :y-gap="12" :cols="blockItemsPerRow">
          <!-- <n-gi>
            <Actions />
          </n-gi> -->
          <n-gi
            v-for="block in blocks.filter((i) => i.Summaries.length > 0)"
            :key="getBlockKey(block)"
          >
            <div class="block">
              <TopicBlock v-if="isTopicBlock(block)" :block="block" />
              <Block v-else :block="block" :maxProjectsPerBlock="maxProjectsPerBlock" />
            </div>
          </n-gi>
        </n-grid>
      </div>
    </main>
  </div>
  <Footer></Footer>
</template>

<script setup lang="ts">
import { ref, onMounted, onActivated, onBeforeUnmount } from 'vue'
import { NGi, NGrid } from 'naive-ui'
import router from '../router'
import { checkLogin, getPath, getUserUrl } from '@services/utils'
import '../layout/loading.css'
import '../layout/startPage.css'
import sm from '@storage/index.ts'
import { useI18n } from 'vue-i18n'
import Emitter from '@services/eventEmitter'
import { useResponsive } from '../layout/useResponsive.ts'
import { login } from '@api/getData'
import Header from '../components/utils/Header.vue'
import Footer from '../components/utils/Footer.vue'
import Block from '../components/blocks/Block.vue'
import TopicBlock from '../components/blocks/TopicBlock.vue'
import { showLoginModel } from '@popup/index'
import type {
  ListBlock,
  ResultOf,
  TopicBlock as TopicBlockType,
  Users,
} from '@services/../pl-serve-type-main/type/main'

const isLoading = ref(true)
const blocks = ref<Array<ListBlock | TopicBlockType>>([])
const { t } = useI18n()
interface QuickAccount {
  id: string
  nickname: string
  avatarUrl: string
  token: string
  authCode: string
}

function isTopicBlock(block: ListBlock | TopicBlockType): block is TopicBlockType {
  return block.$type === 'Quantum.Models.Contents.TopicBlock, Quantum Models'
}

function getBlockKey(block: ListBlock | TopicBlockType) {
  return isTopicBlock(block) ? block.Subject : block.Header
}

const _user = sm.getObj('userInfo')?.value
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
        username: t('user.clickToLogin'),
        avatarUrl: getPath('/@base/assets/user/default-avatar.png'),
        ID: '',
      })

const { blockItemsPerRow, maxProjectsPerBlock, isPortrait } = useResponsive()
const showSwitchPanel = ref(false)
const accountList = ref<Array<QuickAccount>>(sm.getObj('quickSwitchAccounts').value ?? [])

function persistQuickAccounts() {
  sm.setObj('quickSwitchAccounts', accountList.value.slice(0, 3), 30 * 24 * 60 * 60 * 1000)
}

function saveCurrentAccount(authInfo?: { token?: string; authCode?: string } | null) {
  if (!authInfo?.token || !authInfo.authCode || !user.value.ID) return
  const record: QuickAccount = {
    id: user.value.ID,
    nickname: user.value.username,
    avatarUrl: user.value.avatarUrl,
    token: authInfo.token,
    authCode: authInfo.authCode,
  }
  accountList.value = [record, ...accountList.value.filter((item) => item.id !== record.id)].slice(0, 3)
  persistQuickAccounts()
}

async function switchAccount(account: QuickAccount) {
  showSwitchPanel.value = false
  sm.setObj('userAuthInfo', { token: account.token, authCode: account.authCode }, 30 * 24 * 60 * 60 * 1000)
  const res = await login(account.token, account.authCode, true)
  if (!res.Data?.User) return
  user.value = {
    coins: res.Data.User.Gold,
    gems: res.Data.User.Diamond,
    level: res.Data.User.Level,
    username: res.Data.User.Nickname,
    avatarUrl: getUserUrl(res.Data.User),
    ID: res.Data.User.ID,
  }
  saveCurrentAccount(sm.getObj('userAuthInfo').value)
}

function toggleSwitchPanel() {
  showSwitchPanel.value = !showSwitchPanel.value
}

function handlePageClick() {
  showSwitchPanel.value = false
}

onMounted(async () => {
  window.addEventListener('click', handlePageClick)
  // First render from cache, then update it
  async function processAuthInfo() {
    const ua = sm.getObj('userAuthInfo')
    if (ua.status === 'success' && ua.value?.token != null) {
      const res = await login(ua.value.token, ua.value.authCode, true)
      if (!res.Data?.User) return
      user.value = {
        coins: res.Data.User.Gold,
        gems: res.Data.User.Diamond,
        level: res.Data.User.Level,
        username: res.Data.User.Nickname,
        avatarUrl: getUserUrl(res.Data.User),
        ID: res.Data.User.ID,
      }
      saveCurrentAccount(ua.value)
    }
  }
  async function processHomepageProjects() {
    const res = await login(null, null)
    loadPageData(res)
  }
  await Promise.allSettled([processAuthInfo(), processHomepageProjects()])
})
onBeforeUnmount(() => {
  window.removeEventListener('click', handlePageClick)
})

onActivated(() => {
  window.$Logger.logPageView({
    pageLink: '/',
    timeStamp: Date.now(),
  })
})

Emitter.on('userLogin', (res) => {
  if (!res.Data?.User) return
  user.value = {
    coins: res.Data.User.Gold,
    gems: res.Data.User.Diamond,
    level: res.Data.User.Level,
    username: res.Data.User.Nickname,
    avatarUrl: getUserUrl(res.Data.User),
    ID: res.Data.User.ID,
  }
  saveCurrentAccount(sm.getObj('userAuthInfo').value)
})
// It is astonishing that server respond with projects data when login with (null,null)
// And responed with user data when login with token/password
// Fourtunately, both data has the same structure
async function loadPageData(response: ResultOf<Users['Authenticate']>) {
  if (!response.Data) return
  isLoading.value = false
  if (response.Data.ContentTags) {
    Emitter.emit('updateTagConfig', response.Data.ContentTags)
  }
  blocks.value = [...(response.Data.Library?.Blocks ?? [])]
  const userData = response.Data.User

  // Both null-null-login or real-login can get user data,but the previous one is fake
  // The nickName is null in fake user data
  if (userData?.Nickname != null) {
    user.value = {
      coins: userData.Gold,
      gems: userData.Diamond,
      level: userData.Level,
      username: userData.Nickname || t('user.clickToLogin'),
      avatarUrl: getUserUrl(userData),
      ID: userData.ID,
    }
  }

  window.$Logger.logPageView({
    pageLink: '/Account/Login/',
    timeStamp: Date.now(),
  })
}

function showModalFn() {
  if (checkLogin(false)) {
    router.push(`/u/${user.value.ID}`)
    window.$Logger.logPageView({
      pageLink: '/Profile/',
      timeStamp: Date.now(),
    })
  } else {
    showLoginModel()
  }
}
</script>

<style scoped>
/* Header start */
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

.quick-switch {
  position: relative;
}

.switch-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  cursor: pointer;
}

.switch-panel {
  position: absolute;
  right: 0;
  top: 40px;
  width: 180px;
  background: white;
  border: 1px solid #eee;
  border-radius: 8px;
  box-shadow: 0 8px 20px rgb(0 0 0 / 12%);
  z-index: 20;
}

.switch-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 10px;
  cursor: pointer;
}

.switch-item:hover {
  background: #f7f7f7;
}

.switch-item-avatar {
  width: 24px;
  height: 24px;
  border-radius: 50%;
}

.switch-item-name {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
/* Header end */

.block {
  height: 100%;
}

.div {
  box-sizing: border-box;
}
</style>
