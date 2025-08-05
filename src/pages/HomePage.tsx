import styled from "styled-components";
import TitleContentArea from "../components/common/TitleContentArea.tsx";
import HomeCard from "../components/home/HomeCard.tsx";
import ThreeWeekCalendar from "../components/home/ThreeWeekCalendar.tsx";
import Header from "../components/common/Header.tsx";
import 배너1 from "../assets/banner/포스터1.svg";
import HomeTipsCard from "../components/home/HomeTipsCard.tsx";
import { useEffect, useMemo, useRef, useState } from "react";
import { fetchDailyRandomTips } from "../apis/tips.ts";
import { Tip } from "../types/tips.ts";
import RoomMateCard from "../components/roommate/RoomMateCard.tsx";
import { getRoomMateList } from "../apis/roommate.ts";
import { RoommatePost } from "../types/roommates.ts";

const mockBoard = [
  {
    type: "공지사항",
    title: "기숙사 공지사항입니다",
    content: "기숙사 전쟁나썽요!!!!!",
    isEmergency: true,
    scrapCount: 121,
  },
  {
    type: "기숙사 꿀팁",
    title: "기숙사 생활 꿀팁 공유합니다",
    content: "세탁기는 이른 아침에 쓰는 게 제일 한가합니다!",
    isEmergency: false,
    scrapCount: 45,
  },
];
export default function HomePage() {
  const [tips, setTips] = useState<Tip[]>([]);

  useEffect(() => {
    const getTips = async () => {
      try {
        const data = await fetchDailyRandomTips();
        setTips(data);
      } catch (err: any) {
        if (err.response?.status === 204) {
          setTips([]); // 팁이 3개 미만인 경우 빈 배열
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

  const [roommates, setRoommates] = useState<RoommatePost[]>([]);
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await getRoomMateList();
        setRoommates(response.data);
      } catch (error) {
        console.error("룸메이트 목록 가져오기 실패:", error);
      }
    };

    fetchData();
  }, []);

  const randomRoommate = useMemo(() => {
    if (!roommates || roommates.length === 0) return null;
    const index = Math.floor(Math.random() * roommates.length);
    return roommates[index];
  }, [roommates]);

  return (
    <HomePageWrapper>
      <Header title="아이돔" hasBack={false} showAlarm={true} />

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
        <TitleContentArea
          title={"룸메이트 매칭 진행 중!"}
          description={"룸메이트를 구하고 있는 다양한 UNI들을 찾아보세요!"}
          link={"/roommatelist"}
        >
          <>
            {randomRoommate ? (
              <RoomMateCard
                key={randomRoommate.boardId}
                title={randomRoommate.title}
                boardId={randomRoommate.boardId}
                dormType={randomRoommate.dormType}
                mbti={randomRoommate.mbti}
                college={randomRoommate.college}
                isSmoker={true}
                isClean={true}
                stayDays={randomRoommate.dormPeriod}
                description={randomRoommate.comment}
                commentCount={12}
                likeCount={8}
              />
            ) : (
              <EmptyMessage>게시글이 없습니다.</EmptyMessage>
            )}
          </>
        </TitleContentArea>
        <TitleContentArea
          title="오늘의 Best 꿀팁"
          link={"/tips"}
          children={
            <>
              {tips.length > 0 ? (
                tips.map((tip, key) => (
                  <HomeTipsCard
                    key={key}
                    index={key + 1}
                    id={tip.id}
                    content={tip.title}
                  />
                ))
              ) : (
                <p>오늘의 꿀팁이 없습니다.</p>
              )}
            </>
          }
        />
        <TitleContentArea
          title={mockBoard[0].type}
          link={"/notification"}
          children={
            <NotiWrapper>
              <HomeCard
                title={mockBoard[0].title}
                content={mockBoard[0].content}
                isEmergency={mockBoard[0].isEmergency}
                scrapCount={mockBoard[0].scrapCount}
              />
              <HomeCard
                title={mockBoard[0].title}
                content={mockBoard[0].content}
                isEmergency={mockBoard[0].isEmergency}
                scrapCount={mockBoard[0].scrapCount}
              />
            </NotiWrapper>
          }
        />

        <TitleContentArea
          title={"캘린더 이벤트"}
          children={<ThreeWeekCalendar />}
        />
        {/*<TitleContentArea*/}
        {/*  title={"임박한 공동구매"}*/}
        {/*  link={"/groupPurchase"}*/}
        {/*  children={<GroupPurchaseList />}*/}
        {/*/>*/}
      </ContentWrapper>
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

  width: 100%;
  height: 100%;

  overflow-y: auto;

  background: #fafafa;
`;

const ContentWrapper = styled.div`
  padding: 0 16px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: 16px;
  box-sizing: border-box;
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

const EmptyMessage = styled.div`
  padding: 24px;
  text-align: center;
  color: #aaa;
  font-size: 14px;
`;
