import { Outlet } from "react-router-dom";
import styled from "styled-components";

export default function OutPage() {
  return (
    <OutPageWrapper>
      <Outlet />
    </OutPageWrapper>
  );
}

const OutPageWrapper = styled.div`
  width: 100%;
  min-height: 100%; /* 뷰포트 전체 높이를 기준으로 설정 */
  height: fit-content;
  box-sizing: border-box;
  background: #fafafa;
  display: flex;
  flex-direction: column;
`;
