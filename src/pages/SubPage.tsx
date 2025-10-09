import { Outlet } from "react-router-dom";
import styled from "styled-components";

export default function SubPage() {
  return (
    <SubPageWrapper>
      {/*<Header hasBack={true} />*/}
      <StyledOutletContainer>
        <Outlet />
      </StyledOutletContainer>
      {/*<BottomBar />*/}
    </SubPageWrapper>
  );
}

const SubPageWrapper = styled.div`
  width: 100%;
  min-height: 100vh; /* 뷰포트 전체 높이를 기준으로 설정 */
  height: fit-content;
  box-sizing: border-box;
  background: #fafafa;
  display: flex;
  flex-direction: column;
`;

const StyledOutletContainer = styled.div`
  flex-grow: 1; /* 남은 공간을 모두 차지하도록 설정 */
  display: flex; /* 내부 콘텐츠 정렬을 위해 추가 */
  flex-direction: column;
`;
