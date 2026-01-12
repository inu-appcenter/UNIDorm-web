import TitleContentArea from "../../../common/TitleContentArea";
import SelectableChipGroup from "../SelectableChipGroup";
import ToggleGroup from "../ToggleGroup";
import { colleges, days, dormitory } from "../../../../constants/constants";
import { StepProps } from "../../../../types/roommates";

export default function Step1BasicInfo({ data, onChange }: StepProps) {
  return (
    <>
      <TitleContentArea
        title={"기숙사 종류"}
        description={"기숙사 종류는 내 정보 수정에서 변경할 수 있어요."}
      >
        <ToggleGroup
          Groups={dormitory}
          selectedIndex={data.dormType}
          onSelect={(val) => onChange("dormType", val)}
          disabled={true}
        />
      </TitleContentArea>
      <TitleContentArea title={"기숙사 상주기간"}>
        <SelectableChipGroup
          Groups={days}
          selectedIndices={data.dormPeriod}
          onSelect={(val) => onChange("dormPeriod", val)}
          multi={true}
        />
      </TitleContentArea>
      <TitleContentArea
        title={"단과대학"}
        description={"단과대학은 내 정보 수정에서 변경할 수 있어요."}
      >
        <SelectableChipGroup
          Groups={colleges}
          selectedIndex={data.college}
          onSelect={(val) => onChange("college", val)}
          disabled={true}
        />
      </TitleContentArea>
    </>
  );
}
