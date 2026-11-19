import { create } from "zustand";
import i18n, {
  getInitialLanguage,
  isSupportedLanguage,
  LANGUAGE_STORAGE_KEY,
  type Language,
} from "@/i18n";
import { broadcastSync } from "@/stores/middleware/broadcastSync";
import { safeLocalStorage } from "@/utils/safeStorage";

interface LanguageState {
  language: Language;
  setLanguage: (language: Language) => void;
}

function applyLanguageSideEffects(language: Language) {
  safeLocalStorage.setItem(LANGUAGE_STORAGE_KEY, language);
  if (typeof document !== "undefined") {
    document.documentElement.lang = language;
  }
  if (i18n.language !== language) {
    void i18n.changeLanguage(language);
  }
}

export const useLanguageStore = create<LanguageState>()(
  broadcastSync<LanguageState>({
    name: "language-store-sync",
    partialize: (state) => ({ language: state.language }),
    onReceive: (partial) => {
      if (partial.language && isSupportedLanguage(partial.language)) {
        applyLanguageSideEffects(partial.language);
      }
    },
  })((set) => ({
    language: getInitialLanguage(),
    setLanguage: (language) => {
      applyLanguageSideEffects(language);
      set({ language });
    },
  })),
);

export type { Language };
