import styled from "styled-components";
import { useLocation, useNavigate } from "react-router-dom";
import StyledInput from "../../components/common/StyledInput.tsx";
import SquareButton from "../../components/common/SquareButton.tsx";
import { useEffect, useState } from "react";
import {
  deleteMembers,
  getMemberImage,
  getMemberInfo,
  putMember,
  putUserImage,
} from "../../apis/members.ts";
import useUserStore from "../../stores/useUserStore.ts";
import TitleContentArea from "../../components/common/TitleContentArea.tsx";
import ToggleGroup from "../../components/roommate/checklist/ToggleGroup.tsx";
import SelectableChipGroup from "../../components/roommate/checklist/SelectableChipGroup.tsx";
import Header from "../../components/common/Header.tsx";
import { colleges, dormitory } from "../../constants/constants.ts";
import RoundSquareBlueButton from "../../components/button/RoundSquareBlueButton.tsx";

const menuItems = [
  {
    label: "회원탈퇴",
    onClick: async () => {
      try {
        const confirmed = window.confirm(
          "정말 탈퇴하시겠어요? 탈퇴 후에는 모든 회원 정보를 되돌릴 수 없어요.",
        );
        if (!confirmed) return;

        const status = await deleteMembers();

        switch (status) {
          case 204:
            alert("회원 탈퇴에 성공했어요.");
            break;
          case 403:
            alert("인증되지 않은 사용자입니다. 다시 로그인해 주세요.");
            break;
          case 404:
            alert("사용자를 찾을 수 없습니다. 이미 탈퇴되었을 수 있어요.");
            break;
          default:
            alert("알 수 없는 오류가 발생했습니다.");
        }
      } catch (error) {
        console.error("회원 탈퇴 중 예외 발생:", error);
        alert("회원 탈퇴 중 네트워크 오류가 발생했습니다.");
      }
    },
  },
];

export default function MyInfoEditPage() {
  const { userInfo, setUserInfo } = useUserStore();
  console.log(userInfo);

  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const isFirstVisit = queryParams.get("firstvisit") === "true";

  const navigate = useNavigate();
  const [studentNumber] = useState(userInfo.studentNumber);
  const [nickname, setNickname] = useState(userInfo.name);
  const [selectedDomitoryIndex, setSelectedDomitoryIndex] = useState<
    number | null
  >(null);
  const [selectedCollegeIndex, setSelectedCollegeIndex] = useState<
    number | null
  >(null);

  function findIndex(datas: string[], findStr: string): number {
    return datas.findIndex((data) => findStr.includes(data));
  }

  useEffect(() => {
    setSelectedCollegeIndex(findIndex(colleges, userInfo.college));
    setSelectedDomitoryIndex(findIndex(dormitory, userInfo.dormType));
  }, []);

  const isFilled = () => {
    return typeof nickname === "string" && nickname.trim() !== "";
  };

  const handleSubmit = async () => {
    try {
      if (
        !nickname ||
        selectedCollegeIndex == null ||
        selectedDomitoryIndex == null
      ) {
        alert("모든 값을 입력해주세요!");
        return;
      }

      if (nickname.length < 2 || nickname.length > 10) {
        alert("닉네임은 2자 이상 10자 이하로 입력해주세요!");
        return;
      }

      const response = await putMember(
        nickname,
        colleges[selectedCollegeIndex],
        dormitory[selectedDomitoryIndex],
        0,
      );
      console.log(response);

      if (response.status === 200) {
        if (isFirstVisit) {
          alert(
            "회원정보 저장을 성공하였습니다.\nUNI Dorm에 오신 것을 환영합니다!",
          );
        } else {
          alert("회원정보 수정을 성공하였습니다.");
        }
        try {
          const response = await getMemberInfo();
          console.log(response);
          setUserInfo(response.data);
        } catch (error) {
          console.error("회원 가져오기 실패", error);
        }
        navigate("/mypage");
      } else {
        alert("회원정보 수정 중 오류가 발생하였습니다.");
      }
    } catch (error) {
      alert("회원정보 수정 중 오류가 발생하였습니다.");
      console.error(error);
    }
  };

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    const getUserProfileImg = async () => {
      const result = await getMemberImage();
      console.log(result.data);
      setPreviewUrl(result.data.fileName);
    };

    getUserProfileImg();
    // setUserProfileImg(result.data)
  }, [userInfo]);

  // 이미지 선택 핸들러
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 1. 허용된 이미지 형식
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!allowedTypes.includes(file.type)) {
      alert("이미지 파일(jpeg, png, webp, gif)만 업로드 가능합니다.");
      return;
    }

    // 2. 3MB 이하 용량 제한
    const maxSizeInBytes = 2 * 1024 * 1024; // 3MB
    if (file.size > maxSizeInBytes) {
      alert("파일 크기는 2MB 이하만 업로드 가능합니다.");
      return;
    }

    // 3. 상태 업데이트
    setImageFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleUploadImage = async () => {
    if (!imageFile) return;

    try {
      const response = await putUserImage(imageFile);
      if (response.status === 200) {
        alert("프로필 이미지가 변경되었습니다.");
      } else {
        alert("이미지 업로드에 실패했습니다.");
      }
    } catch (error) {
      alert("이미지 업로드 중 오류가 발생했습니다.");
      console.error(error);
    }
  };

  return (
    <MyInfoEditPageWrapper>
      <Header
        title={isFirstVisit ? "회원정보 입력" : "회원정보 수정"}
        hasBack={!isFirstVisit}
        showAlarm={false}
        menuItems={!isFirstVisit ? menuItems : undefined}
      />

      <ContentWrapper>
        {/* 프로필 이미지 업로드 */}
        {!isFirstVisit && (
          <TitleContentArea
            title={"프로필 사진"}
            description={
              "프로필 이미지 변경을 원하시는 경우에만 이미지 선택 후 변경하기 버튼을 눌러주세요."
            }
            children={
              <ImageUploadContainer>
                <ImageSelectRow>
                  <ProfileImageWrapper>
                    {previewUrl ? (
                      <ProfileImage src={previewUrl} alt="프로필 미리보기" />
                    ) : (
                      <DefaultProfileImage />
                    )}
                  </ProfileImageWrapper>

                  <FileInputLabel htmlFor="profileImageInput">
                    이미지 선택
                  </FileInputLabel>
                  <HiddenFileInput
                    id="profileImageInput"
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                  />
                </ImageSelectRow>

                {imageFile && (
                  <UploadButtonWrapper>
                    <RoundSquareBlueButton
                      btnName="이미지 변경하기"
                      onClick={handleUploadImage}
                    />
                  </UploadButtonWrapper>
                )}
              </ImageUploadContainer>
            }
          />
        )}
        {isFirstVisit && (
          <TitleContentArea
            title={""}
            description={
              "서비스 이용에 반드시 필요한 정보입니다! " +
              "이 페이지를 나가지 마시고 아래 정보를 꼭 입력해주세요."
            }
            children={<></>}
          />
        )}

        <TitleContentArea
          title={"학번 정보"}
          children={
            <StyledInput
              placeholder="학번이 표시되는 자리입니다."
              value={studentNumber}
              disabled={true}
            />
          }
        />

        <TitleContentArea
          title={"닉네임"}
          description={
            "닉네임이 중복되는 경우 로그아웃이 될 수 있습니다! 재로그인 후 다른 닉네임을 사용해주세요. 조속한 시일 내에 수정하겠습니다."
          }
          children={
            <StyledInput
              placeholder="닉네임은 2자~8자 이내로 입력해주세요."
              value={nickname}
              onChange={(e) => {
                setNickname(e.target.value);
              }}
            />
          }
        />

        <TitleContentArea
          title={"기숙사 종류"}
          children={
            <ToggleGroup
              Groups={dormitory}
              selectedIndex={selectedDomitoryIndex}
              onSelect={setSelectedDomitoryIndex}
            />
          }
        />
        <TitleContentArea
          title={"단과대"}
          children={
            <SelectableChipGroup
              Groups={colleges}
              selectedIndex={selectedCollegeIndex}
              onSelect={setSelectedCollegeIndex}
            />
          }
        />
      </ContentWrapper>

      <ButtonWrapper>
        <SquareButton
          text={isFirstVisit ? "저장하기" : "수정하기"}
          disabled={!isFilled()}
          onClick={handleSubmit}
        />
      </ButtonWrapper>
    </MyInfoEditPageWrapper>
  );
}
const MyInfoEditPageWrapper = styled.div`
  padding: 16px;
  padding-top: 90px;
  padding-bottom: 150px;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;

  //width: 100%;
  //height: 100%;
  //justify-content: space-between;

  background: #fafafa;
`;

const ContentWrapper = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 30px;

  //padding-bottom: 50px;
  //margin-bottom: 200px;

  //box-sizing: border-box;
`;

const ButtonWrapper = styled.div`
  width: 100%;
  height: fit-content;
  position: fixed;

  padding: 12px 16px;
  box-sizing: border-box;

  bottom: 0;
  left: 0;
`;

const ProfileImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const DefaultProfileImage = styled.div`
  width: 100%;
  height: 100%;
  background: #bbb;
`;

const HiddenFileInput = styled.input`
  display: none;
`;

const ImageUploadContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const ImageSelectRow = styled.div`
  display: flex;
  align-items: center;
  gap: 20px;
`;

const ProfileImageWrapper = styled.div`
  width: 80px;
  height: 80px;
  border-radius: 50%;
  overflow: hidden;
  background: #ddd;
  border: 2px solid #ccc;
  flex-shrink: 0;
`;

const FileInputLabel = styled.label`
  cursor: pointer;
  padding: 10px 24px;
  background-color: #4a90e2;
  color: white;
  border-radius: 6px;
  font-weight: 600;
  user-select: none;
  transition: background-color 0.3s ease;
  white-space: nowrap;

  &:hover {
    background-color: #357abd;
  }
`;

const UploadButtonWrapper = styled.div`
  width: 100%;
`;
