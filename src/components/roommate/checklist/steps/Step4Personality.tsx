import styled from "styled-components";
import TitleContentArea from "../../../common/TitleContentArea";
import ToggleGroup from "../ToggleGroup";
import StyledTextInput from "../../StyledTextInput";
import StyledTextArea from "../../StyledTextArea";
import { mbti1, mbti2, mbti3, mbti4 } from "../../../../constants/constants";
import { StepProps } from "../../../../types/roommates";

interface Step4Props extends StepProps {
  randomTitles: string[];
}

export default function Step4Personality({
  data,
  onChange,
  randomTitles,
}: Step4Props) {
  const handleMbtiChange = (index: number, val: number | null) => {
    const newMbti = [...data.mbti];
    newMbti[index] = val;
    onChange("mbti", newMbti);
  };

  return (
    <>
      <TitleContentArea title={"MBTI"}>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "8px",
            width: "100%",
          }}
        >
          <ToggleGroup
            Groups={mbti1}
            selectedIndex={data.mbti[0]}
            onSelect={(val) => handleMbtiChange(0, val)}
          />
          <ToggleGroup
            Groups={mbti2}
            selectedIndex={data.mbti[1]}
            onSelect={(val) => handleMbtiChange(1, val)}
          />
          <ToggleGroup
            Groups={mbti3}
            selectedIndex={data.mbti[2]}
            onSelect={(val) => handleMbtiChange(2, val)}
          />
          <ToggleGroup
            Groups={mbti4}
            selectedIndex={data.mbti[3]}
            onSelect={(val) => handleMbtiChange(3, val)}
          />
        </div>
      </TitleContentArea>
      <TitleContentArea
        title={"제목"}
        description={"룸메이트 게시글의 제목을 입력해주세요."}
      >
        <StyledTextInput
          value={data.title}
          onChange={(e) => onChange("title", e.target.value)}
          placeholder={"제목을 입력하세요"}
        />
        {!data.title && (
          <SortFilterWrapper>
            {randomTitles.map((option) => (
              <SortButton
                key={option}
                onClick={() => onChange("title", option)}
              >
                {option}
              </SortButton>
            ))}
          </SortFilterWrapper>
        )}
      </TitleContentArea>
      <TitleContentArea title={"하고 싶은 말"}>
        <StyledTextArea
          value={data.comment}
          onChange={(e) => onChange("comment", e.target.value)}
          placeholder={"추가로 자신을 어필해보세요!"}
        />
      </TitleContentArea>
    </>
  );
}

const SortFilterWrapper = styled.div`
  display: flex;
  overflow-x: scroll;
  gap: 8px;
  margin-top: 8px;
  padding-bottom: 4px;
  width: 100%;
  &::-webkit-scrollbar {
    display: none;
  }
`;

const SortButton = styled.button`
  background-color: #f4f4f4;
  border: none;
  border-radius: 999px;
  padding: 6px 12px;
  font-size: 13px;
  color: #333;
  white-space: nowrap;
  cursor: pointer;
`;
