import styled from "styled-components";
import { useTranslation } from "react-i18next";
import { colors, typography } from "@/styles/tokens";
import TitleContentArea from "../components/common/TitleContentArea.tsx";
import HomeNoticeCard from "../components/home/HomeNoticeCard.tsx";
import HomeFormCard from "../components/home/HomeFormCard.tsx";
import HomeTipsCard from "../components/home/HomeTipsCard.tsx";
import { useEffect, useMemo, useRef, useState } from "react";
import 앱센터로고가로 from "../assets/앱센터로고가로.webp";
import { useNavigate } from "react-router-dom";
import GroupPurchaseList from "../components/GroupPurchase/GroupPurchaseList.tsx";
import HomeNoticeBottomSheet from "src/components/modal/HomeNoticeBottomSheet.tsx";
import HomeBanner from "../components/home/HomeBanner.tsx";
import LoadingSpinner from "../components/common/LoadingSpinner.tsx";
import EmptyMessage from "../constants/EmptyMessage.tsx";
import { statusText } from "@/utils/formUtils";
import { PopupNotification } from "@/types/popup-notifications";
import TopPopupNotification from "../components/common/TopPopupNotification.tsx";
import useNetworkStore from "../stores/useNetworkStore.ts";
import Calendar from "../components/calendar/Calendar.tsx";
import { useSetHeader } from "@/hooks/useSetHeader";
import { useLatestAnnouncements } from "@/queries/announcements";
import { useGroupPurchaseList } from "@/queries/groupPurchases";
import { useSurveys } from "@/queries/surveys";
import { useDailyRandomTips } from "@/queries/tips";
import { useActivePopupNotifications } from "@/queries/popupNotifications";
import { useInitFromQuery } from "@/hooks/useInitFromQuery";
import RoomMateCard from "@/components/roommate/RoomMateCard.tsx";
import RoommateEmptyState from "@/components/roommate/RoommateEmptyState";
import { useQuery } from "@tanstack/react-query";
import { getRoomMateScrollList } from "@/apis/roommate.ts";
import YoutubeWidget from "@/components/home/YoutubeWidget.tsx";
import { useSetAIChat } from "@/hooks/useSetAIChat";
import MigrationBanner from "@/components/common/MigrationBanner.tsx";
import { useFreshmanMigrationBanner } from "@/hooks/useFreshmanMigrationBanner";
import { motion, AnimatePresence } from "framer-motion";
import { useRoommateMatchingStatus } from "@/hooks/useRoommateMatchingStatus";
import { formatSemesterName } from "@/utils/semester";
import { mixpanelTrack } from "@/utils/mixpanel"; // 추가
import useUserStore from "@/stores/useUserStore";
import { PATHS } from "@/constants/paths";
import HomeDormitoryPromptModal from "@/components/home/HomeDormitoryPromptModal";
import { isLatestUnidormApp } from "@/utils/getMobilePlatform";
import {
  isDormitorySemesterExpired,
  getCurrentAcademicCycleKey,
} from "@/utils/semesterGuard";
import { evaluateDormitoryResidentStatus } from "@/pages/Dormitory/DormitoryCardPage";
import { secureStorage } from "@/utils/secureStorage";
import dormitoryGuideSvg from "@/assets/home/dormitory-guide-widget.svg";

const GUIDE_KEYWORDS = [
  { key: "laundry", query: "세탁" },
  { key: "facility", query: "고장" },
  { key: "meal", query: "식단" },
  { key: "rules", query: "수칙" },
] as const;

export default function HomePage() {
  const { t } = useTranslation(["home", "common"]);
  useSetAIChat({ isVisible: true, shouldAnimate: true });
  const { data: matchingStatus, isOpen: isMatchingOpen } =
    useRoommateMatchingStatus();
  const homeLoadStartTime = useRef(performance.now());

  const {
    data: notices = [],
    isLoading: isAnnounceLoading,
    isError: isAnnounceError,
  } = useLatestAnnouncements();

  const { data: rawGroupOrders = [], isLoading: isGroupOrdersLoading } =
    useGroupPurchaseList({ sort: "마감임박순", type: "전체" });
  const groupOrders = rawGroupOrders;

  const { data: rawSurveys = [], isLoading: isSurveysLoading } = useSurveys();
  const surveys = useMemo(() => {
    return [...rawSurveys].sort((a, b) => {
      const isAProgress = statusText(a.status) === "진행 중";
      const isBProgress = statusText(b.status) === "진행 중";

      if (isAProgress && !isBProgress) return -1;
      if (!isAProgress && isBProgress) return 1;

      const timeA = new Date(a.createdDate).getTime();
      const timeB = new Date(b.createdDate).getTime();
      return timeB - timeA;
    });
  }, [rawSurveys]);

  const { data: dailyTips = [], isLoading: isTipsLoading } = useDailyRandomTips();
  const { data: popupNotices = [], isLoading: isPopupLoading } =
    useActivePopupNotifications();

  const navigate = useNavigate();
  const { tokenInfo } = useUserStore();
  const isLoggedIn = Boolean(tokenInfo?.accessToken);
  const {
    isFreshman,
    bannerVariant,
    handleMigrationBannerClick,
    shouldShowMigrationBanner,
  } = useFreshmanMigrationBanner();

  const [isDormPromptOpen, setIsDormPromptOpen] = useState(false);
  const [dormPromptMode, setDormPromptMode] = useState<"issue" | "renew">("issue");

  useEffect(() => {
    if (!isLoggedIn) return;

    // 사생증 발급은 유니돔 앱 전용 기능이므로 일반 웹 브라우저에서는 노출 제외
    const isPreview =
      typeof window !== "undefined" &&
      (new URLSearchParams(window.location.search).get("preview_dorm_prompt") === "true" ||
        localStorage.getItem("preview_dorm_prompt") === "true");

    if (!isLatestUnidormApp() && !isPreview) return;

    const currentCycle = getCurrentAcademicCycleKey();

    void (async () => {
      let isExpired = false;
      let isResident = false;

      try {
        const cached = await secureStorage.getCacheWithTtl<any>("portal_dormitory_student_info");
        const dormData = cached?.data;
        if (dormData) {
          const evalResult = evaluateDormitoryResidentStatus(dormData);
          isResident = evalResult.isCurrentlyResident;
          isExpired = isDormitorySemesterExpired({
            dormYear: evalResult.year,
            dormTerm: evalResult.term,
          });
        }
      } catch (e) {
        console.warn("[HomePage] 사생증 캐시 확인 오류:", e);
      }

      // 1. 학기 만료로 갱신이 필요한 시점: 사용자가 해당 갱신 모달을 이번 학기에 닫은 적이 없으면 노출
      if (isExpired) {
        const dismissedRenewalCycle = localStorage.getItem("dismissedDormCardRenewalCycle");
        if (dismissedRenewalCycle !== currentCycle || isPreview) {
          setDormPromptMode("renew");
          setIsDormPromptOpen(true);
          return;
        }
      }

      // 2. 이미 유효한 활성 사생증을 보유하고 있는 경우: 발급 유도 모달 노출 제외
      if (isResident && !isExpired && !isPreview) {
        return;
      }

      // 3. 신규 발급 대상자 또는 실패(FAILED) 상태인 경우
      // 한 번 닫았으면(localStorage) 동일 학기 주기 내에서는 더 이상 띄우지 않음
      const dismissedIssueCycle = localStorage.getItem("dismissedDormCardPromptCycle");
      if (dismissedIssueCycle === currentCycle && !isPreview) return;

      const issueStatus = localStorage.getItem("unidorm_dorm_card_issue_status");
      if (issueStatus === "FAILED" || !isResident || isPreview) {
        setDormPromptMode("issue");
        setIsDormPromptOpen(true);
      }
    })();
  }, [isLoggedIn]);

  const handleCloseDormPrompt = () => {
    const currentCycle = getCurrentAcademicCycleKey();
    if (dormPromptMode === "renew") {
      localStorage.setItem("dismissedDormCardRenewalCycle", currentCycle);
    } else {
      localStorage.setItem("dismissedDormCardPromptCycle", currentCycle);
    }
    setIsDormPromptOpen(false);
  };

  const handleConfirmDormPrompt = () => {
    const currentCycle = getCurrentAcademicCycleKey();
    if (dormPromptMode === "renew") {
      localStorage.setItem("dismissedDormCardRenewalCycle", currentCycle);
    } else {
      localStorage.setItem("dismissedDormCardPromptCycle", currentCycle);
    }
    setIsDormPromptOpen(false);
    mixpanelTrack.dormitoryCardEntryClicked(
      dormPromptMode === "renew" ? "홈_사생증갱신모달" : "홈_발급유도모달",
    );
    navigate(`${PATHS.DORMITORY_CARD}?mode=${dormPromptMode}`);
  };

  const handleDormitoryCardClick = () => {
    mixpanelTrack.dormitoryCardEntryClicked("홈");
    if (!isLoggedIn) {
      const shouldLogin = window.confirm(
        t("home:dormPrompt.loginRequiredConfirm"),
      );
      if (shouldLogin) {
        navigate(PATHS.LOGIN);
      }
      return;
    }
    navigate(PATHS.DORMITORY_CARD);
  };

  const handleDormitoryGuideClick = () => {
    mixpanelTrack.featureClicked("기숙사_생활안내", "홈");
    navigate(PATHS.DORMITORY_GUIDE);
  };

  const handleDormitoryGuideKeywordClick = (
    e: React.MouseEvent<HTMLButtonElement>,
    query: string,
  ) => {
    e.stopPropagation();
    mixpanelTrack.featureClicked(`기숙사_생활안내_${query}`, "홈");
    navigate(`${PATHS.DORMITORY_GUIDE}?q=${encodeURIComponent(query)}`);
  };

  useEffect(() => {
    mixpanelTrack.homeViewed();
  }, []);

  // 유휴 시간에 바텀바 주요 탭 청크를 사전 로드하여 탭 전환 지연 방지
  useEffect(() => {
    const preloadRoutes = () => {
      import("@/pages/RoomMate/RoomMatePage");
      import("@/pages/GroupPurchase/GroupPurchaseMainPage");
      import("@/pages/Chat/openChatPage");
      import("@/pages/Complain/ComplainListPage");
      import("@/pages/MyPage");
    };

    if (typeof window !== "undefined" && "requestIdleCallback" in window) {
      const handle = (window as any).requestIdleCallback(preloadRoutes, {
        timeout: 2000,
      });
      return () => (window as any).cancelIdleCallback(handle);
    }

    const timer = setTimeout(preloadRoutes, 1200);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const hasSeenMigrationAlert = sessionStorage.getItem(
      "hasSeenFreshmanMigrationAlert",
    );

    if (shouldShowMigrationBanner && !hasSeenMigrationAlert) {
      sessionStorage.setItem("hasSeenFreshmanMigrationAlert", "true");
      mixpanelTrack.migrationAlertShown("freshman");
      alert(t("home:migrationConfirm"));
      // navigate(PATHS.FRESHMAN_MIGRATION); //강제이동은 안하기..
      return;
    }
  }, [isFreshman, navigate]);

  const [modalOpenStates, setModalOpenStates] = useState<
    Record<number, boolean>
  >({});

  const setModalOpen = (id: number, open: boolean) => {
    setModalOpenStates((prev) => ({ ...prev, [id]: open }));
  };

  const hasTrackedPopups = useRef(false);
  useInitFromQuery(popupNotices, (data) => {
    let hiddenModals: string[] = [];
    try {
      hiddenModals = JSON.parse(localStorage.getItem("hiddenModals") || "[]");
    } catch {
      hiddenModals = [];
    }

    const initialState = data.reduce(
      (acc, noti) => {
        if (noti.id !== undefined && noti.id !== null) {
          const isHidden = hiddenModals.some(
            (hiddenId) => String(hiddenId) === String(noti.id),
          );
          acc[noti.id] = !isHidden;
        }
        return acc;
      },
      {} as Record<number, boolean>,
    );
    setModalOpenStates(initialState);

    if (!hasTrackedPopups.current) {
      hasTrackedPopups.current = true;
      data.forEach((popup: PopupNotification) => {
        if (popup.id !== undefined && popup.id !== null) {
          const isHidden = hiddenModals.some(
            (hiddenId) => String(hiddenId) === String(popup.id),
          );
          if (!isHidden) {
            mixpanelTrack.popupViewed(popup.title);
          }
        }
      });
    }
  });

  const hasTrackedHomeLoad = useRef(false);
  useEffect(() => {
    if (!isAnnounceLoading && !hasTrackedHomeLoad.current) {
      hasTrackedHomeLoad.current = true;
      if (isAnnounceError) {
        mixpanelTrack.homeLoadFail("api_error", "announcements");
      } else {
        mixpanelTrack.homeLoadComplete(
          Math.round(performance.now() - homeLoadStartTime.current),
        );
      }
    }
  }, [isAnnounceLoading, isAnnounceError]);

  const CHANNEL_ID = "UCrpqEmMWCOg6P8FSk6mN5Hw"; //인천대학교 생활원 유튜브 채널 id

  const currentSemesterFilters = useMemo(() => {
    if (!matchingStatus?.year || !matchingStatus?.semester) return undefined;
    return {
      year: matchingStatus.year,
      semester: Number(matchingStatus.semester),
    };
  }, [matchingStatus?.year, matchingStatus?.semester]);

  // 룸메이트 데이터 단일 페이지 조회 (현재 학기 기준)
  const { data: roommates, isLoading: isRoommateLoading } = useQuery({
    queryKey: ["roommates", "home", currentSemesterFilters],
    queryFn: () => getRoomMateScrollList(undefined, 10, currentSemesterFilters),
    staleTime: 1000 * 60 * 5,
    enabled: Boolean(isMatchingOpen && currentSemesterFilters),
  });

  interface NotificationData {
    title: string;
    message: string;
  }

  const { isNetworkError } = useNetworkStore();
  const [notification, setNotification] = useState<NotificationData | null>(
    null,
  );

  useEffect(() => {
    if (isNetworkError) {
      setNotification({
        title: t("home:networkError.title"),
        message: t("home:networkError.message"),
      });
    } else {
      setNotification(null);
    }
  }, [isNetworkError]);

  const handleCloseNotification = () => {
    setNotification(null);
  };

  const [isOpenGroupPurchase] = useState(false);

  useSetHeader({
    showAlarm: true,
    showDormitoryCard: true,
    dormitoryCardOnClick: handleDormitoryCardClick,
  });

  // 0.15초 페이드 전환 효과
  const quickFade = {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    transition: { duration: 0.15 },
  };

  return (
    <HomePageWrapper>
      {!isPopupLoading &&
        popupNotices.map((popup) => (
          <HomeNoticeBottomSheet
            key={popup.id}
            id={popup.id?.toString() ?? ""}
            isOpen={modalOpenStates[popup.id ?? 0]}
            setIsOpen={(open) => setModalOpen(popup.id ?? 0, open)}
            links={[]}
            title={popup.title}
            text={popup.content}
          >
            <PopupModalContent>
              {popup.imagePath?.map((img, idx) => (
                <img key={idx} src={img} alt={popup.title} />
              ))}
            </PopupModalContent>
          </HomeNoticeBottomSheet>
        ))}

      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
          >
            <TopPopupNotification
              title={notification.title}
              message={notification.message}
              onClose={handleCloseNotification}
              duration={10000}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <HomeBanner />

      {shouldShowMigrationBanner && (
        <motion.div
          {...quickFade}
          style={{ width: "100%", display: "flex", justifyContent: "center" }}
        >
          <StyledMigrationBanner
            variant={bannerVariant}
            onClick={() => {
              mixpanelTrack.bannerClicked(
                "신입생 마이그레이션 배너",
                "홈_상단",
              );
              handleMigrationBannerClick();
            }}
          />
        </motion.div>
      )}

      <ContentWrapper>
        {isMatchingOpen && (
            <WidgetContainer>
              <TitleContentArea
                title={
                  matchingStatus
                    ? t("home:roommateSection.titleWithSemester", {
                        year: matchingStatus.year,
                        semester: formatSemesterName(matchingStatus.semester),
                      })
                    : t("home:roommateSection.title")
                }
                description={t("home:roommateSection.description")}
                link={"/roommate"}
                location="홈"
              >
                <>
                  {isRoommateLoading ? (
                    <LoadingSpinner message={t("home:roommateSection.loading")} />
                  ) : roommates && roommates.length > 0 ? (
                    roommates
                      .slice(0, 2)
                      .map((post) => (
                        <RoomMateCard
                          key={post.boardId}
                          title={post.title}
                          boardId={post.boardId}
                          dormType={post.dormType}
                          mbti={post.mbti}
                          college={post.college}
                          isSmoker={post.smoking === "피워요"}
                          isClean={post.arrangement === "깔끔해요"}
                          stayDays={post.dormPeriod}
                          description={post.comment}
                          roommateBoardLike={post.roommateBoardLike}
                          matched={post.matched}
                          location="홈_룸메이트목록"
                        />
                      ))
                  ) : (
                    <RoommateEmptyState />
                  )}
                </>
              </TitleContentArea>
            </WidgetContainer>
          )}

        <WidgetContainer>
          <TitleContentArea
            title={t("home:guideWidget.title")}
            link={PATHS.DORMITORY_GUIDE}
            location="홈"
            gap={"12px"}
          >
            <GuideWidgetCard
              role="button"
              tabIndex={0}
              onClick={handleDormitoryGuideClick}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  handleDormitoryGuideClick();
                }
              }}
            >
              <GuideIllustration
                src={dormitoryGuideSvg}
                alt=""
                aria-hidden="true"
                draggable={false}
              />
              <GuideWidgetContent>
                <GuideWidgetSummary>
                  {t("home:guideWidget.summary")}
                </GuideWidgetSummary>
                <GuideChipRow>
                  {GUIDE_KEYWORDS.map((chip) => (
                    <GuideKeywordChip
                      key={chip.query}
                      type="button"
                      onClick={(e) =>
                        handleDormitoryGuideKeywordClick(e, chip.query)
                      }
                    >
                      {t(`home:guideWidget.keywords.${chip.key}`)}
                    </GuideKeywordChip>
                  ))}
                </GuideChipRow>
              </GuideWidgetContent>
            </GuideWidgetCard>
          </TitleContentArea>
        </WidgetContainer>

        <WidgetContainer>
            <TitleContentArea
              title={t("home:noticeSection.title")}
              link={"/announcements"}
              location="홈"
              gap={"16px"}
            >
              {isAnnounceLoading ? (
                <LoadingSpinner message={t("home:noticeSection.loading")} />
              ) : notices.length > 0 ? (
                <NoticeListContainer>
                  {notices
                    .filter((notice) => notice !== null && notice !== undefined)
                    .slice(0, 2)
                    .map((notice, index) => (
                      <HomeNoticeCard
                        key={notice.id ?? notice.title}
                        id={notice.id}
                        title={notice.title}
                        content={notice.content}
                        isEmergency={notice.emergency}
                        createdDate={notice.createdDate}
                        type={notice.type}
                        order={index}
                        layoutType="목록형"
                      />
                    ))}
                </NoticeListContainer>
              ) : (
                <EmptyMessage message={t("home:noticeSection.empty")} />
              )}
            </TitleContentArea>
          </WidgetContainer>
          <FormSectionWrapper>
            <TitleContentArea title={t("home:formSection.title")} link={"/form"} location="홈">
              {isSurveysLoading ? (
                <LoadingSpinner message={t("home:formSection.loading")} />
              ) : (
                <FormArea>
                  <FormWrapper>
                    {surveys.length > 0 ? (
                      surveys
                        .filter(
                          (survey) => survey !== null && survey !== undefined,
                        )
                        .slice(0, 8)
                        .map((survey, index) => (
                          <HomeFormCard
                            key={survey.id ?? survey.title}
                            survey={survey}
                            order={index}
                          />
                        ))
                    ) : (
                      <EmptyMessage message={t("home:formSection.empty")} />
                    )}
                  </FormWrapper>
                  <FormGradientRight />
                </FormArea>
              )}
            </TitleContentArea>
          </FormSectionWrapper>

        <WidgetContainer>
            <TitleContentArea
              title={t("home:youtubeSection.title")}
              externalLink={`https://www.youtube.com/channel/${CHANNEL_ID}`}
              location="홈"
            >
              <YoutubeWidget />
            </TitleContentArea>
          </WidgetContainer>

        <GridContainer>
          <WidgetContainer>
              <TitleContentArea
                title={t("home:tipsSection.title")}
                link={"/tips"}
                location="홈"
                gap={"16px"}
              >
                {isTipsLoading ? (
                  <LoadingSpinner message={t("home:tipsSection.loading")} />
                ) : dailyTips.length > 0 ? (
                  <TipsListContainer>
                    {dailyTips.slice(0, 3).map((tip, key) => (
                      <HomeTipsCard
                        key={tip.boardId ?? key}
                        index={key + 1}
                        id={tip.boardId}
                        content={tip.title}
                      />
                    ))}
                  </TipsListContainer>
                ) : (
                  <EmptyMessage message={t("home:tipsSection.empty")} />
                )}
              </TitleContentArea>
            </WidgetContainer>
          <WidgetContainer>
            <TitleContentArea
                title={t("home:calendarSection.title")}
                children={<Calendar mode={"week"} location="홈" />}
                link={"/calendar"}
                location="홈"
              />
            </WidgetContainer>
        </GridContainer>

        {isOpenGroupPurchase && (
            <WidgetContainer>
              <TitleContentArea
                title={t("home:groupPurchaseSection.title")}
                link={"/groupPurchase"}
                location="홈"
              >
                {isGroupOrdersLoading ? (
                  <LoadingSpinner message={t("home:groupPurchaseSection.loading")} />
                ) : groupOrders.length > 0 ? (
                  <GroupPurchaseList groupOrders={groupOrders.slice(0, 4)} />
                ) : (
                  <EmptyMessage message={t("home:groupPurchaseSection.empty")} />
                )}
              </TitleContentArea>
            </WidgetContainer>
          )}
      </ContentWrapper>

      <motion.img
        className="appcenter-logo"
        src={앱센터로고가로}
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        onClick={() => {
          mixpanelTrack.externalLinkClicked(
            "앱센터 홈페이지",
            "https://home.inuappcenter.kr",
            "홈_하단",
          );
          window.open("https://home.inuappcenter.kr", "_blank");
        }}
        style={{ cursor: "pointer" }}
      />

      <HomeDormitoryPromptModal
        isOpen={isDormPromptOpen}
        onClose={handleCloseDormPrompt}
        onConfirm={handleConfirmDormPrompt}
        mode={dormPromptMode}
      />
    </HomePageWrapper>
  );
}

const HomePageWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-bottom: 120px;
  box-sizing: border-box;
  overflow-y: auto;
  width: 100%;
  overflow-x: hidden;

  .appcenter-logo {
    margin-top: 36px;
    width: 50%;
    max-width: 250px;
    align-self: start;
    @media (min-width: 768px) {
      align-self: center;
    }
  }
`;


const ContentWrapper = styled.div`
  padding: 0;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: 8px;
  background: ${colors.bg.bg2};
  width: 100%;

  @media (min-width: 768px) {
    max-width: 1200px;
    padding: 0;
  }
`;

const WidgetContainer = styled.div`
  background: ${colors.bg.bg1};
  padding: 16px 20px;
  box-sizing: border-box;
  width: 100%;
`;

const GridContainer = styled.div`
  display: contents;

  @media (min-width: 1024px) {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 32px;
  }
`;

const PopupModalContent = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  text-align: center;

  img {
    max-width: 100%;
    border-radius: 8px;
  }
  h3 {
    ${typography.headline1}
    color: ${colors.text.text1};
  }
  p {
    ${typography.label1Normal}
    color: ${colors.text.text1};
  }
  span {
    ${typography.caption1}
    color: ${colors.text.text2};
  }
`;

const StyledMigrationBanner = styled(MigrationBanner)`
  width: calc(100% - 32px);
  max-width: 1200px;
  margin: 16px 16px 0;

  @media (min-width: 768px) {
    margin: 24px auto 0;
  }
`;

const FormSectionWrapper = styled.div`
  background: ${colors.bg.bg2};
  padding: 16px 0 16px 20px;
  box-sizing: border-box;
  width: 100%;

  /* TitleContentArea 헤더 부분(제목 + 더보기) 우측 20px 여백 유지 */
  > div > div:first-child {
    padding-right: 20px;
    box-sizing: border-box;
    width: 100%;
  }
`;

const FormArea = styled.div`
  position: relative;
  width: 100%;
  height: fit-content;
`;

const FormWrapper = styled.div`
  display: flex;
  flex-direction: row;
  gap: 16px;
  width: 100%;
  padding: 12px 20px 16px 0;
  box-sizing: border-box;
  overflow-x: auto;
  -ms-overflow-style: none;
  scrollbar-width: none;
  &::-webkit-scrollbar {
    display: none;
  }
`;

const FormGradientRight = styled.div`
  position: absolute;
  right: 0;
  top: 0;
  bottom: 0;
  width: 48px;
  background: linear-gradient(
    270deg,
    ${colors.bg.bg2} 38.54%,
    rgba(247, 247, 247, 0) 100%
  );
  pointer-events: none;

  @media (min-width: 768px) {
    display: none;
  }
`;

const NoticeListContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  width: 100%;
`;

const TipsListContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  width: 100%;
`;

const GuideWidgetCard = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 16px;
  background: ${colors.bg.bg2};
  border-radius: 18px;
  box-sizing: border-box;
  cursor: pointer;
  transition:
    transform 0.14s cubic-bezier(0.16, 1, 0.3, 1),
    background-color 0.15s ease;

  &:active {
    transform: scale(0.985);
    background: ${colors.gray.gray100};
  }
`;

const GuideIllustration = styled.img`
  width: 76px;
  height: 76px;
  flex-shrink: 0;
  display: block;
  pointer-events: none;
`;

const GuideWidgetContent = styled.div`
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const GuideWidgetSummary = styled.p`
  ${typography.body2Normal}
  font-weight: 600;
  margin: 0;
  color: ${colors.text.text1};
  word-break: keep-all;
`;

const GuideChipRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
`;

const GuideKeywordChip = styled.button`
  ${typography.label2}
  font-weight: 600;
  padding: 6px 11px;
  border: none;
  border-radius: 13px;
  background: ${colors.blue.blue100};
  color: ${colors.main.main2};
  line-height: 1.2;
  white-space: nowrap;
  cursor: pointer;
  transition:
    transform 0.12s cubic-bezier(0.16, 1, 0.3, 1),
    background-color 0.12s ease;

  &:active {
    transform: scale(0.96);
    background: ${colors.blue.blue200};
  }
`;
