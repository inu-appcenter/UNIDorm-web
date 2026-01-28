import TitleContentArea from "../../../common/TitleContentArea";

import { colleges, days, dormitory } from "@/constants/constants";
import { StepProps } from "@/types/roommates";
import ToggleGroup from "@/components/roommate/checklist/ToggleGroup";
import SelectableChipGroup from "@/components/roommate/checklist/SelectableChipGroup";

export default function Step1BasicInfo({ data, onChange }: StepProps) {
  return (
    <>
      <TitleContentArea
        title={"상대방 기숙사 종류"}
        description={"알림을 받고 싶은 상대방의 기숙사 유형을 선택해주세요."}
      >
        <ToggleGroup
          Groups={dormitory}
          selectedIndex={data.dormType}
          onSelect={(val) => onChange("dormType", val)}
        />
      </TitleContentArea>

      <TitleContentArea
        title={"상대방 '비'상주 기간"}
        description={
          "상대방이 기숙사를 비우는 날을 선택해주세요.\n(내 상주 기간과 상대의 비상주 기간이 겹쳐야 쾌적해요!)"
        }
      >
        <SelectableChipGroup
          Groups={days}
          selectedIndices={data.dormPeriod}
          onSelect={(val) => onChange("dormPeriod", val)}
          multi={true}
        />
      </TitleContentArea>

      <TitleContentArea
        title={"상대방 단과대학 (중복 선택)"}
        description={"알림을 받고 싶은 상대방의 단과대학을 모두 선택해주세요."}
      >
        <SelectableChipGroup
          Groups={colleges}
          selectedIndices={Array.isArray(data.college) ? data.college : []}
          onSelect={(val) => onChange("college", val)}
          multi={true}
        />
      </TitleContentArea>
    </>
  );
}
