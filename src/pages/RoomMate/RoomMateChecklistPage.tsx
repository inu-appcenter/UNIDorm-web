import styled from "styled-components";
import TitleContentArea from "../../components/common/TitleContentArea.tsx";
import SelectableChipGroup from "../../components/roommate/checklist/SelectableChipGroup.tsx";
import ToggleGroup from "../../components/roommate/checklist/ToggleGroup.tsx";

export default function RoomMateChecklistPage() {
  const days = ["월", "화", "수", "목", "금", "토", "일"];

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

  const mbti1 = ["E", "I"];
  const mbti2 = ["N", "S"];
  const mbti3 = ["F", "T"];
  const mbti4 = ["P", "J"];

  const smoking = ["피워요", "안피워요"]; //흡연
  const snoring = ["갈아요", "안갈아요"]; // 코골이
  const toothgrinding = ["갈아요", "안갈아요"]; //이갈이
  const isLightSleeper = ["밝아요", "어두워요", "몰라요"]; //잠귀
  const showertime = ["아침", "저녁", "둘다"]; //샤워 시기
  const showerDuration = ["10분 이내", "30분 이내", "1시간 이내"]; //샤워 시간
  const bedtime = ["일찍 자요", "늦게 자요", "때마다 달라요"]; //취침 시기
  const organizationLevel = ["깔끔해요", "개방적이예요", "애매해요"]; //정리 정돈

  return (
    <RoomMateChecklistPageWrapper>
      <TitleContentArea
        type={"기숙사 상주기간"}
        children={<SelectableChipGroup Groups={days} />}
      />
      <TitleContentArea
        type={"기숙사 종류"}
        children={<ToggleGroup Groups={domitory} />}
      />
      <TitleContentArea
        type={"단과대"}
        children={<SelectableChipGroup Groups={colleges} />}
      />
      <TitleContentArea
        type={"MBTI"}
        children={
          <>
            <ToggleGroup Groups={mbti1} />
            <ToggleGroup Groups={mbti2} />
            <ToggleGroup Groups={mbti3} />
            <ToggleGroup Groups={mbti4} />
          </>
        }
      />
      <TitleContentArea
        type={"흡연 여부"}
        children={<ToggleGroup Groups={smoking} />}
      />
      <TitleContentArea
        type={"코골이 여부"}
        children={<ToggleGroup Groups={snoring} />}
      />
      <TitleContentArea
        type={"이갈이 여부"}
        children={<ToggleGroup Groups={toothgrinding} />}
      />
      <TitleContentArea
        type={"잠귀"}
        children={<ToggleGroup Groups={isLightSleeper} />}
      />
      <TitleContentArea
        type={"샤워 시기"}
        children={<ToggleGroup Groups={showerDuration} />}
      />
      <TitleContentArea
        type={"샤워 시간"}
        children={<ToggleGroup Groups={showertime} />}
      />
      <TitleContentArea
        type={"취침 시기"}
        children={<ToggleGroup Groups={bedtime} />}
      />
      <TitleContentArea
        type={"정리 정돈"}
        children={<ToggleGroup Groups={organizationLevel} />}
      />
    </RoomMateChecklistPageWrapper>
  );
}

const RoomMateChecklistPageWrapper = styled.div`
  padding: 90px 20px;

  display: flex;
  flex-direction: column;
  gap: 16px;
  box-sizing: border-box;

  width: 100%;
  height: 100%;

  overflow-y: auto;

  background: #fafafa;
`;
