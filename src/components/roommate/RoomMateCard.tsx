import CommentIcon from "../../assets/comment.svg";
import HeartIcon from "../../assets/heart.svg";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";

interface RoomMateCardProps {
  boardId: number;
  dormType: string;
  mbti: string;
  college: string;
  isSmoker: boolean;
  isClean: boolean;
  stayDays: string[];
  description: string;
  commentCount: number;
  likeCount: number;
  percentage?: number;
}

const RoomMateCard = ({
  boardId,
  dormType,
  mbti,
  college,
  isSmoker,
  isClean,
  stayDays,
  description,
  commentCount,
  likeCount,
  percentage,
}: RoomMateCardProps) => {
  const navigate = useNavigate();

  return (
    <CardWrapper onClick={() => navigate(`/roommatelist/${boardId}`)}>
      {percentage !== undefined && (
        <LeftCircle percentage={percentage}>
          <span>{percentage}%</span>
        </LeftCircle>
      )}

      {/* dormType 배지를 원래 위치인 우측 상단에 독립적으로 배치 */}
      <TopRightBadge>{dormType}</TopRightBadge>

      <ContentContainer isPercentageVisible={percentage !== undefined}>
        {/* 태그들은 콘텐츠 영역 내에 배치 */}
        <TagRow>
          <Tag category="mbti">{mbti}</Tag>
          <Tag category="college">{college}</Tag>
          <Tag category="smoker">{isSmoker ? "흡연⭕" : "흡연❌"}</Tag>
          <Tag category="clean">{isClean ? "🧼깔끔" : "정돈보통"}</Tag>
        </TagRow>

        <StayInfo>상주 요일: {stayDays.join(", ")}</StayInfo>
        <Description>"{description}"</Description>

        <BottomLine>
          <img src={CommentIcon} alt="댓글 아이콘" />
          <span>{commentCount}</span>
          <img src={HeartIcon} alt="좋아요 아이콘" />
          <span>{likeCount}</span>
        </BottomLine>
      </ContentContainer>
    </CardWrapper>
  );
};

export default RoomMateCard;

const CardWrapper = styled.div`
  position: relative;
  display: flex;
  flex-direction: row; /* 좌측 원형과 콘텐츠를 가로로 배치 */
  align-items: center; /* 세로 중앙 정렬 */
  gap: 12px; /* 좌측 원형과 콘텐츠 사이 간격 */
  padding: 16px;
  background: #fff;
  border: 1px solid #dcdcdc;
  border-radius: 12px;
  width: 100%;
  cursor: pointer;
  box-sizing: border-box;
`;

// TopRightBadge (기숙사 타입) 원래 위치 및 스타일 복원
const TopRightBadge = styled.div`
  position: absolute; /* 절대 위치로 우측 상단에 고정 */
  top: 12px;
  right: 12px;
  font-size: 12px;
  background: #0a84ff;
  color: white;
  padding: 4px 8px;
  border-radius: 8px;
  font-weight: 600;
  z-index: 1; /* 다른 요소 위에 표시되도록 z-index 설정 */
`;

const LeftCircle = styled.div<{ percentage: number }>`
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

const ContentContainer = styled.div<ContentContainerProps>`
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  gap: 6px;
  /* TopRightBadge가 다시 absolute로 위치하므로, 콘텐츠 자체의 패딩은 영향을 덜 받음 */
  /* 필요하다면 TopRightBadge가 콘텐츠를 가리지 않도록 이 곳에 padding-top을 추가할 수 있습니다. */
  padding-top: 0; /* 기본값으로 설정 */
`;

const TagRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-right: 60px;
`;

interface TagProps {
  category: string;
}

const Tag = styled.div<TagProps>`
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
  color: #1c1c1e; /* Tag 텍스트 색상 기본값으로 유지 */
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
