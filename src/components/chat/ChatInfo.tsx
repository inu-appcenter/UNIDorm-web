import styled from "styled-components";
import profile from "../../assets/chat/profile.svg";
import GroupPurchaseInfo from "./GroupPurchaseInfo.tsx";
import RoundSquareBlueButton from "../button/RoundSquareBlueButton.tsx";
import TopRightDropdownMenu from "../common/TopRightDropdownMenu.tsx";
import { useNavigate } from "react-router-dom";
import { deleteRoommateChatRoom } from "../../apis/roommate.ts";

interface ChatInfoProps {
  selectedTab: string;
  partnerName?: string;
  roomId?: number;
}

const ChatInfo = ({ selectedTab, partnerName, roomId }: ChatInfoProps) => {
  const navigate = useNavigate();

  const menuItems = [
    {
      label: "사전 체크리스트 보기",
      onClick: async () => {
        navigate("/roommatechecklist", { state: { partnerName, roomId } });
      },
    },
    {
      label: "채팅방 나가기",
      onClick: async () => {
        const confirmed = window.confirm(
          "정말 채팅방을 나갈까요?\n서로에게 더 이상 채팅방이 보이지 않습니다.",
        );
        if (!confirmed) return;
        try {
          if (roomId === undefined)
            throw new Error("채팅방 id가 undefined입니다.");
          const response = await deleteRoommateChatRoom(roomId);
          if (response.status === 201) {
            alert("채팅방에서 나왔어요.");
            console.log("채팅방 나가기 성공, 채팅방이 삭제되었습니다.");
            // 추가 처리(예: 화면 이동, 상태 업데이트 등)
            navigate("/chat");
          }
        } catch (error: any) {
          alert("채팅방 나가기를 실패했어요." + error);
          if (error.response) {
            if (error.response.status === 403) {
              console.error("게스트가 아닌 사용자의 접근입니다.");
            } else if (error.response.status === 404) {
              console.error("유저 또는 채팅방을 찾을 수 없습니다.");
            } else {
              console.error("알 수 없는 오류가 발생했습니다.");
            }
          } else {
            console.error("네트워크 오류 또는 서버 응답 없음");
          }
        }
      },
    },
  ];
  return (
    <ChatInfoWrapper>
      <ImgWrapper>
        <img src={profile} alt={"프로필이미지"} />
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
          <RoundSquareBlueButton btnName={"룸메 신청"} />
        )}
        {menuItems && <TopRightDropdownMenu items={menuItems} />}
      </FunctionWrapper>
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
`;

const ImgWrapper = styled.div`
  width: fit-content;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;

  img {
    width: 46px;
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
