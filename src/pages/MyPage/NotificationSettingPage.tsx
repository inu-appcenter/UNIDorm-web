import styled from "styled-components";
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
    label: "유니돔 앱 알림",
    type: "유니돔",
    apiKey: "unidormNotification" as keyof NotificationPreferences,
    description: "유니돔 공지사항",
  },
  {
    label: "생활원 공지사항 알림",
    type: "생활원",
    apiKey: "dormitoryNotification" as keyof NotificationPreferences,
    description: "생활원 공지사항",
  },
  {
    label: "서포터즈 공지사항 알림",
    type: "서포터즈",
    apiKey: "supportersNotification" as keyof NotificationPreferences,
    description: "서포터즈 공지사항",
  },
  {
    label: "룸메이트 알림",
    type: "룸메이트",
    apiKey: "roommateNotification" as keyof NotificationPreferences,
    description: "퀵 메시지",
  },
  {
    label: "공동구매 알림",
    type: "공동구매",
    apiKey: "groupOrderNotification" as keyof NotificationPreferences,
    description: "키워드 및 카테고리 새 글 알림 / 좋아요한 글 마감 임박 알림",
  },
];

const adminNotificationSettingMenus = [
  {
    label: "새 민원 알림",
    type: "민원",
    apiKey: "complaintNotification" as keyof NotificationPreferences,
    description: "새 민원 등록 알림을 켜고 끌 수 있습니다.",
  },
];

const NotificationSettingPage = () => {
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
      alert("유니돔 앱 알림을 먼저 켜주세요.");
      return;
    }

    const newStatus = {
      ...notificationStatus,
      [type]: enabled,
    };

    if (type === "유니돔" && !enabled) {
      const confirmed = window.confirm(
        "유니돔 앱 알림을 끄면 모든 알림을 받을 수 없습니다. 진행하시겠습니까?",
      );
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
    ...menu,
    checked: notificationStatus[menu.type] ?? false,
  }));

  const adminMenusWithStatus = adminNotificationSettingMenus.map((menu) => ({
    ...menu,
    checked: notificationStatus[menu.type] ?? false,
  }));

  useSetHeader({ title: "앱 알림 설정" });

  return (
    <Wrapper>
      {isLoading ? (
        <LoadingSpinner
          overlay={true}
          message={"알림 설정 상태를 불러오는 중"}
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
          title={"관리자 알림 설정"}
          description={"관리자 권한인 경우에만 표시됩니다."}
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
