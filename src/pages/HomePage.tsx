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
import 궁금해하는횃불이 from "../assets/roommate/궁금해하는횃불이.png";
import RoundSquareWhiteButton from "../components/button/RoundSquareWhiteButton.tsx";
import RoundSquareBlueButton from "../components/button/RoundSquareBlueButton.tsx";
import 민원접수 from "../assets/민원접수.svg";
import 앱센터로고가로 from "../assets/앱센터로고가로.svg";
import { useNavigate } from "react-router-dom";

export default function HomePage() {
  const [dailyTips, setDailyTips] = useState<Tip[]>([]);
  const { notices } = useAnnouncement();
  const navigate = useNavigate();

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
                <EmptyMessage>공지사항이 없습니다.</EmptyMessage>
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
                <EmptyMessage>오늘의 꿀팁이 없습니다.</EmptyMessage>
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
        {/*<TitleContentArea*/}
        {/*  title={"임박한 공동구매"}*/}
        {/*  link={"/groupPurchase"}*/}
        {/*  children={<GroupPurchaseList />}*/}
        {/*/>*/}
      </ContentWrapper>

      {showInfoModal && (
        <ModalBackGround>
          <Modal>
            <ModalContentWrapper>
              <ModalHeader>
                <img src={궁금해하는횃불이} className="wonder-character" />
                <h2>유니돔에서 알려드립니다</h2>
                <span>
                  기숙사 룸메이트 신청 기간입니다.
                  <br />
                  결핵 검사도 놓치지 마세요!
                </span>
              </ModalHeader>
              <ModalScrollArea>
                <h3>기숙사 룸메이트 신청은 어떻게 하나요?</h3>
                <p>
                  반드시 룸메이트 사전 지정 기간에{" "}
                  <strong>인천대학교 포털에서 신청</strong>해주세요!!!!
                  <strong>
                    <br />❍ 신청기간 : 2025. 08. 15(금) 00:00 ~ 08. 17(일) 23:59
                  </strong>
                  <br />
                  ❍ 신청방법
                  <br />- 포털(
                  <a
                    href="https://portal.inu.ac.kr"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    https://portal.inu.ac.kr
                  </a>
                  ) → 통합정보 → 부속행정(생활원) → 합격조회
                  <br />
                  ❍ 주의사항
                  <br />
                  - 입사기간 및 호실형태가 동일한 학생끼리 서로 신청해야
                  룸메이트 매칭 가능
                  <br />
                  ▷ 별도선발 신청자의 룸메이트 신청을 원하는 경우, 별도선발 부서
                  신청 기간 내 신청바랍니다.
                  <br />- 룸메이트 신청은 2명이 서로 신청한 경우에만 신청이
                  인정됨
                </p>
                <h3>결핵 검사도 놓치지 마세요!</h3>
                <p>
                  <strong>
                    결핵 검사 후 결과지 수령까지 보통 1주일 정도 걸리니 미리
                    하시기 바랍니다.
                  </strong>
                  <br /> ○ 결핵검사결과서
                  <br />
                  - 검진항목 : 보건소, 내과 등 의료기관에서 시행하는 흉부 엑스선
                  검사(결핵검사)
                  <br />
                  ※ 일반 내과 발급 진단서 또는 소견서 / 보건증 / 신체검사확인서
                  등<br />
                  - 기준 : 입사일 기준 2개월 이내의 진단서만 유효함
                  <br />※ 정기입사자 검진일 기준 : 2025. 06. 30 이후 검진기록
                  인정
                </p>
                <p>
                  <br />
                  기타 자세한 사항은{" "}
                  <a
                    href="https://dorm.inu.ac.kr/dorm/6521/subview.do?enc=Zm5jdDF8QEB8JTJGYmJzJTJGZG9ybSUyRjIwMDMlMkY0MTAwNjIlMkZhcnRjbFZpZXcuZG8lM0Y%3D"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    여기
                  </a>
                  를 클릭하여 확인
                </p>
              </ModalScrollArea>
            </ModalContentWrapper>
            <ButtonGroupWrapper>
              <RoundSquareWhiteButton
                btnName={"다시 보지 않기"}
                onClick={() => {
                  localStorage.setItem("hideInfoModal", "true"); // 다음 방문에도 안 뜨도록
                  setShowInfoModal(false);
                }}
              />

              <RoundSquareBlueButton
                btnName={"닫기"}
                onClick={() => {
                  setShowInfoModal(false);
                }}
              />
            </ButtonGroupWrapper>
          </Modal>
        </ModalBackGround>
      )}

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
  width: 100%;
  box-sizing: border-box;
`;

const ModalBackGround = styled.div`
  position: fixed;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(0, 0, 0, 0.5);
  inset: 0 0 0 0;
  z-index: 9999;
`;

const Modal = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
  box-sizing: border-box;
  padding: 32px 20px;
  border-radius: 16px;
  width: 90%;
  max-width: 420px;
  max-height: 80%;
  background: white;
  color: #333366;
  font-weight: 500;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  animation: fadeIn 0.3s ease-out;
  overflow: hidden;
  position: relative;

  .wonder-character {
    position: absolute;
    top: 10px;
    right: 0;
    width: 100px;
    height: 100px;
    z-index: 1000;
  }

  .content {
    width: 100%;
    flex: 1;
    //height: 100%;
    overflow-y: auto;
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

const ModalContentWrapper = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  overflow: hidden; /* 내부에서만 스크롤 생기도록 */
`;

const ModalHeader = styled.div`
  flex-shrink: 0; /* 스크롤 시 줄어들지 않게 고정 */
  margin-bottom: 12px;
  justify-content: space-between;
  padding-right: 50px;
  overflow-wrap: break-word; // 또는 wordWrap
  word-break: keep-all; // 단어 중간이 아니라 단어 단위로 줄바꿈

  h2 {
    margin: 0;
    box-sizing: border-box;
    font-size: 22px;
  }
  span {
    font-size: 14px;
  }
`;

const ModalScrollArea = styled.div`
  flex: 1;
  overflow-y: scroll; /* 항상 스크롤 가능하게 */
  padding-right: 8px;

  /* 크롬/사파리 */
  &::-webkit-scrollbar {
    display: block; /* 기본 표시 */
    width: 8px; /* 스크롤바 두께 */
  }
  &::-webkit-scrollbar-thumb {
    background-color: #ccc;
    border-radius: 4px;
  }
  &::-webkit-scrollbar-track {
    background-color: transparent;
  }

  /* 파이어폭스 */
  scrollbar-width: thin; /* 얇게 */
  scrollbar-color: #ccc transparent;
`;

const ButtonGroupWrapper = styled.div`
  display: flex;
  flex-direction: row;
  gap: 6px;
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
