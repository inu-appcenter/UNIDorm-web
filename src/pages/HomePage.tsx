import styled from "styled-components";
import { colors, typography } from "@/styles/tokens";
import TitleContentArea from "../components/common/TitleContentArea.tsx";
import HomeNoticeCard from "../components/home/HomeNoticeCard.tsx";
import HomeFormCard from "../components/home/HomeFormCard.tsx";
import HomeTipsCard from "../components/home/HomeTipsCard.tsx";
import { useEffect, useState } from "react";
import { fetchDailyRandomTips } from "@/apis/tips";
import { Tip } from "@/types/tips";
import 앱센터로고가로 from "../assets/앱센터로고가로.webp";
import { useNavigate } from "react-router-dom";
import GroupPurchaseList from "../components/GroupPurchase/GroupPurchaseList.tsx";
import { GetGroupPurchaseListParams, GroupOrder } from "@/types/grouporder";
import { getGroupPurchaseList } from "@/apis/groupPurchase";
import HomeNoticeBottomSheet from "src/components/modal/HomeNoticeBottomSheet.tsx";
import HomeBanner from "../components/home/HomeBanner.tsx";
import LoadingSpinner from "../components/common/LoadingSpinner.tsx";
import EmptyMessage from "../constants/EmptyMessage.tsx";
import { getAnnouncementScrollList } from "@/apis/announcements";
import { Announcement } from "@/types/announcements";
import { getAllSurveys } from "@/apis/formApis";
import { SurveySummary } from "@/types/formTypes";
import { statusText } from "@/utils/formUtils";
import { getPopupNotifications } from "@/apis/popup-notification";
import { PopupNotification } from "@/types/popup-notifications";
import { getMobilePlatform } from "@/utils/getMobilePlatform";
import ModalContent_AppInstall from "../components/common/ModalContent_AppInstall.tsx";
import CommonBottomSheet from "src/components/modal/CommonBottomSheet.tsx";
import TopPopupNotification from "../components/common/TopPopupNotification.tsx";
import useNetworkStore from "../stores/useNetworkStore.ts";
import Calendar from "../components/calendar/Calendar.tsx";
import { useSetHeader } from "@/hooks/useSetHeader";
import RoomMateCard from "@/components/roommate/RoomMateCard.tsx";
import { useQuery } from "@tanstack/react-query";
import { getRoomMateScrollList } from "@/apis/roommate.ts";
import YoutubeWidget from "@/components/home/YoutubeWidget.tsx";
import { useSetAIChat } from "@/hooks/useSetAIChat";
import MigrationBanner from "@/components/common/MigrationBanner.tsx";
import { useFreshmanMigrationBanner } from "@/hooks/useFreshmanMigrationBanner";
import { motion, AnimatePresence } from "framer-motion";
import { useRoommateMatchingStatus } from "@/hooks/useRoommateMatchingStatus";
import { mixpanelTrack } from "@/utils/mixpanel"; // 추가

export default function HomePage() {
  useSetAIChat({ isVisible: true, shouldAnimate: true });
  const { data: matchingStatus, isOpen: isMatchingOpen } =
    useRoommateMatchingStatus();

  const [dailyTips, setDailyTips] = useState<Tip[]>([]);
  const [groupOrders, setGroupOrders] = useState<GroupOrder[]>([]);
  const [notices, setNotices] = useState<Announcement[]>([]);
  const [surveys, setSurveys] = useState<SurveySummary[]>([]);
  const [popupNotices, setPopupNotices] = useState<PopupNotification[]>([]);
  const [isPopupLoading, setIsPopupLoading] = useState<boolean>(false);

  const navigate = useNavigate();
  const {
    isFreshman,
    bannerVariant,
    handleMigrationBannerClick,
    shouldShowMigrationBanner,
  } = useFreshmanMigrationBanner();

  useEffect(() => {
    const hasSeenMigrationAlert = sessionStorage.getItem(
      "hasSeenFreshmanMigrationAlert",
    );

    if (shouldShowMigrationBanner && !hasSeenMigrationAlert) {
      sessionStorage.setItem("hasSeenFreshmanMigrationAlert", "true");
      mixpanelTrack.migrationAlertShown("freshman");
      alert(
        "지금 바로 신입생 임시 계정을 학교 포털 계정으로 통합하세요!!!\n곧 통합하지 않은 임시 계정은 삭제될 예정입니다.\n홈 중앙의 [포털 계정 통합] 배너를 클릭하세요.",
      );
      // navigate(PATHS.FRESHMAN_MIGRATION); //강제이동은 안하기..
      return;
    }
  }, [isFreshman, navigate]);

  const [isTipsLoading, setIsTipsLoading] = useState<boolean>(false);
  const [isAnnounceLoading, setIsAnnounceLoading] = useState<boolean>(false);
  const [isSurveysLoading, setIsSurveysLoading] = useState<boolean>(false);
  const [isGroupOrdersLoading, setIsGroupOrdersLoading] =
    useState<boolean>(false);

  const [modalOpenStates, setModalOpenStates] = useState<
    Record<number, boolean>
  >({});

  const setModalOpen = (id: number, open: boolean) => {
    setModalOpenStates((prev) => ({ ...prev, [id]: open }));
  };

  const platform = getMobilePlatform();
  const [isAppInstallOpen, setIsAppInstallOpen] = useState(
    (platform === "ios_browser" || platform === "android_browser") &&
      Math.random() < 0.4,
  );

  const CHANNEL_ID = "UCrpqEmMWCOg6P8FSk6mN5Hw"; //인천대학교 생활원 유튜브 채널 id

  useEffect(() => {
    const fetchPopupNotices = async () => {
      setIsPopupLoading(true);
      try {
        const response = await getPopupNotifications();
        console.log("팝업 공지 불러오기 성공", response);
        setPopupNotices(response.data);

        // 팝업 노출 추적 추가
        response.data.forEach((popup: PopupNotification) => {
          mixpanelTrack.popupViewed(popup.title);
        });

        const initialState = response.data.reduce(
          (acc, noti) => {
            if (noti.id !== undefined && noti.id !== null) {
              acc[noti.id] = true;
            }
            return acc;
          },
          {} as Record<number, boolean>,
        );
        setModalOpenStates(initialState);
      } catch (error) {
        console.error("팝업 공지 불러오기 실패:", error);
      } finally {
        setIsPopupLoading(false);
      }
    };
    const getTips = async () => {
      setIsTipsLoading(true);
      try {
        const data = await fetchDailyRandomTips();
        setDailyTips(data);
      } catch (err: any) {
        if (err.response?.status === 204) {
          setDailyTips([]);
        }
      } finally {
        setIsTipsLoading(false);
      }
    };

    const fetchGroupOrders = async (searchTerm?: string) => {
      setIsGroupOrdersLoading(true);
      try {
        const params: GetGroupPurchaseListParams = {
          sort: "마감임박순",
          type: "전체",
          search: searchTerm || undefined,
        };
        const data = await getGroupPurchaseList(params);
        console.log("공동구매 게시글 불러오기 성공 : ", data);
        setGroupOrders(data);
      } catch (error) {
        console.error("게시글 목록 불러오기 실패:", error);
      } finally {
        setIsGroupOrdersLoading(false);
      }
    };

    async function fetchAnnouncements() {
      setIsAnnounceLoading(true);
      try {
        const response = await getAnnouncementScrollList(
          "ALL",
          "ALL",
          "",
          undefined,
        );
        console.log("공지사항 불러오기 성공:", response);
        setNotices(response);
      } catch (error) {
        console.error("공지사항 불러오기 실패", error);
      } finally {
        setIsAnnounceLoading(false);
      }
    }

    async function fetchSurveys() {
      setIsSurveysLoading(true);
      try {
        const response = await getAllSurveys();
        console.log("폼 목록 불러오기 성공:", response);
        const sorted = [...response.data].sort((a, b) => {
          const isAProgress = statusText(a.status) === "진행 중";
          const isBProgress = statusText(b.status) === "진행 중";

          // 1. 현재 신청 받는 이벤트(진행 중)가 우선
          if (isAProgress && !isBProgress) return -1;
          if (!isAProgress && isBProgress) return 1;

          // 2. 같은 상태 내에서는 최신 생성순
          const timeA = new Date(a.createdDate).getTime();
          const timeB = new Date(b.createdDate).getTime();
          return timeB - timeA;
        });
        setSurveys(sorted);
      } catch (error) {
        console.error("폼 목록 불러오기 실패:", error);
      } finally {
        setIsSurveysLoading(false);
      }
    }

    fetchPopupNotices();
    getTips();
    fetchGroupOrders();
    fetchAnnouncements();
    fetchSurveys();
  }, []);

  // 룸메이트 데이터 단일 페이지 조회
  const { data: roommates, isLoading: isRoommateLoading } = useQuery({
    queryKey: ["roommates", "home"],
    queryFn: () => getRoomMateScrollList(undefined, 10),
    staleTime: 1000 * 60 * 5,
    enabled: isMatchingOpen,
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
        title: "서비스 장애 안내",
        message: `학교 인터넷에 문제가 발생했거나, 서버 점검 중입니다. 이용에 불편을 드려 죄송합니다.`,
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
  });

  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5 },
  };

  const staggerContainer = {
    animate: {
      transition: {
        staggerChildren: 0.1,
      },
    },
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
          {...fadeInUp}
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

      <ContentWrapper
        as={motion.div}
        variants={staggerContainer}
        initial="initial"
        animate="animate"
      >
        {isMatchingOpen && (
          <motion.div variants={fadeInUp}>
            <WidgetContainer>
              <TitleContentArea
                title={
                  matchingStatus
                    ? `${matchingStatus.year}년 ${matchingStatus.semester}학기 룸메이트 모집`
                    : "룸메이트 모집"
                }
                description={
                  "룸메이트를 구하고 있는 다양한 UNI들을 찾아보세요!"
                }
                link={"/roommate"}
                location="홈"
              >
                <>
                  {isRoommateLoading ? (
                    <LoadingSpinner message="최신 목록을 불러오는 중..." />
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
                    <EmptyMessage>게시글이 없습니다.</EmptyMessage>
                  )}
                </>
              </TitleContentArea>
            </WidgetContainer>
          </motion.div>
        )}

        <motion.div variants={fadeInUp}>
          <WidgetContainer>
            <TitleContentArea
              title={"공지사항"}
              link={"/announcements"}
              location="홈"
              gap={"16px"}
            >
              {isAnnounceLoading ? (
                <LoadingSpinner message={"공지사항을 불러오고 있어요!"} />
              ) : notices.length > 0 ? (
                <NoticeListContainer>
                  {notices
                    .filter((notice) => notice !== null && notice !== undefined)
                    .slice(0, 2)
                    .map((notice) => (
                      <HomeNoticeCard
                        key={notice.id ?? notice.title}
                        id={notice.id}
                        title={notice.title}
                        content={notice.content}
                        isEmergency={notice.emergency}
                        createdDate={notice.createdDate}
                        type={notice.type}
                      />
                    ))}
                </NoticeListContainer>
              ) : (
                <EmptyMessage message={"공지사항이 없습니다."} />
              )}
            </TitleContentArea>
          </WidgetContainer>
        </motion.div>

        <motion.div variants={fadeInUp}>
          <FormSectionWrapper>
            <TitleContentArea title={"INU 폼"} link={"/form"} location="홈">
              {isSurveysLoading ? (
                <LoadingSpinner message={"폼 목록을 불러오고 있어요!"} />
              ) : (
                <FormArea>
                  <FormWrapper>
                    {surveys.length > 0 ? (
                      surveys
                        .filter(
                          (survey) => survey !== null && survey !== undefined,
                        )
                        .slice(0, 8)
                        .map((survey) => (
                          <HomeFormCard
                            key={survey.id ?? survey.title}
                            survey={survey}
                          />
                        ))
                    ) : (
                      <EmptyMessage message={"조회된 폼이 없습니다."} />
                    )}
                  </FormWrapper>
                  <FormGradientRight />
                </FormArea>
              )}
            </TitleContentArea>
          </FormSectionWrapper>
        </motion.div>

        <motion.div variants={fadeInUp}>
          <WidgetContainer>
            <TitleContentArea
              title={"생활원 YouTube"}
              externalLink={`https://www.youtube.com/channel/${CHANNEL_ID}`}
              location="홈"
            >
              <YoutubeWidget />
            </TitleContentArea>
          </WidgetContainer>
        </motion.div>

        <GridContainer>
          <motion.div variants={fadeInUp}>
            <WidgetContainer>
              <TitleContentArea
                title="오늘의 Best 꿀팁"
                link={"/tips"}
                location="홈"
                gap={"16px"}
              >
                {isTipsLoading ? (
                  <LoadingSpinner message={"꿀팁을 불러오고 있어요!"} />
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
                  <EmptyMessage message={"오늘의 꿀팁이 없습니다."} />
                )}
              </TitleContentArea>
            </WidgetContainer>
          </motion.div>
          <motion.div variants={fadeInUp}>
            <WidgetContainer>
              <TitleContentArea
                title={"생활원 일정"}
                children={<Calendar mode={"week"} location="홈" />}
                link={"/calendar"}
                location="홈"
              />
            </WidgetContainer>
          </motion.div>
        </GridContainer>

        {isOpenGroupPurchase && (
          <motion.div variants={fadeInUp}>
            <WidgetContainer>
              <TitleContentArea
                title={"임박한 공동구매"}
                link={"/groupPurchase"}
                location="홈"
              >
                {isGroupOrdersLoading ? (
                  <LoadingSpinner message={"공동구매를 불러오고 있어요!"} />
                ) : groupOrders.length > 0 ? (
                  <GroupPurchaseList groupOrders={groupOrders.slice(0, 4)} />
                ) : (
                  <EmptyMessage message={"임박한 공동구매가 없습니다."} />
                )}
              </TitleContentArea>
            </WidgetContainer>
          </motion.div>
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

      <CommonBottomSheet
        id={"이벤트 당첨"}
        isOpen={isAppInstallOpen}
        setIsOpen={(open) => {
          if (open) mixpanelTrack.appInstallImpression("홈");
          setIsAppInstallOpen(open);
        }}
        title={"유니돔 앱을 사용해보세요!"}
        headerImageId={0}
        children={ModalContent_AppInstall()}
        closeButtonText={"스토어에서 설치하기"}
        onCloseClick={() => {
          if (platform === "ios_browser") {
            mixpanelTrack.appInstallClicked("iOS", "홈");
            window.open(
              "https://apps.apple.com/kr/app/%EC%9C%A0%EB%8B%88%EB%8F%94/id6751404748",
              "_blank",
            );
          } else if (platform === "android_browser") {
            mixpanelTrack.appInstallClicked("Android", "홈");
            window.open(
              "https://play.google.com/store/apps/details?id=com.hjunieee.inudormitory",
              "_blank",
            );
          }
        }}
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
