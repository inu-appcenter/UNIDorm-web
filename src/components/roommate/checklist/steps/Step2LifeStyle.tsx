import TitleContentArea from "../../../common/TitleContentArea";
import SelectableChipGroup from "../SelectableChipGroup";
import ToggleGroup from "../ToggleGroup";
import {
  organizationLevel,
  religion,
  smoking,
  snoring,
  toothgrinding,
} from "@/constants/constants";
import { StepProps } from "@/types/roommates";

export default function Step2LifeStyle({ data, onChange }: StepProps) {
  return (
    <>
      <TitleContentArea title={"흡연 여부"}>
        <ToggleGroup
          Groups={smoking}
          selectedIndex={data.smoking}
          onSelect={(val) => onChange("smoking", val)}
        />
      </TitleContentArea>
      <TitleContentArea title={"코골이 여부"}>
        <ToggleGroup
          Groups={snoring}
          selectedIndex={data.snoring}
          onSelect={(val) => onChange("snoring", val)}
        />
      </TitleContentArea>
      <TitleContentArea title={"이갈이 여부"}>
        <ToggleGroup
          Groups={toothgrinding}
          selectedIndex={data.toothGrind}
          onSelect={(val) => onChange("toothGrind", val)}
        />
      </TitleContentArea>
      <TitleContentArea title={"정리 정돈"}>
        <ToggleGroup
          Groups={organizationLevel}
          selectedIndex={data.arrangement}
          onSelect={(val) => onChange("arrangement", val)}
        />
      </TitleContentArea>
      <TitleContentArea title={"종교"}>
        <SelectableChipGroup
          Groups={religion}
          selectedIndex={data.religion}
          onSelect={(val) => onChange("religion", val)}
        />
      </TitleContentArea>
    </>
  );
}
