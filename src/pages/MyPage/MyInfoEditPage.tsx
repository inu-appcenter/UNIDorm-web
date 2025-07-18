import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import StyledInput from "../../components/common/StyledInput.tsx";
import SquareButton from "../../components/common/SquareButton.tsx";
import { useState } from "react";
import { putMember } from "../../apis/members.ts";
import useUserStore from "../../stores/useUserStore.ts";
import TitleContentArea from "../../components/common/TitleContentArea.tsx";
import ToggleGroup from "../../components/roommate/checklist/ToggleGroup.tsx";
import SelectableChipGroup from "../../components/roommate/checklist/SelectableChipGroup.tsx";
import Header from "../../components/common/Header.tsx";

export default function MyInfoEditPage() {
  const { userInfo } = useUserStore();
  console.log(userInfo);

  const navigate = useNavigate();
  const [name, setName] = useState(userInfo.name);
  const [selectedDomitoryIndex, setSelectedDomitoryIndex] = useState<
    number | null
  >(null);
  const [selectedCollegeIndex, setSelectedCollegeIndex] = useState<
    number | null
  >(null);

  const colleges = [
    "사범대",
    "예체대",
    "공과대",
    "자연과학대",
    "법학부",
    "계약학",
    "사회과학대",
    "글로벌정경대",
    "경영대",
    "생명과학기술대",
    "융합자유전공대",
    "동북아국제통상물류학부",
    "도시과학대",
    "정보기술대",
    "인문대",
  ];

  const domitory = ["2기숙사", "3기숙사"];

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
        navigate("/mypage");
      } else {
        alert("회원정보 수정 중 오류가 발생하였습니다.");
      }
    } catch (error) {
      alert("회원정보 수정 중 오류가 발생하였습니다.");
      console.error(error);
    }
  };

  return (
    <LoginPageWrapper>
      <Header title={"회원정보 수정"} hasBack={true} showAlarm={false} />
      <ContentWrapper>
        <TitleContentArea
          type={"닉네임"}
          children={
            <StyledInput
              placeholder="아이디를 입력하세요."
              value={name}
              onChange={(e) => {
                setName(e.target.value);
              }}
            />
          }
        />

        <TitleContentArea
          type={"기숙사 종류"}
          children={
            <ToggleGroup
              Groups={domitory}
              selectedIndex={selectedDomitoryIndex}
              onSelect={setSelectedDomitoryIndex}
            />
          }
        />
        <TitleContentArea
          type={"단과대"}
          children={
            <SelectableChipGroup
              Groups={colleges}
              selectedIndex={selectedCollegeIndex}
              onSelect={setSelectedCollegeIndex}
            />
          }
        />
      </ContentWrapper>

      <SquareButton
        text="수정하기"
        disabled={!isFilled()}
        onClick={handleSubmit}
      />
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
`;
