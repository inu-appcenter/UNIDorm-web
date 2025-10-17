import Header from "../../components/common/Header.tsx";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import useUserStore from "../../stores/useUserStore.ts";
import { useEffect } from "react";
import { useIsAdminRole } from "../../hooks/useIsAdminRole.ts";

const AdminMainPage: React.FC = () => {
  const navigate = useNavigate();
  const { tokenInfo, userInfo, isLoading } = useUserStore();
  const { isAdmin, isSupporters, isMainAdmin } = useIsAdminRole();

  useEffect(() => {
    console.log(tokenInfo.role);
    if (!isLoading) {
      // 새로고침 시 유저정보가 불러와지는 타이밍으로 인해 어드민 메인으로 오는 문제 방지
      if (!tokenInfo.accessToken || !isAdmin) {
        navigate("/home");
      }
    }
  }, [tokenInfo, userInfo, isLoading]);

  const menuItems = [
    {
      label: "로그아웃",
      onClick: () => {
        navigate("/logout");
      },
    },
  ];

  // 전체 관리자 페이지 목록
  const allAdminPages = [
    {
      label: "민원 관리",
      path: "/admin/complain",
      description: "민원 사항에 대해 관리할 수 있습니다.",
    },
    {
      label: "캘린더 관리",
      path: "/admin/calendar",
      description: "캘린더의 일정을 관리할 수 있습니다.",
    },
    {
      label: "공지사항 관리",
      path: "/announcements",
      description: "생활원 공지사항을 관리할 수 있습니다.",
    },
    {
      label: "TIP 관리",
      path: "/tips",
      description: "기숙사 꿀팁을 관리할 수 있습니다.",
    },
    {
      label: "홈 화면 팝업 공지 관리",
      path: "/admin/popup-notifications",
      description: "앱 접속 시 나타날 팝업 공지를 관리할 수 있습니다.",
    },
    {
      label: "푸시알림 보내기",
      path: "/admin/notification/create",
      description: "유저를 대상으로 푸시알림을 보낼 수 있습니다.",
    },
  ];

  // SUPPORTERS인 경우 특정 페이지만 표시
  const adminPages = isSupporters
    ? allAdminPages.filter((page) =>
        [
          "공지사항 관리",
          "캘린더 관리",
          "TIP 관리",
          "홈 화면 팝업 공지 관리",
        ].includes(page.label),
      )
    : allAdminPages;

  return (
    <Wrapper>
      <Header title={"관리자 페이지"} hasBack={true} menuItems={menuItems} />
      <Title>관리자 기능 선택</Title>
      <MenuGrid>
        {adminPages.map((page) => (
          <MenuCard key={page.path} onClick={() => navigate(page.path)}>
            <CardTitle>{page.label}</CardTitle>
            <CardDescription>{page.description}</CardDescription>
          </MenuCard>
        ))}
        {isMainAdmin && (
          <MenuCard
            onClick={() =>
              (window.location.href = "https://unidorm-test.pages.dev")
            }
          >
            <CardTitle>테스트 페이지</CardTitle>
            <CardDescription>
              개발 중인 유니돔 테스트 페이지로 이동합니다.
            </CardDescription>
          </MenuCard>
        )}
      </MenuGrid>
    </Wrapper>
  );
};

export default AdminMainPage;

export const Wrapper = styled.div`
  padding: 30px;
  padding-top: 80px;
  box-sizing: border-box;
  max-width: 800px;
  margin: 0 auto;
  flex: 1;
  width: 100%;
`;

const Title = styled.h2`
  margin-bottom: 20px;
  font-weight: 700;
  font-size: 1.5rem;
  color: #333;
`;

const MenuGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 20px;
`;

const MenuCard = styled.div`
  background-color: #f8f9fa;
  padding: 20px;
  border-radius: 10px;
  cursor: pointer;
  box-shadow: 0 0 8px rgba(0, 0, 0, 0.1);
  transition: all 0.2s ease-in-out;

  &:hover {
    background-color: #e9ecef;
    box-shadow: 0 0 12px rgba(0, 0, 0, 0.15);
  }
`;

const CardTitle = styled.h3`
  margin: 0 0 10px 0;
  font-weight: 600;
  font-size: 1.2rem;
  color: #222;
`;

const CardDescription = styled.p`
  margin: 0;
  font-size: 0.9rem;
  color: #555;
`;
