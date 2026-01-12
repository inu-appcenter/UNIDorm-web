import { Outlet } from "react-router-dom";
import * as S from "@/styles/Layout.styles";

export default function OutPage() {
  return (
    <S.PageWrapper>
      <S.ContentContainer $hasHeader={false} $hasBottomBar={false}>
        <Outlet />
      </S.ContentContainer>
    </S.PageWrapper>
  );
}
