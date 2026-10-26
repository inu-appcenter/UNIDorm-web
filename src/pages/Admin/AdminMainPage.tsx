import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import { motion } from "framer-motion";
import useUserStore from "../../stores/useUserStore";
import { useUserRole } from "@/hooks/useUserRole";
import { useSetHeader } from "@/hooks/useSetHeader";

interface AdminPageItem {
  label: string;
  path: string;
  description: string;
  isExternal?: boolean;
  category: "콘텐츠 관리" | "운영 및 시스템" | "개발 지원";
}

const AdminMainPage: React.FC = () => {
  const navigate = useNavigate();
  const { tokenInfo, userInfo, isLoading } = useUserStore();
  const { isAdmin, isSupporters, isMainAdmin, roleName } = useUserRole();

  useEffect(() => {
    if (!isLoading) {
      if (!tokenInfo.accessToken || !isAdmin) {
        navigate("/home");
      }
    }
  }, [tokenInfo, userInfo, isLoading, isAdmin, navigate]);

  useSetHeader({ title: "관리자 페이지" });

  const allAdminPages: AdminPageItem[] = [
    {
      label: "민원 관리",
      path: "/admin/complain",
      description: "접수된 민원을 확인하고 처리합니다.",
      category: "콘텐츠 관리",
    },
    {
      label: "공지사항 관리",
      path: "/announcements",
      description: "생활원 공지사항을 등록하고 수정합니다.",
      category: "콘텐츠 관리",
    },
    {
      label: "캘린더 관리",
      path: "/admin/calendar",
      description: "학사 및 생활원 일정을 관리합니다.",
      category: "콘텐츠 관리",
    },
    {
      label: "TIP 관리",
      path: "/tips",
      description: "기숙사 생활 꿀팁을 관리합니다.",
      category: "콘텐츠 관리",
    },
    {
      label: "홈 화면 팝업 공지",
      path: "/admin/popup-notifications",
      description: "앱 접속 시 노출될 팝업을 설정합니다.",
      category: "콘텐츠 관리",
    },
    {
      label: "폼 관리",
      path: "/form",
      description: "설문조사 및 신청 폼을 관리합니다.",
      category: "콘텐츠 관리",
    },
    {
      label: "채팅 신고 관리",
      path: "/admin/open-chat-reports",
      description: "오픈채팅 메시지 신고를 확인하고 처리합니다.",
      category: "운영 및 시스템",
    },
    {
      label: "푸시 알림 전송",
      path: "/admin/notification/create",
      description: "전체 또는 특정 유저에게 알림을 보냅니다.",
      category: "운영 및 시스템",
    },
    {
      label: "Feature Flag 관리",
      path: "/admin/feature-flag",
      description: "기능별 활성화 여부를 실시간 제어합니다.",
      category: "운영 및 시스템",
    },
    {
      label: "서비스 이용 통계",
      path: "/admin/statistics",
      description: "유저 활동 및 서비스 지표를 확인합니다.",
      category: "운영 및 시스템",
    },
    {
      label: "AI 챗불이 관리",
      path: `${import.meta.env.VITE_INUCHAT_CONSOLE_URL}/?service=unidorm`,
      description: "AI 답변을 학습시키고 관리합니다.",
      isExternal: true,
      category: "운영 및 시스템",
    },
    {
      label: "오픈채팅방 관리",
      path: "/admin/open-chat-rooms",
      description: "기숙사 공식 채팅방 생성·수정·삭제 및 챗봇 메시지 발송",
      category: "운영 및 시스템",
    },
    {
      label: "사생증 시뮬레이션 (정상)",
      path: "/dormitory/card?preview=true",
      description: "모바일 사생증 3D 카드, 최근 동기화 시각 및 실시간 새로고침 시뮬레이션을 테스트합니다.",
      category: "개발 지원",
    },
    {
      label: "사생증 시뮬레이션 (만료)",
      path: "/dormitory/card?preview=true&status=expired",
      description: "학기 만료 가드 차단 안내 및 최신 사생증으로 갱신하는 전환 플로우를 테스트합니다.",
      category: "개발 지원",
    },
    {
      label: "사생정보조회 ERP 연동",
      path: "/dormitory/portal",
      description: "기숙사 사생 배정 정보, 상벌점, 공공요금 및 동기화 모달 연동을 확인합니다.",
      category: "개발 지원",
    },
    {
      label: "유니돔 테스트 웹",
      path: "https://unidorm-test.pages.dev",
      description: "개발 중인 유니돔 웹 테스트 배포 페이지로 이동합니다.",
      isExternal: true,
      category: "개발 지원",
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
          "푸시 알림 전송",
        ].includes(page.label),
      )
    : allAdminPages.filter(
        (page) =>
          !["채팅 신고 관리", "오픈채팅방 관리"].includes(page.label) ||
          isMainAdmin,
      );

  const categories = Array.from(
    new Set(filteredPages.map((p) => p.category)),
  ) as AdminPageItem["category"][];

  return (
    <Wrapper>
      <Container>
        {/* 상단 웰컴 헤더 */}
        <HeaderCard
          as={motion.div}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        >
          <HeaderContent>
            <RoleBadge>{roleName}</RoleBadge>
            <WelcomeTitle>
              {userInfo.name ? `${userInfo.name} 관리자님` : "관리자 센터"}
            </WelcomeTitle>
            <WelcomeSubtitle>
              생활원 운영 및 시스템 제어 메뉴를 확인하고 관리하세요.
            </WelcomeSubtitle>
          </HeaderContent>
        </HeaderCard>

        {/* 카테고리별 메뉴 섹션 */}
        <ContentBody>
          {categories.map((category) => (
            <CategorySection key={category}>
              <CategoryHeader>
                <CategoryTitle>{category}</CategoryTitle>
                <CategoryCount>
                  {filteredPages.filter((p) => p.category === category).length}개 메뉴
                </CategoryCount>
              </CategoryHeader>

              <MenuGrid>
                {filteredPages
                  .filter((page) => page.category === category)
                  .map((page, index) => (
                    <MenuCard
                      key={page.label}
                      as={motion.button}
                      type="button"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{
                        delay: index * 0.03,
                        duration: 0.28,
                        ease: [0.16, 1, 0.3, 1],
                      }}
                      onClick={() => {
                        if (page.isExternal) {
                          window.open(
                            page.path,
                            "_blank",
                            "noopener,noreferrer",
                          );
                        } else {
                          navigate(page.path);
                        }
                      }}
                    >
                      <CardTopRow>
                        <CardTitle>{page.label}</CardTitle>
                        {page.isExternal ? (
                          <ExternalBadge>외부</ExternalBadge>
                        ) : (
                          <ActionIndicator aria-hidden="true">›</ActionIndicator>
                        )}
                      </CardTopRow>
                      <CardDescription>{page.description}</CardDescription>
                    </MenuCard>
                  ))}
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
  min-height: 100dvh;
  width: 100%;
  display: flex;
  justify-content: center;
  background: #f9fafb;
`;

const Container = styled.div`
  width: 100%;
  max-width: 1100px;
  padding: 20px 16px calc(40px + env(safe-area-inset-bottom, 0px));
  display: flex;
  flex-direction: column;
  gap: 36px;
  box-sizing: border-box;

  @media (min-width: 768px) {
    padding: 36px 24px 80px;
    gap: 44px;
  }
`;

const HeaderCard = styled.div`
  display: flex;
  flex-direction: column;
  padding: 24px;
  background-color: #ffffff;
  border-radius: 24px;
  border: 1px solid #e5e8eb;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.02);

  @media (min-width: 768px) {
    padding: 32px 36px;
    border-radius: 28px;
  }
`;

const HeaderContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const RoleBadge = styled.span`
  display: inline-flex;
  width: fit-content;
  align-items: center;
  padding: 4px 10px;
  border-radius: 8px;
  background: #e8f3ff;
  color: #3182f6;
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: -0.01em;
`;

const WelcomeTitle = styled.h1`
  margin: 0;
  font-size: 1.5rem;
  font-weight: 800;
  color: #191f28;
  letter-spacing: -0.03em;
  line-height: 1.3;

  @media (min-width: 768px) {
    font-size: 1.85rem;
  }
`;

const WelcomeSubtitle = styled.p`
  margin: 0;
  font-size: 0.92rem;
  color: #6b7684;
  line-height: 1.55;

  @media (min-width: 768px) {
    font-size: 1rem;
  }
`;

const ContentBody = styled.div`
  display: flex;
  flex-direction: column;
  gap: 40px;

  @media (min-width: 768px) {
    gap: 48px;
  }
`;

const CategorySection = styled.section`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const CategoryHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 4px;
`;

const CategoryTitle = styled.h2`
  margin: 0;
  font-size: 1.05rem;
  font-weight: 800;
  color: #191f28;
  letter-spacing: -0.02em;

  @media (min-width: 768px) {
    font-size: 1.15rem;
  }
`;

const CategoryCount = styled.span`
  font-size: 0.8rem;
  font-weight: 600;
  color: #8b95a1;
`;

const MenuGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 12px;

  @media (min-width: 640px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 16px;
  }

  @media (min-width: 1024px) {
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 18px;
  }
`;

const MenuCard = styled.button`
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 100%;
  padding: 20px 22px;
  background-color: #ffffff;
  border-radius: 20px;
  border: 1px solid #e5e8eb;
  text-align: left;
  cursor: pointer;
  transition: all 0.18s cubic-bezier(0.16, 1, 0.3, 1);
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.02);

  &:hover {
    border-color: #3182f6;
    background-color: #fcfdfe;
    transform: translateY(-2px);
    box-shadow: 0 8px 20px -8px rgba(49, 130, 246, 0.14);
  }

  &:active {
    transform: scale(0.985);
  }
`;

const CardTopRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  width: 100%;
`;

const CardTitle = styled.span`
  font-size: 1.05rem;
  font-weight: 700;
  color: #191f28;
  letter-spacing: -0.02em;
`;

const ActionIndicator = styled.span`
  font-size: 1.25rem;
  font-weight: 400;
  color: #b0b8c1;
  line-height: 1;
  transition: color 0.15s ease, transform 0.15s ease;

  ${MenuCard}:hover & {
    color: #3182f6;
    transform: translateX(2px);
  }
`;

const CardDescription = styled.p`
  margin: 0;
  font-size: 0.86rem;
  color: #6b7684;
  line-height: 1.55;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const ExternalBadge = styled.span`
  font-size: 0.7rem;
  font-weight: 700;
  padding: 2px 7px;
  background-color: #f2f4f6;
  color: #6b7684;
  border-radius: 6px;
`;
