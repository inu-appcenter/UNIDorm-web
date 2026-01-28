import TitleContentArea from "../../../common/TitleContentArea";

import { organizationLevel, religion } from "@/constants/constants";
import { StepProps } from "@/types/roommates";
import ToggleGroup from "@/components/roommate/checklist/ToggleGroup";
import SelectableChipGroup from "@/components/roommate/checklist/SelectableChipGroup";

export default function Step4Personality({ data, onChange }: StepProps) {
  return (
    <>
      <TitleContentArea title={"상대방 정리 정돈"}>
        <ToggleGroup
          Groups={organizationLevel}
          selectedIndex={data.arrangement}
          onSelect={(val) => onChange("arrangement", val)}
        />
      </TitleContentArea>

      <TitleContentArea
        title={"희망 종교 (중복 선택)"}
        description={"허용 가능한 상대방의 종교를 모두 선택해주세요."}
      >
        <SelectableChipGroup
          Groups={religion}
          // religion이 배열(number[])인 경우를 가정
          selectedIndices={Array.isArray(data.religion) ? data.religion : []}
          onSelect={(val) => onChange("religion", val)}
          multi={true}
        />
      </TitleContentArea>
    </>
  );
}
