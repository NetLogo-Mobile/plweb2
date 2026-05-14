<template>
  <aside
    v-if="isVisible"
    class="cookie-notice"
    role="status"
    aria-live="polite"
  >
    <div class="cookie-notice__content">
      <strong class="cookie-notice__title">{{
        t("cookieNotice.title")
      }}</strong>
      <p class="cookie-notice__message">
        {{ t("cookieNotice.message") }}
      </p>
    </div>
    <button class="cookie-notice__button" type="button" @click="dismissNotice">
      {{ t("cookieNotice.dismiss") }}
    </button>
  </aside>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useI18n } from "vue-i18n";

const { t } = useI18n();
const isVisible = ref(true);

function dismissNotice() {
  isVisible.value = false;
}
</script>

<style scoped>
.cookie-notice {
  position: fixed;
  right: clamp(12px, 3vw, 28px);
  bottom: clamp(12px, 3vw, 28px);
  left: clamp(12px, 3vw, 28px);
  z-index: 1000;
  display: flex;
  gap: 16px;
  align-items: center;
  justify-content: space-between;
  max-width: 920px;
  padding: 14px 16px;
  margin: 0 auto;
  color: #172033;
  background: rgb(255 255 255 / 94%);
  border: 1px solid rgb(120 140 180 / 28%);
  border-radius: 16px;
  box-shadow: 0 12px 36px rgb(20 32 56 / 18%);
  backdrop-filter: blur(10px);
  pointer-events: auto;
}

.cookie-notice__content {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
}

.cookie-notice__title {
  font-size: 0.95rem;
  line-height: 1.25;
}

.cookie-notice__message {
  margin: 0;
  font-size: 0.86rem;
  line-height: 1.45;
}

.cookie-notice__button {
  flex: 0 0 auto;
  min-width: 84px;
  padding: 8px 14px;
  color: #fff;
  font: inherit;
  font-weight: 600;
  cursor: pointer;
  touch-action: manipulation;
  background: #2f6fed;
  border: 0;
  border-radius: 999px;
}

.cookie-notice__button:focus-visible {
  outline: 3px solid rgb(47 111 237 / 32%);
  outline-offset: 2px;
}

@media (max-width: 560px) {
  .cookie-notice {
    align-items: stretch;
    flex-direction: column;
  }

  .cookie-notice__button {
    width: 100%;
  }
}
</style>
