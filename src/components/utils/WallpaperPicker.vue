<template>
  <div v-if="demo" class="wallpaper-picker">
    <select :value="wallpaperId ?? ''" :aria-label="t('wallpapers.title')" @change="change">
      <option value="">{{ t('wallpapers.default') }}</option>
      <option v-for="item in WALLPAPERS" :key="item.id" :value="item.id">
        {{ t(`wallpapers.${item.id}`) }}
      </option>
    </select>
    <span v-if="failed" role="alert">{{ t('wallpapers.error') }}</span>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { WALLPAPERS, wallpaperId, setWallpaper, type WallpaperId } from '../../services/wallpapers'

const { t } = useI18n()
const demo = import.meta.env.DEV
const failed = ref(false)
function change(event: Event) {
  const select = event.target as HTMLSelectElement
  try {
    setWallpaper((select.value || null) as WallpaperId | null)
    failed.value = false
  } catch {
    select.value = wallpaperId.value ?? ''
    failed.value = true
  }
}
</script>

<style scoped>
.wallpaper-picker {
  position: relative;
}
select {
  max-width: clamp(5rem, 16vw, 10rem);
  min-height: 2rem;
  border: 1px solid #d7e3eb;
  border-radius: 4px;
  background: white;
  color: #006b9e;
  font: inherit;
}
select:focus-visible {
  outline: 2px solid #0185c5;
  outline-offset: 2px;
}
[role='alert'] {
  position: absolute;
  z-index: 200;
  top: 100%;
  right: 0;
  width: 15rem;
  padding: 0.75rem;
  background: white;
  color: #a21919;
  box-shadow: 0 2px 8px #0002;
}
</style>
