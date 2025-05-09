import styled from "styled-components";
import profile from "../../assets/chat/profile.svg";
import GroupPurchaseInfo from "./GroupPurchaseInfo.tsx";
import RoundSquareButton from "../button/RoundSquareButton.tsx";
import menu from "../../assets/menu.svg";

interface ChatInfoProps {
  selectedTab: string;
}
const ChatInfo = ({ selectedTab }: ChatInfoProps) => {
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
          <div className="title">익명 1</div>
          {selectedTab === "공구" && <GroupPurchaseInfo />}
        </div>
      </ContentWrapper>
      <FunctionWrapper>
        {selectedTab === "룸메" && <RoundSquareButton btnName={"룸메 신청"} />}
        <img src={menu} alt={"메뉴"} />
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
    font-family: "Pretendard";
    font-style: normal;
    font-weight: 600;
    font-size: 12px;
    line-height: 24px;
    letter-spacing: 0.38px;

    color: #1c1c1e;
  }

  .message {
    font-family: "Pretendard";
    font-style: normal;
    font-weight: 600;
    font-size: 10px;
    line-height: 24px;

    letter-spacing: 0.38px;

    color: #636366;
  }
`;

const FunctionWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
`;
