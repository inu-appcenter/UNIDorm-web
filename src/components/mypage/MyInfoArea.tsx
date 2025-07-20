import styled from "styled-components";
import useUserStore from "../../stores/useUserStore.ts";
import { useEffect, useState } from "react";
import { getMemberImage } from "../../apis/members.ts";

const MyInfoArea = () => {
  const userInfo = useUserStore((state) => state.userInfo);
  const [userProfileImg, setUserProfileImg] = useState<string>("");

  useEffect(() => {
    const getUserProfileImg = async () => {
      const result = await getMemberImage();
      console.log(result.data.fileName);
      setUserProfileImg(result.data.fileName);
    };

    getUserProfileImg();
    // setUserProfileImg(result.data)
  }, []);

  return (
    <MyInfoAreaWrapper>
      <LeftArea>
        <img className="profile" src={userProfileImg} alt="프로필 이미지" />
        <div className="description">
          <div className="name">{userInfo.name || "이름 정보 없음"}</div>
          <div className="college">
            {userInfo.college || "단과대 정보 없음"}
          </div>
        </div>
      </LeftArea>
      <Penalty>벌점 {userInfo.penalty ?? 0}점</Penalty>
    </MyInfoAreaWrapper>
  );
};

export default MyInfoArea;

const MyInfoAreaWrapper = styled.div`
  width: 100%;
  height: fit-content;

  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;

  .profile {
    border-radius: 100%;
    overflow: hidden;
    height: 70px;
    width: 70px;
    object-fit: cover;
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

const Penalty = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  padding: 8px 16px;
  gap: 5px;

  min-width: fit-content;
  height: fit-content;

  background: #0a84ff;
  border-radius: 23px;

  font-style: normal;
  font-weight: 500;
  font-size: 16px;
  line-height: 24px;

  letter-spacing: 0.38px;

  color: #f4f4f4;
`;
