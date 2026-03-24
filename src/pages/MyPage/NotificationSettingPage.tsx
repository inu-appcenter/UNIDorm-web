import styled from "styled-components";
import MenuGroup from "../../components/mypage/MenuGroup.tsx";
import {
  addNotificationPreferences,
  deleteNotificationPreferences,
  getUserNotificationPreferences,
} from "@/apis/notification";
import { useEffect, useState } from "react";
import { NotificationPreferences } from "@/types/notifications";
import LoadingSpinner from "../../components/common/LoadingSpinner.tsx";
import { useSetHeader } from "@/hooks/useSetHeader";
import Box from "@/components/common/Box";
import TitleContentArea from "@/components/common/TitleContentArea";
import { useUserRole } from "@/hooks/useUserRole";

// 알림 항목 목록 (로컬 이름과 API 키를 매핑하여 관리)
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

  // 알림 상태를 { type: boolean } 형태로 관리 (예: { 룸메이트: true, 공동구매: false, ... })
  const [notificationStatus, setNotificationStatus] = useState<
    Record<string, boolean>
  >({});

  // 로딩 상태 (초기 데이터를 불러올 때 사용)
  const [isLoading, setIsLoading] = useState(true);

  // ---  초기 설정 불러오기 (GET) ---
  const fetchInitialPreferences = async () => {
    try {
      const response = await getUserNotificationPreferences();
      const apiData = response.data; // NotificationPreferences 객체

      // API 응답 객체를 로컬 상태 객체 형식으로 변환하여 초기 상태 설정
      const newStatus = notificationSettingMenus.reduce(
        (acc, menu) => {
          const status = apiData[menu.apiKey];
          acc[menu.type] = status ?? false;
          return acc;
        },
        {} as Record<string, boolean>,
      );

      // [추가] 유니돔 앱 알림이 꺼져 있는데 다른 알림이 켜져 있는 경우 (버그 방지)
      const isUnidormEnabled = newStatus["유니돔"];
      const hasOtherEnabled = Object.entries(newStatus).some(
        ([type, enabled]) => type !== "유니돔" && enabled,
      );

      if (!isUnidormEnabled && hasOtherEnabled) {
        newStatus["유니돔"] = true;
        // 서버에도 동기화
        addSingleNotificationPreference("유니돔");
      }

      setNotificationStatus(newStatus);
    } catch (error) {
      console.error("초기 알림 설정을 불러오는 데 실패했습니다.", error);
      // 실패 시 기본값(모두 false)으로 초기화
      setNotificationStatus(
        notificationSettingMenus.reduce(
          (acc, menu) => ({ ...acc, [menu.type]: false }),
          {} as Record<string, boolean>,
        ),
      );
    } finally {
      setIsLoading(false);
    }
  };

  // 컴포넌트 마운트 시 초기 설정 정보를 불러옵니다.
  useEffect(() => {
    fetchInitialPreferences();
  }, []);

  // --- 🟢 알림 활성화 (POST) ---
  // 단일 알림 타입만 추가/업데이트 요청
  const addSingleNotificationPreference = async (type: string) => {
    try {
      console.log(`POST API 요청 데이터: ${[type]}`);
      await addNotificationPreferences([type]); // 배열에 담아 전송
      console.log(`알림 수신 설정 추가 요청 성공: ${type}`);
    } catch (error) {
      console.error(`알림 설정 활성화 중 오류 발생 (${type})`, error);
    }
  };

  // --- 알림 비활성화 (DELETE) ---
  // 단일 알림 타입만 삭제 요청
  const deleteSingleNotificationPreference = async (type: string) => {
    try {
      console.log(`DELETE API 요청 데이터: ${[type]}`);
      await deleteNotificationPreferences([type]); // 배열에 담아 쿼리 파라미터로 전송
      console.log(`알림 수신 설정 삭제 요청 성공: ${type}`);
    } catch (error) {
      console.error(`알림 설정 삭제 중 오류 발생 (${type})`, error);
    }
  };

  // --- 개별 토글 변경 시 실행 (메인 로직) ---
  const handleToggleChange = (type: string, enabled: boolean) => {
    // 1. 유니돔 앱 알림 의존성 체크
    if (type !== "유니돔" && !notificationStatus["유니돔"]) {
      alert("유니돔 앱 알림을 먼저 켜주세요.");
      return;
    }

    // 2. 로컬 상태 업데이트
    const newStatus = {
      ...notificationStatus,
      [type]: enabled,
    };

    // 만약 '유니돔' 알림을 끄는 경우, 다른 모든 알림도 시각적으로 꺼짐 처리하거나
    // 혹은 여기서는 유니돔만 끄고 다른 토글을 막는 정책을 취할 수 있습니다.
    // 여기서는 유니돔을 끌 때 다른 모든 알림도 함께 비활성화(서버 연동 포함) 하도록 구현합니다.
    if (type === "유니돔" && !enabled) {
      const confirmed = window.confirm(
        "유니돔 앱 알림을 끄면 모든 알림을 받을 수 없습니다. 진행하시겠습니까?",
      );
      if (!confirmed) return;

      // 모든 상태 false로 변경
      Object.keys(newStatus).forEach((key) => {
        newStatus[key] = false;
      });

      // 서버에도 모든 알림 삭제 요청 (기존 API가 배열을 받으므로 한 번에 보낼 수 있는지 확인 필요)
      // 여기서는 기존 로직대로 개별 삭제 혹은 전체 삭제 API가 있다면 그것을 사용해야 함.
      // 현재 add/deleteSingle... 함수는 하나씩 처리하므로 루프를 돌거나,
      // API가 지원한다면 전체 타입을 배열로 보내야 함.
      notificationSettingMenus.forEach((menu) => {
        deleteSingleNotificationPreference(menu.type);
      });
    }

    setNotificationStatus(newStatus);

    // 3. 토글 상태에 따라 적절한 API 호출 (유니돔을 끈 경우는 위에서 처리했으므로 제외)
    if (!(type === "유니돔" && !enabled)) {
      if (enabled) {
        addSingleNotificationPreference(type);
      } else {
        deleteSingleNotificationPreference(type);
      }
    }
  };

  // --- 개별 토글 변경 시 실행 (메인 로직) ---
  const handleAdminToggleChange = (type: string, enabled: boolean) => {
    // 2. 로컬 상태 업데이트
    const newStatus = {
      ...notificationStatus,
      [type]: enabled,
    };

    setNotificationStatus(newStatus);

    // 3. 토글 상태에 따라 적절한 API 호출
    if (enabled) {
      addSingleNotificationPreference(type);
    } else {
      deleteSingleNotificationPreference(type);
    }
  };

  // 로컬 상태와 결합하여 MenuGroup에 전달할 최종 menus 데이터 생성
  const menusWithStatus = notificationSettingMenus.map((menu) => ({
    ...menu,
    checked: notificationStatus[menu.type] ?? false, // 로딩 후 데이터가 없을 경우를 대비해 기본값 설정
  }));

  const adminMenusWithStatus = adminNotificationSettingMenus.map((menu) => ({
    ...menu,
    checked: notificationStatus[menu.type] ?? false, // 로딩 후 데이터가 없을 경우를 대비해 기본값 설정
  }));

  useSetHeader({ title: "앱 알림 설정" });

  return (
    <Wrapper>
      {isLoading ? (
        <LoadingSpinner
          overlay={true}
          message={"알림 설정 상태를 불러오는 중 ..."}
        />
      ) : (
        <Box>
          <MenuGroup
            title={""}
            menus={menusWithStatus}
            hasToggle={true}
            onToggle={handleToggleChange} // type과 enabled를 받는 함수를 전달
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
              onToggle={handleAdminToggleChange} // type과 enabled를 받는 함수를 전달
            />
          </Box>
        </TitleContentArea>
      )}
    </Wrapper>
  );
};

export default NotificationSettingPage;

// --- 스타일 컴포넌트 ---
const Wrapper = styled.div`
  flex: 1;
  padding: 24px 16px;
  gap: 16px;

  display: flex;
  flex-direction: column;
  box-sizing: border-box;

  overflow-y: auto;
  background: #fafafa;
`;
