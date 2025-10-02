import { Outlet } from "react-router-dom";
import styled from "styled-components";
import { getMobilePlatform } from "../utils/getMobilePlatform";

const platform = getMobilePlatform();

export default function SubPage() {
  return (
    <SubPageWrapper $isIOS={platform === "ios"}>
      {/*<Header hasBack={true} />*/}
      <StyledOutletContainer>
        <Outlet />
      </StyledOutletContainer>
      {/*<BottomBar />*/}
    </SubPageWrapper>
  );
}

const SubPageWrapper = styled.div<{ $isIOS: boolean }>`
  width: 100%;
  min-height: 100vh; /* 뷰포트 전체 높이를 기준으로 설정 */
  height: fit-content;
  box-sizing: border-box;
  background: #fafafa;
  display: flex;
  flex-direction: column;

  ${({ $isIOS }) =>
    $isIOS &&
    `
      padding-top: calc(env(safe-area-inset-top, 0px) * 0.5);
    `}
`;

const StyledOutletContainer = styled.div`
  flex-grow: 1; /* 남은 공간을 모두 차지하도록 설정 */
  display: flex; /* 내부 콘텐츠 정렬을 위해 추가 */
  flex-direction: column;
`;
