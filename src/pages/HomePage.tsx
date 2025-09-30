import styled from "styled-components";
import TitleContentArea from "../components/common/TitleContentArea.tsx";
import HomeNoticeCard from "../components/home/HomeNoticeCard.tsx";
import ThreeWeekCalendar from "../components/home/ThreeWeekCalendar.tsx";
import Header from "../components/common/Header.tsx";
import 배너1 from "../assets/banner/포스터1.svg";
import HomeTipsCard from "../components/home/HomeTipsCard.tsx";
import { useEffect, useRef, useState } from "react";
import { fetchDailyRandomTips } from "../apis/tips.ts";
import { Tip } from "../types/tips.ts";
import BottomBar from "../components/common/BottomBar.tsx";
import { useAnnouncement } from "../stores/AnnouncementContext.tsx";
import 민원접수 from "../assets/민원접수.svg";
import 앱센터로고가로 from "../assets/앱센터로고가로.svg";
import { useNavigate } from "react-router-dom";
import Modal from "../components/common/Modal.tsx";
import GroupPurchaseList from "../components/GroupPurchase/GroupPurchaseList.tsx";
import { GetGroupPurchaseListParams, GroupOrder } from "../types/grouporder.ts";
import { getGroupPurchaseList } from "../apis/groupPurchase.ts";
import { dormNoticeContent } from "../constants/dormNoticeContent.tsx";
import EmptyMessage from "../constants/EmptyMessage.tsx";
import BottomModal from "../components/common/BottomModal.tsx";
import 인천시티투어_영문 from "../assets/banner/인천시티투어_영문.jpg";
import 인천시티투어_한글 from "../assets/banner/인천시티투어_한글.jpg";

export default function HomePage() {
  const [dailyTips, setDailyTips] = useState<Tip[]>([]);
  const { notices } = useAnnouncement();
  const navigate = useNavigate();

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
      try {
        const data = await fetchDailyRandomTips();
        setDailyTips(data);
      } catch (err: any) {
        if (err.response?.status === 204) {
          setDailyTips([]); // 팁이 3개 미만인 경우 빈 배열
        }
      }
    };

    getTips();
  }, []);

  const sliderRef = useRef<HTMLDivElement>(null);
  const indexRef = useRef(0);
  const totalSlides = 3;
  const [currentIndex, setCurrentIndex] = useState(0);

  const autoSlideTimerRef = useRef<NodeJS.Timeout | null>(null); // 🔹 타이머를 ref로

  useEffect(() => {
    const slider = sliderRef.current;
    if (!slider) return;

    const startAutoSlide = () => {
      if (autoSlideTimerRef.current) clearInterval(autoSlideTimerRef.current);
      autoSlideTimerRef.current = setInterval(() => {
        if (!slider) return;
        indexRef.current = (indexRef.current + 1) % totalSlides;
        slider.scrollTo({
          left: slider.clientWidth * indexRef.current,
          behavior: "smooth",
        });
        setCurrentIndex(indexRef.current);
      }, 4000);
    };

    const delayTimer = setTimeout(startAutoSlide, 300); // 처음 mount 이후 300ms 지연

    const handleManualScroll = () => {
      if (!slider) return;

      // 현재 인덱스 계산
      const newIndex = Math.round(slider.scrollLeft / slider.clientWidth);
      indexRef.current = newIndex;
      setCurrentIndex(newIndex);

      // 🔹 기존 타이머 클리어 및 일정 시간 후 재시작
      if (autoSlideTimerRef.current) {
        clearInterval(autoSlideTimerRef.current);
        autoSlideTimerRef.current = null;
      }

      // 5초 뒤에 다시 자동 슬라이드 시작
      setTimeout(startAutoSlide, 5000);
    };

    slider.addEventListener("scroll", handleManualScroll);

    return () => {
      clearTimeout(delayTimer);
      if (autoSlideTimerRef.current) clearInterval(autoSlideTimerRef.current);
      slider.removeEventListener("scroll", handleManualScroll);
    };
  }, []);

  // 게시글 상태
  const [groupOrders, setGroupOrders] = useState<GroupOrder[]>([]);

  useEffect(() => {
    const fetchGroupOrders = async (searchTerm?: string) => {
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
      }
    };

    fetchGroupOrders();
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

  // 초기 상태를 localStorage에서 불러오기
  const [showInfoModal, setShowInfoModal] = useState(() => {
    const saved = localStorage.getItem("hideInfoModal");
    return saved !== "true"; // 저장값이 "true"면 숨김
  });
  return (
    <HomePageWrapper>
      <Header title="아이돔" hasBack={false} showAlarm={true} />
      {/* 🔹 중앙에서 관리하는 모달을 map으로 렌더링 */}
      {modalList.map((modal) => (
        <BottomModal
          key={modal.id}
          id={modal.id}
          isOpen={modalOpenStates[modal.id]}
          setIsOpen={(open) => setModalOpen(modal.id, open)}
          links={modal.links}
        >
          {modal.content}
        </BottomModal>
      ))}

      <BannerWrapper>
        <FullWidthSlider ref={sliderRef}>
          <FullWidthSlide>
            <img src={배너1} />
          </FullWidthSlide>
          <FullWidthSlide>
            <img src={배너1} />
          </FullWidthSlide>
          <FullWidthSlide>
            <img src={배너1} />
          </FullWidthSlide>
        </FullWidthSlider>
        {/* 인디케이터 */}
        <IndicatorWrapper>
          {Array.from({ length: totalSlides }).map((_, idx) => (
            <Dot key={idx} active={idx === currentIndex} />
          ))}
        </IndicatorWrapper>
      </BannerWrapper>
      <ContentWrapper>
        {/*<TitleContentArea*/}
        {/*  title={"룸메이트 매칭 진행 중!"}*/}
        {/*  description={"룸메이트를 구하고 있는 다양한 UNI들을 찾아보세요!"}*/}
        {/*  link={"/roommate"}*/}
        {/*>*/}
        {/*  <>*/}
        {/*    {randomRoommate ? (*/}
        {/*      <RoomMateCard*/}
        {/*        key={randomRoommate.boardId}*/}
        {/*        title={randomRoommate.title}*/}
        {/*        boardId={randomRoommate.boardId}*/}
        {/*        dormType={randomRoommate.dormType}*/}
        {/*        mbti={randomRoommate.mbti}*/}
        {/*        college={randomRoommate.college}*/}
        {/*        isSmoker={true}*/}
        {/*        isClean={true}*/}
        {/*        stayDays={randomRoommate.dormPeriod}*/}
        {/*        description={randomRoommate.comment}*/}
        {/*        roommateBoardLike={randomRoommate.roommateBoardLike}*/}
        {/*        matched={randomRoommate.matched}*/}
        {/*      />*/}
        {/*    ) : (*/}
        {/*      <EmptyMessage>게시글이 없습니다.</EmptyMessage>*/}
        {/*    )}*/}
        {/*  </>*/}
        {/*</TitleContentArea>*/}

        <TitleContentArea
          title={"공지사항"}
          description={
            "인천대학교 생활원에서 알려드리는 공지사항을 확인해보세요."
          }
          link={"/announcements"}
          children={
            <NotiWrapper>
              {notices.length > 0 ? (
                notices
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
          }
        />

        <TitleContentArea
          title="오늘의 Best 꿀팁"
          description={
            "기숙사에 사는 UNI들이 공유하는 다양한 기숙사 꿀팁을 찾아보세요!"
          }
          link={"/tips"}
          children={
            <>
              {dailyTips.length > 0 ? (
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
            </>
          }
        />

        <TitleContentArea
          title={"캘린더 이벤트"}
          description={"인천대학교 생활원에서 알려드리는 일정입니다."}
          children={<ThreeWeekCalendar />}
          link={"/calendar"}
        />
        <TitleContentArea
          title={"임박한 공동구매"}
          link={"/groupPurchase"}
          children={
            groupOrders.length > 0 ? (
              <GroupPurchaseList groupOrders={groupOrders} />
            ) : (
              <EmptyMessage message={"임박한 공동구매가 없습니다."} />
            )
          }
        />
      </ContentWrapper>

      <Modal
        show={showInfoModal}
        onClose={() => setShowInfoModal(false)}
        title={"유니돔에서 알려드립니다."}
        subtitle={"기숙사 룸메이트 신청기간입니다.\n결핵 검사도 놓치지 마세요!"}
        content={dormNoticeContent}
        showHideOption={true}
      />

      <img className="appcenter-logo" src={앱센터로고가로} />
      <FloatingButton
        onClick={() => {
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

const FullWidthSlider = styled.div`
  display: flex;
  overflow-x: scroll;
  scroll-snap-type: x mandatory;
  scroll-behavior: smooth;
  width: 100%;
  position: relative; /* ← 플로팅을 위한 설정 */
  -ms-overflow-style: none; /* IE */
  scrollbar-width: none; /* Firefox */
  min-height: fit-content;

  &::-webkit-scrollbar {
    display: none; /* Chrome */
  }
`;

const FullWidthSlide = styled.div`
  flex: 0 0 100%;
  scroll-snap-align: start;
  width: 100%;
  height: 100%;
  box-sizing: border-box;

  img {
    width: 100%;
    height: 250px;
    object-fit: cover;
  }
`;

const BannerWrapper = styled.div`
  position: relative;
  width: 100%;
`;

const IndicatorWrapper = styled.div`
  position: absolute;
  bottom: 12px; /* 이미지 하단에서 약간 위 */
  left: 0;
  right: 0;
  display: flex;
  justify-content: center;
  gap: 4px;
  //padding: 0 16px;
  pointer-events: none;
`;

const Dot = styled.div<{ active: boolean }>`
  height: 3px;
  flex: 1;
  background-color: ${({ active }) => (active ? "#FFD600" : "#ccc")};
  transition: background-color 0.3s ease;
  border-radius: 2px;
  &:not(:last-child) {
    margin-right: 6px;
  }
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
