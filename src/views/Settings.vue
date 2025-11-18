<template>
  <!-- Not completed yet -->
  <div class="container">
    <div class="header">
      <div class="header-title">
        <img
          src="/assets/library/Navigation-Return.png"
          style="width: 1.5em"
          class="return"
          @click="goBack"
        />
        {{ $t("settings.settings") }}
      </div>
    </div>
    <div
      v-for="section in settingsConfig"
      :key="section.title"
      class="settings-section"
    >
      <div class="section-title">{{ $t(`settings.${section.title}`) }}</div>
      <div v-for="item in section.items" :key="item.key" class="setting-item">
        <span class="label">{{ $t(`settings.${item.key}`) }}</span>
        <div v-if="item.type === 'link'" class="value">
          <n-select
            :options="item.options"
            size="medium"
            :default-value="item.value as string"
            @update:value="
              (v) => {
                item.value = v;
                if (item.callBack) item.callBack(v);
              }
            "
          />
        </div>
        <label v-else-if="item.type === 'toggle'" class="toggle-switch">
          <input
            type="checkbox"
            :checked="!!item.value"
            @click="
              (e) =>
                (item.value = String((e.target as HTMLInputElement)?.checked))
            "
          />
          <span class="slider"></span>
        </label>
      </div>
    </div>
  </div>
  <div class="version">{{ sysConfig.version }}</div>
</template>
<script setup lang="ts">
import { reactive, watch, onActivated } from "vue";
import { settingsConfig as s } from "../config/user.config";
import { NSelect } from "naive-ui";
import storageManager from "../services/storage";
import sysConfig from "../config/system.config";

// Read current config from storage and render it
const savedValues = storageManager.getObj("userConfig")?.value || {};
const settingsConfig = reactive(s);
settingsConfig.forEach((section) => {
  section.items.forEach((item) => {
    if (savedValues[item.key] !== undefined) {
      item.value = savedValues[item.key];
      // When section changes, vue will update the html automatically
    }
  });
});

function goBack() {
  window.history.back();
}

watch(
  () => settingsConfig,
  () => {
    const saveData = settingsConfig.reduce(
      (acc, section) => {
        section.items.forEach((item) => {
          acc[item.key] = item.value;
        });
        return acc;
      },
      {} as Record<string, any>,
    );

    storageManager.setObj("userConfig", saveData);
  },
  { deep: true },
);

onActivated(() => {
  window.$Logger.logPageView({
    pageLink: "/Settings/",
    timeStamp: Date.now(),
  });
});
</script>

<style scoped>
.container {
  max-width: 800px;
  margin: 0 auto;
  background-color: #ffffff;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  border-bottom: 1px solid #dee2e6;
}

.header-title {
  display: flex;
  align-items: center;
  font-size: 1.5rem;
  font-weight: 500;
}

.header-title img {
  margin-right: 20px;
}

.settings-section {
  padding: 0 24px;
}

.section-title {
  padding: 24px 0 8px;
  font-size: 1rem;
  font-weight: 500;
  color: #6c757d;
}

.setting-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 0;
  border-bottom: 1px solid #e9ecef;
}

.setting-item:last-child {
  border-bottom: none;
}

.setting-item .label {
  font-size: 1rem;
}

.setting-item .value {
  display: flex;
  align-items: center;
  color: #6c757d;
  width: 200px;
}

.value .material-icons {
  font-size: 1rem;
  color: #adb5bd;
}

.toggle-switch {
  position: relative;
  display: inline-block;
  width: 44px;
  height: 24px;
}

.toggle-switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #ccc;
  transition: 0.4s;
  border-radius: 24px;
}

.slider:before {
  position: absolute;
  content: "";
  height: 20px;
  width: 20px;
  left: 2px;
  bottom: 2px;
  background-color: white;
  transition: 0.4s;
  border-radius: 50%;
}

input:checked + .slider {
  background-color: #007bff;
}

input:checked + .slider:before {
  transform: translateX(20px);
}

.version {
  font-size: 0.875rem;
  color: #6c757d;
  padding: 12px 24px;
  border-top: 1px solid #dee2e6;
}
</style>
