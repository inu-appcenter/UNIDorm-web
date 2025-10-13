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
      {!isPopupLoading &&
        popupNotices.map((popup) => (
          <HomeNoticeBottomModal
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
        {/* PC에서는 '꿀팁'과 '캘린더'를 묶어서 그리드 아이템으로 처리 */}
        <GridContainer>
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
        </GridContainer>

        <TitleContentArea title={"임박한 공동구매"} link={"/groupPurchase"}>
          {isGroupOrdersLoading ? (
            <LoadingSpinner message={"공동구매를 불러오고 있어요!"} />
          ) : groupOrders.length > 0 ? (
            <GroupPurchaseList groupOrders={groupOrders.slice(0, 4)} />
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
  align-items: center; // 🖥️ PC 레이아웃을 위해 중앙 정렬 추가
  padding-top: 16px;
  padding-bottom: 120px;
  box-sizing: border-box;
  overflow-y: auto;
  width: 100%; // 🖥️ 너비 100% 명시

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
  padding: 0 16px;
  padding-top: 32px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: 32px;
  border-radius: 16px 16px 0 0;
  background: #fafafa;
  width: 100%; // 🖥️ 너비 100% 명시

  // 🖥️ PC (태블릿 포함) 화면에서는 최대 너비를 지정하여 콘텐츠가 너무 넓어지는 것을 방지
  @media (min-width: 768px) {
    max-width: 1200px;
    padding: 32px;
  }
`;

// 🖥️ PC에서 꿀팁, 캘린더를 묶기 위한 새로운 그리드 컨테이너
const GridContainer = styled.div`
  display: contents; // 기본적으로는 아무런 스타일도 가지지 않음

  // 🖥️ PC 화면에서 그리드 레이아웃 적용
  @media (min-width: 1024px) {
    display: grid;
    grid-template-columns: 1fr 1fr; // 1:1 비율의 2열 그리드
    gap: 32px;

    // 이 컨테이너가 '공지사항'보다 위에 오도록 순서 변경
    order: -1;
  }
`;

const NotiArea = styled.div`
  position: relative;
  left: -16px;
  right: -16px;
  width: calc(100% + 32px);
  height: fit-content;

  // 🖥️ PC 화면에서는 좌우 패딩을 제거
  @media (min-width: 768px) {
    left: 0;
    right: 0;
    width: 100%;
  }
`;

const NotiWrapper = styled.div`
  display: flex;
  flex-direction: row;
  gap: 16px;
  width: 100%;
  padding: 16px;
  padding-right: 48px;
  padding-left: 32px;
  padding-top: 8px;
  box-sizing: border-box;
  overflow-x: auto; // (수정) overflow-y -> overflow-x

  //// 🖥️ PC 화면에서는 스크롤 대신 그리드로 표시
  //@media (min-width: 768px) {
  //  display: grid;
  //  // 카드의 최소 너비는 280px, 공간이 남으면 1fr씩 나눠가짐
  //  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  //  overflow-x: hidden;
  //  padding: 8px 0 0 0;
  //}
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

  // 🖥️ PC 화면에서는 위치를 조금 더 안쪽으로 조정할 수 있음
  @media (min-width: 768px) {
    right: 48px;
    //bottom: 50px;
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

  // 🖥️ PC 화면에서는 가로 스크롤이 없으므로 그라데이션을 숨김
  @media (min-width: 768px) {
    display: none;
  }
`;
