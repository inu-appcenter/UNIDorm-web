import BottomBar from "../components/common/BottomBar.tsx";
import { Outlet } from "react-router-dom";
import styled from "styled-components";
import Header from "../components/common/Header.tsx";

export default function RootPage() {
  return (
    <RootPageWrapper>
      <Header />
      <Outlet />
      <BottomBar />
    </RootPageWrapper>
  );
}

const RootPageWrapper = styled.div`
  width: 100vw;
  height: 100vh;
`;
