<template>
  <footer>
    <nav>
      <router-link to="/">
        <svg
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8a2 2 0 012 2v10a2 2 0 01-2 2H8a2 2 0 01-2-2V6a2 2 0 012-2z"
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
          ></path>
        </svg>
        <span>{{ $t("footer.home") }}</span>
      </router-link>
      <router-link to="/b">
        <svg
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M5.636 18.364a9 9 0 010-12.728m12.728 0a9 9 0 010 12.728m-9.9-2.829a5 5 0 010-7.07m7.072 0a5 5 0 010 7.07M12 6v.01M12 12v.01M12 18v.01"
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
          ></path>
        </svg>
        <span>{{ $t("footer.blackHole") }}</span>
      </router-link>
      <!-- <router-link to="/my-lab">
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" stroke-linecap="round"
            stroke-linejoin="round" stroke-width="2"></path>
        </svg>
        <span>我的</span>
      </router-link> -->
      <router-link to="/f">
        <svg
          fill="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"
          ></path>
        </svg>
        <span>{{ $t("footer.friends") }}</span>
      </router-link>
      <router-link to="/n" class="notification-link">
        <span class="notification-icon-wrapper">
          <svg
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
            ></path>
            <circle
              v-if="hasUnreadNotification"
              class="notification-dot"
              cx="18"
              cy="6"
              r="3.5"
              fill="#EF4444"
              stroke="white"
              stroke-width="2"
            ></circle>
          </svg>
        </span>
        <span>{{ $t("footer.notifications") }}</span>
      </router-link>
    </nav>
  </footer>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref } from "vue";
import Emitter from "@services/eventEmitter";
import { hasUnreadNotifications } from "@services/notificationUnread";

const hasUnreadNotification = ref(hasUnreadNotifications());

function handleNotificationUnreadChanged(hasUnread: boolean) {
  hasUnreadNotification.value = hasUnread;
}

onMounted(() => {
  Emitter.on("notificationUnreadChanged", handleNotificationUnreadChanged);
  hasUnreadNotification.value = hasUnreadNotifications();
});

onUnmounted(() => {
  Emitter.off("notificationUnreadChanged", handleNotificationUnreadChanged);
});
</script>

<style scoped>
footer {
  height: 50px;
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: white;
  border-top: 1px solid #e5e7eb;
  box-shadow: 0 -1px 3px rgba(0, 0, 0, 0.1);
  z-index: 50;
}

nav {
  display: flex;
  justify-content: space-around;
  align-items: center;
  height: 50px;
  max-width: 1024px;
  margin: 0 auto;
  padding: 0 4px;
}

nav a {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  padding-top: 4px;
  color: #666;
  text-decoration: none;
}

nav a svg {
  width: 20px;
  height: 20px;
}

nav a span {
  font-size: 12px;
  font-weight: 500;
  margin-top: 4px;
}

.notification-icon-wrapper {
  position: relative;
  display: inline-flex;
  margin-top: 0;
}

.notification-dot {
  pointer-events: none;
}

footer a.router-link-exact-active {
  color: #0185c5;
}
</style>
