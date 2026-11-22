import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import styled, { css } from "styled-components";
import {
  BookOpen,
  Building2,
  ChevronRight,
  ExternalLink,
  FileText,
  GraduationCap,
  LucideIcon,
  MessageSquare,
  Phone,
  WashingMachine,
  Wrench,
} from "lucide-react";
import chatbuliLogo from "@/assets/ai-chat/챗불이로고.svg";
import intipIcon from "@/assets/dormitory-guide/intip-icon.webp";
import inuSymbol from "@/assets/dormitory-guide/inu-symbol.webp";
import metaclubLogo from "@/assets/dormitory-guide/metaclub-logo.webp";
import unidormLogo from "@/assets/unidorm-logo.webp";
import ChipButton from "@/components/button/ChipButton";
import DormitoryBadge from "@/components/common/DormitoryBadge";
import TitleContentArea from "@/components/common/TitleContentArea";
import { useSetHeader } from "@/hooks/useSetHeader";
import useUserStore from "@/stores/useUserStore";
import useAIChatStore from "@/stores/useAIChatStore";
import { PATHS } from "@/constants/paths";
import {
  DORMITORY_FILTER_OPTIONS,
  DormitoryFilter,
  DormitoryGuideItem,
  GuideVisualKey,
  filterGuideSections,
  resolveAppStoreUrl,
  resolveDormitoryFilter,
} from "@/constants/dormitoryGuide";
import { getMobilePlatform } from "@/utils/getMobilePlatform";
import { mixpanelTrack } from "@/utils/mixpanel";
import { colors, typography } from "@/styles/tokens";

const SINGLE_DORM_BADGES = new Set(["1기숙사", "2기숙사", "3기숙사"]);

const FULL_BLEED_LOGOS: Partial<Record<GuideVisualKey, string>> = {
  metaclub: metaclubLogo,
  intip: intipIcon,
};

const CONTAINED_LOGOS: Partial<Record<GuideVisualKey, string>> = {
  inu: inuSymbol,
  unidorm: unidormLogo,
  chatbuli: chatbuliLogo,
};

const FUNCTION_ICONS: Partial<Record<GuideVisualKey, LucideIcon>> = {
  washing: WashingMachine,
  wrench: Wrench,
  lecture: GraduationCap,
  rules: BookOpen,
  facilities: Building2,
  archive: FileText,
  qna: MessageSquare,
  phone: Phone,
};

function renderGuideVisual(visual: GuideVisualKey, isExternal: boolean) {
  const fullBleedSrc = FULL_BLEED_LOGOS[visual];
  const containedSrc = CONTAINED_LOGOS[visual];
  const IconComponent = FUNCTION_ICONS[visual] ?? FileText;

  let slotContent: React.ReactNode;
  if (fullBleedSrc) {
    slotContent = (
      <AppIconSlot>
        <AppIconImage src={fullBleedSrc} alt="" aria-hidden="true" />
      </AppIconSlot>
    );
  } else if (containedSrc) {
    slotContent = (
      <LogoSlot>
        <LogoImage src={containedSrc} alt="" aria-hidden="true" />
      </LogoSlot>
    );
  } else {
    slotContent = (
      <IconSlot>
        <IconComponent size={19} strokeWidth={1.9} aria-hidden="true" />
      </IconSlot>
    );
  }

  return (
    <VisualWrapper>
      {slotContent}
      {isExternal && (
        <ExternalBadge aria-hidden="true">
          <ExternalLink size={10} strokeWidth={2.4} />
        </ExternalBadge>
      )}
    </VisualWrapper>
  );
}

export default function DormitoryGuidePage() {
  const navigate = useNavigate();
  const dormType = useUserStore((state) => state.userInfo?.dormType);

  const [selectedFilter, setSelectedFilter] = useState<DormitoryFilter>(() =>
    resolveDormitoryFilter(dormType),
  );
  const hasManualFilterChange = useRef(false);

  useEffect(() => {
    if (hasManualFilterChange.current) return;
    const resolved = resolveDormitoryFilter(dormType);
    setSelectedFilter(resolved);
  }, [dormType]);

  const headerConfig = useMemo(
    () => ({
      title: "기숙사 생활 안내",
    }),
    [],
  );
  useSetHeader(headerConfig);

  const sections = useMemo(
    () => filterGuideSections(selectedFilter),
    [selectedFilter],
  );

  const handleFilterSelect = (filter: DormitoryFilter) => {
    hasManualFilterChange.current = true;
    setSelectedFilter(filter);
    mixpanelTrack.categoryFiltered("기숙사_생활안내", filter, "기숙사_생활안내");
  };

  const openExternalUrl = (label: string, url: string) => {
    mixpanelTrack.externalLinkClicked(label, url, "기숙사_생활안내");
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const handleItemClick = (item: DormitoryGuideItem) => {
    if (item.type === "info") return;

    if (item.type === "iframe") {
      mixpanelTrack.featureClicked(item.title, "기숙사_생활안내");
      navigate(`${PATHS.DORMITORY_VIEWER}?id=${encodeURIComponent(item.id)}`);
      return;
    }

    if (item.type === "internal" && item.path) {
      mixpanelTrack.featureClicked(item.title, "기숙사_생활안내");
      navigate(item.path);
      return;
    }

    if (item.type === "aichat") {
      mixpanelTrack.featureClicked("챗불이", PATHS.DORMITORY_GUIDE);
      useAIChatStore.getState().openChat();
      return;
    }

    if (item.type === "external" && item.url) {
      openExternalUrl(item.title, item.url);
      return;
    }

    if (item.type === "app" && item.appLinks) {
      const storeUrl = resolveAppStoreUrl(item.appLinks, getMobilePlatform());
      openExternalUrl(item.title, storeUrl);
      return;
    }

    if (item.type === "tel" && item.tel) {
      mixpanelTrack.featureClicked(item.title, "기숙사_생활안내");
      window.location.href = `tel:${item.tel}`;
    }
  };

  const handleSecondaryAppClick = (
    event: React.MouseEvent<HTMLButtonElement>,
    item: DormitoryGuideItem,
  ) => {
    event.stopPropagation();
    if (!item.secondaryApp) return;

    const storeUrl = resolveAppStoreUrl(
      item.secondaryApp.appLinks,
      getMobilePlatform(),
    );
    openExternalUrl(item.secondaryApp.label, storeUrl);
  };

  return (
    <PageWrapper>
      <IntroArea>
        <IntroDescription>
          기숙사 생활에 자주 쓰는 앱과 학교 사이트를 용도별로 정리했어요.
        </IntroDescription>
        <FilterChipRow role="tablist" aria-label="기숙사 구분 필터">
          {DORMITORY_FILTER_OPTIONS.map((option) => {
            const isActive = selectedFilter === option.value;
            return (
              <GuideFilterChip
                key={option.value}
                role="tab"
                aria-selected={isActive}
                active={isActive}
                onClick={() => handleFilterSelect(option.value)}
              >
                {option.label}
              </GuideFilterChip>
            );
          })}
        </FilterChipRow>
      </IntroArea>

      <SectionList>
        {sections.map((section) => (
          <TitleContentArea
            key={section.category}
            title={section.category}
            gap="10px"
          >
            <CardList>
              {section.items.map((item) => {
                const isInteractive = item.type !== "info";
                const isExternalAction =
                  item.type === "external" || item.type === "app";
                const isSingleDormBadge = Boolean(
                  item.badge && SINGLE_DORM_BADGES.has(item.badge),
                );

                return (
                  <GuideCard
                    key={item.id}
                    $interactive={isInteractive}
                    role={isInteractive ? "button" : undefined}
                    tabIndex={isInteractive ? 0 : undefined}
                    onClick={
                      isInteractive ? () => handleItemClick(item) : undefined
                    }
                    onKeyDown={
                      isInteractive
                        ? (event) => {
                            if (event.key === "Enter" || event.key === " ") {
                              event.preventDefault();
                              handleItemClick(item);
                            }
                          }
                        : undefined
                    }
                  >
                    {renderGuideVisual(item.visual, isExternalAction)}

                    <CardBody>
                      <TitleRow>
                        <CardTitle>{item.title}</CardTitle>
                        {item.badge && (
                          <DormitoryBadge
                            dormType={isSingleDormBadge ? item.badge : ""}
                            variant="subtle"
                            size="sm"
                          >
                            {item.badge}
                          </DormitoryBadge>
                        )}
                      </TitleRow>
                      <CardDescription>{item.description}</CardDescription>
                      {item.secondaryApp && (
                        <SecondaryActionRow>
                          <SecondaryButton
                            type="button"
                            onClick={(event) =>
                              handleSecondaryAppClick(event, item)
                            }
                          >
                            <span>{item.secondaryApp.label} 설치</span>
                            <ExternalLink size={12} strokeWidth={2.2} />
                          </SecondaryButton>
                        </SecondaryActionRow>
                      )}
                    </CardBody>

                    {isInteractive && (
                      <CardChevron
                        size={16}
                        strokeWidth={2}
                        aria-hidden="true"
                      />
                    )}
                  </GuideCard>
                );
              })}
            </CardList>
          </TitleContentArea>
        ))}
      </SectionList>
    </PageWrapper>
  );
}

const PageWrapper = styled.div`
  width: 100%;
  max-width: 840px;
  margin: 0 auto;
  padding: 12px 20px calc(48px + var(--safe-area-bottom, 0px));
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const IntroArea = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const IntroDescription = styled.p`
  ${typography.label1Normal}
  color: ${colors.text.text2};
  margin: 0;
  word-break: keep-all;
`;

const FilterChipRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  overflow-x: auto;
  padding-bottom: 2px;
  -ms-overflow-style: none;
  scrollbar-width: none;

  &::-webkit-scrollbar {
    display: none;
  }
`;

const GuideFilterChip = styled(ChipButton)`
  flex-shrink: 0;
  min-height: 36px;
  transition:
    background-color 0.15s ease,
    color 0.15s ease,
    opacity 0.15s ease,
    transform 0.12s cubic-bezier(0.16, 1, 0.3, 1);

  &:active {
    transform: scale(0.97);
  }
`;

const SectionList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

const CardList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const GuideCard = styled.div<{ $interactive: boolean }>`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 15px 16px;
  background: ${colors.bg.bg1};
  border: 1px solid ${colors.gray.gray200};
  border-radius: 16px;
  box-sizing: border-box;
  cursor: ${({ $interactive }) => ($interactive ? "pointer" : "default")};
  transition:
    transform 0.14s cubic-bezier(0.16, 1, 0.3, 1),
    border-color 0.15s ease,
    background-color 0.15s ease;

  ${({ $interactive }) =>
    $interactive &&
    css`
      &:hover {
        border-color: ${colors.blue.blue300};
      }

      &:active {
        transform: scale(0.985);
        background: ${colors.gray.gray50};
      }
    `}
`;

const VisualWrapper = styled.div`
  position: relative;
  width: 40px;
  height: 40px;
  flex-shrink: 0;
`;

const ExternalBadge = styled.span`
  position: absolute;
  right: -3px;
  bottom: -3px;
  width: 17px;
  height: 17px;
  border-radius: 5px;
  background: ${colors.bg.bg1};
  border: 1px solid ${colors.gray.gray200};
  color: ${colors.gray.gray600};
  display: flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
`;

const visualSlotBase = css`
  width: 40px;
  height: 40px;
  border-radius: 10px;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const AppIconSlot = styled.div`
  ${visualSlotBase}
  overflow: hidden;
  border: 1px solid ${colors.gray.gray100};
`;

const AppIconImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
`;

const LogoSlot = styled.div`
  ${visualSlotBase}
  padding: 4px;
  background: ${colors.bg.bg1};
  border: 1px solid ${colors.gray.gray200};
`;

const LogoImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: contain;
  display: block;
`;

const IconSlot = styled.div`
  ${visualSlotBase}
  background: ${colors.gray.gray50};
  border: 1px solid ${colors.gray.gray200};
  color: ${colors.gray.gray700};
`;

const CardBody = styled.div`
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const TitleRow = styled.div`
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 6px;
  min-width: 0;
`;

const CardTitle = styled.span`
  ${typography.body1Normal}
  color: ${colors.text.text1};
  overflow-wrap: anywhere;
  word-break: keep-all;
`;

const CardDescription = styled.p`
  ${typography.label1Normal}
  color: ${colors.text.text2};
  margin: 0;
  word-break: keep-all;
  overflow-wrap: anywhere;
`;

const SecondaryActionRow = styled.div`
  margin-top: 6px;
  display: flex;
  align-items: center;
`;

const SecondaryButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  min-height: 36px;
  padding: 6px 12px;
  border-radius: 8px;
  background: ${colors.gray.gray100};
  color: ${colors.gray.gray800};
  ${typography.caption1}
  font-weight: 600;
  cursor: pointer;
  transition:
    background-color 0.15s ease,
    transform 0.12s cubic-bezier(0.16, 1, 0.3, 1);

  &:hover {
    background: ${colors.gray.gray200};
  }

  &:active {
    transform: scale(0.97);
  }
`;

const CardChevron = styled(ChevronRight)`
  flex-shrink: 0;
  color: ${colors.gray.gray400};
`;
