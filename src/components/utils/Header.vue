<template>
  <div class="header-container">
    <slot></slot>
    <!-- @see https://icomoon.io/app/ -->
    <div class="buttons">
      <div v-show="!isFullScreen" class="fullScreen" @click="toggleFullScreen">
        <svg
          width="22"
          height="22"
          viewBox="0 0 32 32"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M32 0h-13l5 5-6 6 3 3 6-6 5 5z"></path>
          <path d="M32 32v-13l-5 5-6-6-3 3 6 6-5 5z"></path>
          <path d="M0 32h13l-5-5 6-6-3-3-6 6-5-5z"></path>
          <path d="M0 0v13l5-5 6 6 3-3-6-6 5-5z"></path>
        </svg>
      </div>
      <div v-show="isFullScreen" class="fullScreen" @click="toggleFullScreen">
        <svg
          width="25"
          height="25"
          viewBox="0 0 32 32"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M18 14h13l-5-5 6-6-3-3-6 6-5-5z"></path>
          <path d="M18 18v13l5-5 6 6 3-3-6-6 5-5z"></path>
          <path d="M14 18h-13l5 5-6 6 3 3 6-6 5 5z"></path>
          <path d="M14 14v-13l-5 5-6-6-3 3 6 6-5 5z"></path>
        </svg>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
let isFullScreen = ref(false);

const toggleFullScreen = () => {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen();
    isFullScreen.value = true;
  } else {
    if (document.exitFullscreen) {
      document.exitFullscreen();
      isFullScreen.value = false;
    }
  }
};

/**
 *  强制刷新，但是日后需要修改本地存储清理逻辑
 * Force refresh, but the local storage clearing logic needs to be modified in the future
 *  @deprecated
 */
// function logout() {
//   sm.remove("userInfo");
//   Emitter.emit("info", "您已退出登录！", 1);
//   window.location.href = getPath("/@root");
//   window.location.reload();
// }
</script>

<style scoped>
.header-container {
  height: 50px;
  top: 0;
  padding: 0 0 0 20px;
  font-size: small;
  background-color: white;
  width: 100%;
  z-index: 100;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.buttons {
  display: flex;
  align-items: center;
  cursor: pointer;
  padding-right: 8vw;
  gap: 10px;
}

.div {
  box-sizing: border-box;
}
</style>
