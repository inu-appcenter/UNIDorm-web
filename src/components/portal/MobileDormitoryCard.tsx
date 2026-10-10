import React, { useState, useEffect, useMemo } from "react";
import styled, { keyframes } from "styled-components";
import { User, Shield } from "lucide-react";
import { typography } from "@/styles/intipTypography";

export interface MobileDormitoryCardProps {
  studentName?: string;
  englishName?: string;
  studentId?: string;
  department?: string;
  grade?: string;
  photoSrc?: string | null;
  dormitoryType?: string;
  dormitoryBuilding?: string;
  studentDormNo?: string;
  year?: string;
  term?: string;
  status?: string;
  fullscreen?: boolean;
}

interface DormitoryTheme {
  name: string;
  borderColor: string;
  badgeBg: string;
  badgeText: string;
  boxBg: string;
  boxBorder: string;
}

/**
 * 1, 2, 3 기숙사별 고유 색상 테마 계산
 */
function resolveDormitoryTheme(dormType?: string, dormBuilding?: string): DormitoryTheme {
  const combined = `${dormType || ""} ${dormBuilding || ""}`.trim();

  // 미배정 또는 데이터 없음
  if (!combined || combined === "-") {
    return {
      name: "-",
      borderColor: "var(--border-default)",
      badgeBg: "var(--bg-muted)",
      badgeText: "var(--text-secondary)",
      boxBg: "var(--bg-subtle)",
      boxBorder: "var(--border-default)",
    };
  }

  // 제2기숙사 (직영 / BTL) -> 그린
  if (combined.includes("02") || combined.includes("03") || combined.includes("2기숙사") || combined.includes("제2")) {
    return {
      name: "제2기숙사",
      borderColor: "var(--border-success)",
      badgeBg: "var(--text-success)",
      badgeText: "var(--text-inverse)",
      boxBg: "var(--bg-subtle)",
      boxBorder: "var(--border-success)",
    };
  }

  // 제3기숙사 (BTL) -> 인디고 / 보라
  if (combined.includes("04") || combined.includes("05") || combined.includes("3기숙사") || combined.includes("제3")) {
    return {
      name: "제3기숙사(BTL)",
      borderColor: "var(--border-brand)",
      badgeBg: "var(--interactive-primary)",
      badgeText: "var(--text-inverse)",
      boxBg: "var(--bg-brand)",
      boxBorder: "var(--border-brand)",
    };
  }

  // 제1기숙사 -> INU 시그니처 블루
  return {
    name: "제1기숙사",
    borderColor: "var(--border-brand)",
    badgeBg: "var(--interactive-primary)",
    badgeText: "var(--text-inverse)",
    boxBg: "var(--bg-brand)",
    boxBorder: "var(--border-brand)",
  };
}

/**
 * 학기 코드 변환 (10 -> 1학기, 20 -> 2학기)
 */
function formatSemesterTerm(term?: string): string {
  if (!term) return "";
  const trimmed = term.trim();
  if (trimmed === "10" || trimmed === "1") return "1학기";
  if (trimmed === "20" || trimmed === "2") return "2학기";
  if (trimmed === "30") return "여름학기";
  if (trimmed === "40") return "겨울학기";
  return trimmed.endsWith("학기") ? trimmed : `${trimmed}학기`;
}

export const MobileDormitoryCard: React.FC<MobileDormitoryCardProps> = ({
  studentName = "-",
  englishName,
  studentId = "-",
  department = "-",
  grade = "-",
  photoSrc,
  dormitoryType,
  dormitoryBuilding,
  studentDormNo = "-",
  year,
  term,
  status = "-",
  fullscreen = false,
}) => {
  const [clockText, setClockText] = useState<string>("");

  useEffect(() => {
    const pad = (n: number) => String(n).padStart(2, "0");
    const update = () => {
      const now = new Date();
      const y = now.getFullYear();
      const m = pad(now.getMonth() + 1);
      const d = pad(now.getDate());
      const hh = pad(now.getHours());
      const mm = pad(now.getMinutes());
      const ss = pad(now.getSeconds());
      setClockText(`${y}.${m}.${d} ${hh}:${mm}:${ss}`);
    };
    update();
    const timer = setInterval(update, 1000);
    return () => clearInterval(timer);
  }, []);

  const theme = useMemo(
    () => resolveDormitoryTheme(dormitoryType, dormitoryBuilding),
    [dormitoryType, dormitoryBuilding]
  );

  const formattedTerm = formatSemesterTerm(term);
  const termDisplay = year && formattedTerm ? `${year}학년도 ${formattedTerm}` : (year ? `${year}학년도` : "");

  return (
    <CardContainer $borderColor={theme.borderColor} $fullscreen={fullscreen}>
      {/* 위조 방지: 은은한 한글 워터마크 레이어 */}
      <WatermarkLayer aria-hidden="true">
        <WatermarkRow>
          인천대학교 생활원 • 모바일 사생증 • 인천대학교 생활원 • 모바일 사생증 • 인천대학교 생활원 • 모바일 사생증 •{" "}
        </WatermarkRow>
        <WatermarkRow $reverse>
          인천대학교 생활원 • 모바일 사생증 • 인천대학교 생활원 • 모바일 사생증 • 인천대학교 생활원 • 모바일 사생증 •{" "}
        </WatermarkRow>
        <WatermarkRow>
          인천대학교 생활원 • 모바일 사생증 • 인천대학교 생활원 • 모바일 사생증 • 인천대학교 생활원 • 모바일 사생증 •{" "}
        </WatermarkRow>
      </WatermarkLayer>

      {/* 상단 헤더: 대학/생활원 명칭 & 학기 */}
      <HeaderSection>
        <HeaderLeft>
          <SubHeading>인천대학교 생활원</SubHeading>
          <MainTitle>모바일 사생증</MainTitle>
        </HeaderLeft>
        {termDisplay ? <TermBadge>{termDisplay}</TermBadge> : null}
      </HeaderSection>

      {/* 본문 영역: 프로필 + 핵심 사생 정보 */}
      <CardBody $fullscreen={fullscreen}>
        <ProfileSection>
          <PhotoWrapper $fullscreen={fullscreen}>
            {photoSrc ? (
              <PhotoImg src={photoSrc} alt={`${studentName} 사생 증명사진`} />
            ) : (
              <PlaceholderPhoto>
                <User size={36} strokeWidth={1.5} color="var(--text-tertiary)" />
              </PlaceholderPhoto>
            )}
          </PhotoWrapper>

          <ProfileInfo>
            <NameRow>
              <StudentName $fullscreen={fullscreen}>{studentName}</StudentName>
              {englishName ? <EnglishName>{englishName}</EnglishName> : null}
            </NameRow>

            <MetaList>
              <MetaItem>
                <MetaKey>학번</MetaKey>
                <MetaVal>{studentId}</MetaVal>
              </MetaItem>
              <MetaItem>
                <MetaKey>학과</MetaKey>
                <MetaVal>{department}</MetaVal>
              </MetaItem>
              <MetaItem>
                <MetaKey>학년</MetaKey>
                <MetaVal>{grade}</MetaVal>
              </MetaItem>
            </MetaList>
          </ProfileInfo>
        </ProfileSection>

        {/* 핵심 사생 정보 박스: 기숙사 + 사생번호 + 입사 구분 */}
        <DetailBox $boxBg={theme.boxBg} $boxBorder={theme.boxBorder} $fullscreen={fullscreen}>
          <DetailHeader>
            <DetailLabel>기숙사</DetailLabel>
            <DormBadge $bg={theme.badgeBg} $text={theme.badgeText}>
              {dormitoryBuilding || dormitoryType || (theme.name !== "-" ? theme.name : "-")}
            </DormBadge>
          </DetailHeader>

          <DormNoRow>
            <DormNoLabel>사생번호</DormNoLabel>
            <DormNoValue $fullscreen={fullscreen}>{studentDormNo}</DormNoValue>
          </DormNoRow>

          <StatusRow>
            <StatusLabel>입사 구분</StatusLabel>
            <StatusValue>{status || "-"}</StatusValue>
          </StatusRow>
        </DetailBox>
      </CardBody>

      {/* 하단 풋터: 실시간 시계 & 보안 검증 표시 */}
      <FooterSection $fullscreen={fullscreen}>
        <SecurityIconWrapper>
          <Shield size={12} color="var(--text-tertiary)" />
        </SecurityIconWrapper>
        <ClockText $fullscreen={fullscreen}>{clockText || "—"}</ClockText>
      </FooterSection>
    </CardContainer>
  );
};

export default MobileDormitoryCard;

// ==================== Styled Components ====================

const watermarkFlow = keyframes`
  0% { transform: translateX(0); }
  100% { transform: translateX(-50%); }
`;

const CardContainer = styled.article<{ $borderColor: string; $fullscreen?: boolean }>`
  position: relative;
  width: 100%;
  max-width: ${({ $fullscreen }) => ($fullscreen ? "100%" : "380px")};
  height: ${({ $fullscreen }) => ($fullscreen ? "100%" : "auto")};
  flex: ${({ $fullscreen }) => ($fullscreen ? "1" : "initial")};
  background-color: var(--bg-base);
  border-radius: var(--radius-xl);
  border: 1.5px solid ${({ $borderColor }) => $borderColor};
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
  overflow: hidden;
  user-select: none;
  display: flex;
  flex-direction: column;
  justify-content: ${({ $fullscreen }) => ($fullscreen ? "space-between" : "flex-start")};
  margin: 0 auto;
  box-sizing: border-box;
`;

const WatermarkLayer = styled.div`
  position: absolute;
  inset: 0;
  pointer-events: none;
  overflow: hidden;
  opacity: 0.035;
  display: flex;
  flex-direction: column;
  justify-content: space-around;
  transform: rotate(-6deg) scale(1.1);
  z-index: 1;
`;

const WatermarkRow = styled.div<{ $reverse?: boolean }>`
  display: flex;
  width: 200%;
  ${typography.caption1}
  font-weight: 800;
  white-space: nowrap;
  color: var(--text-primary);
  animation: ${watermarkFlow} 24s linear infinite;
  animation-direction: ${({ $reverse }) => ($reverse ? "reverse" : "normal")};
`;

const HeaderSection = styled.header`
  position: relative;
  z-index: 2;
  padding: 16px 20px 14px 20px;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  border-bottom: 1px solid var(--border-default);
`;

const HeaderLeft = styled.div`
  display: flex;
  flex-direction: column;
`;

const SubHeading = styled.span`
  ${typography.caption1}
  color: var(--text-tertiary);
  font-weight: 500;
`;

const MainTitle = styled.h2`
  ${typography.label1}
  color: var(--text-primary);
  margin: 2px 0 0 0;
`;

const TermBadge = styled.span`
  ${typography.caption1}
  font-weight: 600;
  color: var(--text-secondary);
  background-color: var(--bg-muted);
  padding: 3px 8px;
  border-radius: var(--radius-full);
`;

const CardBody = styled.div<{ $fullscreen?: boolean }>`
  position: relative;
  z-index: 2;
  display: flex;
  flex-direction: column;
  ${({ $fullscreen }) =>
    $fullscreen &&
    `
    flex: 1;
    justify-content: center;
    gap: 12px;
  `}
`;

const ProfileSection = styled.section`
  position: relative;
  z-index: 2;
  padding: 16px 20px 14px 20px;
  display: flex;
  align-items: center;
  gap: 16px;
`;

const PhotoWrapper = styled.div<{ $fullscreen?: boolean }>`
  width: ${({ $fullscreen }) => ($fullscreen ? "100px" : "92px")};
  height: ${({ $fullscreen }) => ($fullscreen ? "130px" : "120px")};
  border-radius: var(--radius-md);
  overflow: hidden;
  border: 1px solid var(--border-default);
  background-color: var(--bg-subtle);
  flex-shrink: 0;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
`;

const PhotoImg = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const PlaceholderPhoto = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--bg-subtle);
`;

const ProfileInfo = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  min-width: 0;
  flex: 1;
`;

const NameRow = styled.div`
  display: flex;
  flex-direction: column;
`;

const StudentName = styled.h1<{ $fullscreen?: boolean }>`
  ${typography.title1}
  color: var(--text-primary);
  margin: 0;
  line-height: 1.25;
`;

const EnglishName = styled.span`
  ${typography.caption1}
  color: var(--text-tertiary);
  margin-top: 2px;
`;

const MetaList = styled.div`
  margin-top: 10px;
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const MetaItem = styled.div`
  ${typography.body2}
  display: flex;
  align-items: center;
  font-weight: 500;
`;

const MetaKey = styled.span`
  color: var(--text-tertiary);
  width: 34px;
  flex-shrink: 0;
  ${typography.caption1}
`;

const MetaVal = styled.span`
  color: var(--text-primary);
  font-weight: 600;
`;

const DetailBox = styled.div<{ $boxBg: string; $boxBorder: string; $fullscreen?: boolean }>`
  position: relative;
  z-index: 2;
  margin: ${({ $fullscreen }) => ($fullscreen ? "0 20px 20px 20px" : "0 20px 16px 20px")};
  padding: ${({ $fullscreen }) => ($fullscreen ? "16px 18px" : "14px 16px")};
  border-radius: var(--radius-lg);
  background-color: ${({ $boxBg }) => $boxBg};
  border: 1px solid ${({ $boxBorder }) => $boxBorder};
  display: flex;
  flex-direction: column;
  gap: ${({ $fullscreen }) => ($fullscreen ? "12px" : "10px")};
`;

const DetailHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const DetailLabel = styled.span`
  ${typography.caption1}
  color: var(--text-secondary);
  font-weight: 500;
`;

const DormBadge = styled.span<{ $bg: string; $text: string }>`
  ${typography.caption1}
  font-weight: 700;
  background-color: ${({ $bg }) => $bg};
  color: ${({ $text }) => $text};
  padding: 3px 8px;
  border-radius: var(--radius-sm);
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.06);
`;

const DormNoRow = styled.div`
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  padding-top: 8px;
  border-top: 1px solid var(--border-subtle);
`;

const DormNoLabel = styled.span`
  ${typography.caption1}
  font-weight: 600;
  color: var(--text-secondary);
`;

const DormNoValue = styled.span<{ $fullscreen?: boolean }>`
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  font-size: ${({ $fullscreen }) => ($fullscreen ? "22px" : "18px")};
  font-weight: 800;
  color: var(--text-primary);
  letter-spacing: 0.5px;
`;

const StatusRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  ${typography.caption1}
`;

const StatusLabel = styled.span`
  color: var(--text-secondary);
`;

const StatusValue = styled.span`
  font-weight: 600;
  color: var(--text-primary);
`;

const FooterSection = styled.footer<{ $fullscreen?: boolean }>`
  position: relative;
  z-index: 2;
  padding: ${({ $fullscreen }) => ($fullscreen ? "12px 20px" : "10px 20px")};
  background-color: var(--bg-subtle);
  border-top: 1px solid var(--border-default);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
`;

const SecurityIconWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
`;

const ClockText = styled.time<{ $fullscreen?: boolean }>`
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  ${typography.caption1}
  font-weight: 600;
  color: var(--text-secondary);
  letter-spacing: 0.3px;
`;
