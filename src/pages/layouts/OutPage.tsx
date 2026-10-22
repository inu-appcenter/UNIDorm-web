import { Outlet } from "react-router-dom";
import * as S from "@/styles/Layout.styles";
import useCurrentRouteBg from "@/hooks/useCurrentRouteBg";

export default function OutPage() {
  const bgType = useCurrentRouteBg();

  return (
    <S.PageWrapper $bgType={bgType}>
      <S.ContentContainer $hasHeader={false} $hasBottomBar={false}>
        <Outlet />
      </S.ContentContainer>
    </S.PageWrapper>
  );
}
