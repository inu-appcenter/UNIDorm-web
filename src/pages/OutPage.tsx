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
  width: 100vw;
  height: 100vh;
  box-sizing: border-box;
`;
