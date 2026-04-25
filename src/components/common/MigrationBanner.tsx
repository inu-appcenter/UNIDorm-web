import styled from "styled-components";
import ArrowRight from "@/assets/arrow-right.svg";

export type MigrationBannerVariant = "freshman" | "portal";

const MIGRATION_BANNER_COPY: Record<
  MigrationBannerVariant,
  { title: string; description: React.ReactNode }
> = {
  freshman: {
    title: "포털 계정으로 통합하세요",
    description:
      "지금 바로 신입생 임시 계정을 학교 포털 계정으로 통합하세요!!!",
  },
  portal: {
    title: "신입생 임시 계정 통합 안내",
    description: (
      <>
        <strong>이전에 만드셨던 신입생 임시 계정이 있는 경우에만</strong> 통합을
        진행해 주세요.
        {"\n"}일정 기간 이후에는 통합하지 않은 임시 계정은 삭제될 예정입니다.
      </>
    ),
  },
};

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
  const copy = MIGRATION_BANNER_COPY[variant];

  return (
    <BannerWrapper
      type="button"
      className={className}
      onClick={onClick}
      $variant={variant}
    >
      <MigrationText>
        <h3>{copy.title}</h3>
        <p>{copy.description}</p>
      </MigrationText>
      <img src={ArrowRight} alt="이동" />
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
