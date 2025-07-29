import { Outlet } from "react-router-dom";
import styled from "styled-components";
import { getMobilePlatform } from "../utils/getMobilePlatform.ts";

const platform = getMobilePlatform();

export default function OutPage() {
  return (
    <OutPageWrapper $isIOS={platform === "ios"}>
      <Outlet />
    </OutPageWrapper>
  );
}

const OutPageWrapper = styled.div<{ $isIOS: boolean }>`
  width: 100vw;
  height: 100vh;
  //margin: auto;

  ${({ $isIOS }) =>
    $isIOS &&
    `
      padding-top: calc(env(safe-area-inset-top, 0px) * 0.5);
    `}
`;
