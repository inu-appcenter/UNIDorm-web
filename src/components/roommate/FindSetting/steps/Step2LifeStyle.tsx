import TitleContentArea from "../../../common/TitleContentArea";
import ToggleGroup from "@/components/roommate/checklist/ToggleGroup";
import {
  smokingDisplay,
  snoringDisplay,
  toothgrindingDisplay,
  isLightSleeper,
} from "@/constants/constants";
import { StepProps } from "@/types/roommates";

export default function Step2LifeStyle({ data, onChange }: StepProps) {
  return (
    <>
      <TitleContentArea title={"상대방 흡연 여부"}>
        <ToggleGroup
          Groups={smokingDisplay}
          selectedIndex={data.smoking}
          onSelect={(val) => onChange("smoking", val)}
        />
      </TitleContentArea>

      <TitleContentArea title={"상대방 코골이 여부"}>
        <ToggleGroup
          Groups={snoringDisplay}
          selectedIndex={data.snoring}
          onSelect={(val) => onChange("snoring", val)}
        />
      </TitleContentArea>

      <TitleContentArea title={"상대방 이갈이 여부"}>
        <ToggleGroup
          Groups={toothgrindingDisplay}
          selectedIndex={data.toothGrind}
          onSelect={(val) => onChange("toothGrind", val)}
        />
      </TitleContentArea>


      <TitleContentArea title={"상대방 잠귀"}>
        <ToggleGroup
          Groups={isLightSleeper}
          selectedIndex={data.sleeper}
          onSelect={(val) => onChange("sleeper", val)}
        />
      </TitleContentArea>
    </>
  );
}
