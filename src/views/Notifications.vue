<template>
  <Header>
    <h1>{{ t('notifications.title') }}</h1>
  </Header>
  <main>
    <div class="outer">
      <n-tabs type="line" animated justify-content="space-evenly">
        <!-- :CategoryID 是糟糕的，不建议改动 @see NotificationList.vue -->
        <!-- The parameter `:CategoryID` is poorly designed, do not modify it. @see NotificationList.vue -->
        <n-tab-pane name="all" :tab="t('notifications.all')">
          <div class="item">
            <NotificationList :CategoryID="0" />
          </div>
        </n-tab-pane>
        <n-tab-pane name="system" :tab="t('notifications.system')">
          <div class="item">
            <NotificationList :CategoryID="1" />
          </div>
        </n-tab-pane>
        <n-tab-pane name="comments" :tab="t('notifications.comments')">
          <div class="item">
            <NotificationList :CategoryID="3" />
          </div>
        </n-tab-pane>
        <n-tab-pane name="friends" :tab="t('notifications.friends')">
          <div class="item">
            <NotificationList :CategoryID="2" />
          </div>
        </n-tab-pane>
        <n-tab-pane name="works" :tab="t('notifications.works')">
          <div class="item">
            <NotificationList :CategoryID="4" />
          </div>
        </n-tab-pane>
        <n-tab-pane name="admin" :tab="t('notifications.admin')">
          <div class="item">
            <NotificationList :CategoryID="5" />
          </div>
        </n-tab-pane>
      </n-tabs>
    </div>
  </main>
  <Footer />
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import NotificationList from '../components/messages/NotificationList.vue'
import Header from '../components/utils/Header.vue'
import { NTabs, NTabPane } from 'naive-ui'
import Footer from '../components/utils/Footer.vue'
import { nextTick, onActivated } from 'vue'
import { checkLogin } from '@services/utils'
import { clearNotificationUnread } from '@services/notificationUnread'
import storageManager from '@storage/index.ts'

const { t } = useI18n()

onActivated(async () => {
  clearNotificationUnread()
  await nextTick()
  const nickname = storageManager.getObj('userInfo').value?.Nickname
  if (nickname) return
  checkLogin()
})
</script>

<style scoped>
.item {
  box-sizing: border-box;
  height: calc(100dvh - 150px);
}

@media (min-aspect-ratio: 1/1) {
  .item {
    padding-left: 20px;
  }
}
</style>
