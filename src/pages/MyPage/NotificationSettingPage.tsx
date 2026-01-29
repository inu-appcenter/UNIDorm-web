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

// 알림 항목 목록 (로컬 이름과 API 키를 매핑하여 관리)
const initialMenus = [
  {
    label: "유니돔 앱 알림",
    type: "유니돔",
    apiKey: "unidormNotification" as keyof NotificationPreferences,
    description: "유니돔 앱 공지사항",
  },
  {
    label: "생활원 알림",
    type: "생활원",
    apiKey: "dormitoryNotification" as keyof NotificationPreferences,
    description: "생활원 공지사항",
  },

  {
    label: "서포터즈 알림",
    type: "서포터즈",
    apiKey: "supportersNotification" as keyof NotificationPreferences,
    description: "서포터즈 공지사항",
  },
  {
    label: "룸메이트 알림",
    type: "룸메이트",
    apiKey: "roommateNotification" as keyof NotificationPreferences,
    description: "모아보기한 룸메이트 새 글 알림, 퀵 메시지",
  },
  {
    label: "공동구매 알림",
    type: "공동구매",
    apiKey: "groupOrderNotification" as keyof NotificationPreferences,
    description: "키워드 및 카테고리 새 글 알림 / 좋아요한 글 마감 임박 알림",
  },
];

const NotificationSettingPage = () => {
  // 알림 상태를 { type: boolean } 형태로 관리 (예: { 룸메이트: true, 공동구매: false, ... })
  const [notificationStatus, setNotificationStatus] = useState<
    Record<string, boolean>
  >({});

  // 로딩 상태 (초기 데이터를 불러올 때 사용)
  const [isLoading, setIsLoading] = useState(true);

  // --- 🔔 초기 설정 불러오기 (GET) ---
  const fetchInitialPreferences = async () => {
    try {
      const response = await getUserNotificationPreferences();
      const apiData = response.data; // NotificationPreferences 객체

      // API 응답 객체를 로컬 상태 객체 형식으로 변환하여 초기 상태 설정
      const newStatus = initialMenus.reduce(
        (acc, menu) => {
          const status = apiData[menu.apiKey];
          acc[menu.type] = status ?? false;
          return acc;
        },
        {} as Record<string, boolean>,
      );

      setNotificationStatus(newStatus);
    } catch (error) {
      console.error("초기 알림 설정을 불러오는 데 실패했습니다.", error);
      // 실패 시 기본값(모두 false)으로 초기화
      setNotificationStatus(
        initialMenus.reduce(
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

  // --- 🔴 알림 비활성화 (DELETE) ---
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

  // --- 🔄 개별 토글 변경 시 실행 (메인 로직) ---
  const handleToggleChange = (type: string, enabled: boolean) => {
    // 1. 로컬 상태 업데이트
    const newStatus = {
      ...notificationStatus,
      [type]: enabled,
    };
    setNotificationStatus(newStatus);

    // 2. 토글 상태에 따라 적절한 API 호출
    if (enabled) {
      // ON으로 변경: 알림 활성화 (POST)
      addSingleNotificationPreference(type);
    } else {
      // OFF로 변경: 알림 비활성화 (DELETE)
      deleteSingleNotificationPreference(type);
    }
  };

  // 로컬 상태와 결합하여 MenuGroup에 전달할 최종 menus 데이터 생성
  const menusWithStatus = initialMenus.map((menu) => ({
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
        <MenuGroup
          title={""}
          menus={menusWithStatus}
          hasToggle={true}
          onToggle={handleToggleChange} // type과 enabled를 받는 함수를 전달
        />
      )}
    </Wrapper>
  );
};

export default NotificationSettingPage;

// --- 스타일 컴포넌트 ---
const Wrapper = styled.div`
  flex: 1;
  padding: 0 16px 100px;

  display: flex;
  flex-direction: column;
  box-sizing: border-box;

  overflow-y: auto;
  background: #fafafa;
`;
