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
import 인천시티투어_영문 from "../assets/banner/인천시티투어_영문.jpg";
import 인천시티투어_한글 from "../assets/banner/인천시티투어_한글.jpg";
import HomeBanner from "../components/home/HomeBanner.tsx";
import LoadingSpinner from "../components/common/LoadingSpinner.tsx";
import EmptyMessage from "../constants/EmptyMessage.tsx";
import { getAnnouncements } from "../apis/announcements.ts";
import { Announcement } from "../types/announcements.ts";
import useUserStore from "../stores/useUserStore.ts";

export default function HomePage() {
  const { tokenInfo } = useUserStore();
  const isLoggedIn = Boolean(tokenInfo.accessToken);

  const [dailyTips, setDailyTips] = useState<Tip[]>([]);
  const [groupOrders, setGroupOrders] = useState<GroupOrder[]>([]);
  const [notices, setNotices] = useState<Announcement[]>([]);

  const navigate = useNavigate();

  const [isTipsLoading, setIsTipsLoading] = useState<boolean>(false);
  const [isAnnounceLoading, setIsAnnounceLoading] = useState<boolean>(false);
  const [isGroupOrdersLoading, setIsGroupOrdersLoading] =
    useState<boolean>(false);

  // 🔹 모달 데이터 중앙 관리
  const modalList = [
    {
      id: "인천시티투어_영문",
      content: <img src={인천시티투어_영문} />,
      links: [
        {
          title: "Incheon City Tour HomePage",
          link: "https://citytour.ito.or.kr/foreign/english/citytour.do",
        },
        {
          title: "Apply for the Incheon city tour – Chuseok Holiday",
          link: "https://form.naver.com/response/9gFKMybfIWhGsq2xKZgHCQ",
        },
      ],
    },
    {
      id: "인천시티투어_한글",
      content: <img src={인천시티투어_한글} />,
      links: [
        {
          title: "인천시티투어 관광안내",
          link: "https://citytour.ito.or.kr/",
        },
        {
          title: "생활원 추석연휴 인천 시티투어 신청",
          link: "https://form.naver.com/response/C8J-IXLCXiAFJjla8d8cAg",
        },
      ],
    },
  ];

  // 🔹 모달별 열림 상태
  const [modalOpenStates, setModalOpenStates] = useState(() =>
    modalList.reduce(
      (acc, modal) => {
        acc[modal.id] = true;
        return acc;
      },
      {} as Record<string, boolean>,
    ),
  );

  const setModalOpen = (id: string, open: boolean) => {
    setModalOpenStates((prev) => ({ ...prev, [id]: open }));
  };

  useEffect(() => {
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

    getTips();
    fetchGroupOrders();
    fetchAnnouncements();
  }, []);

  // const { roommates } = useRoomMateContext();

  // const randomRoommate = useMemo(() => {
  //   if (!Array.isArray(roommates) || roommates.length === 0) return null;
  //
  //   const unmatchedRoommates = roommates.filter((r) => !r.matched);
  //   if (!Array.isArray(unmatchedRoommates) || unmatchedRoommates.length === 0)
  //     return null;
  //
  //   const index = Math.floor(Math.random() * unmatchedRoommates.length);
  //   return unmatchedRoommates[index];
  // }, [roommates]);

  // // 초기 상태를 localStorage에서 불러오기
  // const [showInfoModal, setShowInfoModal] = useState(() => {
  //   const saved = localStorage.getItem("hideInfoModal");
  //   return saved !== "true"; // 저장값이 "true"면 숨김
  // });
  return (
    <HomePageWrapper>
      <Header title="유니돔" hasBack={false} showAlarm={true} />
      {/* 🔹 중앙에서 관리하는 모달을 map으로 렌더링 */}
      {modalList.map((modal) => (
        <HomeNoticeBottomModal
          key={modal.id}
          id={modal.id}
          isOpen={modalOpenStates[modal.id]}
          setIsOpen={(open) => setModalOpen(modal.id, open)}
          links={modal.links}
        >
          {modal.content}
        </HomeNoticeBottomModal>
      ))}

      <HomeBanner />

      <ContentWrapper>
        {/*<TitleContentArea*/}
        {/* title={"룸메이트 매칭 진행 중!"}*/}
        {/* description={"룸메이트를 구하고 있는 다양한 UNI들을 찾아보세요!"}*/}
        {/* link={"/roommate"}*/}
        {/*>*/}
        {/* <>*/}
        {/* {randomRoommate ? (*/}
        {/* <RoomMateCard*/}
        {/* key={randomRoommate.boardId}*/}
        {/* title={randomRoommate.title}*/}
        {/* boardId={randomRoommate.boardId}*/}
        {/* dormType={randomRoommate.dormType}*/}
        {/* mbti={randomRoommate.mbti}*/}
        {/* college={randomRoommate.college}*/}
        {/* isSmoker={true}*/}
        {/* isClean={true}*/}
        {/* stayDays={randomRoommate.dormPeriod}*/}
        {/* description={randomRoommate.comment}*/}
        {/* roommateBoardLike={randomRoommate.roommateBoardLike}*/}
        {/* matched={randomRoommate.matched}*/}
        {/* />*/}
        {/* ) : (*/}
        {/* <EmptyMessage>게시글이 없습니다.</EmptyMessage>*/}
        {/* )}*/}
        {/* </>*/}
        {/*</TitleContentArea>*/}

        <TitleContentArea
          title={"공지사항"}
          description={
            "인천대학교 생활원에서 알려드리는 공지사항을 확인해보세요."
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
                  .slice(0, 2)
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
          description={
            "기숙사에 사는 UNI들이 공유하는 다양한 기숙사 꿀팁을 찾아보세요!"
          }
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
            <GroupPurchaseList groupOrders={groupOrders} />
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
  gap: 16px;
  padding-top: 16px;
  padding-bottom: 120px;
  box-sizing: border-box;
  //
  //width: 100%;
  //height: 100%;

  overflow-y: auto;

  //background: #fafafa;

  .appcenter-logo {
    margin-top: 36px;
    width: 50%;
    max-width: 250px;
  }
`;

const ContentWrapper = styled.div`
  padding: 0 16px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: 16px;
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
