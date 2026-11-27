import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import boardEn from "@/locales/en/board.json";
import boardKo from "@/locales/ko/board.json";
import boardVi from "@/locales/vi/board.json";
import boardZh from "@/locales/zh/board.json";
import chatEn from "@/locales/en/chat.json";
import chatKo from "@/locales/ko/chat.json";
import chatVi from "@/locales/vi/chat.json";
import chatZh from "@/locales/zh/chat.json";
import commonEn from "@/locales/en/common.json";
import commonKo from "@/locales/ko/common.json";
import commonVi from "@/locales/vi/common.json";
import commonZh from "@/locales/zh/common.json";
import dormitoryEn from "@/locales/en/dormitory.json";
import dormitoryKo from "@/locales/ko/dormitory.json";
import dormitoryVi from "@/locales/vi/dormitory.json";
import dormitoryZh from "@/locales/zh/dormitory.json";
import homeEn from "@/locales/en/home.json";
import homeKo from "@/locales/ko/home.json";
import homeVi from "@/locales/vi/home.json";
import homeZh from "@/locales/zh/home.json";
import mypageEn from "@/locales/en/mypage.json";
import mypageKo from "@/locales/ko/mypage.json";
import mypageVi from "@/locales/vi/mypage.json";
import mypageZh from "@/locales/zh/mypage.json";
import onboardingEn from "@/locales/en/onboarding.json";
import onboardingKo from "@/locales/ko/onboarding.json";
import onboardingVi from "@/locales/vi/onboarding.json";
import onboardingZh from "@/locales/zh/onboarding.json";
import roommateEn from "@/locales/en/roommate.json";
import roommateKo from "@/locales/ko/roommate.json";
import roommateVi from "@/locales/vi/roommate.json";
import roommateZh from "@/locales/zh/roommate.json";
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

export const resources = {
  ko: {
    board: boardKo,
    common: commonKo,
    dormitory: dormitoryKo,
    home: homeKo,
    onboarding: onboardingKo,
    mypage: mypageKo,
    roommate: roommateKo,
    chat: chatKo,
  },
  en: {
    board: boardEn,
    common: commonEn,
    dormitory: dormitoryEn,
    home: homeEn,
    onboarding: onboardingEn,
    mypage: mypageEn,
    roommate: roommateEn,
    chat: chatEn,
  },
  zh: {
    board: boardZh,
    common: commonZh,
    dormitory: dormitoryZh,
    home: homeZh,
    onboarding: onboardingZh,
    mypage: mypageZh,
    roommate: roommateZh,
    chat: chatZh,
  },
  vi: {
    board: boardVi,
    common: commonVi,
    dormitory: dormitoryVi,
    home: homeVi,
    onboarding: onboardingVi,
    mypage: mypageVi,
    roommate: roommateVi,
    chat: chatVi,
  },
} as const;

export const NAMESPACES = [
  "board",
  "common",
  "dormitory",
  "home",
  "onboarding",
  "mypage",
  "roommate",
  "chat",
] as const;

if (!i18n.isInitialized) {
  void i18n.use(initReactI18next).init({
    resources,
    lng: initialLanguage,
    fallbackLng: "ko",
    defaultNS: "common",
    ns: [...NAMESPACES],
    interpolation: {
      escapeValue: false,
    },
  });
}

export default i18n;
