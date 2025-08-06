import HeartIcon from "../../assets/heart.svg";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import { RoomMateCardProps } from "../../types/roommates.ts";
import 매칭완료 from "../../assets/roommate/매칭완료2.svg";

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
}: RoomMateCardProps) => {
  const navigate = useNavigate();

  return (
    <CardWrapper
      onClick={() => !matched && navigate(`/roommatelist/${boardId}`)}
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

      <ContentContainer isPercentageVisible={percentage !== undefined}>
        <span className="title">{title}</span>
        {description && <Description>{description}</Description>}
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
  align-items: center;
  gap: 12px;
  padding: 16px;
  background: #fff;
  border: 1px solid #dcdcdc;
  border-radius: 12px;
  width: 100%;
  cursor: ${({ matched }) => (matched ? "not-allowed" : "pointer")};
  box-sizing: border-box;
  overflow: hidden;

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

// TopRightBadge (기숙사 타입) 원래 위치 및 스타일 복원
const TopRightBadge = styled.div.withConfig({
  shouldForwardProp: (prop) => prop !== "dormType",
})<{ dormType: string }>`
  position: absolute;
  top: 12px;
  right: 12px;
  font-size: 12px;
  color: white;
  padding: 4px 8px;
  border-radius: 8px;
  font-weight: 600;
  z-index: 0;

  background: ${({ dormType }) => {
    switch (dormType) {
      case "1기숙사":
        return "#8e8e93"; // 회색 계열
      case "2기숙사":
        return "#0a84ff"; // 파랑
      case "3기숙사":
        return "#ff6b6b"; // 빨강
      default:
        return "#0a84ff"; // 기본값
    }
  }};
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

interface ContentContainerProps {
  isPercentageVisible: boolean;
}

const ContentContainer = styled.div.withConfig({
  shouldForwardProp: (prop) => prop !== "isPercentageVisible",
})<ContentContainerProps>`
  padding-top: ${({ isPercentageVisible }) =>
    isPercentageVisible ? "10px" : "0"};
  display: flex;
  flex-direction: column;
  width: 100%;
  gap: 6px;

  .title {
    font-style: normal;
    font-weight: 700;
    font-size: 16px;
    line-height: 24px;
    letter-spacing: 0.38px;

    color: #1c1c1e;
  }
`;

const TagRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  //margin-right: 60px;
`;

const Tag = styled.div.withConfig({
  shouldForwardProp: (prop) => prop !== "category",
})<{ category: string }>`
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  color: #1c1c1e;
  padding: 4px 8px;
  border-radius: 6px;
  font-weight: 500;
  background: ${({ category }) => {
    switch (category) {
      case "mbti":
        return "#E4F6ED";
      case "college":
        return "#FCEEF3";
      case "smoker":
        return "#E8F0FE";
      case "clean":
        return "#F3F4F6";
      default:
        return "#f1f1f1";
    }
  }};
`;

const StayInfo = styled.div`
  font-size: 12px;
  color: #3a3a3c;
`;

const Description = styled.div`
  font-size: 13px;
  color: #1c1c1e;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const BottomLine = styled.div`
  display: flex;
  align-items: center;
  font-size: 12px;
  color: #1c1c1e;

  img {
    width: 16px;
    height: 16px;
    margin-right: 4px;
  }

  span {
    margin-right: 8px;
  }
`;
