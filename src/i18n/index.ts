import zh from "./zh";
import en from "./en";
import de from "./de";
import ja from "./ja";
import fr from "./fr";
import { createI18n } from "vue-i18n";

const datetimeFormats = {
  Chinese: {
    time: {
      hour: "numeric" as const,
      minute: "numeric" as const,
      hour12: true,
    },
    monthDay: {
      month: "numeric" as const,
      day: "numeric" as const,
      hour: "numeric" as const,
      minute: "numeric" as const,
      hour12: true,
    },
    yearMonthDay: {
      year: "numeric" as const,
      month: "numeric" as const,
      day: "numeric" as const,
      hour: "numeric" as const,
      minute: "numeric" as const,
      hour12: true,
    },
    date: {
      year: "2-digit" as const,
      month: "short" as const,
      day: "numeric" as const,
    },
  },
  English: {
    time: {
      hour: "numeric" as const,
      minute: "numeric" as const,
      hour12: true,
    },
    monthDay: {
      month: "short" as const,
      day: "numeric" as const,
      hour: "numeric" as const,
      minute: "numeric" as const,
      hour12: true,
    },
    yearMonthDay: {
      year: "2-digit" as const,
      month: "short" as const,
      day: "numeric" as const,
      hour: "numeric" as const,
      minute: "numeric" as const,
      hour12: true,
    },
    date: {
      year: "2-digit" as const,
      month: "short" as const,
      day: "numeric" as const,
    },
  },
  German: {
    time: {
      hour: "numeric" as const,
      minute: "numeric" as const,
      hour12: false,
    },
    monthDay: {
      month: "2-digit" as const,
      day: "2-digit" as const,
      hour: "numeric" as const,
      minute: "numeric" as const,
      hour12: false,
    },
    yearMonthDay: {
      year: "2-digit" as const,
      month: "2-digit" as const,
      day: "2-digit" as const,
      hour: "numeric" as const,
      minute: "numeric" as const,
      hour12: false,
    },
    date: {
      year: "2-digit" as const,
      month: "2-digit" as const,
      day: "2-digit" as const,
    },
  },
  Japanese: {
    time: {
      hour: "numeric" as const,
      minute: "numeric" as const,
      hour12: false,
    },
    monthDay: {
      month: "numeric" as const,
      day: "numeric" as const,
      hour: "numeric" as const,
      minute: "numeric" as const,
      hour12: false,
    },
    yearMonthDay: {
      year: "numeric" as const,
      month: "numeric" as const,
      day: "numeric" as const,
      hour: "numeric" as const,
      minute: "numeric" as const,
      hour12: false,
    },
    date: {
      year: "numeric" as const,
      month: "numeric" as const,
      day: "numeric" as const,
    },
  },
  French: {
    time: {
      hour: "numeric" as const,
      minute: "numeric" as const,
      hour12: false,
    },
    monthDay: {
      month: "long" as const,
      day: "numeric" as const,
      hour: "numeric" as const,
      minute: "numeric" as const,
      hour12: false,
    },
    yearMonthDay: {
      year: "2-digit" as const,
      month: "long" as const,
      day: "numeric" as const,
      hour: "numeric" as const,
      minute: "numeric" as const,
      hour12: false,
    },
    date: {
      year: "2-digit" as const,
      month: "long" as const,
      day: "numeric" as const,
    },
  },
};

const messages = {
  Chinese: zh,
  English: en,
  German: de,
  Japanese: ja,
  French: fr,
};

const _l = navigator.language;
const defaultLanguage =
  _l === "zh-CN" ? "Chinese" : _l === "zh" ? "Chinese" : "English";

const i18n = createI18n({
  legacy: false,
  locale: defaultLanguage,
  fallbackLocale: defaultLanguage,
  datetimeFormats,
  messages,
});

export default i18n;
