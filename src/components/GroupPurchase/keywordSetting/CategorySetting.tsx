import styled from "styled-components";
import SelectableChipGroup from "../../roommate/checklist/SelectableChipGroup.tsx";
import useUserStore from "../../../stores/useUserStore.ts";

interface Props {
  Groups: string[];
  selectedIndices: number[];
  setSelectedIndices: (indices: number[]) => void;
}
const CategorySetting = ({
  Groups,
  selectedIndices,
  setSelectedIndices,
}: Props) => {
  const { userInfo } = useUserStore();

  return (
    <Wrapper>
      <Title>
        {userInfo.name}님이 <span className="colored">카테고리</span> 알림을
        설정할 수 있어요!
      </Title>
      <SelectableChipGroup
        Groups={Groups}
        selectedIndices={selectedIndices}
        onSelect={setSelectedIndices}
        multi={true}
        backgroundColor={"transparent"}
      />
    </Wrapper>
  );
};

export default CategorySetting;

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
`;
const Title = styled.h2`
  color: var(--1, #1c1c1e);
  font-size: 16px;
  font-style: normal;
  font-weight: 600;
  line-height: 24px; /* 150% */
  letter-spacing: 0.38px;

  .colored {
    color: #0a84ff;
  }
`;
