import { Suspense } from "react";
import { Outlet } from "react-router-dom";
import * as S from "@/styles/Layout.styles";
import Header from "@/components/common/Header/Header";
import useCurrentRouteBg from "@/hooks/useCurrentRouteBg";
import LoadingSpinner from "@/components/common/LoadingSpinner";

export default function SubPage() {
  const bgType = useCurrentRouteBg();

  return (
    <S.PageWrapper $bgType={bgType}>
      <Header hasBack={true} />
      <S.ContentContainer $hasHeader={true} $hasBottomBar={false}>
        <Suspense fallback={<LoadingSpinner />}>
          <Outlet />
        </Suspense>
      </S.ContentContainer>
    </S.PageWrapper>
  );
}
