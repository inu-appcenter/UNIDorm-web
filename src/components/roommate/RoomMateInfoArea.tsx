import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import { MyRoommateInfoResponse } from "../../types/roommates.ts";

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
        등록된 내 룸메이트가 없어요! 😢 <br />
        룸메이트 탭에서 룸메이트를 찾아보세요.
        <div className="button-group">
          <button onClick={() => navigate("/roommatechecklist")}>
            지금 바로 룸메이트 찾으러 가기 →
          </button>
        </div>
        <br />
        이미 같이 하기로 한 룸메이트가 있다면?
        <div className="button-group">
          <button onClick={() => navigate("/roommateadd")}>
            룸메이트 등록하러 가기 →
          </button>
        </div>
      </ChecklistBanner>
    );
  }

  if (!roommateInfo) {
    return <div>룸메이트 정보를 불러오는 중입니다...</div>;
  }

  return (
    <RoomMateInfoAreaWrapperr>
      <LeftArea>
        <div className="profile">
          <img src={roommateInfo.imagePath} alt="profile image" />
        </div>
        <div className="description">
          <div className="name">{roommateInfo.name}</div>
          <div className="college">{roommateInfo.college}</div>
        </div>
      </LeftArea>
    </RoomMateInfoAreaWrapperr>
  );
};

export default RoomMateInfoArea;

const RoomMateInfoAreaWrapperr = styled.div`
  width: 100%;
  height: fit-content;

  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;

  .profile {
    max-width: 70px;
    max-height: 70px;
    border-radius: 50%;
    overflow: hidden;
    display: inline-block;
  }

  .profile img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }
`;

const LeftArea = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: center;
  min-width: fit-content;
  height: fit-content;
  gap: 8px;

  .description {
    display: flex;
    flex-direction: column;
    width: 100%;
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

    .date {
      font-weight: 400;
    }
  }
`;

const ChecklistBanner = styled.div`
  background-color: #fff3cd;
  color: #856404;
  padding: 16px;
  border-radius: 12px;
  border: 1px solid #ffeeba;
  font-size: 14px;
  line-height: 1.5;
  cursor: pointer;

  strong {
    display: block;
    margin-top: 6px;
    font-weight: 600;
    color: #8a6d3b;
  }

  button {
    margin-top: 8px;
    margin-bottom: 8px;
    padding: 8px 12px;
    background-color: #0a84ff;
    color: white;
    border: 1.5px solid #076fd6;
    border-radius: 6px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition:
      background-color 0.3s ease,
      border-color 0.3s ease;

    &:hover {
      background-color: #3399ff;
      border-color: #2a85e0;
    }

    &:active {
      background-color: #076fd6;
      border-color: #0557a1;
    }
  }

  /* 버튼들을 감싸는 div를 추가했을 때 */
  > div.button-group {
    display: flex;
    justify-content: flex-end;
    gap: 12px;
  }
`;
