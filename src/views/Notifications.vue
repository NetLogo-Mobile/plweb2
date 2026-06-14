<template>
  <Header>
    <h1>{{ t('notifications.title') }}</h1>
  </Header>
  <main>
    <div class="outer">
      <n-tabs v-model:value="activeTab" type="line" animated justify-content="space-evenly">
        <n-tab-pane name="0" :tab="t('notifications.all')">
          <div class="item">
            <NotificationList :CategoryID="0" :fromID="targetFromID" :initialSkip="targetSkip"></NotificationList>
          </div>
        </n-tab-pane>
        <n-tab-pane name="1" :tab="t('notifications.system')">
          <div class="item">
            <NotificationList :CategoryID="1" :fromID="targetFromID" :initialSkip="targetSkip"></NotificationList>
          </div>
        </n-tab-pane>
        <n-tab-pane name="3" :tab="t('notifications.comments')">
          <div class="item">
            <NotificationList :CategoryID="3" :fromID="targetFromID" :initialSkip="targetSkip"></NotificationList>
          </div>
        </n-tab-pane>
        <n-tab-pane name="2" :tab="t('notifications.friends')">
          <div class="item">
            <NotificationList :CategoryID="2" :fromID="targetFromID" :initialSkip="targetSkip"></NotificationList>
          </div>
        </n-tab-pane>
        <n-tab-pane name="4" :tab="t('notifications.works')">
          <div class="item">
            <NotificationList :CategoryID="4" :fromID="targetFromID" :initialSkip="targetSkip"></NotificationList>
          </div>
        </n-tab-pane>
        <n-tab-pane name="5" :tab="t('notifications.admin')">
          <div class="item">
            <NotificationList :CategoryID="5" :fromID="targetFromID" :initialSkip="targetSkip"></NotificationList>
          </div>
        </n-tab-pane>
      </n-tabs>
    </div>
  </main>
  <Footer></Footer>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
const { t } = useI18n()
import NotificationList from '../components/messages/NotificationList.vue'
import Header from '../components/utils/Header.vue'
import { NTabs, NTabPane } from 'naive-ui'
import Footer from '../components/utils/Footer.vue'
import { onActivated } from 'vue'
import { checkLogin } from '@services/utils'
import { clearNotificationUnread } from '@services/notificationUnread'

const route = useRoute()
const activeTab = ref(route.query.category as string || '0')

const targetFromID = computed(() => route.query.from as string | undefined)
const targetSkip = computed(() => {
  const skip = route.query.skip
  return skip ? parseInt(skip as string) : undefined
})

onActivated(() => {
  clearNotificationUnread()
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
