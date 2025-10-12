import styled from "styled-components";
import useUserStore from "../../stores/useUserStore.ts";
import { useEffect, useState } from "react";
import { getMemberImage } from "../../apis/members.ts";
import profile from "../../assets/profileimg.png";

const MyInfoArea = () => {
  const userInfo = useUserStore((state) => state.userInfo);
  const [userProfileImg, setUserProfileImg] = useState<string>("");

  useEffect(() => {
    const getUserProfileImg = async () => {
      const result = await getMemberImage();
      console.log(result.data);
      setUserProfileImg(result.data.imageUrl);
    };

    getUserProfileImg();
    // setUserProfileImg(result.data)
  }, [userInfo]);

  return (
    <MyInfoAreaWrapper>
      <LeftArea>
        <div className="profile">
          <img
            src={userProfileImg || profile}
            alt="profile image"
            onError={(e) => {
              e.currentTarget.src = profile;
            }}
          />
        </div>
        <div className="description">
          <div className="name">{userInfo.name || "이름 정보 없음"}</div>
          <div className="college">
            {userInfo.college || "단과대 정보 없음"}
          </div>
        </div>
      </LeftArea>
      {/*<Penalty>벌점 {userInfo.penalty ?? 0}점</Penalty>*/}
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

    .createdDate {
      font-weight: 400;
    }
  }
`;
//
// const Penalty = styled.div`
//   display: flex;
//   flex-direction: row;
//   justify-content: center;
//   align-items: center;
//   padding: 8px 16px;
//   gap: 5px;
//
//   min-width: fit-content;
//   height: fit-content;
//
//   background: #0a84ff;
//   border-radius: 23px;
//
//   font-style: normal;
//   font-weight: 500;
//   font-size: 16px;
//   line-height: 24px;
//
//   letter-spacing: 0.38px;
//
//   color: #f4f4f4;
// `;
