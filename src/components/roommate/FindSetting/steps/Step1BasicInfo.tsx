import TitleContentArea from "../../../common/TitleContentArea";

import { colleges, complainDormitory, days } from "@/constants/constants";
import { StepProps } from "@/types/roommates";
import ToggleGroup from "@/components/roommate/checklist/ToggleGroup";
import SelectableChipGroup from "@/components/roommate/checklist/SelectableChipGroup";

export default function Step1BasicInfo({ data, onChange }: StepProps) {
  return (
    <>
      <TitleContentArea
        title={"상대방 기숙사 종류"}
        description={
          "기숙사만 선택하면 해당 기숙사로 올라오는 모든 새 글을 푸시알림으로 받을 수 있어요."
        }
      >
        <ToggleGroup
          Groups={complainDormitory}
          selectedIndex={data.dormType}
          onSelect={(val) => onChange("dormType", val)}
        />
      </TitleContentArea>

      <TitleContentArea
        title={"상대방 '비'상주 기간"}
        description={"상대방이 기숙사를 비웠으면 하는 날을 선택해주세요."}
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
