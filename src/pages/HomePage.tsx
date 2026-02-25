import styled from "styled-components";
import TitleContentArea from "../components/common/TitleContentArea.tsx";
import HomeNoticeCard from "../components/home/HomeNoticeCard.tsx";
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
import useUserStore from "../stores/useUserStore.ts";
import { getPopupNotifications } from "@/apis/popup-notification";
import { PopupNotification } from "@/types/popup-notifications";
import { getMobilePlatform } from "@/utils/getMobilePlatform";
import ModalContent_AppInstall from "../components/common/ModalContent_AppInstall.tsx";
import CommonBottomSheet from "src/components/modal/CommonBottomSheet.tsx";
import ServiceBox from "../components/home/ServiceBox.tsx";
import 민원아이콘 from "../assets/home/민원아이콘.webp";
import 폼아이콘 from "../assets/home/폼아이콘.webp";
import TopPopupNotification from "../components/common/TopPopupNotification.tsx";
import useNetworkStore from "../stores/useNetworkStore.ts";
import Calendar from "../components/calendar/Calendar.tsx";
import { useSetHeader } from "@/hooks/useSetHeader";
import RoomMateCard from "@/components/roommate/RoomMateCard.tsx";
import { useQuery } from "@tanstack/react-query";
import { getRoomMateScrollList } from "@/apis/roommate.ts";
import { getFeatureFlagByKey } from "@/apis/featureFlag.ts";
import YoutubeWidget from "@/components/home/YoutubeWidget.tsx";

export default function HomePage() {
  const { tokenInfo } = useUserStore();
  const isLoggedIn = Boolean(tokenInfo.accessToken);

  const [dailyTips, setDailyTips] = useState<Tip[]>([]);
  const [groupOrders, setGroupOrders] = useState<GroupOrder[]>([]);
  const [notices, setNotices] = useState<Announcement[]>([]);
  const [popupNotices, setPopupNotices] = useState<PopupNotification[]>([]);
  const [isPopupLoading, setIsPopupLoading] = useState<boolean>(false);

  const navigate = useNavigate();

  const [isTipsLoading, setIsTipsLoading] = useState<boolean>(false);
  const [isAnnounceLoading, setIsAnnounceLoading] = useState<boolean>(false);
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

    fetchPopupNotices();
    getTips();
    fetchGroupOrders();
    fetchAnnouncements();
  }, []);

  /* 피처 플래그 상태 관리 */
  const [isMatchingActive, setIsMatchingActive] = useState<boolean>(false);
  useEffect(() => {
    /* 피처 플래그 데이터 페칭 */
    const fetchFeatureFlag = async () => {
      try {
        const response = await getFeatureFlagByKey("ROOMMATE_MATCHING");
        setIsMatchingActive(response.data.flag);
      } catch (error) {
        console.error("피처 플래그 조회 실패:", error);
        setIsMatchingActive(false); // 에러 발생 시 기본값 설정
      }
    };

    fetchFeatureFlag();
  }, []);

  // 룸메이트 데이터 단일 페이지 조회
  const { data: roommates, isLoading: isRoommateLoading } = useQuery({
    queryKey: ["roommates", "home"],
    queryFn: () => getRoomMateScrollList(undefined, 10),
    staleTime: 1000 * 60 * 5,
    enabled: isMatchingActive,
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

      {notification && (
        <TopPopupNotification
          title={notification.title}
          message={notification.message}
          onClose={handleCloseNotification}
          duration={10000}
        />
      )}

      <HomeBanner />

      <ContentWrapper>
        <TitleContentArea title={""}>
          <ServiceWrapper>
            <ServiceBox
              title={"생활원 민원"}
              imgsrc={민원아이콘}
              onClick={() => {
                if (!isLoggedIn) {
                  alert("로그인 후 사용할 수 있습니다.");
                  navigate("/login");
                  return;
                }
                navigate("/complain");
              }}
            />
            <ServiceBox
              title={"폼"}
              imgsrc={폼아이콘}
              onClick={() => {
                navigate("/form");
              }}
            />
          </ServiceWrapper>
        </TitleContentArea>
        {isMatchingActive && (
          <TitleContentArea
            title={"2026년 1학기 룸메이트 모집"}
            description={"룸메이트를 구하고 있는 다양한 UNI들을 찾아보세요!"}
            link={"/roommate"}
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
                    />
                  ))
              ) : (
                <EmptyMessage>게시글이 없습니다.</EmptyMessage>
              )}
            </>
          </TitleContentArea>
        )}

        <TitleContentArea
          title={"공지사항"}
          description={
            "생활원과 서포터즈에서 알려드리는 공지사항을 확인해보세요."
          }
          link={"/announcements"}
        >
          {isAnnounceLoading ? (
            <LoadingSpinner message={"공지사항을 불러오고 있어요!"} />
          ) : (
            <NotiArea>
              <NotiWrapper>
                {notices.length > 0 ? (
                  notices
                    .filter((notice) => notice !== null && notice !== undefined)
                    .slice(0, 8)
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
                    ))
                ) : (
                  <EmptyMessage message={"공지사항이 없습니다."} />
                )}
              </NotiWrapper>
              <GradientRight />
            </NotiArea>
          )}
        </TitleContentArea>
        <TitleContentArea
          title={"생활원 YouTube"}
          externalLink={`https://www.youtube.com/channel/${CHANNEL_ID}`}
        >
          <YoutubeWidget />
        </TitleContentArea>
        <GridContainer>
          <TitleContentArea title="오늘의 Best 꿀팁" link={"/tips"}>
            {isTipsLoading ? (
              <LoadingSpinner message={"꿀팁을 불러오고 있어요!"} />
            ) : dailyTips.length > 0 ? (
              dailyTips.map((tip, key) => (
                <HomeTipsCard
                  key={key}
                  index={key + 1}
                  id={tip.boardId}
                  content={tip.title}
                />
              ))
            ) : (
              <EmptyMessage message={"오늘의 꿀팁이 없습니다."} />
            )}
          </TitleContentArea>
          <TitleContentArea
            title={"생활원 일정"}
            children={<Calendar mode={"week"} />}
            link={"/calendar"}
          />
        </GridContainer>

        {isOpenGroupPurchase && (
          <TitleContentArea title={"임박한 공동구매"} link={"/groupPurchase"}>
            {isGroupOrdersLoading ? (
              <LoadingSpinner message={"공동구매를 불러오고 있어요!"} />
            ) : groupOrders.length > 0 ? (
              <GroupPurchaseList groupOrders={groupOrders.slice(0, 4)} />
            ) : (
              <EmptyMessage message={"임박한 공동구매가 없습니다."} />
            )}
          </TitleContentArea>
        )}
      </ContentWrapper>

      <img className="appcenter-logo" src={앱센터로고가로} />

      <CommonBottomSheet
        id={"이벤트 당첨"}
        isOpen={isAppInstallOpen}
        setIsOpen={setIsAppInstallOpen}
        title={"유니돔 앱을 사용해보세요!"}
        headerImageId={0}
        children={ModalContent_AppInstall()}
        closeButtonText={"스토어에서 설치하기"}
        onCloseClick={() => {
          if (platform === "ios_browser") {
            window.open(
              "https://apps.apple.com/kr/app/%EC%9C%A0%EB%8B%88%EB%8F%94/id6751404748",
              "_blank",
            );
          } else if (platform === "android_browser") {
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
  padding: 16px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: 16px;
  border-radius: 16px 16px 0 0;
  background: #fafafa;
  width: 100%;

  @media (min-width: 768px) {
    max-width: 1200px;
    padding: 32px;
  }
`;

const GridContainer = styled.div`
  display: contents;

  @media (min-width: 1024px) {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 32px;
    order: -1;
  }
`;

const NotiArea = styled.div`
  position: relative;
  left: -32px;
  right: -32px;
  width: calc(100% + 32px);
  height: fit-content;
`;

const NotiWrapper = styled.div`
  display: flex;
  flex-direction: row;
  gap: 16px;
  width: 100%;
  padding: 16px 48px 16px 32px;
  padding-top: 8px;
  box-sizing: border-box;
  overflow-x: auto;
  -ms-overflow-style: none;
  scrollbar-width: none;
  &::-webkit-scrollbar {
    display: none;
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
    font-size: 18px;
    font-weight: 600;
  }
  p {
    font-size: 14px;
    color: #333;
  }
  span {
    font-size: 12px;
    color: #777;
  }
`;

const GradientRight = styled.div`
  position: absolute;
  right: -16px;
  top: 0;
  bottom: 0;
  width: 48px;
  background: linear-gradient(
    270deg,
    #fafafa 38.54%,
    rgba(250, 250, 250, 0) 100%
  );
  pointer-events: none;

  @media (min-width: 768px) {
    display: none;
  }
`;

const ServiceWrapper = styled.div`
  width: 100%;
  height: 78px;
  display: flex;
  flex-direction: row;
  gap: 16px;
`;
