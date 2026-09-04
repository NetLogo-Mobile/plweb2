<template>
  <div id="app" @click="handleClick">
    <CookieNotice />
    <router-view v-slot="{ Component, route }">
      <keep-alive>
        <component :is="Component" v-if="route.meta.keepAlive" :key="route.fullPath" />
      </keep-alive>
      <component :is="Component" v-if="!route.meta.keepAlive" :key="route.fullPath" />
    </router-view>
  </div>
</template>

<script setup lang="ts">
import showUserCard from '@popup/userProfileDialog.ts'
import CookieNotice from './components/utils/CookieNotice.vue'

function handleClick(event: MouseEvent) {
  if (!(event.target instanceof Element)) return
  const userElement = event.target.closest<HTMLElement>('.RUser')
  const userId = userElement?.dataset.user
  if (userId) showUserCard(userId)
}
</script>

<style>
html,
body {
  height: 100dvh !important;
  overflow: hidden;
}

#app {
  height: 100dvh !important;
  touch-action: manipulation;
  overflow: hidden;
}
</style>
