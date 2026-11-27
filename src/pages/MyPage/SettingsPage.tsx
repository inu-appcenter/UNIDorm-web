import { useEffect, useState } from "react";
import { Check } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import CommonBottomSheet from "@/components/modal/CommonBottomSheet";
import MenuGroup from "@/components/mypage/MenuGroup";
import { PATHS } from "@/constants/paths";
import { useSetHeader } from "@/hooks/useSetHeader";
import { useUserRole } from "@/hooks/useUserRole";
import { SUPPORTED_LANGUAGES } from "@/i18n";
import { createSettingsMenuGroups } from "@/stores/menuGroupsFactory";
import { useLanguageStore } from "@/stores/useLanguageStore";
import { colors, typography } from "@/styles/tokens";
import { appBridge } from "@/utils/appBridgeAdapter";

const APP_VERSION = "1.8.0";

const SettingsPage = () => {
  const navigate = useNavigate();
  const { t } = useTranslation(["mypage", "common"]);
  const { isLoggedIn, isAdmin } = useUserRole();
  const language = useLanguageStore((state) => state.language);
  const setLanguage = useLanguageStore((state) => state.setLanguage);

  const [showHiddenMenu, setShowHiddenMenu] = useState(false);
  const [clickCount, setClickCount] = useState(0);
  const [isLanguageSheetOpen, setIsLanguageSheetOpen] = useState(false);

  const menuGroups = createSettingsMenuGroups(navigate, isLoggedIn, t);

  useSetHeader({
    title: t("mypage:settings.title"),
  });

  useEffect(() => {
    if (clickCount >= 5 && !showHiddenMenu) {
      setShowHiddenMenu(true);
    }
  }, [clickCount, showHiddenMenu]);

  const handleAppUpdate = () => {
    if (appBridge.isApp()) {
      appBridge.requestAppUpdate();
      return;
    }

    if (window.confirm(t("mypage:settings.reloadConfirm"))) {
      window.location.reload();
    }
  };

  return (
    <SettingsWrapper>
      <MenuGroupsWrapper>
        <MenuGroup
          title={t("mypage:settings.languageSection")}
          menus={[
            {
              label: t("mypage:settings.languageLabel"),
              description: t(`common:languageOptions.${language}`),
              onClick: () => setIsLanguageSheetOpen(true),
            },
          ]}
        />
        <Divider />

        <MenuGroup title={menuGroups[0].title} menus={menuGroups[0].menus} />
        <Divider />

        <MenuGroup
          title={t("mypage:settings.appInfoSection")}
          menus={[
            {
              label: t("mypage:settings.version", { version: APP_VERSION }),
              onClick: () => setClickCount((prev) => prev + 1),
            },
            {
              label: t("mypage:settings.updateApp"),
              onClick: handleAppUpdate,
            },
          ]}
        />

        {showHiddenMenu && (
          <>
            <Divider />
            <MenuGroup
              title={t("mypage:settings.hiddenMenuSection")}
              menus={[
                {
                  label: t("mypage:settings.viewLogs"),
                  onClick: () => navigate(PATHS.SETTINGS_LOGS),
                },
                {
                  label: t("mypage:settings.viewFcmToken"),
                  onClick: () => navigate(PATHS.ADMIN.FCM),
                },
              ]}
            />
          </>
        )}

        {isAdmin && (
          <>
            <Divider />
            <MenuGroup
              title={t("mypage:settings.adminSection")}
              menus={[
                {
                  label: t("mypage:settings.adminPage"),
                  onClick: () => navigate(PATHS.ADMIN.ROOT),
                },
              ]}
            />
          </>
        )}
      </MenuGroupsWrapper>

      <CommonBottomSheet
        id="settings-language-sheet"
        isOpen={isLanguageSheetOpen}
        setIsOpen={setIsLanguageSheetOpen}
        title={t("mypage:settings.languageSheetTitle")}
        subtitle={t("mypage:settings.languageSheetSubtitle")}
        closeButtonText={t("common:actions.close")}
      >
        <LanguageOptionList>
          {SUPPORTED_LANGUAGES.map((lang) => {
            const isSelected = language === lang;
            return (
              <LanguageOptionButton
                key={lang}
                type="button"
                $selected={isSelected}
                onClick={() => {
                  setLanguage(lang);
                  setIsLanguageSheetOpen(false);
                }}
              >
                <LanguageLabel>{t(`common:languageOptions.${lang}`)}</LanguageLabel>
                {isSelected && <Check size={18} strokeWidth={2.5} />}
              </LanguageOptionButton>
            );
          })}
        </LanguageOptionList>
      </CommonBottomSheet>
    </SettingsWrapper>
  );
};

export default SettingsPage;

const SettingsWrapper = styled.div`
  padding: 24px 16px;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  width: 100%;
  flex: 1;
  overflow-y: auto;

  @media (min-width: 1024px) {
    max-width: 1200px;
    margin: 0 auto;
  }
`;

const MenuGroupsWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const Divider = styled.div`
  height: 1px;
  margin: 0 -16px;
  background: #0000001a;
`;

const LanguageOptionList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  width: 100%;
`;

const LanguageOptionButton = styled.button<{ $selected: boolean }>`
  width: 100%;
  min-height: 48px;
  padding: 12px 16px;
  border-radius: 12px;
  border: 1.5px solid
    ${({ $selected }) => ($selected ? colors.main.main1 : colors.gray.gray200)};
  background-color: ${({ $selected }) =>
    $selected ? colors.blue.blue100 : colors.bg.bg1};
  color: ${({ $selected }) =>
    $selected ? colors.main.main2 : colors.text.text1};
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  cursor: pointer;
  box-sizing: border-box;
  transition:
    background-color 0.16s cubic-bezier(0.16, 1, 0.3, 1),
    border-color 0.16s cubic-bezier(0.16, 1, 0.3, 1),
    transform 0.12s cubic-bezier(0.16, 1, 0.3, 1);

  &:active {
    transform: scale(0.985);
  }
`;

const LanguageLabel = styled.span`
  ${typography.body1Normal};
  color: inherit;
  min-width: 0;
  text-align: left;
`;
