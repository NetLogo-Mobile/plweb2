<template>
  <div class="settings-wrapper">
    <div class="settings-container">
      <div class="settings-header">
        <img
          src="/assets/library/Navigation-Return.png"
          alt="back"
          class="back-icon"
          @click="goBack"
        />
        <h1 class="page-title">{{ $t("settings.settings") }}</h1>
      </div>

      <div class="settings-content">
        <div
          v-for="section in settingsConfig"
          :key="section.title"
          class="settings-section"
        >
          <h2 class="section-title">{{ $t(`settings.${section.title}`) }}</h2>
          <div class="section-items">
            <div
              v-for="item in section.items"
              :key="item.key"
              class="setting-item"
            >
              <span class="item-label">{{ $t(`settings.${item.key}`) }}</span>

              <!-- Select/Link Type -->
              <div v-if="item.type === 'link'" class="item-control">
                <n-select
                  :options="item.options"
                  size="small"
                  :value="item.value as string"
                  style="width: 150px"
                  @update:value="handleSelectChange(item, $event)"
                />
              </div>

              <!-- Toggle Type -->
              <label v-else-if="item.type === 'toggle'" class="toggle-wrapper">
                <input
                  type="checkbox"
                  :checked="item.value === 'on'"
                  @change="handleToggleChange(item, $event)"
                />
                <span class="toggle-slider"></span>
              </label>

              <!-- Button Type -->
              <button
                v-else-if="item.type === 'button'"
                class="export-button"
                @click="handleButtonClick(item)"
              >
                {{ $t(`settings.${item.key}`) }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div class="settings-footer">
        <span class="version-info">v{{ sysConfig.version }}</span>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { reactive, onActivated } from "vue";
import { settingsConfig as s } from "../config/user.config";
import { NSelect } from "naive-ui";
import storageManager from "../services/storage";
import sysConfig from "../config/system.config";
import i18n from "@i18n/index";

const settingsConfig = reactive(s);

// Initialize settings from storage
const savedValues = storageManager.getObj("userConfig")?.value || {};
settingsConfig.forEach((section) => {
  section.items.forEach((item) => {
    if (item.type !== "button" && savedValues[item.key] !== undefined) {
      item.value = savedValues[item.key];
    }
  });
});

// Restore language setting on component mount
if (savedValues.language) {
  i18n.global.locale.value = savedValues.language as any;
}

function saveSettings() {
  const saveData: Record<string, any> = {};
  settingsConfig.forEach((section) => {
    section.items.forEach((item) => {
      if (item.type !== "button") {
        saveData[item.key] = item.value;
      }
    });
  });
  storageManager.setObj("userConfig", saveData);
}

function handleSelectChange(item: any, newValue: string) {
  item.value = newValue;
  saveSettings();
  if (item.callBack) {
    item.callBack(newValue);
  }
}

function handleToggleChange(item: any, event: Event) {
  const target = event.target as HTMLInputElement;
  item.value = target.checked ? "on" : "off";
  saveSettings();
  if (item.callBack) {
    item.callBack(target.checked ? "on" : "off");
  }
}

function handleButtonClick(item: any) {
  if (item.callBack) {
    item.callBack();
  }
}

function goBack() {
  window.history.back();
}

onActivated(() => {
  if (window.$Logger) {
    window.$Logger.logPageView({
      pageLink: "/settings",
      timeStamp: Date.now(),
    });
  }
});
</script>

<style scoped>
.settings-wrapper {
  width: 100%;
  min-height: 100vh;
  background-color: #f5f5f5;
  padding: 20px 0;
}

.settings-container {
  max-width: 700px;
  margin: 0 auto;
  background-color: #ffffff;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.settings-header {
  display: flex;
  align-items: center;
  padding: 24px 24px 20px 24px;
  border-bottom: 2px solid #f0f0f0;
  background-color: #ffffff;
}

.back-icon {
  width: 28px;
  height: 28px;
  cursor: pointer;
  transition: transform 0.2s;
  margin-right: 16px;
}

.back-icon:hover {
  transform: scale(1.1);
}

.page-title {
  margin: 0;
  font-size: 24px;
  font-weight: 600;
  color: #333333;
  letter-spacing: 0.5px;
}

.settings-content {
  padding: 24px;
}

.settings-section {
  margin-bottom: 32px;
}

.settings-section:last-child {
  margin-bottom: 0;
}

.section-title {
  font-size: 14px;
  font-weight: 700;
  color: #667eea;
  text-transform: uppercase;
  letter-spacing: 1px;
  margin: 0 0 16px 0;
  padding-bottom: 8px;
  border-bottom: 2px solid #667eea;
}

.section-items {
  display: flex;
  flex-direction: column;
  gap: 0;
}

.setting-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 16px;
  border-bottom: 1px solid #f0f0f0;
  transition: background-color 0.2s;
}

.setting-item:last-child {
  border-bottom: none;
}

.setting-item:hover {
  background-color: #fafbfc;
}

.item-label {
  font-size: 14px;
  font-weight: 500;
  color: #333333;
  min-width: 120px;
}

.item-control {
  display: flex;
  align-items: center;
  gap: 8px;
}

/* Toggle Switch Styles */
.toggle-wrapper {
  position: relative;
  display: inline-block;
  width: 50px;
  height: 28px;
  cursor: pointer;
}

.toggle-wrapper input {
  opacity: 0;
  width: 0;
  height: 0;
}

.toggle-slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #d4d4d4;
  transition: all 0.3s ease;
  border-radius: 34px;
  box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.1);
}

.toggle-slider:before {
  position: absolute;
  content: "";
  height: 24px;
  width: 24px;
  left: 2px;
  bottom: 2px;
  background-color: white;
  transition: all 0.3s ease;
  border-radius: 50%;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.toggle-wrapper input:checked + .toggle-slider {
  background-color: #8293dd;
  box-shadow: inset 0 2px 4px rgba(102, 126, 234, 0.3);
}

.toggle-wrapper input:checked + .toggle-slider:before {
  transform: translateX(22px);
  background-color: #ffffff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.toggle-wrapper input:focus + .toggle-slider {
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.2);
}

/* Export Button Styles */
.export-button {
  padding: 10px 24px;
  background-color: #8293dd;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(102, 126, 234, 0.2);
  letter-spacing: 0.5px;
  text-transform: uppercase;
  white-space: nowrap;
}

.export-button:hover {
  background-color: #5568d3;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.export-button:active {
  transform: translateY(0);
  box-shadow: 0 2px 8px rgba(102, 126, 234, 0.3);
}

.export-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.settings-footer {
  padding: 16px 24px;
  border-top: 2px solid #f0f0f0;
  background-color: #fafbfc;
  text-align: center;
}

.version-info {
  font-size: 12px;
  color: #999999;
  letter-spacing: 0.5px;
}

/* Responsive Design */
@media (max-width: 600px) {
  .settings-wrapper {
    padding: 10px 0;
  }

  .settings-container {
    border-radius: 0;
  }

  .settings-header {
    padding: 20px 16px 16px 16px;
  }

  .page-title {
    font-size: 20px;
  }

  .settings-content {
    padding: 16px;
  }

  .setting-item {
    padding: 12px 12px;
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  .item-label {
    min-width: auto;
  }

  .item-control {
    width: 100%;
    justify-content: flex-end;
  }

  .export-button {
    width: 100%;
    padding: 12px 16px;
  }
}
</style>
