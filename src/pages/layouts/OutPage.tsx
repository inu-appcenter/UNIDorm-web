import { Suspense } from "react";
import { Outlet } from "react-router-dom";
import * as S from "@/styles/Layout.styles";
import useCurrentRouteBg from "@/hooks/useCurrentRouteBg";
import LoadingSpinner from "@/components/common/LoadingSpinner";

export default function OutPage() {
  const bgType = useCurrentRouteBg();

  return (
    <S.PageWrapper $bgType={bgType}>
      <S.ContentContainer $hasHeader={false} $hasBottomBar={false}>
        <Suspense fallback={<LoadingSpinner />}>
          <Outlet />
        </Suspense>
      </S.ContentContainer>
    </S.PageWrapper>
  );
}
