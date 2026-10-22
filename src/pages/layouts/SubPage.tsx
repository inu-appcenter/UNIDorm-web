import { Outlet } from "react-router-dom";
import * as S from "@/styles/Layout.styles";
import Header from "@/components/common/Header/Header";
import useCurrentRouteBg from "@/hooks/useCurrentRouteBg";

export default function SubPage() {
  const bgType = useCurrentRouteBg();

  return (
    <S.PageWrapper $bgType={bgType}>
      <Header hasBack={true} />
      <S.ContentContainer $hasHeader={true} $hasBottomBar={false}>
        <Outlet />
      </S.ContentContainer>
    </S.PageWrapper>
  );
}
