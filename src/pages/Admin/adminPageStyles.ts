import styled, { css } from "styled-components";

export type ButtonTone = "primary" | "secondary" | "danger" | "ghost";
export type BadgeTone = "blue" | "green" | "amber" | "red" | "slate";

const buttonToneStyles: Record<
  ButtonTone,
  {
    background: string;
    color: string;
    border: string;
    shadow: string;
    hoverBackground: string;
    hoverBorder: string;
  }
> = {
  primary: {
    background: "#3182f6",
    color: "#ffffff",
    border: "transparent",
    shadow: "0 2px 8px rgba(49, 130, 246, 0.25)",
    hoverBackground: "#1b64da",
    hoverBorder: "transparent",
  },
  secondary: {
    background: "#f2f4f6",
    color: "#191f28",
    border: "transparent",
    shadow: "none",
    hoverBackground: "#e5e8eb",
    hoverBorder: "transparent",
  },
  danger: {
    background: "#fdf2f2",
    color: "#f04452",
    border: "#fde8e8",
    shadow: "none",
    hoverBackground: "#fce8e8",
    hoverBorder: "#fbd5d5",
  },
  ghost: {
    background: "transparent",
    color: "#4e5968",
    border: "#e5e8eb",
    shadow: "none",
    hoverBackground: "#f9fafb",
    hoverBorder: "#d1d6db",
  },
};

const badgeToneStyles: Record<
  BadgeTone,
  { background: string; color: string; border: string }
> = {
  blue: {
    background: "#e8f3ff",
    color: "#3182f6",
    border: "transparent",
  },
  green: {
    background: "#e6f8ef",
    color: "#04b05c",
    border: "transparent",
  },
  amber: {
    background: "#fff5e5",
    color: "#ff8b00",
    border: "transparent",
  },
  red: {
    background: "#fdf2f2",
    color: "#f04452",
    border: "transparent",
  },
  slate: {
    background: "#f2f4f6",
    color: "#6b7684",
    border: "transparent",
  },
};

export const AdminShell = styled.div`
  width: 100%;
  min-height: 100dvh;
  display: flex;
  justify-content: center;
  background: #f9fafb;
`;

export const AdminPage = styled.div`
  width: 100%;
  max-width: 1100px;
  padding: 16px 16px calc(32px + env(safe-area-inset-bottom, 0px));
  display: flex;
  flex-direction: column;
  gap: 20px;
  box-sizing: border-box;

  @media (min-width: 768px) {
    padding: 32px 24px 80px;
    gap: 32px;
  }
`;

export const AdminHero = styled.section`
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 20px;
  background: #ffffff;
  border: 1px solid #e5e8eb;
  border-radius: 20px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.03);

  @media (min-width: 768px) {
    gap: 24px;
    padding: 28px;
    border-radius: 24px;
  }

  @media (min-width: 960px) {
    flex-direction: row;
    align-items: flex-end;
    justify-content: space-between;
  }
`;

export const AdminHeroContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-width: 620px;

  @media (min-width: 768px) {
    gap: 10px;
  }
`;

export const AdminHeroEyebrow = styled.span`
  display: inline-flex;
  width: fit-content;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  border-radius: 8px;
  background: #e8f3ff;
  color: #3182f6;
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: -0.01em;
`;

export const AdminHeroTitle = styled.h1`
  margin: 0;
  font-size: clamp(1.4rem, 4vw, 2.1rem);
  font-weight: 800;
  line-height: 1.25;
  letter-spacing: -0.03em;
  color: #191f28;
`;

export const AdminHeroDescription = styled.p`
  margin: 0;
  font-size: 0.92rem;
  line-height: 1.6;
  color: #4e5968;

  @media (min-width: 768px) {
    font-size: 1rem;
    line-height: 1.65;
  }
`;

export const AdminHeroMetrics = styled.div`
  display: flex;
  gap: 10px;
  width: 100%;
  overflow-x: auto;
  padding-bottom: 4px;
  scrollbar-width: none;

  &::-webkit-scrollbar {
    display: none;
  }

  > * {
    flex: 0 0 132px;
  }

  @media (min-width: 768px) {
    gap: 12px;
    > * {
      flex-basis: 150px;
    }
  }

  @media (min-width: 960px) {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
    max-width: 440px;
    overflow: visible;
    padding-bottom: 0;

    > * {
      flex: initial;
    }
  }
`;

export const AdminHeroMetricGrid = styled(AdminHeroMetrics)`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
  width: 100%;
  max-width: none;
  overflow: visible;
  padding-bottom: 0;

  > * {
    flex: initial;
  }

  @media (min-width: 768px) {
    gap: 12px;
  }

  @media (min-width: 960px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    max-width: none;
  }
`;

export const AdminMiniStat = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 14px 16px;
  border-radius: 16px;
  background: #f9fafb;
  border: 1px solid #e5e8eb;

  @media (min-width: 768px) {
    gap: 6px;
    padding: 18px 20px;
    border-radius: 18px;
  }
`;

export const AdminMiniStatLabel = styled.span`
  font-size: 0.78rem;
  font-weight: 600;
  color: #8b95a1;

  @media (min-width: 768px) {
    font-size: 0.82rem;
  }
`;

export const AdminMiniStatValue = styled.strong`
  font-size: 1.25rem;
  font-weight: 800;
  color: #191f28;
  letter-spacing: -0.02em;
  font-variant-numeric: tabular-nums;

  @media (min-width: 768px) {
    font-size: 1.6rem;
  }
`;

export const AdminPageGrid = styled.div<{ $desktopColumns?: string }>`
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 20px;

  @media (min-width: 1080px) {
    grid-template-columns: ${({ $desktopColumns }) =>
      $desktopColumns || "minmax(0, 1.15fr) minmax(320px, 0.85fr)"};
    align-items: start;
    gap: 28px;
  }
`;

export const AdminStack = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
  min-width: 0;

  @media (min-width: 768px) {
    gap: 28px;
  }
`;

export const AdminCard = styled.section<{ $sticky?: boolean }>`
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 20px;
  background: #ffffff;
  border: 1px solid #e5e8eb;
  border-radius: 22px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.02);
  min-width: 0;

  @media (min-width: 768px) {
    padding: 28px;
    border-radius: 24px;
  }

  ${({ $sticky }) =>
    $sticky &&
    css`
      @media (min-width: 1080px) {
        position: sticky;
        top: 80px;
      }
    `}
`;

export const AdminCardHeader = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: flex-start;
  gap: 14px;
`;

export const AdminCardTitleGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-width: 0;
`;

export const AdminCardEyebrow = styled.span`
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: -0.01em;
  color: #3182f6;
`;

export const AdminCardTitle = styled.h2`
  margin: 0;
  font-size: 1.25rem;
  font-weight: 800;
  line-height: 1.3;
  letter-spacing: -0.02em;
  color: #191f28;

  @media (min-width: 768px) {
    font-size: 1.4rem;
  }
`;

export const AdminCardDescription = styled.p`
  margin: 0;
  font-size: 0.92rem;
  line-height: 1.6;
  color: #6b7684;
`;

export const AdminSubtleText = styled.p`
  margin: 0;
  font-size: 0.88rem;
  line-height: 1.6;
  color: #8b95a1;
`;

export const AdminBadge = styled.span<{ $tone?: BadgeTone }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  width: fit-content;
  padding: 4px 10px;
  border-radius: 8px;
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: -0.01em;
  ${({ $tone = "slate" }) => {
    const tone = badgeToneStyles[$tone];

    return css`
      background: ${tone.background};
      color: ${tone.color};
      border: 1px solid ${tone.border};
    `;
  }}
`;

export const AdminButton = styled.button<{
  $tone?: ButtonTone;
  $fullWidth?: boolean;
}>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  width: ${({ $fullWidth }) => ($fullWidth ? "100%" : "auto")};
  min-height: 46px;
  padding: 12px 18px;
  border-radius: 14px;
  font-size: 0.94rem;
  font-weight: 700;
  line-height: 1;
  cursor: pointer;
  transition: all 0.18s cubic-bezier(0.16, 1, 0.3, 1);

  ${({ $tone = "primary" }) => {
    const tone = buttonToneStyles[$tone];

    return css`
      background: ${tone.background};
      color: ${tone.color};
      border: 1px solid ${tone.border};
      box-shadow: ${tone.shadow};

      &:hover:not(:disabled) {
        background: ${tone.hoverBackground};
        border-color: ${tone.hoverBorder};
      }

      &:active:not(:disabled) {
        transform: scale(0.98);
      }
    `;
  }}

  &:disabled {
    opacity: 0.45;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }
`;

export const AdminActionRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;

  > * {
    flex: 1 1 100%;
  }

  @media (min-width: 768px) {
    > * {
      flex: 0 0 auto;
    }
  }
`;

export const AdminField = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

export const AdminFieldGrid = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 14px;

  @media (min-width: 768px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 16px;
  }
`;

export const AdminLabel = styled.label`
  font-size: 0.9rem;
  font-weight: 700;
  color: #333d4b;
`;

const inputBaseStyle = css`
  width: 100%;
  box-sizing: border-box;
  padding: 13px 16px;
  border-radius: 14px;
  border: 1px solid #e5e8eb;
  background: #ffffff;
  color: #191f28;
  font-size: 0.95rem;
  transition: all 0.15s ease-out;

  &::placeholder {
    color: #b0b8c1;
  }

  &:focus {
    outline: none;
    border-color: #3182f6;
    box-shadow: 0 0 0 3px rgba(49, 130, 246, 0.15);
  }
`;

export const AdminInput = styled.input`
  ${inputBaseStyle};

  &[type="file"] {
    cursor: pointer;
    padding: 10px;
  }

  &[type="file"]::file-selector-button {
    margin-right: 12px;
    padding: 8px 14px;
    border: none;
    border-radius: 10px;
    background: #e8f3ff;
    color: #3182f6;
    font-size: 0.85rem;
    font-weight: 700;
    cursor: pointer;
  }
`;

export const AdminSelect = styled.select`
  ${inputBaseStyle};
  cursor: pointer;
`;

export const AdminTextarea = styled.textarea`
  ${inputBaseStyle};
  min-height: 140px;
  resize: vertical;
  line-height: 1.6;
`;

export const AdminNotice = styled.div<{ $tone: "error" | "success" }>`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  border-radius: 12px;
  font-size: 0.88rem;
  font-weight: 600;
  color: ${({ $tone }) => ($tone === "error" ? "#f04452" : "#04b05c")};
  background: ${({ $tone }) => ($tone === "error" ? "#fdf2f2" : "#e6f8ef")};
  border: 1px solid ${({ $tone }) => ($tone === "error" ? "#fde8e8" : "#cbf0dd")};
`;

export const AdminChoiceGrid = styled.div<{ $minWidth?: string }>`
  display: grid;
  grid-template-columns: repeat(
    auto-fit,
    minmax(${({ $minWidth }) => $minWidth || "160px"}, 1fr)
  );
  gap: 10px;
`;

export const AdminChoiceCard = styled.button<{ $selected?: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 4px;
  padding: 16px;
  text-align: left;
  border-radius: 16px;
  border: 1.5px solid ${({ $selected }) => ($selected ? "#3182f6" : "#e5e8eb")};
  background: ${({ $selected }) => ($selected ? "#f4f8fe" : "#ffffff")};
  cursor: pointer;
  transition: all 0.15s ease-out;

  &:hover {
    border-color: #3182f6;
    background: #f9fbff;
  }

  &:active {
    transform: scale(0.99);
  }
`;

export const AdminChoiceTitle = styled.strong`
  font-size: 0.95rem;
  font-weight: 700;
  color: #191f28;
`;

export const AdminChoiceDescription = styled.span`
  font-size: 0.82rem;
  line-height: 1.5;
  color: #6b7684;
`;

export const AdminEmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 8px;
  padding: 48px 24px;
  border-radius: 20px;
  border: 1px dashed #d1d6db;
  background: #f9fafb;
`;

export const AdminEmptyTitle = styled.h3`
  margin: 0;
  font-size: 1.05rem;
  font-weight: 700;
  color: #191f28;
`;

export const AdminEmptyDescription = styled.p`
  margin: 0;
  max-width: 400px;
  font-size: 0.9rem;
  line-height: 1.6;
  color: #8b95a1;
`;

export const AdminScrollableArea = styled.div<{ $maxHeight?: string }>`
  max-height: ${({ $maxHeight }) => $maxHeight || "560px"};
  overflow-y: auto;
  padding-right: 4px;

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-thumb {
    background: #d1d6db;
    border-radius: 999px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }
`;

export const AdminPreviewGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(88px, 1fr));
  gap: 10px;
`;

export const AdminPreviewImage = styled.img`
  width: 100%;
  aspect-ratio: 1;
  object-fit: cover;
  border-radius: 14px;
  border: 1px solid #e5e8eb;
  background: #f9fafb;
`;

export const getLocalDateInputValue = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

export const formatDateLabel = (value?: string) =>
  value ? value.replace(/-/g, ".") : "-";

export const formatDateRangeLabel = (startDate?: string, endDate?: string) => {
  if (!startDate || !endDate) {
    return "일정을 입력하면 노출 기간이 여기에 표시됩니다.";
  }

  return `${formatDateLabel(startDate)} - ${formatDateLabel(endDate)}`;
};

export const summarizeText = (value: string, maxLength: number = 140) => {
  const compact = value.replace(/\s+/g, " ").trim();

  if (compact.length <= maxLength) {
    return compact;
  }

  return `${compact.slice(0, maxLength).trim()}...`;
};

export const getDomainLabel = (value: string) => {
  try {
    return new URL(value).hostname.replace(/^www\./, "");
  } catch {
    return value.replace(/^https?:\/\//, "").slice(0, 36);
  }
};
