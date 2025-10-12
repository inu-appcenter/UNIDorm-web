import styled from "styled-components";
import TitleContentArea from "../components/common/TitleContentArea.tsx";
import HomeNoticeCard from "../components/home/HomeNoticeCard.tsx";
import ThreeWeekCalendar from "../components/home/ThreeWeekCalendar.tsx";
import Header from "../components/common/Header.tsx";
import HomeTipsCard from "../components/home/HomeTipsCard.tsx";
import { useEffect, useState } from "react";
import { fetchDailyRandomTips } from "../apis/tips.ts";
import { Tip } from "../types/tips.ts";
import BottomBar from "../components/common/BottomBar.tsx";
import 민원접수 from "../assets/민원접수.svg";
import 앱센터로고가로 from "../assets/앱센터로고가로.svg";
import { useNavigate } from "react-router-dom";
import GroupPurchaseList from "../components/GroupPurchase/GroupPurchaseList.tsx";
import { GetGroupPurchaseListParams, GroupOrder } from "../types/grouporder.ts";
import { getGroupPurchaseList } from "../apis/groupPurchase.ts";
import HomeNoticeBottomModal from "../components/modal/HomeNoticeBottomModal.tsx";
import HomeBanner from "../components/home/HomeBanner.tsx";
import LoadingSpinner from "../components/common/LoadingSpinner.tsx";
import EmptyMessage from "../constants/EmptyMessage.tsx";
import { getAnnouncements } from "../apis/announcements.ts";
import { Announcement } from "../types/announcements.ts";
import useUserStore from "../stores/useUserStore.ts";
import { getPopupNotifications } from "../apis/popup-notification.ts";
import { PopupNotification } from "../types/popup-notifications.ts";
import useScreenWidth from "../hooks/useScreenWidth.ts";

export default function HomePage() {
  const { tokenInfo } = useUserStore();
  const isLoggedIn = Boolean(tokenInfo.accessToken);

  // 2. 화면 너비 가져오기
  const screenWidth = useScreenWidth();

  // 3. 화면 너비에 따라 표시 개수 결정
  const displayCount =
    screenWidth >= 1024 // 데스크톱 크기 (예: 1024px 이상)
      ? 5 // 데스크톱에서는 4개 표시
      : screenWidth >= 768 // 태블릿 크기 (예: 768px 이상)
        ? 3 // 태블릿에서는 3개 표시
        : 2; // 모바일 크기 (768px 미만)에서는 2개 표시 (기존 값)

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

  // 🔹 모달별 열림 상태 (popupNotices 기반)
  const [modalOpenStates, setModalOpenStates] = useState<
    Record<number, boolean>
  >({});

  const setModalOpen = (id: number, open: boolean) => {
    setModalOpenStates((prev) => ({ ...prev, [id]: open }));
  };

  useEffect(() => {
    // ✅ 팝업 공지 불러오기
    const fetchPopupNotices = async () => {
      setIsPopupLoading(true);
      try {
        const response = await getPopupNotifications();
        console.log("팝업 공지 불러오기 성공", response);
        setPopupNotices(response.data);

        // 팝업 공지 기반으로 모달별 초기 열림 상태 (true로 시작) 설정
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
          setDailyTips([]); // 팁이 3개 미만인 경우 빈 배열
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
        const response = await getAnnouncements();
        console.log("공지사항 불러오기 성공:", response);
        setNotices(response.data);
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

  return (
    <HomePageWrapper>
      <Header title="유니돔" hasBack={false} showAlarm={true} />
      {/* ✅ 팝업 공지를 모달로 렌더링 */}
      {!isPopupLoading &&
        popupNotices.map((popup) => (
          <HomeNoticeBottomModal
            key={popup.id}
            id={popup.id?.toString() ?? ""}
            isOpen={modalOpenStates[popup.id ?? 0]}
            setIsOpen={(open) => setModalOpen(popup.id ?? 0, open)}
            links={[]} // 필요시 popup.content에 URL을 파싱해서 전달 가능
            title={popup.title}
            text={popup.content}
          >
            <PopupModalContent>
              {popup.imagePath?.map((img, idx) => (
                <img key={idx} src={img} alt={popup.title} />
              ))}
            </PopupModalContent>
          </HomeNoticeBottomModal>
        ))}

      <HomeBanner />

      <ContentWrapper>
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
            <NotiWrapper>
              {notices.length > 0 ? (
                notices
                  .filter((notice) => notice !== null && notice !== undefined)
                  .slice(0, displayCount) // ✨ 여기서 동적으로 결정된 개수(displayCount)를 사용
                  .map((notice) => (
                    <HomeNoticeCard
                      key={notice.id ?? notice.title}
                      id={notice.id}
                      title={notice.title}
                      content={notice.content}
                      isEmergency={notice.emergency}
                      createdDate={notice.createdDate}
                    />
                  ))
              ) : (
                <EmptyMessage message={"공지사항이 없습니다."} />
              )}
            </NotiWrapper>
          )}
        </TitleContentArea>

        <TitleContentArea
          title="오늘의 Best 꿀팁"
          description={"다양한 기숙사 꿀팁을 알아보세요!"}
          link={"/tips"}
        >
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
          title={"캘린더 이벤트"}
          description={"인천대학교 생활원에서 알려드리는 일정입니다."}
          children={<ThreeWeekCalendar />}
          link={"/calendar"}
        />
        <TitleContentArea title={"임박한 공동구매"} link={"/groupPurchase"}>
          {isGroupOrdersLoading ? (
            <LoadingSpinner message={"공동구매를 불러오고 있어요!"} />
          ) : groupOrders.length > 0 ? (
            <GroupPurchaseList groupOrders={groupOrders.slice(0, 4)} /> // ⭐️ [수정] 4개로 고정
          ) : (
            <EmptyMessage message={"임박한 공동구매가 없습니다."} />
          )}
        </TitleContentArea>
      </ContentWrapper>

      <img className="appcenter-logo" src={앱센터로고가로} />
      <FloatingButton
        onClick={() => {
          if (!isLoggedIn) {
            alert("로그인 후 사용할 수 있습니다.");
            navigate("/login");
            return;
          }
          navigate("/complain");
        }}
      >
        <img src={민원접수} />
      </FloatingButton>

      <BottomBar />
    </HomePageWrapper>
  );
}

const HomePageWrapper = styled.div`
  display: flex;
  flex-direction: column;
  //gap: 32px;
  padding-top: 16px;
  padding-bottom: 120px;
  box-sizing: border-box;
  //
  //width: 100%;
  //height: 100%;

  overflow-y: auto;
  //background: white;

  .appcenter-logo {
    margin-top: 36px;
    width: 50%;
    max-width: 250px;
  }
`;

const ContentWrapper = styled.div`
  padding: 0 16px;
  padding-top: 32px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: 32px;
  border-radius: 16px 16px 0 0;
  background: #fafafa;
`;
const NotiWrapper = styled.div`
  display: flex;
  flex-direction: row;
  gap: 12px;
  width: 100%;
`;

const FloatingButton = styled.button`
  border: none;
  background: none;
  width: fit-content;
  height: fit-content;

  position: fixed;
  bottom: 100px;
  right: 24px;

  cursor: pointer;
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
