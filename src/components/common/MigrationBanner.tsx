import { Trans, useTranslation } from "react-i18next";
import styled from "styled-components";
import ArrowRight from "@/assets/arrow-right.svg";

export type MigrationBannerVariant = "freshman" | "portal";

interface MigrationBannerProps {
  className?: string;
  onClick: () => void;
  variant: MigrationBannerVariant;
}

const MigrationBanner = ({
  className,
  onClick,
  variant,
}: MigrationBannerProps) => {
  const { t } = useTranslation("common");

  const title = t(`migrationBanner.${variant}.title`);

  return (
    <BannerWrapper
      type="button"
      className={className}
      onClick={onClick}
      $variant={variant}
    >
      <MigrationText>
        <h3>{title}</h3>
        <p>
          {variant === "portal" ? (
            <Trans
              i18nKey={`migrationBanner.portal.description`}
              ns="common"
              components={{ strong: <strong /> }}
            />
          ) : (
            t("migrationBanner.freshman.description")
          )}
        </p>
      </MigrationText>
      <img src={ArrowRight} alt="" aria-hidden="true" />
    </BannerWrapper>
  );
};

export default MigrationBanner;

const BannerWrapper = styled.button<{ $variant: MigrationBannerVariant }>`
  width: 100%;
  padding: 18px 20px;
  box-sizing: border-box;
  background: white;
  border-radius: 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  border: 1px solid #f0f0f0;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.04);
  transition: all 0.2s ease-in-out;
  position: relative;
  overflow: hidden;
  text-align: left;
  appearance: none;

  &::before {
    content: "";
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    width: 4px;
    background: ${({ $variant }) =>
      $variant === "freshman" ? "#0a84ff" : "#8bb8ff"};
  }

  &:active {
    transform: translateY(1px);
    background: #fdfdfd;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  }

  img {
    width: 20px;
    height: 20px;
    filter: invert(41%) sepia(91%) deg(204deg) saturate(3781%)
      hue-rotate(195deg) brightness(101%) contrast(105%);
    opacity: 0.7;
  }
`;

const MigrationText = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
  word-break: keep-all;

  h3 {
    font-size: 16px;
    font-weight: 700;
    margin: 0;
    color: #1a1a1a;
  }

  p {
    font-size: 13px;
    margin: 0;
    color: #666;
    line-height: 1.4;
    text-align: left;
    white-space: pre-line;

    strong {
      color: #333;
      font-weight: 600;
    }
  }
`;
