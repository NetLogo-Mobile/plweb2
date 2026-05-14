<template>
  <div id="app" @click="handleClick">
    <CookieNotice />
    <router-view v-slot="{ Component }">
      <!-- keep alive源自于vue-router的缓存 -->
      <!-- keep alive comes from cach function from vue-router -->
      <keep-alive>
        <component
          :is="Component"
          v-if="$route.meta.keepAlive"
          :key="$route.fullPath"
        />
      </keep-alive>
      <component
        :is="Component"
        v-if="!$route.meta.keepAlive"
        :key="$route.fullPath"
      />
    </router-view>
  </div>
</template>

<script setup lang="ts">
import showUserCard from "@popup/userProfileDialog.ts";
import CookieNotice from "./components/utils/CookieNotice.vue";
function handleClick(event: MouseEvent) {
  const target = event.target as HTMLElement;
  if (target.classList.contains("RUser")) {
    showUserCard(target.dataset.user || "");
  }
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
  touch-action: none;
  overflow: hidden;
}
</style>
