import TitleContentArea from "../../../common/TitleContentArea";
import ToggleGroup from "../ToggleGroup";
import {
  bedtime,
  isLightSleeper,
  showerDuration,
  showertime,
} from "@/constants/constants";
import { StepProps } from "@/types/roommates";

export default function Step3LifeRhythm({ data, onChange }: StepProps) {
  return (
    <>
      <TitleContentArea title={"잠귀"}>
        <ToggleGroup
          Groups={isLightSleeper}
          selectedIndex={data.sleeper}
          onSelect={(val) => onChange("sleeper", val)}
        />
      </TitleContentArea>
      <TitleContentArea title={"샤워 시기"}>
        <ToggleGroup
          Groups={showertime}
          selectedIndex={data.showerHour}
          onSelect={(val) => onChange("showerHour", val)}
        />
      </TitleContentArea>
      <TitleContentArea title={"샤워 시간"}>
        <ToggleGroup
          Groups={showerDuration}
          selectedIndex={data.showerTime}
          onSelect={(val) => onChange("showerTime", val)}
        />
      </TitleContentArea>
      <TitleContentArea title={"취침 시기"}>
        <ToggleGroup
          Groups={bedtime}
          selectedIndex={data.bedTime}
          onSelect={(val) => onChange("bedTime", val)}
        />
      </TitleContentArea>
    </>
  );
}
