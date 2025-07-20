import styled from "styled-components";
import { useEffect, useState } from "react";
import { getMyRoommateInfo } from "../../apis/roommate.ts";
import { MyRoommateInfoResponse } from "../../types/roommates.ts";

const RoomMateInfoArea = () => {
  const [roommateInfo, setRoommateInfo] =
    useState<MyRoommateInfoResponse | null>(null);

  useEffect(() => {
    const fetchRoommateInfo = async () => {
      try {
        const res = await getMyRoommateInfo();
        setRoommateInfo(res.data);
        console.log(res.data);
      } catch (err) {
        alert("룸메이트 정보를 불러오는 데 실패했습니다." + err);
      }
    };

    fetchRoommateInfo();
  }, []);

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
