import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useSearchParams } from "react-router-dom";
import styled from "styled-components";
import { ExternalLink } from "lucide-react";
import { useSetHeader } from "@/hooks/useSetHeader";
import EmptyState from "@/components/common/EmptyState";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import SquareButton from "@/components/common/SquareButton";
import { PATHS } from "@/constants/paths";
import { getIframeGuideServiceById } from "@/constants/dormitoryGuide";
import { mixpanelTrack } from "@/utils/mixpanel";
import { colors, typography } from "@/styles/tokens";

export default function DormitoryWebViewerPage() {
  const { t } = useTranslation("dormitory");
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const serviceId = searchParams.get("id");
  const service = useMemo(
    () => getIframeGuideServiceById(serviceId),
    [serviceId],
  );

  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(false);
  }, [service?.id]);

  const handleOpenExternal = useCallback(() => {
    if (!service?.url) return;
    mixpanelTrack.externalLinkClicked(
      service.title,
      service.url,
      "기숙사_인앱뷰어",
    );
    window.open(service.url, "_blank", "noopener,noreferrer");
  }, [service]);

  const localizedTitle = service
    ? t(`guide.items.${service.id}.title`, { defaultValue: service.title })
    : t("viewer.defaultTitle");

  const headerRightElement = useMemo(
    () =>
      service?.url ? (
        <ExternalOpenButton
          type="button"
          onClick={handleOpenExternal}
          aria-label={t("viewer.openExternalAriaLabel")}
        >
          <span>{t("viewer.openExternal")}</span>
          <ExternalLink size={14} strokeWidth={2.2} />
        </ExternalOpenButton>
      ) : null,
    [service?.url, handleOpenExternal, t],
  );

  const headerConfig = useMemo(
    () => ({
      title: localizedTitle,
      headerRightElement,
    }),
    [localizedTitle, headerRightElement],
  );
  useSetHeader(headerConfig);

  if (!service || !service.url) {
    return (
      <FallbackContainer>
        <EmptyState padding="12px 0">
          <FallbackTextGroup>
            <FallbackTitle>{t("viewer.notFoundTitle")}</FallbackTitle>
            <FallbackDescription>
              {t("viewer.notFoundDescription")}
            </FallbackDescription>
          </FallbackTextGroup>
        </EmptyState>
        <FallbackActionArea>
          <SquareButton
            variant="primary"
            text={t("viewer.backToGuide")}
            onClick={() => navigate(PATHS.DORMITORY_GUIDE, { replace: true })}
          />
        </FallbackActionArea>
      </FallbackContainer>
    );
  }

  return (
    <ViewerContainer>
      {!isLoaded && (
        <LoadingOverlay>
          <LoadingSpinner message={t("viewer.loading")} />
        </LoadingOverlay>
      )}
      <StyledIframe
        key={service.id}
        src={service.url}
        title={localizedTitle}
        onLoad={() => setIsLoaded(true)}
        allow="clipboard-write"
      />
    </ViewerContainer>
  );
}

const ViewerContainer = styled.div`
  position: relative;
  flex: 1;
  width: 100%;
  height: calc(100dvh - 70px - var(--safe-area-top, 0px));
  min-height: 480px;
  padding-bottom: var(--safe-area-bottom, 0px);
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
`;

const LoadingOverlay = styled.div`
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
`;

const StyledIframe = styled.iframe`
  width: 100%;
  height: 100%;
  flex: 1;
  border: none;
  display: block;
`;

const ExternalOpenButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  min-height: 36px;
  padding: 6px 12px;
  border-radius: 9999px;
  background: ${colors.blue.blue100};
  color: ${colors.blue.blue700};
  ${typography.caption1}
  font-weight: 700;
  line-height: 1;
  white-space: nowrap;
  flex-shrink: 0;
  cursor: pointer;
  transition:
    background-color 0.15s ease,
    transform 0.12s cubic-bezier(0.16, 1, 0.3, 1);

  &:hover {
    background: ${colors.blue.blue200};
  }

  &:active {
    transform: scale(0.97);
  }
`;

const FallbackContainer = styled.div`
  flex: 1;
  min-height: 480px;
  padding: 32px 20px calc(40px + var(--safe-area-bottom, 0px));
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  box-sizing: border-box;
`;

const FallbackTextGroup = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
`;

const FallbackTitle = styled.h2`
  ${typography.heading2}
  color: ${colors.text.text1};
  margin: 0;
  word-break: keep-all;
`;

const FallbackDescription = styled.p`
  ${typography.label1Normal}
  color: ${colors.text.text2};
  margin: 0;
  word-break: keep-all;
`;

const FallbackActionArea = styled.div`
  width: 100%;
  max-width: 280px;
`;
