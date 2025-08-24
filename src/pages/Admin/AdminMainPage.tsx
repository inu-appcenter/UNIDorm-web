import Header from "../../components/common/Header.tsx";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import useUserStore from "../../stores/useUserStore.ts";
import { useEffect } from "react";

const AdminMainPage: React.FC = () => {
  const navigate = useNavigate();
  const { tokenInfo, userInfo } = useUserStore();

  useEffect(() => {
    console.log(userInfo.isAdmin);
    if (!tokenInfo.accessToken || !userInfo.isAdmin) {
      navigate("/home");
    }
  }, [tokenInfo, navigate, userInfo]);

  const menuItems = [
    {
      label: "로그아웃",
      onClick: () => {
        navigate("/logout");
      },
    },
  ];

  // 관리자 페이지 목록 (추가 확장 가능)
  const adminPages = [
    {
      label: "캘린더 관리자 페이지",
      path: "/admin/calendar",
      description: "캘린더 관리 및 일정 설정",
    },
    {
      label: "공지사항 관리자 페이지",
      path: "/announcements",
      description: "공지사항 등록 및 수정",
    },
    {
      label: "FCM 토큰",
      path: "/admin/fcm",
      description: "푸시알림 토큰 확인",
    },
  ];

  return (
    <Wrapper>
      <Header title={"관리자 페이지"} hasBack={false} menuItems={menuItems} />
      <Title>관리자 기능 선택</Title>
      <MenuGrid>
        {adminPages.map((page) => (
          <MenuCard key={page.path} onClick={() => navigate(page.path)}>
            <CardTitle>{page.label}</CardTitle>
            <CardDescription>{page.description}</CardDescription>
          </MenuCard>
        ))}
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
