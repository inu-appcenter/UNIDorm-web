import HeartIcon from "../../assets/heart.svg";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import { RoomMateCardProps } from "@/types/roommates";
import 매칭완료 from "../../assets/roommate/매칭완료2.svg";
import { mixpanelTrack } from "@/utils/mixpanel";

const RoomMateCard = ({
  boardId,
  title,
  dormType,
  mbti,
  college,
  isSmoker,
  isClean,
  stayDays,
  description,
  roommateBoardLike,
  percentage,
  matched,
  location,
}: RoomMateCardProps) => {
  const navigate = useNavigate();

  return (
    <CardWrapper
      onClick={() => {
        if (!matched) {
          mixpanelTrack.itemClicked(
            "룸메이트",
            boardId,
            title,
            location || "룸메이트목록",
          );
          navigate(`/roommate/list/${boardId}`);
        }
      }}
      matched={matched}
    >
      {matched && <DisabledOverlay />}
      {percentage !== undefined && (
        <LeftCircle percentage={percentage}>
          <span>{percentage}%</span>
        </LeftCircle>
      )}
      <TopRightBadge dormType={dormType}>{dormType}</TopRightBadge>
      {matched && <RightBottomBadge src={매칭완료} />}

      <ContentContainer>
        <span className="title">{title}</span>
        <Description>{description || "\u00a0"}</Description>
        <TagRow>
          <Tag category="mbti">{mbti}</Tag>
          <Tag category="college">{college}</Tag>
          <Tag category="smoker">{isSmoker ? "흡연⭕" : "흡연❌"}</Tag>
          <Tag category="clean">{isClean ? "🧼깔끔" : "정돈보통"}</Tag>
        </TagRow>
        <StayInfo>상주 요일: {stayDays.join(", ")}</StayInfo>
        <BottomLine>
          <img src={HeartIcon} alt="좋아요 아이콘" />
          <span>{roommateBoardLike}</span>
        </BottomLine>
      </ContentContainer>
    </CardWrapper>
  );
};

export default RoomMateCard;

const CardWrapper = styled.div.withConfig({
  shouldForwardProp: (prop) => prop !== "matched",
})<{ matched?: boolean }>`
  position: relative;
  display: flex;
  flex-direction: row;
  align-items: stretch;
  gap: 12px;
  padding: 16px;
  border: none;
  width: 100%;
  height: 176px;
  cursor: ${({ matched }) => (matched ? "not-allowed" : "pointer")};
  box-sizing: border-box;
  overflow: hidden;

  border-radius: 8px;
  background: var(--Gray-Gray0, #fff);
  box-shadow: 0 0 4px 0 rgba(0, 0, 0, 0.1);

  ${({ matched }) =>
    matched &&
    `
    pointer-events: none;
  `}
`;
const DisabledOverlay = styled.div`
  position: absolute;
  inset: 0;
  background-color: rgba(255, 255, 255, 0.6); /* 흐림 효과 */
  z-index: 1;
`;

// TopRightBadge (기숙사 타입)
const TopRightBadge = styled.div.withConfig({
  shouldForwardProp: (prop) => prop !== "dormType",
})<{ dormType: string }>`
  position: absolute;
  top: 12px;
  right: 12px;
  padding: 4px 8px;
  border-radius: 12px;
  z-index: 0;
  text-align: center;

  font-family: Pretendard;
  font-size: 12px;
  font-style: normal;
  font-weight: 400;
  line-height: 150%; /* 18px */

  ${({ dormType }) => {
    switch (dormType) {
      case "1기숙사":
        return `
          border: 1px solid #8e8e93;
          color: #8e8e93;
        `;
      case "2기숙사":
        return `
          border: 1px solid var(--Main-Main1, #1677FF);
          color: var(--Main-Main2, #0958D9);
        `;
      case "3기숙사":
        return `
          border: 1px solid #ff6b6b;
          color: #ff6b6b;
        `;
      default:
        return `
          border: 1px solid var(--Main-Main1, #1677FF);
          color: var(--Main-Main2, #0958D9);
        `;
    }
  }}
`;

const RightBottomBadge = styled.img.attrs({
  className: "matched-stamp",
})`
  position: absolute;
  top: 25%;
  right: 12px;
  width: 80px;
  height: 80px;
  z-index: 2;
  pointer-events: none;
  opacity: 1;
  //transform: rotate(25deg);
`;

const LeftCircle = styled.div.withConfig({
  shouldForwardProp: (prop) => prop !== "percentage",
})<{ percentage: number }>`
  width: 48px;
  height: 48px;
  min-width: 48px;
  min-height: 48px;
  border-radius: 50%;
  background: conic-gradient(
    #0a84ff ${({ percentage }) => percentage * 3.6}deg,
    #e0e0e0 0deg
  );
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  color: #0a84ff;
  font-size: 14px;
  position: relative;
  font-weight: 700;

  /* 원 안쪽에 하얀색 작은 원을 만들어서 비율 텍스트가 돋보이게 함 */
  &::before {
    content: "";
    position: absolute;
    width: 36px;
    height: 36px;
    background: #fff;
    border-radius: 50%;
    top: 6px;
    left: 6px;
    z-index: 1;
  }

  /* percentage 텍스트가 위에 표시되도록 */
  span {
    position: relative;
    z-index: 2;
  }
`;

const ContentContainer = styled.div`
  display: flex;
  flex-direction: column;
  min-width: 0;
  width: 100%;
  height: 100%;
  gap: 6px;

  .title {
    display: block;
    padding-right: 72px;
    font-style: normal;
    font-weight: 700;
    font-size: 16px;
    line-height: 24px;
    letter-spacing: 0.38px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;

    color: #1c1c1e;
  }
`;

const TagRow = styled.div`
  display: flex;
  flex-wrap: nowrap;
  gap: 6px;
  min-height: 26px;
  overflow: hidden;
`;

const Tag = styled.div.withConfig({
  shouldForwardProp: (prop) => prop !== "category",
})<{ category: string }>`
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 0;

  padding: 4px 8px;
  border-radius: 12px;

  color: var(--Gray-Gray800, #3d3d3d);
  text-align: center;
  font-size: 12px;
  font-style: normal;
  font-weight: 400;
  line-height: 150%; /* 18px */
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;

  background: ${({ category }) => {
    switch (category) {
      case "mbti":
        return "#E1F7EE";
      case "college":
        return "#FFEDF3";
      case "smoker":
        return "#E6F0FE";
      case "clean":
        return "var(--Gray-Gray100, #EFEFEF)";
      default:
        return "#f1f1f1";
    }
  }};
`;

const StayInfo = styled.div`
  font-size: 12px;
  color: #3a3a3c;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const Description = styled.div`
  font-size: 13px;
  line-height: 20px;
  min-height: 20px;
  color: #1c1c1e;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const BottomLine = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  margin-top: auto;
  font-size: 12px;
  color: #1c1c1e;

  img {
    width: 18px;
    height: 18px;
    display: block;
  }

  span {
    display: inline-flex;
    align-items: center;
    line-height: 1;
  }
`;
