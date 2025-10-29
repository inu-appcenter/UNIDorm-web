import styled from "styled-components";
import { AiOutlineClockCircle } from "react-icons/ai";
import { useNavigate } from "react-router-dom";
import TagIconBlueBackground from "../common/TagIconBlueBackground.tsx";
import { formatTimeAgo } from "../../utils/dateUtils.ts";

interface HomeCardProps {
  id: number;
  title: string;
  content: string;
  isEmergency: boolean;
  createdDate: string;
}

const HomeNoticeCard = ({
  id,
  title,
  content,
  isEmergency,
  createdDate,
}: HomeCardProps) => {
  const navigate = useNavigate();
  return (
    <HomeCardWrapper
      onClick={() => {
        navigate("/announcements/" + id);
      }}
    >
      <div className="emergency">
        {isEmergency && <TagIconBlueBackground tagTitle={"긴급"} />}
      </div>

      <FirstLine>
        <div className="title">{title}</div>
      </FirstLine>
      <SecondLine>{content}</SecondLine>
      <LastLine>
        <AiOutlineClockCircle style={{ marginRight: "4px" }} />
        {formatTimeAgo(createdDate)}
      </LastLine>
    </HomeCardWrapper>
  );
};

export default HomeNoticeCard;

const HomeCardWrapper = styled.div`
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: flex-start;
  padding: 8px 16px;
  gap: 5px;

  width: 45vw;
  max-width: 170px;
  height: 150px;

  flex-shrink: 0; /* width가 줄지 않도록 고정 */

  border-radius: 16px;
  background: #fff;
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.1);

  cursor: pointer;
`;

const FirstLine = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  width: 100%;
  height: fit-content;

  align-items: center;

  .title {
    font-style: normal;
    font-weight: 600;
    font-size: 14px;
    line-height: 24px;
    display: -webkit-box;
    -webkit-line-clamp: 2; /* 최대 두 줄 */
    -webkit-box-orient: vertical;
    overflow: hidden;
    text-overflow: ellipsis;
    letter-spacing: 0.38px;

    color: #1c1c1e;
  }
`;

const SecondLine = styled.div`
  display: -webkit-box;
  -webkit-line-clamp: 2; /* 최대 두 줄 */
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;

  width: 100%;
  height: fit-content;
  font-style: normal;
  font-weight: 400;
  font-size: 12px;
  line-height: 24px;
  letter-spacing: 0.38px;

  color: #1c1c1e;
`;

const LastLine = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: start;
  width: 100%;
  height: fit-content;

  font-style: normal;
  font-weight: 400;
  font-size: 12px;
  line-height: 24px;
  /* 상자 높이와 동일 또는 200% */
  letter-spacing: 0.38px;

  color: #1c1c1e;
`;
