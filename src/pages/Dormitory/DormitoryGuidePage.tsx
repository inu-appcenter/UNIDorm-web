import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import styled, { css } from "styled-components";
import { ChevronRight, ExternalLink } from "lucide-react";
import { useSetHeader } from "@/hooks/useSetHeader";
import useUserStore from "@/stores/useUserStore";
import useAIChatStore from "@/stores/useAIChatStore";
import { PATHS } from "@/constants/paths";
import {
  DORMITORY_FILTER_OPTIONS,
  DormitoryFilter,
  DormitoryGuideItem,
  filterGuideSections,
  resolveAppStoreUrl,
  resolveDormitoryFilter,
} from "@/constants/dormitoryGuide";
import { getMobilePlatform } from "@/utils/getMobilePlatform";
import { mixpanelTrack } from "@/utils/mixpanel";
import { colors, typography } from "@/styles/tokens";

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
              <FilterChip
                key={option.value}
                type="button"
                role="tab"
                aria-selected={isActive}
                $active={isActive}
                onClick={() => handleFilterSelect(option.value)}
              >
                {option.label}
              </FilterChip>
            );
          })}
        </FilterChipRow>
      </IntroArea>

      <SectionList>
        {sections.map((section) => (
          <SectionBlock key={section.category}>
            <SectionTitle>{section.category}</SectionTitle>
            <CardList>
              {section.items.map((item) => {
                const isInteractive = item.type !== "info";
                const isExternalAction =
                  item.type === "external" || item.type === "app";

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
                    <CardBody>
                      <TitleRow>
                        <CardTitle>{item.title}</CardTitle>
                        {item.badge && (
                          <Badge $muted={item.type === "info"}>
                            {item.badge}
                          </Badge>
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

                    {isInteractive && item.actionLabel && (
                      <ActionPill $highlight={item.type === "aichat"}>
                        <span>{item.actionLabel}</span>
                        {isExternalAction ? (
                          <ExternalLink size={13} strokeWidth={2.2} />
                        ) : (
                          <ChevronRight size={14} strokeWidth={2.4} />
                        )}
                      </ActionPill>
                    )}
                  </GuideCard>
                );
              })}
            </CardList>
          </SectionBlock>
        ))}
      </SectionList>
    </PageWrapper>
  );
}

const PageWrapper = styled.div`
  width: 100%;
  max-width: 840px;
  margin: 0 auto;
  padding: 12px 20px calc(48px + env(safe-area-inset-bottom, 0px));
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
  ${typography.body2Normal}
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

const FilterChip = styled.button<{ $active: boolean }>`
  flex-shrink: 0;
  padding: 8px 14px;
  border-radius: 9999px;
  font-size: 13px;
  font-weight: 600;
  line-height: 1.2;
  cursor: pointer;
  transition:
    background-color 0.15s ease,
    color 0.15s ease,
    border-color 0.15s ease,
    transform 0.12s cubic-bezier(0.16, 1, 0.3, 1);

  ${({ $active }) =>
    $active
      ? css`
          background: ${colors.main.main1};
          color: #ffffff;
          border: 1px solid ${colors.main.main1};
        `
      : css`
          background: ${colors.bg.bg1};
          color: ${colors.text.text2};
          border: 1px solid ${colors.gray.gray200};
        `}

  &:active {
    transform: scale(0.97);
  }
`;

const SectionList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

const SectionBlock = styled.section`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const SectionTitle = styled.h2`
  ${typography.heading2}
  color: ${colors.text.text1};
  margin: 0;
  padding-left: 2px;
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
  padding: 16px 18px;
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
`;

const CardTitle = styled.span`
  ${typography.title3}
  color: ${colors.text.text1};
  overflow-wrap: anywhere;
`;

const Badge = styled.span<{ $muted?: boolean }>`
  display: inline-flex;
  align-items: center;
  padding: 2px 8px;
  border-radius: 9999px;
  font-size: 11px;
  font-weight: 600;
  line-height: 1.4;
  white-space: nowrap;

  ${({ $muted }) =>
    $muted
      ? css`
          background: ${colors.gray.gray100};
          color: ${colors.gray.gray700};
        `
      : css`
          background: ${colors.blue.blue100};
          color: ${colors.blue.blue700};
        `}
`;

const CardDescription = styled.p`
  ${typography.body2Normal}
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
  padding: 5px 10px;
  border-radius: 8px;
  background: ${colors.gray.gray100};
  color: ${colors.gray.gray800};
  font-size: 12px;
  font-weight: 600;
  line-height: 1.2;
  cursor: pointer;
  transition: background-color 0.15s ease, transform 0.12s ease;

  &:hover {
    background: ${colors.gray.gray200};
  }

  &:active {
    transform: scale(0.97);
  }
`;

const ActionPill = styled.div<{ $highlight?: boolean }>`
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  gap: 3px;
  padding: 7px 12px;
  border-radius: 9999px;
  font-size: 13px;
  font-weight: 700;
  line-height: 1;
  white-space: nowrap;

  ${({ $highlight }) =>
    $highlight
      ? css`
          background: ${colors.main.main1};
          color: #ffffff;
        `
      : css`
          background: ${colors.blue.blue100};
          color: ${colors.blue.blue700};
        `}
`;
