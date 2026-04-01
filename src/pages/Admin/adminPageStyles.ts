import styled, { css } from "styled-components";

type ButtonTone = "primary" | "secondary" | "danger" | "ghost";
type BadgeTone = "blue" | "green" | "amber" | "red" | "slate";

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
    background: "linear-gradient(135deg, #2563eb 0%, #3b82f6 100%)",
    color: "#ffffff",
    border: "#2563eb",
    shadow: "0 18px 30px -18px rgba(37, 99, 235, 0.55)",
    hoverBackground: "linear-gradient(135deg, #1d4ed8 0%, #2563eb 100%)",
    hoverBorder: "#1d4ed8",
  },
  secondary: {
    background: "#f8fafc",
    color: "#0f172a",
    border: "#cbd5e1",
    shadow: "0 10px 24px -22px rgba(15, 23, 42, 0.35)",
    hoverBackground: "#eef4ff",
    hoverBorder: "#93c5fd",
  },
  danger: {
    background: "#fff1f2",
    color: "#be123c",
    border: "#fecdd3",
    shadow: "0 10px 24px -22px rgba(190, 24, 93, 0.35)",
    hoverBackground: "#ffe4e6",
    hoverBorder: "#fb7185",
  },
  ghost: {
    background: "transparent",
    color: "#475569",
    border: "#e2e8f0",
    shadow: "none",
    hoverBackground: "#f8fafc",
    hoverBorder: "#cbd5e1",
  },
};

const badgeToneStyles: Record<
  BadgeTone,
  { background: string; color: string; border: string }
> = {
  blue: {
    background: "#eff6ff",
    color: "#1d4ed8",
    border: "#bfdbfe",
  },
  green: {
    background: "#ecfdf5",
    color: "#047857",
    border: "#a7f3d0",
  },
  amber: {
    background: "#fffbeb",
    color: "#b45309",
    border: "#fde68a",
  },
  red: {
    background: "#fff1f2",
    color: "#be123c",
    border: "#fecdd3",
  },
  slate: {
    background: "#f8fafc",
    color: "#475569",
    border: "#cbd5e1",
  },
};

export const AdminShell = styled.div`
  width: 100%;
  min-height: 100%;
  display: flex;
  justify-content: center;
  background: transparent;
`;

export const AdminPage = styled.div`
  width: 100%;
  max-width: 1100px;
  padding: 16px 16px 96px;
  display: flex;
  flex-direction: column;
  gap: 18px;
  box-sizing: border-box;

  @media (min-width: 768px) {
    padding: 32px 20px 120px;
    gap: 28px;
  }
`;

export const AdminHero = styled.section`
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding: 18px;
  background: rgba(255, 255, 255, 0.92);
  border: 1px solid rgba(226, 232, 240, 0.95);
  border-radius: 22px;
  box-shadow: 0 18px 36px -32px rgba(15, 23, 42, 0.24);
  backdrop-filter: blur(16px);

  @media (min-width: 768px) {
    gap: 20px;
    padding: 28px;
    border-radius: 28px;
    box-shadow: 0 22px 45px -34px rgba(15, 23, 42, 0.28);
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
    gap: 12px;
  }
`;

export const AdminHeroEyebrow = styled.span`
  display: none;
  width: fit-content;
  align-items: center;
  gap: 8px;
  padding: 6px 10px;
  border-radius: 999px;
  background: #eff6ff;
  color: #2563eb;
  font-size: 0.7rem;
  font-weight: 800;
  letter-spacing: 0.06em;
  text-transform: uppercase;

  @media (min-width: 768px) {
    padding: 8px 12px;
    font-size: 0.78rem;
  }
`;

export const AdminHeroTitle = styled.h1`
  margin: 0;
  font-size: clamp(1.35rem, 5vw, 2.35rem);
  font-weight: 800;
  line-height: 1.2;
  letter-spacing: -0.03em;
  color: #0f172a;
`;

export const AdminHeroDescription = styled.p`
  margin: 0;
  font-size: 0.9rem;
  line-height: 1.6;
  color: #475569;

  @media (min-width: 768px) {
    font-size: 1rem;
    line-height: 1.75;
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
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    max-width: 430px;
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
  gap: 12px;
  width: 100%;
  max-width: none;
  overflow: visible;
  padding-bottom: 0;

  > * {
    flex: initial;
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
  padding: 12px 14px;
  border-radius: 18px;
  background: linear-gradient(180deg, #ffffff 0%, #f8fbff 100%);
  border: 1px solid #dbeafe;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.85);

  @media (min-width: 768px) {
    gap: 6px;
    padding: 16px 18px;
    border-radius: 22px;
  }
`;

export const AdminMiniStatLabel = styled.span`
  font-size: 0.74rem;
  font-weight: 700;
  color: #64748b;

  @media (min-width: 768px) {
    font-size: 0.82rem;
  }
`;

export const AdminMiniStatValue = styled.strong`
  font-size: 1.18rem;
  font-weight: 800;
  color: #0f172a;
  letter-spacing: -0.03em;

  @media (min-width: 768px) {
    font-size: 1.55rem;
  }
`;

export const AdminPageGrid = styled.div<{ $desktopColumns?: string }>`
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 24px;

  @media (min-width: 1080px) {
    grid-template-columns: ${({ $desktopColumns }) =>
      $desktopColumns || "minmax(0, 1.12fr) minmax(320px, 0.88fr)"};
    align-items: start;
  }
`;

export const AdminStack = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
  min-width: 0;
`;

export const AdminCard = styled.section<{ $sticky?: boolean }>`
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 24px;
  background: rgba(255, 255, 255, 0.96);
  border: 1px solid #e2e8f0;
  border-radius: 26px;
  box-shadow: 0 22px 44px -34px rgba(15, 23, 42, 0.24);
  min-width: 0;

  @media (min-width: 768px) {
    padding: 28px;
  }

  ${({ $sticky }) =>
    $sticky &&
    css`
      @media (min-width: 1080px) {
        position: sticky;
        top: 92px;
      }
    `}
`;

export const AdminCardHeader = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
`;

export const AdminCardTitleGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 0;
`;

export const AdminCardEyebrow = styled.span`
  display: none;
  font-size: 0.78rem;
  font-weight: 800;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: #2563eb;
`;

export const AdminCardTitle = styled.h2`
  margin: 0;
  font-size: 1.35rem;
  font-weight: 800;
  line-height: 1.2;
  letter-spacing: -0.02em;
  color: #0f172a;
`;

export const AdminCardDescription = styled.p`
  margin: 0;
  font-size: 0.96rem;
  line-height: 1.7;
  color: #64748b;
`;

export const AdminSubtleText = styled.p`
  margin: 0;
  font-size: 0.9rem;
  line-height: 1.65;
  color: #64748b;
`;

export const AdminBadge = styled.span<{ $tone?: BadgeTone }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  width: fit-content;
  padding: 7px 11px;
  border-radius: 999px;
  font-size: 0.78rem;
  font-weight: 800;
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
  gap: 8px;
  width: ${({ $fullWidth }) => ($fullWidth ? "100%" : "auto")};
  min-height: 48px;
  padding: 14px 18px;
  border-radius: 16px;
  font-size: 0.95rem;
  font-weight: 800;
  line-height: 1;
  cursor: pointer;
  transition:
    transform 0.2s ease,
    background-color 0.2s ease,
    border-color 0.2s ease,
    box-shadow 0.2s ease;

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
        transform: translateY(-1px);
      }
    `;
  }}

  &:disabled {
    opacity: 0.58;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }
`;

export const AdminActionRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 12px;

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
  gap: 16px;

  @media (min-width: 768px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
`;

export const AdminLabel = styled.label`
  font-size: 0.92rem;
  font-weight: 700;
  color: #1e293b;
`;

const inputBaseStyle = css`
  width: 100%;
  box-sizing: border-box;
  padding: 14px 16px;
  border-radius: 18px;
  border: 1px solid #dbe3ef;
  background: #ffffff;
  color: #0f172a;
  font-size: 0.98rem;
  transition:
    border-color 0.2s ease,
    box-shadow 0.2s ease,
    background-color 0.2s ease;

  &::placeholder {
    color: #94a3b8;
  }

  &:focus {
    outline: none;
    border-color: #60a5fa;
    box-shadow: 0 0 0 4px rgba(96, 165, 250, 0.18);
    background: #ffffff;
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
    padding: 10px 14px;
    border: none;
    border-radius: 14px;
    background: #dbeafe;
    color: #1d4ed8;
    font-size: 0.88rem;
    font-weight: 800;
    cursor: pointer;
  }
`;

export const AdminTextarea = styled.textarea`
  ${inputBaseStyle};
  min-height: 150px;
  resize: vertical;
  line-height: 1.6;
`;

export const AdminChoiceGrid = styled.div<{ $minWidth?: string }>`
  display: grid;
  grid-template-columns: repeat(
    auto-fit,
    minmax(${({ $minWidth }) => $minWidth || "180px"}, 1fr)
  );
  gap: 12px;
`;

export const AdminChoiceCard = styled.button<{ $selected?: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 6px;
  padding: 18px;
  text-align: left;
  border-radius: 22px;
  border: 1px solid ${({ $selected }) => ($selected ? "#60a5fa" : "#dbe3ef")};
  background: ${({ $selected }) =>
    $selected
      ? "linear-gradient(180deg, #eff6ff 0%, #ffffff 100%)"
      : "#ffffff"};
  box-shadow: ${({ $selected }) =>
    $selected ? "0 18px 32px -28px rgba(37, 99, 235, 0.48)" : "none"};
  cursor: pointer;
  transition:
    border-color 0.2s ease,
    box-shadow 0.2s ease,
    transform 0.2s ease,
    background-color 0.2s ease;

  &:hover {
    border-color: #93c5fd;
    transform: translateY(-1px);
  }
`;

export const AdminChoiceTitle = styled.strong`
  font-size: 0.98rem;
  font-weight: 800;
  color: #0f172a;
`;

export const AdminChoiceDescription = styled.span`
  font-size: 0.88rem;
  line-height: 1.55;
  color: #64748b;
`;

export const AdminEmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 10px;
  padding: 44px 24px;
  border-radius: 24px;
  border: 1px dashed #cbd5e1;
  background: linear-gradient(180deg, #f8fbff 0%, #ffffff 100%);
`;

export const AdminEmptyTitle = styled.h3`
  margin: 0;
  font-size: 1.08rem;
  font-weight: 800;
  color: #0f172a;
`;

export const AdminEmptyDescription = styled.p`
  margin: 0;
  max-width: 420px;
  font-size: 0.95rem;
  line-height: 1.7;
  color: #64748b;
`;

export const AdminScrollableArea = styled.div<{ $maxHeight?: string }>`
  max-height: ${({ $maxHeight }) => $maxHeight || "560px"};
  overflow-y: auto;
  padding-right: 4px;

  &::-webkit-scrollbar {
    width: 8px;
  }

  &::-webkit-scrollbar-thumb {
    background: #cbd5e1;
    border-radius: 999px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }
`;

export const AdminPreviewGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(96px, 1fr));
  gap: 12px;
`;

export const AdminPreviewImage = styled.img`
  width: 100%;
  aspect-ratio: 1;
  object-fit: cover;
  border-radius: 18px;
  border: 1px solid #dbe3ef;
  background: #f8fafc;
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
