import { Outlet } from "react-router-dom";
import * as S from "@/styles/Layout.styles";
import Header from "@/components/common/Header/Header";

export default function SubPage() {
  return (
    <S.PageWrapper>
      <Header hasBack={true} />
      <S.ContentContainer $hasHeader={true} $hasBottomBar={false}>
        <Outlet />
      </S.ContentContainer>
    </S.PageWrapper>
  );
}
