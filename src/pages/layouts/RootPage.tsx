import { Outlet } from "react-router-dom";
import BottomBar from "@/components/common/BottomBar/BottomBar"; // 기존 바텀바 컴포넌트
import * as S from "@/styles/Layout.styles";
import Header from "@/components/common/Header/Header";

export default function RootPage() {
  return (
    <S.PageWrapper>
      <Header hasBack={false} />
      <S.ContentContainer $hasHeader={true} $hasBottomBar={true}>
        <Outlet />
      </S.ContentContainer>
      <BottomBar />
    </S.PageWrapper>
  );
}
