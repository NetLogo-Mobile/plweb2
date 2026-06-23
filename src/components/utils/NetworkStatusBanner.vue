<template>
  <Transition name="network-banner">
    <aside
      v-if="isOnline === false || (isOnline && isPoorConnection)"
      class="network-banner"
      :class="{
        'network-banner--offline': isOnline === false,
        'network-banner--poor': isOnline && isPoorConnection,
      }"
      role="alert"
      aria-live="assertive"
    >
      <span class="network-banner__icon">
        {{ isOnline === false ? '🔴' : '⚠️' }}
      </span>
      <span class="network-banner__text">
        {{ isOnline === false ? t('network.offline') : t('network.poorConnection') }}
      </span>
      <span class="network-banner__cache">{{ t('network.usingCache') }}</span>
    </aside>
  </Transition>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'

defineProps<{
  isOnline: boolean | null
  isPoorConnection: boolean
}>()

const { t } = useI18n()
</script>

<style scoped>
.network-banner {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 10px 16px;
  font-size: 0.9rem;
  line-height: 1.4;
  pointer-events: auto;
  flex-wrap: wrap;
}

.network-banner--offline {
  color: #fff;
  background: #e74c3c;
}

.network-banner--poor {
  color: #664d03;
  background: #fff3cd;
}

.network-banner__icon {
  flex-shrink: 0;
  font-size: 1rem;
}

.network-banner__text {
  font-weight: 600;
  white-space: nowrap;
}

.network-banner__cache {
  opacity: 0.85;
  font-size: 0.85rem;
}

.network-banner--offline .network-banner__cache {
  color: rgba(255, 255, 255, 0.85);
}

.network-banner--poor .network-banner__cache {
  color: rgba(102, 77, 3, 0.75);
}

.network-banner-enter-active,
.network-banner-leave-active {
  transition: transform 0.3s ease, opacity 0.3s ease;
}

.network-banner-enter-from,
.network-banner-leave-to {
  transform: translateY(-100%);
  opacity: 0;
}
</style>
