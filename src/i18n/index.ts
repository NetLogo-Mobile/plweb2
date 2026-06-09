import zh from "./zh";
import en from "./en";
import de from "./de";
import ja from "./ja";
import fr from "./fr";
import { createI18n } from "vue-i18n";
import storageManager from "@storage/index";

export type AppLanguage =
  | "Chinese"
  | "English"
  | "German"
  | "Japanese"
  | "French";

export type BrowserLanguage = "zh-CN" | "en-US" | "de-DE" | "ja-JP" | "fr-FR";

const LANGUAGE_BY_CODE: Record<string, AppLanguage> = {
  zh: "Chinese",
  en: "English",
  de: "German",
  ja: "Japanese",
  fr: "French",
};

const API_LANGUAGE_BY_APP_LANGUAGE: Record<BrowserLanguage, string> = {
  "zh-CN": "Chinese",
  "en-US": "English",
  "de-DE": "German",
  "ja-JP": "Japanese",
  "fr-FR": "French",
};

function normalizeLanguageTag(rawLanguage: string): string {
  return rawLanguage.trim().replace(/_/g, "-").toLowerCase();
}

export function normalizeToAppLanguage(
  rawLanguage?: string | null,
): AppLanguage | null {
  if (!rawLanguage) {
    return null;
  }

  const normalized = normalizeLanguageTag(rawLanguage);

  const exactLanguageMap: Record<string, AppLanguage> = {
    chinese: "Chinese",
    english: "English",
    german: "German",
    japanese: "Japanese",
    french: "French",
    "zh-cn": "Chinese",
    "zh-hans": "Chinese",
    "en-us": "English",
    "de-de": "German",
    "ja-jp": "Japanese",
    "fr-fr": "French",
  };

  if (exactLanguageMap[normalized]) {
    return exactLanguageMap[normalized];
  }

  const [baseCode] = normalized.split("-");
  if (!baseCode) {
    return null;
  }
  return LANGUAGE_BY_CODE[baseCode] ?? null;
}

export function detectBrowserLanguage(
  browserLanguages: readonly string[] = navigator.languages,
  browserLanguage: string = navigator.language,
): AppLanguage {
  for (const languageTag of browserLanguages) {
    const matched = normalizeToAppLanguage(languageTag);
    if (matched) {
      return matched;
    }
  }

  return normalizeToAppLanguage(browserLanguage) ?? "English";
}

export function toApiLanguage(language: AppLanguage | string): string {
  const appLanguage = normalizeToAppLanguage(language) ?? "English";
  return API_LANGUAGE_BY_APP_LANGUAGE[appLanguage];
}

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

const config = storageManager.getObj("userConfig");
const defaultLanguage =
  normalizeToAppLanguage(config.value?.language) ?? detectBrowserLanguage();

const i18n = createI18n({
  legacy: false,
  locale: defaultLanguage,
  fallbackLocale: defaultLanguage,
  datetimeFormats,
  messages,
});

// Translation is done useing gpt-5.1-mini

export default i18n;
