import styled from "styled-components";
import { useTranslation } from "react-i18next";
import MenuGroup from "../../components/mypage/MenuGroup.tsx";
import {
  addNotificationPreferences,
  deleteNotificationPreferences,
} from "@/apis/notification";
import { useState } from "react";
import { useNotificationPreferences } from "@/queries/members";
import { useInitFromQuery } from "@/hooks/useInitFromQuery";
import { NotificationPreferences } from "@/types/notifications";
import LoadingSpinner from "../../components/common/LoadingSpinner.tsx";
import { useSetHeader } from "@/hooks/useSetHeader";
import Box from "@/components/common/Box";
import TitleContentArea from "@/components/common/TitleContentArea";
import { useUserRole } from "@/hooks/useUserRole";

// 알림 항목 목록
const notificationSettingMenus = [
  {
    key: "unidorm",
    type: "유니돔",
    apiKey: "unidormNotification" as keyof NotificationPreferences,
  },
  {
    key: "dormitory",
    type: "생활원",
    apiKey: "dormitoryNotification" as keyof NotificationPreferences,
  },
  {
    key: "supporters",
    type: "서포터즈",
    apiKey: "supportersNotification" as keyof NotificationPreferences,
  },
  {
    key: "roommate",
    type: "룸메이트",
    apiKey: "roommateNotification" as keyof NotificationPreferences,
  },
  {
    key: "groupPurchase",
    type: "공동구매",
    apiKey: "groupOrderNotification" as keyof NotificationPreferences,
  },
];

const adminNotificationSettingMenus = [
  {
    key: "adminComplaint",
    type: "민원",
    apiKey: "complaintNotification" as keyof NotificationPreferences,
  },
];

const NotificationSettingPage = () => {
  const { t } = useTranslation("mypage");
  const { isMainAdmin, isDormAdmin } = useUserRole();
  const { data: preferences, isLoading } = useNotificationPreferences();

  // 알림 상태 관리
  const [notificationStatus, setNotificationStatus] = useState<
    Record<string, boolean>
  >({});

  useInitFromQuery(preferences, (apiData) => {
    const allMenus = [
      ...notificationSettingMenus,
      ...adminNotificationSettingMenus,
    ];

    const newStatus = allMenus.reduce(
      (acc, menu) => {
        const status = apiData[menu.apiKey];
        acc[menu.type] = status ?? false;
        return acc;
      },
      {} as Record<string, boolean>,
    );

    const isUnidormEnabled = newStatus["유니돔"];
    const hasOtherEnabled = notificationSettingMenus.some(
      (menu) => menu.type !== "유니돔" && newStatus[menu.type],
    );

    if (!isUnidormEnabled && hasOtherEnabled) {
      newStatus["유니돔"] = true;
      addSingleNotificationPreference("유니돔");
    }

    setNotificationStatus(newStatus);
  });

  // 알림 활성화
  const addSingleNotificationPreference = async (type: string) => {
    try {
      await addNotificationPreferences([type]);
    } catch (error) {
      console.error(`알림 설정 활성화 중 오류 발생 (${type})`, error);
    }
  };

  // 알림 비활성화
  const deleteSingleNotificationPreference = async (type: string) => {
    try {
      await deleteNotificationPreferences([type]);
    } catch (error) {
      console.error(`알림 설정 삭제 중 오류 발생 (${type})`, error);
    }
  };

  // 일반 토글 변경 로직
  const handleToggleChange = (type: string, enabled: boolean) => {
    if (type !== "유니돔" && !notificationStatus["유니돔"]) {
      alert(t("notiSetting.enableMainFirst"));
      return;
    }

    const newStatus = {
      ...notificationStatus,
      [type]: enabled,
    };

    if (type === "유니돔" && !enabled) {
      const confirmed = window.confirm(t("notiSetting.disableMainConfirm"));
      if (!confirmed) return;

      notificationSettingMenus.forEach((menu) => {
        newStatus[menu.type] = false;
        deleteSingleNotificationPreference(menu.type);
      });
    }

    setNotificationStatus(newStatus);

    if (!(type === "유니돔" && !enabled)) {
      if (enabled) {
        addSingleNotificationPreference(type);
      } else {
        deleteSingleNotificationPreference(type);
      }
    }
  };

  // 관리자 토글 변경 로직
  const handleAdminToggleChange = (type: string, enabled: boolean) => {
    const newStatus = {
      ...notificationStatus,
      [type]: enabled,
    };

    setNotificationStatus(newStatus);

    if (enabled) {
      addSingleNotificationPreference(type);
    } else {
      deleteSingleNotificationPreference(type);
    }
  };

  const menusWithStatus = notificationSettingMenus.map((menu) => ({
    label: t(`notiSetting.menus.${menu.key}.label`),
    description: t(`notiSetting.menus.${menu.key}.description`),
    type: menu.type,
    checked: notificationStatus[menu.type] ?? false,
  }));

  const adminMenusWithStatus = adminNotificationSettingMenus.map((menu) => ({
    label: t(`notiSetting.menus.${menu.key}.label`),
    description: t(`notiSetting.menus.${menu.key}.description`),
    type: menu.type,
    checked: notificationStatus[menu.type] ?? false,
  }));

  useSetHeader({ title: t("notiSetting.title") });

  return (
    <Wrapper>
      {isLoading ? (
        <LoadingSpinner
          overlay={true}
          message={t("notiSetting.loading")}
        />
      ) : (
        <Box>
          <MenuGroup
            title={""}
            menus={menusWithStatus}
            hasToggle={true}
            onToggle={handleToggleChange}
          />
        </Box>
      )}

      {(isMainAdmin || isDormAdmin) && (
        <TitleContentArea
          title={t("notiSetting.adminTitle")}
          description={t("notiSetting.adminDescription")}
        >
          <Box>
            <MenuGroup
              title={""}
              menus={adminMenusWithStatus}
              hasToggle={true}
              onToggle={handleAdminToggleChange}
            />
          </Box>
        </TitleContentArea>
      )}
    </Wrapper>
  );
};

export default NotificationSettingPage;

const Wrapper = styled.div`
  flex: 1;
  padding: 24px 16px;
  gap: 16px;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  overflow-y: auto;
`;
