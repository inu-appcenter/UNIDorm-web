import styled from "styled-components";
import useUserStore from "../../stores/useUserStore.ts";
import { useEffect, useState } from "react";
import { getMemberImage } from "@/apis/members";
import profile from "../../assets/profileimg.png";

import { useNavigate } from "react-router-dom";
import { PATHS } from "@/constants/paths";

const MyInfoArea = () => {
  const navigate = useNavigate();
  const userInfo = useUserStore((state) => state.userInfo);
  const [userProfileImg, setUserProfileImg] = useState<string>("");

  useEffect(() => {
    const getUserProfileImg = async () => {
      const result = await getMemberImage();
      setUserProfileImg(result.data.imageUrl);
    };
    getUserProfileImg();
  }, [userInfo]);

  return (
    /* 영역 전체 클릭 이벤트 핸들러 */
    <MyInfoAreaWrapper onClick={() => navigate(PATHS.MYINFO_EDIT)}>
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
      {/* 우측 화살표 아이콘 등 추가 가능 공간 */}
      <ArrowIcon>〉</ArrowIcon>
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
  //padding: 16px 12px;
  //border-radius: 12px;
  box-sizing: border-box;

  /* 클릭 가능 스타일 */
  cursor: pointer;
  transition: background 0.2s ease-in-out;

  &:hover {
    background-color: #f9fafb;
  }

  &:active {
    background-color: #f3f4f6;
  }

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
  }
`;

const LeftArea = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: center;
  min-width: fit-content;
  height: fit-content;
  gap: 12px;

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

    .college {
      font-weight: 400;
      color: #6b7280;
      font-size: 14px;
    }
  }
`;

const ArrowIcon = styled.div`
  color: #9ca3af;
  font-size: 18px;
  font-weight: 300;
  margin-right: 4px;
`;
