import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import onboardingEn from "@/locales/en/onboarding.json";
import onboardingKo from "@/locales/ko/onboarding.json";
import onboardingVi from "@/locales/vi/onboarding.json";
import onboardingZh from "@/locales/zh/onboarding.json";
import { safeLocalStorage } from "@/utils/safeStorage";

export const SUPPORTED_LANGUAGES = ["ko", "en", "zh", "vi"] as const;

export type Language = (typeof SUPPORTED_LANGUAGES)[number];

export const LANGUAGE_STORAGE_KEY = "unidorm-language";

export function isSupportedLanguage(value: string | null): value is Language {
  return (
    value !== null &&
    (SUPPORTED_LANGUAGES as readonly string[]).includes(value)
  );
}

export function getInitialLanguage(): Language {
  const stored = safeLocalStorage.getItem(LANGUAGE_STORAGE_KEY);
  return isSupportedLanguage(stored) ? stored : "ko";
}

const initialLanguage = getInitialLanguage();

if (typeof document !== "undefined") {
  document.documentElement.lang = initialLanguage;
}

if (!i18n.isInitialized) {
  void i18n.use(initReactI18next).init({
    resources: {
      ko: {
        onboarding: onboardingKo,
      },
      en: {
        onboarding: onboardingEn,
      },
      zh: {
        onboarding: onboardingZh,
      },
      vi: {
        onboarding: onboardingVi,
      },
    },
    lng: initialLanguage,
    fallbackLng: "ko",
    defaultNS: "onboarding",
    ns: ["onboarding"],
    interpolation: {
      escapeValue: false,
    },
  });
}

export default i18n;
