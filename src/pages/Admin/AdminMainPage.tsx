import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
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

type CategoryFilter = "ALL" | "콘텐츠 관리" | "운영 및 시스템" | "개발 지원";

export default function AdminMainPage() {
  const navigate = useNavigate();
  const { tokenInfo, userInfo, isLoading } = useUserStore();
  const { isAdmin, isSupporters, isMainAdmin, roleName } = useUserRole();

  const [searchKeyword, setSearchKeyword] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<CategoryFilter>("ALL");

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
      description: "접수된 민원을 확인하고 처리 상태를 관리합니다.",
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
      description: "학사 및 생활원 일정을 등록하고 관리합니다.",
      category: "콘텐츠 관리",
    },
    {
      label: "TIP 관리",
      path: "/tips",
      description: "기숙사 생활 꿀팁 게시글을 관리합니다.",
      category: "콘텐츠 관리",
    },
    {
      label: "홈 화면 팝업 공지",
      path: "/admin/popup-notifications",
      description: "앱 접속 시 팝업으로 노출될 긴급 공지를 설정합니다.",
      category: "콘텐츠 관리",
    },
    {
      label: "폼 관리",
      path: "/form",
      description: "입주 설문조사 및 사생 신청 폼을 제작하고 관리합니다.",
      category: "콘텐츠 관리",
    },
    {
      label: "채팅 신고 관리",
      path: "/admin/open-chat-reports",
      description: "오픈채팅 메시지 신고 내역을 확인하고 제재를 처리합니다.",
      category: "운영 및 시스템",
    },
    {
      label: "푸시 알림 전송",
      path: "/admin/notification/create",
      description: "전체 사용자 또는 특정 학번에 푸시 알림을 발송합니다.",
      category: "운영 및 시스템",
    },
    {
      label: "Feature Flag 관리",
      path: "/admin/feature-flag",
      description: "서비스 기능별 활성화 여부를 켜고 끕니다.",
      category: "운영 및 시스템",
    },
    {
      label: "서비스 이용 통계",
      path: "/admin/statistics",
      description: "API 호출 수와 서비스 이용 지표를 확인합니다.",
      category: "운영 및 시스템",
    },
    {
      label: "AI 챗불이 관리",
      path: `${import.meta.env.VITE_INUCHAT_CONSOLE_URL}/?service=unidorm`,
      description: "기숙사 챗봇 지식을 학습시키고 관리 콘솔로 이동합니다.",
      isExternal: true,
      category: "운영 및 시스템",
    },
    {
      label: "오픈채팅방 관리",
      path: "/admin/open-chat-rooms",
      description: "기숙사 공식 오픈채팅방 생성·수정 및 챗봇 공지를 전송합니다.",
      category: "운영 및 시스템",
    },
    {
      label: "사생증 시뮬레이션 (정상)",
      path: "/dormitory/card?preview=true",
      description: "모바일 사생증 카드와 동기화 동작을 테스트합니다.",
      category: "개발 지원",
    },
    {
      label: "사생증 시뮬레이션 (만료)",
      path: "/dormitory/card?preview=true&status=expired",
      description: "학기 만료 가드 차단 안내 및 사생증 갱신 전환 플로우를 테스트합니다.",
      category: "개발 지원",
    },
    {
      label: "사생정보조회 ERP 연동",
      path: "/dormitory/portal",
      description: "기숙사 사생 배정 정보, 상벌점, 공공요금 및 동기화 모달을 점검합니다.",
      category: "개발 지원",
    },
    {
      label: "유니돔 테스트 웹",
      path: "https://unidorm-test.pages.dev",
      description: "개발 중인 유니돔 웹 테스트 배포 환경으로 이동합니다.",
      isExternal: true,
      category: "개발 지원",
    },
  ];

  const roleFilteredPages = useMemo(() => {
    if (isSupporters) {
      return allAdminPages.filter((page) =>
        [
          "공지사항 관리",
          "캘린더 관리",
          "TIP 관리",
          "홈 화면 팝업 공지",
          "폼 관리",
          "AI 챗불이 관리",
          "푸시 알림 전송",
        ].includes(page.label),
      );
    }
    return allAdminPages.filter(
      (page) =>
        !["채팅 신고 관리", "오픈채팅방 관리"].includes(page.label) ||
        isMainAdmin,
    );
  }, [allAdminPages, isSupporters, isMainAdmin]);

  // 검색 및 카테고리 필터링
  const displayedPages = useMemo(() => {
    let result = roleFilteredPages;

    if (selectedCategory !== "ALL") {
      result = result.filter((p) => p.category === selectedCategory);
    }

    if (searchKeyword.trim()) {
      const kw = searchKeyword.trim().toLowerCase();
      result = result.filter(
        (p) =>
          p.label.toLowerCase().includes(kw) ||
          p.description.toLowerCase().includes(kw),
      );
    }

    return result;
  }, [roleFilteredPages, selectedCategory, searchKeyword]);

  const categories = useMemo(() => {
    if (selectedCategory !== "ALL") {
      return [selectedCategory];
    }
    const set = new Set(displayedPages.map((p) => p.category));
    return Array.from(set) as AdminPageItem["category"][];
  }, [displayedPages, selectedCategory]);

  return (
    <PageRoot>
      <ContentContainer>
        {/* 상단 프로필 및 퀵 바 */}
        <TopProfileCard>
          <ProfileLeft>
            <RoleBadge>{roleName}</RoleBadge>
            <ProfileTitle>
              {userInfo.name ? `${userInfo.name} 관리자님` : "관리자 센터"}
            </ProfileTitle>
          </ProfileLeft>

          <SearchWrapper>
            <SearchInput
              type="text"
              placeholder="원하는 관리 기능 검색 (예: 캘린더, 푸시)..."
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
            />
            {searchKeyword && (
              <ClearButton
                type="button"
                onClick={() => setSearchKeyword("")}
                aria-label="검색어 지우기"
              >
                ✕
              </ClearButton>
            )}
          </SearchWrapper>
        </TopProfileCard>

        {/* 카테고리 세그먼트 칩 */}
        <CategorySegmentGroup>
          {(
            [
              { key: "ALL", label: "전체 메뉴" },
              { key: "콘텐츠 관리", label: "콘텐츠 관리" },
              { key: "운영 및 시스템", label: "운영 및 시스템" },
              { key: "개발 지원", label: "개발 지원" },
            ] as Array<{ key: CategoryFilter; label: string }>
          ).map((tab) => (
            <SegmentButton
              key={tab.key}
              type="button"
              $isSelected={selectedCategory === tab.key}
              onClick={() => setSelectedCategory(tab.key)}
            >
              {tab.label}
            </SegmentButton>
          ))}
        </CategorySegmentGroup>

        {/* 메뉴 목록 영역 */}
        {displayedPages.length === 0 ? (
          <EmptyContainer>
            <EmptyTitle>일치하는 관리 메뉴가 없어요</EmptyTitle>
            <EmptyDescription>
              검색 키워드를 확인하거나 다른 카테고리를 선택해 보세요.
            </EmptyDescription>
            <ResetButton
              type="button"
              onClick={() => {
                setSearchKeyword("");
                setSelectedCategory("ALL");
              }}
            >
              검색 조건 초기화
            </ResetButton>
          </EmptyContainer>
        ) : (
          <SectionsList>
            {categories.map((category) => {
              const pagesInCategory = displayedPages.filter(
                (p) => p.category === category,
              );
              if (pagesInCategory.length === 0) return null;

              return (
                <CategorySection key={category}>
                  <CategoryHeader>
                    <CategoryTitle>{category}</CategoryTitle>
                    <CategoryCount>{pagesInCategory.length}개</CategoryCount>
                  </CategoryHeader>

                  <MenuGrid>
                    {pagesInCategory.map((page) => (
                      <MenuCard
                        key={page.label}
                        type="button"
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
                            <ActionArrow aria-hidden="true">›</ActionArrow>
                          )}
                        </CardTopRow>
                        <CardDescription>{page.description}</CardDescription>
                      </MenuCard>
                    ))}
                  </MenuGrid>
                </CategorySection>
              );
            })}
          </SectionsList>
        )}
      </ContentContainer>
    </PageRoot>
  );
}

/* ================= Styled Components ================= */

const PageRoot = styled.div`
  width: 100%;
  min-height: 100%;
  padding: 16px 20px calc(40px + env(safe-area-inset-bottom, 0px));
  box-sizing: border-box;
  overflow-x: hidden;

  @media (min-width: 1024px) {
    padding: 24px 32px 60px;
  }
`;

const ContentContainer = styled.div`
  width: 100%;
  max-width: 1100px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

/* 상단 프로필 및 검색 바 */
const TopProfileCard = styled.div`
  background: #ffffff;
  border-radius: 20px;
  padding: 20px 24px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.04);
  display: flex;
  flex-direction: column;
  gap: 16px;

  @media (min-width: 768px) {
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
  }
`;

const ProfileLeft = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const RoleBadge = styled.span`
  display: inline-flex;
  align-items: center;
  width: fit-content;
  padding: 3px 8px;
  border-radius: 6px;
  background: #e8f3ff;
  color: #3182f6;
  font-size: 0.74rem;
  font-weight: 800;
`;

const ProfileTitle = styled.h1`
  font-size: 1.35rem;
  font-weight: 800;
  color: #191f28;
  margin: 0;
  letter-spacing: -0.02em;
`;

const SearchWrapper = styled.div`
  position: relative;
  width: 100%;

  @media (min-width: 768px) {
    max-width: 320px;
  }
`;

const SearchInput = styled.input`
  width: 100%;
  height: 44px;
  border-radius: 12px;
  border: 1px solid #e5e8eb;
  background: #f9fafb;
  padding: 0 36px 0 14px;
  font-size: 0.88rem;
  color: #191f28;
  outline: none;
  box-sizing: border-box;
  transition: all 0.15s ease-out;

  &:focus {
    border-color: #3182f6;
    background: #ffffff;
    box-shadow: 0 0 0 3px rgba(49, 130, 246, 0.12);
  }

  &::placeholder {
    color: #8b95a1;
  }
`;

const ClearButton = styled.button`
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  border: none;
  background: none;
  color: #8b95a1;
  font-size: 0.85rem;
  cursor: pointer;
  padding: 4px;
`;

/* 카테고리 세그먼트 버튼 그룹 */
const CategorySegmentGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  overflow-x: auto;
  padding-bottom: 2px;
`;

const SegmentButton = styled.button<{ $isSelected: boolean }>`
  height: 38px;
  padding: 0 16px;
  border-radius: 12px;
  border: 1px solid ${({ $isSelected }) => ($isSelected ? "#3182f6" : "#e5e8eb")};
  background: ${({ $isSelected }) => ($isSelected ? "#3182f6" : "#ffffff")};
  color: ${({ $isSelected }) => ($isSelected ? "#ffffff" : "#4e5968")};
  font-size: 0.85rem;
  font-weight: 700;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.15s ease-out;

  &:active {
    transform: scale(0.98);
  }
`;

/* 섹션 리스트 */
const SectionsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 28px;
`;

const CategorySection = styled.section`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const CategoryHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 4px;
`;

const CategoryTitle = styled.h2`
  font-size: 1.05rem;
  font-weight: 800;
  color: #191f28;
  margin: 0;
`;

const CategoryCount = styled.span`
  font-size: 0.78rem;
  font-weight: 700;
  color: #8b95a1;
`;

/* 메뉴 그리드 */
const MenuGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 12px;

  @media (min-width: 640px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 14px;
  }

  @media (min-width: 1024px) {
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 16px;
  }
`;

const MenuCard = styled.button`
  display: flex;
  flex-direction: column;
  gap: 8px;
  background: #ffffff;
  border-radius: 18px;
  border: 1px solid #e5e8eb;
  padding: 20px;
  text-align: left;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.02);
  transition: all 0.18s cubic-bezier(0.16, 1, 0.3, 1);

  &:hover {
    border-color: #3182f6;
    background: #fbfdff;
    transform: translateY(-2px);
    box-shadow: 0 8px 20px -8px rgba(49, 130, 246, 0.16);
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
  font-size: 1rem;
  font-weight: 700;
  color: #191f28;
  letter-spacing: -0.02em;
`;

const ActionArrow = styled.span`
  font-size: 1.2rem;
  color: #b0b8c1;
  line-height: 1;
  transition: transform 0.15s ease, color 0.15s ease;

  ${MenuCard}:hover & {
    color: #3182f6;
    transform: translateX(3px);
  }
`;

const ExternalBadge = styled.span`
  font-size: 0.68rem;
  font-weight: 700;
  padding: 2px 6px;
  border-radius: 6px;
  background: #f2f4f6;
  color: #6b7684;
`;

const CardDescription = styled.p`
  margin: 0;
  font-size: 0.84rem;
  color: #6b7684;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

/* 빈 상태 */
const EmptyContainer = styled.div`
  background: #ffffff;
  border-radius: 20px;
  padding: 60px 20px;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
`;

const EmptyTitle = styled.h3`
  font-size: 1.1rem;
  font-weight: 800;
  color: #191f28;
  margin: 0;
`;

const EmptyDescription = styled.p`
  font-size: 0.86rem;
  color: #8b95a1;
  margin: 0 0 16px;
`;

const ResetButton = styled.button`
  height: 44px;
  padding: 0 20px;
  border-radius: 12px;
  background: #3182f6;
  color: #ffffff;
  font-size: 0.92rem;
  font-weight: 700;
  border: none;
  cursor: pointer;
  transition: background 0.15s ease-out;

  &:hover {
    background: #1b64da;
  }
`;
