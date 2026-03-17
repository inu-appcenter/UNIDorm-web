import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import useUserStore from "../../stores/useUserStore.ts";
import { useEffect } from "react";
import { useIsAdminRole } from "@/hooks/useIsAdminRole";
import { useSetHeader } from "@/hooks/useSetHeader";
import { motion } from "framer-motion";
import {
  Megaphone,
  Lightbulb,
  Calendar,
  Layout,
  FileText,
  MessageSquare,
  Send,
  ToggleRight,
  BarChart3,
  Bot,
  Beaker,
  LogOut,
  ChevronRight,
  ShieldCheck,
} from "lucide-react";

interface AdminPageItem {
  label: string;
  path: string;
  description: string;
  icon: React.ReactNode;
  isExternal?: boolean;
  category: "콘텐츠 관리" | "운영 및 시스템" | "개발 지원";
}

const AdminMainPage: React.FC = () => {
  const navigate = useNavigate();
  const { tokenInfo, userInfo, isLoading } = useUserStore();
  const { isAdmin, isSupporters, isMainAdmin } = useIsAdminRole();

  useEffect(() => {
    if (!isLoading) {
      if (!tokenInfo.accessToken || !isAdmin) {
        navigate("/home");
      }
    }
  }, [tokenInfo, userInfo, isLoading, isAdmin, navigate]);

  const menuItems = [
    {
      label: "로그아웃",
      onClick: () => {
        navigate("/logout");
      },
    },
  ];

  useSetHeader({ title: "관리자 페이지", menuItems });

  const allAdminPages: AdminPageItem[] = [
    {
      label: "민원 관리",
      path: "/admin/complain",
      description: "접수된 민원을 확인하고 처리합니다.",
      icon: <MessageSquare size={20} />,
      category: "콘텐츠 관리",
    },
    {
      label: "공지사항 관리",
      path: "/announcements",
      description: "생활원 공지사항을 등록하고 수정합니다.",
      icon: <Megaphone size={20} />,
      category: "콘텐츠 관리",
    },
    {
      label: "캘린더 관리",
      path: "/admin/calendar",
      description: "학사 및 생활원 일정을 관리합니다.",
      icon: <Calendar size={20} />,
      category: "콘텐츠 관리",
    },
    {
      label: "TIP 관리",
      path: "/tips",
      description: "기숙사 생활 꿀팁을 관리합니다.",
      icon: <Lightbulb size={20} />,
      category: "콘텐츠 관리",
    },
    {
      label: "홈 화면 팝업 공지",
      path: "/admin/popup-notifications",
      description: "앱 접속 시 노출될 팝업을 설정합니다.",
      icon: <Layout size={20} />,
      category: "콘텐츠 관리",
    },
    {
      label: "폼 관리",
      path: "/form",
      description: "설문조사 및 신청 폼을 관리합니다.",
      icon: <FileText size={20} />,
      category: "콘텐츠 관리",
    },
    {
      label: "푸시 알림 전송",
      path: "/admin/notification/create",
      description: "전체 또는 특정 유저에게 알림을 보냅니다.",
      icon: <Send size={20} />,
      category: "운영 및 시스템",
    },
    {
      label: "Feature Flag 관리",
      path: "/admin/feature-flag",
      description: "기능별 활성화 여부를 실시간 제어합니다.",
      icon: <ToggleRight size={20} />,
      category: "운영 및 시스템",
    },
    {
      label: "서비스 이용 통계",
      path: "/admin/statistics",
      description: "유저 활동 및 서비스 지표를 확인합니다.",
      icon: <BarChart3 size={20} />,
      category: "운영 및 시스템",
    },
    {
      label: "AI 챗불이 관리",
      path: `https://unidorm-aichat-admin-console.pages.dev/?token=${
        tokenInfo.accessToken || ""
      }&mode=${
        import.meta.env.VITE_API_SUBDOMAIN === "unidorm-server" ? "prod" : "dev"
      }`,
      description: "AI 답변을 학습시키고 관리합니다.",
      icon: <Bot size={20} />,
      isExternal: true,
      category: "운영 및 시스템",
    },
  ];

  const filteredPages = isSupporters
    ? allAdminPages.filter((page) =>
        [
          "공지사항 관리",
          "캘린더 관리",
          "TIP 관리",
          "홈 화면 팝업 공지",
          "폼 관리",
          "AI 챗불이 관리",
        ].includes(page.label),
      )
    : allAdminPages;

  let categories = Array.from(
    new Set(filteredPages.map((p) => p.category)),
  ) as AdminPageItem["category"][];
  if (isMainAdmin) categories = [...categories, "개발 지원"];

  return (
    <Wrapper>
      <Container>
        <HeaderSection>
          <WelcomeBox>
            <UserAvatar>
              <ShieldCheck size={32} color="#3b82f6" />
            </UserAvatar>
            <WelcomeText>
              <h2>안녕하세요, {userInfo.name || "관리자"}님</h2>
              <p>
                {tokenInfo.role === "ADMIN" ? "총괄 관리자" : "서포터즈"}{" "}
                권한으로 접속 중입니다.
              </p>
            </WelcomeText>
          </WelcomeBox>
          <LogoutButton onClick={() => navigate("/logout")}>
            <LogOut size={18} />
            <span>로그아웃</span>
          </LogoutButton>
        </HeaderSection>

        <ContentBody>
          {categories.map((category) => (
            <CategorySection key={category}>
              <CategoryTitle>{category}</CategoryTitle>
              <MenuGrid>
                {category === "개발 지원" ? (
                  <MenuCard
                    as={motion.div}
                    whileHover={{ scale: 1.02 }}
                    onClick={() =>
                      (window.location.href = "https://unidorm-test.pages.dev")
                    }
                  >
                    <IconWrapper
                      style={{ backgroundColor: "#fef3c7", color: "#d97706" }}
                    >
                      <Beaker size={20} />
                    </IconWrapper>
                    <CardContent>
                      <CardTitle>테스트 페이지</CardTitle>
                      <CardDescription>
                        개발 중인 유니돔 테스트 페이지로 이동합니다.
                      </CardDescription>
                    </CardContent>
                    <ChevronWrapper>
                      <ChevronRight size={18} />
                    </ChevronWrapper>
                  </MenuCard>
                ) : (
                  filteredPages
                    .filter((page) => page.category === category)
                    .map((page, index) => (
                      <MenuCard
                        key={page.label}
                        as={motion.div}
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.03 }}
                        onClick={() =>
                          page.isExternal
                            ? (window.location.href = page.path)
                            : navigate(page.path)
                        }
                      >
                        <IconWrapper>{page.icon}</IconWrapper>
                        <CardContent>
                          <CardHeader>
                            <CardTitle>{page.label}</CardTitle>
                            {page.isExternal && (
                              <ExternalBadge>외부</ExternalBadge>
                            )}
                          </CardHeader>
                          <CardDescription>{page.description}</CardDescription>
                        </CardContent>
                        <ChevronWrapper>
                          <ChevronRight size={18} />
                        </ChevronWrapper>
                      </MenuCard>
                    ))
                )}
              </MenuGrid>
            </CategorySection>
          ))}
        </ContentBody>
      </Container>
    </Wrapper>
  );
};

export default AdminMainPage;

const Wrapper = styled.div`
  background-color: #f8fafc;
  min-height: 100vh;
  width: 100%;
  display: flex;
  justify-content: center;
`;

const Container = styled.div`
  width: 100%;
  max-width: 1100px;
  padding: 40px 20px 100px;
  display: flex;
  flex-direction: column;
  gap: 48px;

  @media (max-width: 768px) {
    padding: 24px 16px 80px;
    gap: 32px;
  }
`;

const HeaderSection = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 36px 40px;
  background-color: white;
  border-radius: 28px;
  box-shadow: 0 4px 20px -5px rgba(0, 0, 0, 0.05);

  @media (max-width: 768px) {
    padding: 24px;
    flex-direction: column;
    align-items: flex-start;
    gap: 20px;
  }
`;

const WelcomeBox = styled.div`
  display: flex;
  align-items: center;
  gap: 24px;
`;

const UserAvatar = styled.div`
  width: 64px;
  height: 64px;
  border-radius: 20px;
  background-color: #eff6ff;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: inset 0 2px 4px rgba(59, 130, 246, 0.05);
`;

const WelcomeText = styled.div`
  h2 {
    margin: 0;
    font-size: 1.6rem;
    font-weight: 800;
    color: #0f172a;
    letter-spacing: -0.02em;
  }
  p {
    margin: 4px 0 0;
    font-size: 1rem;
    color: #64748b;
    font-weight: 500;
  }

  @media (max-width: 768px) {
    h2 {
      font-size: 1.3rem;
    }
    p {
      font-size: 0.9rem;
    }
  }
`;

const LogoutButton = styled.button`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 20px;
  border-radius: 14px;
  border: 1px solid #e2e8f0;
  background: white;
  color: #64748b;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background-color: #fef2f2;
    border-color: #fee2e2;
    color: #ef4444;
  }

  @media (max-width: 768px) {
    width: 100%;
    justify-content: center;
  }
`;

const ContentBody = styled.div`
  display: flex;
  flex-direction: column;
  gap: 64px;

  @media (max-width: 768px) {
    gap: 40px;
  }
`;

const CategorySection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

const CategoryTitle = styled.h3`
  margin: 0;
  font-size: 1.1rem;
  font-weight: 800;
  color: #1e293b;
  display: flex;
  align-items: center;
  gap: 12px;

  &::before {
    content: "";
    width: 5px;
    height: 18px;
    background-color: #3b82f6;
    border-radius: 3px;
  }
`;

const MenuGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
  gap: 24px;

  @media (max-width: 480px) {
    grid-template-columns: 1fr;
  }
`;

const MenuCard = styled.div`
  display: flex;
  align-items: center;
  padding: 28px;
  background-color: white;
  border-radius: 24px;
  border: 1px solid #f1f5f9;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.02);

  &:hover {
    border-color: #3b82f6;
    box-shadow: 0 15px 30px -10px rgba(59, 130, 246, 0.12);
    transform: translateY(-5px);
  }
`;

const IconWrapper = styled.div`
  width: 56px;
  height: 56px;
  border-radius: 16px;
  background-color: #f8fafc;
  color: #3b82f6;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: all 0.3s;

  ${MenuCard}:hover & {
    background-color: #3b82f6;
    color: white;
    transform: rotate(-5deg) scale(1.1);
  }
`;

const CardContent = styled.div`
  margin-left: 24px;
  flex: 1;
`;

const CardHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

const CardTitle = styled.h4`
  margin: 0;
  font-size: 1.15rem;
  font-weight: 700;
  color: #1e293b;
`;

const CardDescription = styled.p`
  margin: 8px 0 0;
  font-size: 0.95rem;
  color: #64748b;
  line-height: 1.6;
  font-weight: 450;
`;

const ExternalBadge = styled.span`
  font-size: 0.65rem;
  font-weight: 800;
  padding: 2px 8px;
  background-color: #eff6ff;
  color: #2563eb;
  border-radius: 6px;
  border: 1px solid #dbeafe;
  text-transform: uppercase;
`;

const ChevronWrapper = styled.div`
  color: #cbd5e1;
  transition: all 0.3s;
  margin-left: 12px;

  ${MenuCard}:hover & {
    color: #3b82f6;
    transform: translateX(8px);
  }
`;
