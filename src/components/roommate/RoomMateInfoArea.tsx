import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import { MyRoommateInfoResponse } from "@/types/roommates";
import default_profile_img from "../../assets/profileimg.png";
import { MdKeyboardArrowRight } from "react-icons/md";

interface RoomMateInfoAreaProps {
  roommateInfo: MyRoommateInfoResponse | null;
  notFound: boolean;
}

const RoomMateInfoArea = ({
  roommateInfo,
  notFound,
}: RoomMateInfoAreaProps) => {
  const navigate = useNavigate();

  if (notFound) {
    return (
      <ChecklistBanner>
        {/* 상단 섹션 */}
        <BannerSection>
          <TextGroup>
            <MainText>현재 등록된 맞춤형 룸메이트가 없어요!</MainText>
            <SubText>지금 바로 나와 맞는 룸메이트를 찾아보세요!</SubText>
          </TextGroup>
          <ButtonGroup>
            <StyledButton onClick={() => navigate("/roommate")}>
              내게 꼭 맞는 룸메이트 찾으러 가기
            </StyledButton>
          </ButtonGroup>
        </BannerSection>

        <Divider />

        {/* 하단 섹션 */}
        <BannerSection>
          <TextGroup>
            <SubText>함께 하기로한 룸메이트가 있다면?</SubText>
          </TextGroup>
          <ButtonGroup>
            <StyledButton onClick={() => navigate("/roommate/add")}>
              학번으로 룸메이트 등록하러 가기
            </StyledButton>
          </ButtonGroup>
        </BannerSection>
      </ChecklistBanner>
    );
  }

  // if (!roommateInfo) {
  //   return <div>룸메이트 정보를 불러오는 중입니다...</div>;
  // }

  return (
    <RoomMateInfoAreaWrapper
      onClick={() => {
        if (location.pathname === "/mypage") {
          navigate("/roommate/my");
        }
      }}
    >
      <LeftArea>
        <div className="profile">
          <img
            src={roommateInfo?.imagePath || default_profile_img}
            alt="profile image"
          />
        </div>
        <div className="description">
          <div className="name">{roommateInfo?.name || "닉네임"}</div>
          <div className="college">{roommateInfo?.college || "단과대명"}</div>
        </div>
      </LeftArea>
      {location.pathname === "/mypage" && (
        <Penalty>
          <MdKeyboardArrowRight />
        </Penalty>
      )}
    </RoomMateInfoAreaWrapper>
  );
};

export default RoomMateInfoArea;

const RoomMateInfoAreaWrapper = styled.div`
  width: 100%;
  height: fit-content;

  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;

  .profile {
    width: 70px;
    height: 70px;
    border-radius: 50%;
    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    background-color: #f0f0f0;
  }

  .profile img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    aspect-ratio: 1 / 1;
    display: block;
  }
`;

const LeftArea = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: center;
  max-width: 100%;
  height: fit-content;
  gap: 8px;

  .description {
    display: flex;
    flex-direction: column;
    width: 100%;
    overflow-x: hidden;
    font-style: normal;
    font-size: 16px;
    line-height: 24px;
    align-items: start;
    justify-content: center;
    letter-spacing: 0.38px;

    color: #1c1c1e;

    .name {
      font-weight: 700;
    }

    .createdDate {
      font-weight: 400;
    }
  }
`;

const ChecklistBanner = styled.div`
  margin: 0 16px;
  border-radius: 12px;
  border: 0 solid #e5e7eb;
  background: linear-gradient(
    90deg,
    rgba(99, 102, 241, 0.1) 0%,
    rgba(139, 92, 246, 0.1) 100%
  );
  padding: 16px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: 16px;
  width: 100%;
`;

// 섹션 단위
const BannerSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

// 텍스트 그룹
const TextGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

// 메인 문구
const MainText = styled.div`
  color: #111827;
  font-family: Pretendard, sans-serif;
  font-size: 16px;
  font-weight: 400;
  line-height: normal;
`;

// 작은 문구
const SubText = styled.div`
  color: #4b5563;
  font-family: Pretendard, sans-serif;
  font-size: 12px;
  font-weight: 400;
  line-height: normal;
`;

// 버튼 정렬 컨테이너
const ButtonGroup = styled.div`
  display: flex;
  justify-content: flex-end;
`;

// 공통 버튼 스타일
const StyledButton = styled.button`
  cursor: pointer;
  border: none;
  border-radius: 8px;
  background: linear-gradient(90deg, #6366f1 0%, #8b5cf6 100%);
  padding: 8px 16px;

  // 버튼 글씨 스타일
  color: #fafafa;
  font-family: Inter, sans-serif;
  font-size: 14px;
  font-weight: 400;
  line-height: 20px;
  letter-spacing: -0.5px;
  transition: opacity 0.2s;

  &:hover {
    opacity: 0.9;
  }
`;

// 가로 구분선
const Divider = styled.hr`
  border: 0;
  border-top: 1px solid rgba(0, 0, 0, 0.05);
  margin: 4px 0;
`;

const Penalty = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;

  min-width: fit-content;
  height: fit-content;
  font-style: normal;
  font-weight: 600;
  font-size: 26px;
`;
