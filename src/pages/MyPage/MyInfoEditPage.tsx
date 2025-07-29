import styled from "styled-components";
import { useLocation, useNavigate } from "react-router-dom";
import StyledInput from "../../components/common/StyledInput.tsx";
import SquareButton from "../../components/common/SquareButton.tsx";
import { useEffect, useState } from "react";
import { getMemberInfo, putMember } from "../../apis/members.ts";
import useUserStore from "../../stores/useUserStore.ts";
import TitleContentArea from "../../components/common/TitleContentArea.tsx";
import ToggleGroup from "../../components/roommate/checklist/ToggleGroup.tsx";
import SelectableChipGroup from "../../components/roommate/checklist/SelectableChipGroup.tsx";
import Header from "../../components/common/Header.tsx";
import { colleges, domitory } from "../../constants/constants.ts";

export default function MyInfoEditPage() {
  const { userInfo, setUserInfo } = useUserStore();
  console.log(userInfo);

  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const isFirstVisit = queryParams.get("firstvisit") === "true";

  const navigate = useNavigate();
  const [studentNumber] = useState(userInfo.studentNumber);
  const [name, setName] = useState(userInfo.name);
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
    setSelectedDomitoryIndex(findIndex(domitory, userInfo.dormType));
  }, []);

  const isFilled = () => {
    return typeof name === "string" && name.trim() !== "";
  };

  const handleSubmit = async () => {
    try {
      if (
        !name ||
        selectedCollegeIndex == null ||
        selectedDomitoryIndex == null
      ) {
        alert("모든 값을 입력해주세요!");
        return;
      }

      const response = await putMember(
        name,
        colleges[selectedCollegeIndex] + "학",
        domitory[selectedDomitoryIndex],
        0,
      );
      console.log(response);

      if (response.status === 200) {
        alert("회원정보 수정을 성공하였습니다.");
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

  // const [imageFile, setImageFile] = useState<File | null>(null);
  // const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  //
  // // 이미지 선택 핸들러
  // const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  //   const file = e.target.files?.[0];
  //   if (file) {
  //     setImageFile(file);
  //     setPreviewUrl(URL.createObjectURL(file));
  //   }
  // };

  // const handleUploadImage = async () => {
  //   if (!imageFile) return;
  //
  //   try {
  //     const response = await putUserImage(imageFile);
  //     if (response.status === 200) {
  //       alert("프로필 이미지가 변경되었습니다.");
  //     } else {
  //       alert("이미지 업로드에 실패했습니다.");
  //     }
  //   } catch (error) {
  //     alert("이미지 업로드 중 오류가 발생했습니다.");
  //     console.error(error);
  //   }
  // };

  return (
    <LoginPageWrapper>
      <Header
        title={"회원정보 수정"}
        hasBack={!isFirstVisit}
        showAlarm={false}
      />
      <ContentWrapper>
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
          children={
            <StyledInput
              placeholder="닉네임을 입력하세요."
              value={name}
              onChange={(e) => {
                setName(e.target.value);
              }}
            />
          }
        />

        {/*/!* 프로필 이미지 업로드 *!/*/}
        {/*<TitleContentArea*/}
        {/*  type="프로필 사진"*/}
        {/*  children={*/}
        {/*    <div>*/}
        {/*      {previewUrl ? (*/}
        {/*        <img*/}
        {/*          src={previewUrl}*/}
        {/*          alt="미리보기"*/}
        {/*          style={{*/}
        {/*            width: "100px",*/}
        {/*            height: "100px",*/}
        {/*            objectFit: "cover",*/}
        {/*            borderRadius: "50%",*/}
        {/*          }}*/}
        {/*        />*/}
        {/*      ) : (*/}
        {/*        <div*/}
        {/*          style={{*/}
        {/*            width: "100px",*/}
        {/*            height: "100px",*/}
        {/*            background: "#ddd",*/}
        {/*            borderRadius: "50%",*/}
        {/*          }}*/}
        {/*        />*/}
        {/*      )}*/}
        {/*      <input*/}
        {/*        type="file"*/}
        {/*        accept="image/*"*/}
        {/*        onChange={handleImageChange}*/}
        {/*      />*/}
        {/*    </div>*/}
        {/*  }*/}
        {/*/>*/}

        <TitleContentArea
          title={"기숙사 종류"}
          children={
            <ToggleGroup
              Groups={domitory}
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
          text="수정하기"
          disabled={!isFilled()}
          onClick={handleSubmit}
        />
      </ButtonWrapper>
    </LoginPageWrapper>
  );
}
const LoginPageWrapper = styled.div`
  padding: 20px;
  padding-top: 90px;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;

  width: 100vw;
  height: 100vh;
  overflow-y: auto;
  justify-content: space-between;

  background: #fafafa;
`;

const ContentWrapper = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 30px;

  padding-bottom: 200px;
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
