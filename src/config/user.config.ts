import i18n from "@i18n/index";
import storageManager from "../services/storage";
import { showDialog, showNotification } from "@popup/naiveui";

export const settingsConfig = [
  {
    title: "general",
    items: [
      {
        key: "language",
        label: "界面语言",
        type: "link",
        value: "Chinese",
        options: [
          { label: "简体中文", value: "Chinese" },
          { label: "English", value: "English" },
          { label: "Deutsch", value: "German" },
          { label: "日本語", value: "Japanese" },
          { label: "Français", value: "French" },
        ],
        callBack: (newValue: string) => {
          i18n.global.locale.value = newValue as "English" | "Chinese" | "German" | "Japanese" | "French";
          // Save language setting to localStorage
          const userConfig = storageManager.getObj("userConfig")?.value || {};
          userConfig.language = newValue;
          storageManager.setObj("userConfig", userConfig);
          window.$Logger.logEvent({
            category: "Account",
            action: "Switch-Language",
            label: newValue,
            timestamp: Date.now(),
          });
          showDialog("info", {
            title: i18n.global.t("settings.languageChangeTitle"),
            content: i18n.global.t("settings.languageChangeContent"),
            positiveText: i18n.global.t("login.confirm"),
            onPositiveClick: () => {
              showNotification({
                type: "success",
                title: i18n.global.t("settings.languageChangeTitle"),
              });
            },
          });
        },
      },
      {
        key: "debugger",
        label: "错误日志",
        type: "link",
        value: "on",
        options: [
          { label: "on", value: "on" },
          { label: "off", value: "off" },
        ],
        callBack: (newValue: string) => {
          if (newValue === "off") {
            localStorage.removeItem("error_logs");
          }
          showDialog("warning", {
            title: i18n.global.t("login.reLogin"),
            content: i18n.global.t("login.reLoginContent"),
            positiveText: i18n.global.t("login.confirm"),
            onPositiveClick: async () => {
              storageManager.remove("userInfo");
              window.$Logger.logEvent({
                category: "Account",
                action: "Toggle-Error-Logger",
                label: newValue,
                timestamp: Date.now(),
              });
            },
          });
        },
      },
      {
        key: "exportLogs",
        label: "导出错误日志",
        type: "button",
        callBack: () => {
          window.$ErrorLogger.exportToTxt();
          window.$Logger.logEvent({
            category: "Account",
            action: "Export-Error-Logs",
            timestamp: Date.now(),
          });
        },
      },
      // {
      //   key: "",
      //   label: "如题",
      //   type: "toggle",
      //   value: false,
      // },
    ],
  },
];
