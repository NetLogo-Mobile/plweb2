<template>
  <div
    id="app"
    class="wallpaper-shell"
    :class="{ 'has-wallpaper': wallpaper }"
    :style="{ '--wallpaper-image': wallpaper?.background }"
    @click="handleClick"
  >
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
import { wallpaper, useWallpaperSync } from './services/wallpapers'
useWallpaperSync()
function handleClick(event: MouseEvent) {
  const target = event.target as HTMLElement
  if (target.classList.contains('RUser')) {
    showUserCard(target.dataset.user || '')
  }
}
</script>

<style>
.wallpaper-shell.has-wallpaper {
  isolation: isolate;
  --page-background: transparent;
}
.wallpaper-shell.has-wallpaper::before {
  content: '';
  position: fixed;
  inset: 0;
  z-index: -1;
  pointer-events: none;
  background-image: var(--wallpaper-image);
}
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
