import styled from "styled-components";
import Header from "../../components/common/Header.tsx";
import MenuGroup from "../../components/mypage/MenuGroup.tsx";
import { addNotificationPreferences } from "../../apis/notification.ts";
import { useState } from "react";

// 알림 항목 목록 (배열 요소에 type을 추가하여 API 요청에 사용)
const initialMenus = [
  { label: "룸메이트 알림", type: "룸메이트" },
  { label: "공동구매 알림", type: "공동구매" },
  { label: "생활원 알림", type: "생활원" },
  { label: "유니돔 알림", type: "유니돔" },
  { label: "서포터즈 알림", type: "서포터즈" },
];

const NotificationSettingPage = () => {
  // 알림 상태를 { type: boolean } 형태로 관리 (예: { ROOMMATE: true, GROUP_PURCHASE: false, ... })
  const [notificationStatus, setNotificationStatus] = useState<
    Record<string, boolean>
  >(
    initialMenus.reduce(
      (acc, menu) => {
        acc[menu.type] = false; // 초기 상태는 모두 OFF로 설정
        return acc;
      },
      {} as Record<string, boolean>,
    ),
  );

  // [새로운 로직] 토글 상태가 변경될 때마다 활성화된 항목을 모아 API 호출
  const updateNotificationPreferences = async (
    newStatus: Record<string, boolean>,
  ) => {
    // 활성화된(true) 항목의 type만 추출하여 배열로 만듭니다.
    const enabledTypes = Object.entries(newStatus)
      .filter(([, enabled]) => enabled)
      .map(([type]) => type);

    try {
      console.log(`API 요청 데이터: ${enabledTypes}`);
      if (enabledTypes.length > 0) {
        // 활성화된 항목이 있을 경우에만 API 호출
        await addNotificationPreferences(enabledTypes);
        console.log(
          `다음 항목들의 알림 수신 설정 추가/업데이트: ${enabledTypes.join(", ")}`,
        );
      } else {
        // 활성화된 항목이 없으면 해제 API가 필요하지만, 현재는 로그만 남김
        console.log("모든 알림 수신 해제 (해제 API 필요)");
      }
    } catch (error) {
      console.error("알림 설정 업데이트 중 오류 발생", error);
    }
  };

  // 개별 토글 변경 시 실행
  const handleToggleChange = (type: string, enabled: boolean) => {
    // 1. 상태 업데이트
    const newStatus = {
      ...notificationStatus,
      [type]: enabled,
    };
    setNotificationStatus(newStatus);

    // 2. 전체 활성화 상태 기반으로 API 요청
    updateNotificationPreferences(newStatus);
  };

  // MenuData를 notificationStatus와 결합하여 MenuGroup에 전달할 최종 menus 데이터 생성
  const menusWithStatus = initialMenus.map((menu) => ({
    ...menu,
    checked: notificationStatus[menu.type],
    // onClick은 제거하고, type을 추가하여 MenuGroup에서 handleToggleChange를 호출할 때 사용
  }));

  return (
    <Wrapper>
      <Header title={"알림 수신 설정"} hasBack={true} />
      <MenuGroup
        title={""}
        menus={menusWithStatus}
        hasToggle={true}
        onToggle={handleToggleChange} // type과 enabled를 받는 함수를 전달
      />
    </Wrapper>
  );
};

export default NotificationSettingPage;

const Wrapper = styled.div`
  flex: 1;
  padding: 90px 16px;
  padding-bottom: 150px;

  display: flex;
  flex-direction: column;
  box-sizing: border-box;

  overflow-y: auto;
  background: #fafafa;
`;
