import React, { useState, useEffect, useMemo } from "react";
import styled, { keyframes } from "styled-components";
import { User } from "lucide-react";

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
      badgeBg: "var(--text-success)",
      badgeText: "var(--text-inverse)",
      boxBg: "var(--bg-subtle)",
      boxBorder: "var(--border-default)",
    };
  }

  // 제3기숙사 (BTL) -> 인디고 / 보라
  if (combined.includes("04") || combined.includes("05") || combined.includes("3기숙사") || combined.includes("제3")) {
    return {
      name: "제3기숙사(BTL)",
      badgeBg: "var(--interactive-primary)",
      badgeText: "var(--text-inverse)",
      boxBg: "var(--bg-subtle)",
      boxBorder: "var(--border-default)",
    };
  }

  // 제1기숙사 -> INU 시그니처 블루
  return {
    name: "제1기숙사",
    badgeBg: "var(--interactive-primary)",
    badgeText: "var(--text-inverse)",
    boxBg: "var(--bg-subtle)",
    boxBorder: "var(--border-default)",
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
  fullscreen = true,
}) => {
  const [clockText, setClockText] = useState<string>("");

  useEffect(() => {
    const pad = (n: number, width = 2) => String(n).padStart(width, "0");
    const update = () => {
      const now = new Date();
      const y = now.getFullYear();
      const m = pad(now.getMonth() + 1);
      const d = pad(now.getDate());
      const hh = pad(now.getHours());
      const mm = pad(now.getMinutes());
      const ss = pad(now.getSeconds());
      const ms = pad(now.getMilliseconds(), 3);
      setClockText(`${y}.${m}.${d} ${hh}:${mm}:${ss}.${ms}`);
    };
    update();
    const timer = setInterval(update, 33);
    return () => clearInterval(timer);
  }, []);

  const theme = useMemo(
    () => resolveDormitoryTheme(dormitoryType, dormitoryBuilding),
    [dormitoryType, dormitoryBuilding]
  );

  const formattedTerm = formatSemesterTerm(term);
  const termDisplay = year && formattedTerm ? `${year}학년도 ${formattedTerm}` : (year ? `${year}학년도` : "");

  return (
    <CardContainer $fullscreen={fullscreen}>
      {/* 위조 방지: 한글 워터마크 레이어 (회색 농도 강화) */}
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
        <WatermarkRow $reverse>
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
          <PhotoWrapper>
            {photoSrc ? (
              <PhotoImg src={photoSrc} alt={`${studentName} 사생 증명사진`} />
            ) : (
              <PlaceholderPhoto>
                <User size={44} strokeWidth={1.5} color="var(--text-tertiary)" />
              </PlaceholderPhoto>
            )}
          </PhotoWrapper>

          <ProfileInfo>
            <NameRow>
              <StudentName>{studentName}</StudentName>
              {englishName ? <EnglishName>{englishName}</EnglishName> : null}
            </NameRow>

            <MetaList>
              <MetaItem>
                <MetaKey>학번</MetaKey>
                <MetaVal className="font-mono">{studentId}</MetaVal>
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
        <DetailBox $boxBg={theme.boxBg} $boxBorder={theme.boxBorder}>
          <DetailHeader>
            <DetailLabel>기숙사</DetailLabel>
            <DormBadge $bg={theme.badgeBg} $text={theme.badgeText}>
              {dormitoryBuilding || dormitoryType || (theme.name !== "-" ? theme.name : "-")}
            </DormBadge>
          </DetailHeader>

          <DormNoRow>
            <DormNoLabel>사생번호</DormNoLabel>
            <DormNoValue>{studentDormNo}</DormNoValue>
          </DormNoRow>

          <StatusRow>
            <StatusLabel>입사 구분</StatusLabel>
            <StatusValue>{status || "-"}</StatusValue>
          </StatusRow>
        </DetailBox>
      </CardBody>

      {/* 하단 풋터: 밀리초 실시간 시계 */}
      <FooterSection>
        <ClockText>{clockText || "—"}</ClockText>
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

const CardContainer = styled.article<{ $fullscreen?: boolean }>`
  position: relative;
  width: 100%;
  max-width: 420px;
  height: 100%;
  min-height: ${({ $fullscreen }) => ($fullscreen ? "100%" : "540px")};
  flex: 1;
  background-color: var(--bg-base);
  border-radius: var(--radius-xl);
  border: 1px solid var(--border-default);
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.05);
  overflow: hidden;
  user-select: none;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  margin: 0 auto;
  box-sizing: border-box;
`;

const WatermarkLayer = styled.div`
  position: absolute;
  inset: 0;
  pointer-events: none;
  overflow: hidden;
  opacity: 0.12;
  display: flex;
  flex-direction: column;
  justify-content: space-around;
  transform: rotate(-6deg) scale(1.1);
  z-index: 1;
`;

const WatermarkRow = styled.div<{ $reverse?: boolean }>`
  display: flex;
  width: 200%;
  font-size: 14px;
  font-weight: 800;
  white-space: nowrap;
  color: var(--text-secondary);
  animation: ${watermarkFlow} 24s linear infinite;
  animation-direction: ${({ $reverse }) => ($reverse ? "reverse" : "normal")};
`;

const HeaderSection = styled.header`
  position: relative;
  z-index: 2;
  padding: 18px 22px 16px 22px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid var(--border-default);
`;

const HeaderLeft = styled.div`
  display: flex;
  flex-direction: column;
`;

const SubHeading = styled.span`
  font-size: 13px;
  color: var(--text-tertiary);
  font-weight: 600;
  letter-spacing: -0.2px;
`;

const MainTitle = styled.h2`
  font-size: 20px;
  font-weight: 800;
  color: var(--text-primary);
  margin: 2px 0 0 0;
  letter-spacing: -0.4px;
`;

const TermBadge = styled.span`
  font-size: 13px;
  font-weight: 700;
  color: var(--text-secondary);
  background-color: var(--bg-muted);
  padding: 5px 12px;
  border-radius: var(--radius-full);
  letter-spacing: -0.2px;
`;

const CardBody = styled.div<{ $fullscreen?: boolean }>`
  position: relative;
  z-index: 2;
  display: flex;
  flex-direction: column;
  flex: 1;
  justify-content: space-around;
  padding: 8px 0;
`;

const ProfileSection = styled.section`
  position: relative;
  z-index: 2;
  padding: 14px 22px;
  display: flex;
  align-items: center;
  gap: 18px;
`;

const PhotoWrapper = styled.div`
  width: 116px;
  height: 152px;
  border-radius: var(--radius-md);
  overflow: hidden;
  border: 1px solid var(--border-default);
  background-color: var(--bg-subtle);
  flex-shrink: 0;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
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
  margin-bottom: 8px;
`;

const StudentName = styled.h1`
  font-size: 26px;
  font-weight: 800;
  color: var(--text-primary);
  margin: 0;
  line-height: 1.2;
  letter-spacing: -0.5px;
`;

const EnglishName = styled.span`
  font-size: 13px;
  font-weight: 500;
  color: var(--text-tertiary);
  margin-top: 3px;
  letter-spacing: 0.2px;
`;

const MetaList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const MetaItem = styled.div`
  display: flex;
  align-items: center;
  font-size: 15px;
  font-weight: 500;
`;

const MetaKey = styled.span`
  color: var(--text-tertiary);
  width: 38px;
  flex-shrink: 0;
  font-size: 13px;
  font-weight: 600;
`;

const MetaVal = styled.span`
  color: var(--text-primary);
  font-weight: 600;

  &.font-mono {
    font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
    font-weight: 700;
    letter-spacing: 0.3px;
  }
`;

const DetailBox = styled.div<{ $boxBg: string; $boxBorder: string }>`
  position: relative;
  z-index: 2;
  margin: 0 22px;
  padding: 18px 20px;
  border-radius: var(--radius-lg);
  background-color: ${({ $boxBg }) => $boxBg};
  border: 1px solid ${({ $boxBorder }) => $boxBorder};
  display: flex;
  flex-direction: column;
  gap: 14px;
`;

const DetailHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const DetailLabel = styled.span`
  font-size: 14px;
  color: var(--text-secondary);
  font-weight: 600;
`;

const DormBadge = styled.span<{ $bg: string; $text: string }>`
  font-size: 14px;
  font-weight: 700;
  background-color: ${({ $bg }) => $bg};
  color: ${({ $text }) => $text};
  padding: 4px 12px;
  border-radius: var(--radius-sm);
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.06);
`;

const DormNoRow = styled.div`
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  padding-top: 10px;
  border-top: 1px solid var(--border-default);
`;

const DormNoLabel = styled.span`
  font-size: 14px;
  font-weight: 600;
  color: var(--text-secondary);
`;

const DormNoValue = styled.span`
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  font-size: 28px;
  font-weight: 900;
  color: var(--text-primary);
  letter-spacing: 0.5px;
`;

const StatusRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 14px;
`;

const StatusLabel = styled.span`
  color: var(--text-secondary);
  font-weight: 500;
`;

const StatusValue = styled.span`
  font-weight: 700;
  color: var(--text-primary);
`;

const FooterSection = styled.footer`
  position: relative;
  z-index: 2;
  padding: 16px 22px;
  background-color: var(--bg-subtle);
  border-top: 1px solid var(--border-default);
  display: flex;
  align-items: center;
  justify-content: center;
`;

const ClockText = styled.time`
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  font-size: 15px;
  font-weight: 700;
  color: var(--text-primary);
  letter-spacing: 0.5px;
`;
