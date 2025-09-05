import { Outlet } from "react-router-dom";
import styled from "styled-components";
import { getMobilePlatform } from "../utils/getMobilePlatform"; // 경로는 맞게 수정해주세요

const platform = getMobilePlatform();

export default function SubPage() {
  return (
    <SubPageWrapper $isIOS={platform === "ios"}>
      {/*<Header hasBack={true} />*/}
      <Outlet />
      {/*<BottomBar />*/}
    </SubPageWrapper>
  );
}

const SubPageWrapper = styled.div<{ $isIOS: boolean }>`
  width: 100%;
  min-height: 100%;
  height: fit-content;
  box-sizing: border-box;
  background: #fafafa;


  ${({ $isIOS }) =>
    $isIOS &&
    `
      padding-top: calc(env(safe-area-inset-top, 0px) * 0.5);
    `}
`;
