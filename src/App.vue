<template>
  <div id="app" @click="handleClick">
    <CookieNotice />
    <router-view v-slot="{ Component }">
      <!-- keep alive源自于vue-router的缓存 -->
      <!-- keep alive comes from cach function from vue-router -->
      <keep-alive>
        <component :is="Component" v-if="$route.meta.keepAlive" :key="$route.fullPath" />
      </keep-alive>
      <component :is="Component" v-if="!$route.meta.keepAlive" :key="$route.fullPath" />
    </router-view>
  </div>
</template>

<script setup lang="ts">
import showUserCard from '@popup/userProfileDialog.ts'
import CookieNotice from './components/utils/CookieNotice.vue'
function handleClick(event: MouseEvent) {
  const target = event.target as HTMLElement
  if (target.classList.contains('RUser')) {
    showUserCard(target.dataset.user || '')
  }
}
</script>

<style>
:root {
  --header-height: clamp(3.25rem, 6dvh, 4rem);
  --footer-height: clamp(3.5rem, 7dvh, 4.25rem);
  --page-gutter: clamp(0.75rem, 2vw, 2rem);
  --content-max-width: 96rem;
  --surface-radius: clamp(0.5rem, 0.8vw, 0.875rem);
}

html,
body {
  height: 100dvh !important;
  overflow: hidden;
  margin: 0;
  background: #f7f8fa;
}

#app {
  height: 100dvh !important;
  touch-action: manipulation;
  overflow: hidden;
}
</style>
