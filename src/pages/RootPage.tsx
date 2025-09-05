import { Outlet } from "react-router-dom";
import styled from "styled-components";
import { getMobilePlatform } from "../utils/getMobilePlatform.ts";
import { useEffect, useState } from "react";

export default function RootPage() {
  const [platform, setPlatform] = useState<"ios" | "android" | "other">(
    "other",
  );

  useEffect(() => {
    setPlatform(getMobilePlatform());
  }, []);

  return (
    <RootPageWrapper $platform={platform}>
      {/*<Header />*/}
      <Outlet />
    </RootPageWrapper>
  );
}

const RootPageWrapper = styled.div<{ $platform: string }>`
  width: 100%;
  min-height: 100%;
  height: fit-content;
  box-sizing: border-box;
  background: #fafafa;


  ${({ $platform }) =>
    $platform === "ios"
      ? `padding-top: calc(env(safe-area-inset-top, 0px) * 0.5);`
      : ""}
`;
