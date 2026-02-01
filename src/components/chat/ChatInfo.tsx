import styled from "styled-components";
import profile from "../../assets/profileimg.png";
import GroupPurchaseInfo from "./GroupPurchaseInfo.tsx";
import RoundSquareButton from "../button/RoundSquareButton.tsx";
import { requestRoommateMatchingByChatRoom } from "@/apis/roommate";
import { MdHelpOutline } from "react-icons/md";
import RoundSquareWhiteButton from "../button/RoundSquareWhiteButton.tsx";
import { useEffect, useState } from "react";
import 궁금해하는횃불이 from "../../assets/roommate/궁금해하는횃불이.webp";
import TooltipMessage from "../common/TooltipMessage.tsx";

// 로컬 스토리지 키 정의
const TOOLTIP_CLOSED_STORAGE_KEY = "roommate_chat_tooltip_closed_list";

interface ChatInfoProps {
  selectedTab: string;
  partnerName?: string;
  roomId?: number;
  isChatted?: boolean;
  partnerProfileImageUrl?: string;
}

const ChatInfo = ({
  selectedTab,
  partnerName,
  roomId,
  isChatted,
  partnerProfileImageUrl,
}: ChatInfoProps) => {
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [isRequestMode, setIsRequestMode] = useState(false);
  // 초기값은 false로 두고, useEffect에서 확인 후 true로 변경
  const [showTooltip, setShowTooltip] = useState(false);

  // roomId가 바뀌면 해당 방에서 툴팁을 닫은 적이 있는지 확인
  useEffect(() => {
    if (!roomId) return;

    const checkTooltipStatus = () => {
      try {
        const storedList = localStorage.getItem(TOOLTIP_CLOSED_STORAGE_KEY);
        const closedList: number[] = storedList ? JSON.parse(storedList) : [];

        // 이 방 ID가 닫은 목록에 없으면 툴팁 표시
        if (!closedList.includes(roomId)) {
          setShowTooltip(true);
        } else {
          setShowTooltip(false);
        }
      } catch (error) {
        console.error("로컬 스토리지 파싱 에러", error);
        setShowTooltip(true);
      }
    };

    checkTooltipStatus();
  }, [roomId]);

  // 툴팁 닫기 핸들러 (영구 저장)
  const handleCloseTooltip = () => {
    setShowTooltip(false);
    if (!roomId) return;

    try {
      const storedList = localStorage.getItem(TOOLTIP_CLOSED_STORAGE_KEY);
      const closedList: number[] = storedList ? JSON.parse(storedList) : [];

      // 중복되지 않게 현재 roomId 추가
      if (!closedList.includes(roomId)) {
        closedList.push(roomId);
        localStorage.setItem(
          TOOLTIP_CLOSED_STORAGE_KEY,
          JSON.stringify(closedList),
        );
      }
    } catch (error) {
      console.error("툴팁 상태 저장 실패", error);
    }
  };

  const handleMatchingRequest = async () => {
    if (!window.confirm(`${partnerName}님에게 룸메이트 요청을 보낼까요?`)) {
      return;
    }

    if (!roomId) {
      alert("요청을 보내는 중 오류가 발생했습니다.");
      return;
    }
    try {
      const response = await requestRoommateMatchingByChatRoom({
        chatRoomId: roomId,
      });
      console.log("매칭 요청 성공:", response.data);
      alert(
        "상대방에게 룸메이트 매칭 요청을 보냈습니다!\n상대방에게 매칭 수락을 요청해보세요.\n서로 요청을 보내는 경우에도 자동으로 매칭 처리됩니다.",
      );
    } catch (error: any) {
      if (error.response?.status === 404) {
        alert("채팅방 또는 사용자를 찾을 수 없습니다.");
        console.error("채팅방 또는 사용자를 찾을 수 없습니다.");
      } else if (error.response?.status === 409) {
        alert("이미 매칭 요청을 보낸 상태입니다.");
        console.error("이미 매칭 요청을 보낸 상태입니다.");
      } else {
        alert("알 수 없는 오류 발생:" + error);
        console.error("알 수 없는 오류 발생:", error);
      }
    }
  };

  return (
    <ChatInfoWrapper>
      <ImgWrapper>
        <img src={partnerProfileImageUrl || profile} alt={"프로필이미지"} />
      </ImgWrapper>
      <ContentWrapper>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div className="title">{partnerName}</div>
          {selectedTab === "공동구매" && <GroupPurchaseInfo />}
        </div>
      </ContentWrapper>
      <FunctionWrapper>
        {selectedTab === "룸메이트" && (
          <RelativeWrapper>
            <RoundSquareButton
              btnName={"룸메 신청"}
              onClick={() => {
                if (!isChatted) {
                  alert(
                    "대화를 나누지 않고 룸메이트를 신청할 수 없어요.\n상대방과 룸메이트를 하기로 약속한 뒤 눌러주세요.",
                  );
                  return;
                }
                setIsRequestMode(true);
                setShowInfoModal(true);
              }}
            />
            {showTooltip && (
              <TooltipMessage
                message={
                  "서로 룸메이트를 하기로 마음먹었다면,\n룸메이트를 신청하세요!"
                }
                onClose={handleCloseTooltip} // 닫기 버튼 클릭 시 저장 로직 실행
                position="bottom"
                align="right"
                width="110px"
              />
            )}
          </RelativeWrapper>
        )}
      </FunctionWrapper>
      <div style={{ display: "flex", alignItems: "center" }}>
        <MdHelpOutline
          color={"gray"}
          size={24}
          style={{ cursor: "pointer" }}
          onClick={() => setShowInfoModal(true)}
        />
      </div>
      {showInfoModal && (
        <ModalBackGround>
          <Modal>
            <ModalContentWrapper>
              <ModalHeader>
                <img src={궁금해하는횃불이} className="wonder-character" />
                <h2>꼭 확인해주세요!</h2>
                <span>
                  반드시 아래 내용을 숙지하시고 신청하기 버튼을 눌러주세요.
                </span>
              </ModalHeader>
              <ModalScrollArea>
                <h3>룸메이트 신청이 뭔가요?</h3>
                <p>
                  UNI Dorm에서의 룸메이트 매칭은{" "}
                  <strong>실제 기숙사 룸메이트 지정과 무관</strong>
                  하며, 룸메이트를 구하는데 도움을 드리는 서비스입니다.
                </p>

                <p>
                  상대방이 수락하여 매칭이 되면, 룸메이트 탭은 "내 룸메이트"
                  화면으로 전환되며, 룸메이트와 시간표 공유, 퀵 메시지 등 다양한
                  편의 기능을 제공합니다.
                  <br />
                  또한,{" "}
                  <strong>
                    더이상 다른 UNI에게 룸메이트를 구하는 메시지를 받지
                    않습니다.
                    <br />
                    <span style={{ color: "red" }}>
                      채팅으로 서로의 학번을 알아두고, 아래 방법에 따라 실제
                      룸메이트를 신청하세요!
                    </span>
                  </strong>
                </p>
                <h3>실제 기숙사 룸메이트 신청은 어떻게 하나요?</h3>
                <p>
                  <strong style={{ color: "red" }}>
                    반드시 룸메이트 사전 지정 기간에 인천대학교 포털에서
                    신청해주세요!!!!
                    <br />❍ 신청기간 : 2026. 02. 14(토) 00:00 ~ 02. 18(수) 23:59
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
                  <br />
                  - 룸메이트 신청은 2명이 서로 신청한 경우에만 신청이 인정됨
                  <br />
                  <br />
                  기타 자세한 사항은{" "}
                  <a
                    href="https://dorm.inu.ac.kr/dorm/6521/subview.do?enc=Zm5jdDF8QEB8JTJGYmJzJTJGZG9ybSUyRjIwMDMlMkY0MTc4MDglMkZhcnRjbFZpZXcuZG8lM0ZwYWdlJTNEMSUyNnNyY2hDb2x1bW4lM0QlMjZzcmNoV3JkJTNEJTI2YmJzQ2xTZXElM0QlMjZiYnNPcGVuV3JkU2VxJTNEJTI2cmdzQmduZGVTdHIlM0QlMjZyZ3NFbmRkZVN0ciUzRCUyNmlzVmlld01pbmUlM0RmYWxzZSUyNnBhc3N3b3JkJTNEJTI2"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    여기
                  </a>
                  를 클릭하여 확인
                </p>
              </ModalScrollArea>
            </ModalContentWrapper>
            {isRequestMode && (
              <div style={{ padding: "10px 0", textAlign: "center" }}>
                {partnerName}님에게 룸메이트 요청을 보낼까요?
              </div>
            )}
            <ButtonGroupWrapper>
              <RoundSquareWhiteButton
                btnName={"닫기"}
                onClick={() => {
                  setShowInfoModal(false);
                  setIsRequestMode(false);
                }}
              />
              {isRequestMode && (
                <RoundSquareButton
                  btnName={"보내기"}
                  onClick={handleMatchingRequest}
                />
              )}
            </ButtonGroupWrapper>
          </Modal>
        </ModalBackGround>
      )}
    </ChatInfoWrapper>
  );
};
export default ChatInfo;

const ChatInfoWrapper = styled.div`
  width: 100%;
  height: fit-content;
  padding: 8px 20px;

  display: flex;
  flex-direction: row;

  box-sizing: border-box;

  gap: 16px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
  background: white;
  position: relative; /* z-index 컨텍스트 생성 */
  z-index: 100;
`;

const ImgWrapper = styled.div`
  width: fit-content;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;

  img {
    width: 46px;
    height: 46px;
    border-radius: 50%;
    object-fit: cover;
  }
`;
const ContentWrapper = styled.div`
  flex: 1;
  display: flex;
  align-items: center;

  .title {
    font-style: normal;
    font-weight: 500;
    font-size: 16px;
    line-height: 24px;
    letter-spacing: 0.38px;

    color: #1c1c1e;
  }
`;

const FunctionWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
`;

const RelativeWrapper = styled.div`
  position: relative;
  display: flex;
  align-items: center;
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
  overflow: hidden;
`;

const ModalHeader = styled.div`
  flex-shrink: 0;
  margin-bottom: 12px;
  justify-content: space-between;
  padding-right: 50px;
  overflow-wrap: break-word;
  word-break: keep-all;

  h2 {
    margin: 0;
    box-sizing: border-box;
  }
  span {
    font-size: 14px;
  }
`;

const ModalScrollArea = styled.div`
  flex: 1;
  overflow-y: auto;
  padding-right: 8px;
`;

const ButtonGroupWrapper = styled.div`
  display: flex;
  flex-direction: row;
  gap: 6px;
`;
