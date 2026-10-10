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
  roomNumber?: string;
  bedNumber?: string;
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
 * 사생번호 뒤 4자리(3자리 호수, 1자리 침대번호) 파싱
 * 예: 24013041 -> room: 304호, bed: 1번 침대
 */
export function parseDormRoomAndBed(studentDormNo?: string): { room: string; bed: string } | null {
  if (!studentDormNo) return null;
  const clean = studentDormNo.trim();
  if (clean.length < 4 || clean === "-") return null;

  const last4 = clean.slice(-4);
  const roomPart = last4.slice(0, 3);
  const bedPart = last4.slice(3);

  if (!roomPart || !bedPart) return null;

  return {
    room: `${roomPart}호`,
    bed: `${bedPart}번 침대`,
  };
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

  // 제2기숙사 (직영 / BTL / A동 / B동) -> 그린
  if (
    combined.includes("02") ||
    combined.includes("03") ||
    combined.includes("2기숙사") ||
    combined.includes("제2") ||
    combined.includes("A동") ||
    combined.includes("B동")
  ) {
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
  roomNumber,
  bedNumber,
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

  const dormitoryDisplayName = useMemo(() => {
    const rawType = dormitoryType && dormitoryType !== "-" ? dormitoryType : "";
    const rawBuilding = dormitoryBuilding && dormitoryBuilding !== "-" ? dormitoryBuilding : "";

    // 1) 둘 다 있는 경우: "제2기숙사 A동"
    if (rawType && rawBuilding) {
      if (rawType.includes(rawBuilding)) return rawType;
      return `${rawType} ${rawBuilding}`;
    }
    // 2) 건물명만 있는 경우 ("A동" -> "제2기숙사 A동")
    if (rawBuilding) {
      if (rawBuilding.includes("A동") || rawBuilding.includes("B동")) {
        return `제2기숙사 ${rawBuilding}`;
      }
      return rawBuilding;
    }
    // 3) 기숙사명만 있는 경우
    if (rawType) return rawType;
    return theme.name !== "-" ? theme.name : "-";
  }, [dormitoryType, dormitoryBuilding, theme.name]);

  const roomBedInfo = useMemo(() => {
    const parsed = parseDormRoomAndBed(studentDormNo);
    if (parsed) return parsed;
    if (roomNumber && bedNumber) {
      const roomFormatted = roomNumber.endsWith("호") ? roomNumber : `${roomNumber}호`;
      const bedFormatted = bedNumber.endsWith("번 침대") ? bedNumber : `${bedNumber}번 침대`;
      return { room: roomFormatted, bed: bedFormatted };
    }
    return null;
  }, [studentDormNo, roomNumber, bedNumber]);

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
                <User size={40} strokeWidth={1.5} color="var(--text-tertiary)" />
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

        {/* 핵심 사생 정보 박스: 기숙사 + 사생번호 + 배정 호실/침대 + 입사 구분 */}
        <DetailBox $boxBg={theme.boxBg} $boxBorder={theme.boxBorder}>
          <DetailHeader>
            <DetailLabel>기숙사</DetailLabel>
            <DormBadge $bg={theme.badgeBg} $text={theme.badgeText}>
              {dormitoryDisplayName}
            </DormBadge>
          </DetailHeader>

          <DormNoRow>
            <DormNoLabel>사생번호</DormNoLabel>
            <DormNoValue>{studentDormNo}</DormNoValue>
          </DormNoRow>

          {roomBedInfo ? (
            <RoomBedRow>
              <RoomBedLabel>배정 호실</RoomBedLabel>
              <RoomBedValue>
                <RoomBadge>{roomBedInfo.room}</RoomBadge>
                <BedBadge>{roomBedInfo.bed}</BedBadge>
              </RoomBedValue>
            </RoomBedRow>
          ) : null}

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
  max-height: 100%;
  flex: 1;
  background-color: var(--bg-base);
  border-radius: var(--radius-xl);
  border: 1px solid var(--border-default);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
  overflow: hidden;
  user-select: none;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  margin: 0 auto;
  box-sizing: border-box;
  min-height: 0;
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
  padding: clamp(12px, 1.8vh, 18px) clamp(16px, 4vw, 22px);
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid var(--border-default);
  flex-shrink: 0;
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
  font-size: clamp(18px, 4.5vw, 20px);
  font-weight: 800;
  color: var(--text-primary);
  margin: 2px 0 0 0;
  letter-spacing: -0.4px;
`;

const TermBadge = styled.span`
  font-size: 12px;
  font-weight: 700;
  color: var(--text-secondary);
  background-color: var(--bg-muted);
  padding: 4px 10px;
  border-radius: var(--radius-full);
  letter-spacing: -0.2px;
`;

const CardBody = styled.div<{ $fullscreen?: boolean }>`
  position: relative;
  z-index: 2;
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
  justify-content: space-evenly;
  padding: 4px 0;
`;

const ProfileSection = styled.section`
  position: relative;
  z-index: 2;
  padding: 8px clamp(16px, 4vw, 22px);
  display: flex;
  align-items: center;
  gap: clamp(12px, 3.5vw, 18px);
  flex-shrink: 0;
`;

const PhotoWrapper = styled.div`
  width: clamp(96px, 26vw, 114px);
  height: clamp(126px, 34vw, 148px);
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
  margin-bottom: 6px;
`;

const StudentName = styled.h1`
  font-size: clamp(22px, 5.5vw, 26px);
  font-weight: 800;
  color: var(--text-primary);
  margin: 0;
  line-height: 1.2;
  letter-spacing: -0.5px;
`;

const EnglishName = styled.span`
  font-size: 12px;
  font-weight: 500;
  color: var(--text-tertiary);
  margin-top: 2px;
  letter-spacing: 0.2px;
`;

const MetaList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const MetaItem = styled.div`
  display: flex;
  align-items: center;
  font-size: clamp(13px, 3.5vw, 14.5px);
  font-weight: 500;
`;

const MetaKey = styled.span`
  color: var(--text-tertiary);
  width: 36px;
  flex-shrink: 0;
  font-size: 12px;
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
  margin: 0 clamp(16px, 4vw, 22px);
  padding: clamp(12px, 2vh, 16px) clamp(16px, 3.5vw, 20px);
  border-radius: var(--radius-lg);
  background-color: ${({ $boxBg }) => $boxBg};
  border: 1px solid ${({ $boxBorder }) => $boxBorder};
  display: flex;
  flex-direction: column;
  gap: clamp(8px, 1.4vh, 12px);
  flex-shrink: 0;
`;

const DetailHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const DetailLabel = styled.span`
  font-size: 13px;
  color: var(--text-secondary);
  font-weight: 600;
`;

const DormBadge = styled.span<{ $bg: string; $text: string }>`
  font-size: 13px;
  font-weight: 700;
  background-color: ${({ $bg }) => $bg};
  color: ${({ $text }) => $text};
  padding: 3px 10px;
  border-radius: var(--radius-sm);
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.06);
`;

const DormNoRow = styled.div`
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  padding-top: 8px;
  border-top: 1px solid var(--border-default);
`;

const DormNoLabel = styled.span`
  font-size: 13px;
  font-weight: 600;
  color: var(--text-secondary);
`;

const DormNoValue = styled.span`
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  font-size: clamp(24px, 6vw, 28px);
  font-weight: 900;
  color: var(--text-primary);
  letter-spacing: 0.5px;
`;

const RoomBedRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 8px;
  border-top: 1px dashed var(--border-default);
`;

const RoomBedLabel = styled.span`
  font-size: 13px;
  font-weight: 600;
  color: var(--text-secondary);
`;

const RoomBedValue = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
`;

const RoomBadge = styled.span`
  font-size: 13px;
  font-weight: 700;
  color: var(--text-brand);
  background-color: var(--bg-brand);
  padding: 2px 8px;
  border-radius: var(--radius-sm);
  border: 1px solid var(--border-brand-subtle);
`;

const BedBadge = styled.span`
  font-size: 13px;
  font-weight: 700;
  color: var(--text-primary);
  background-color: var(--bg-muted);
  padding: 2px 8px;
  border-radius: var(--radius-sm);
  border: 1px solid var(--border-default);
`;

const StatusRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 13px;
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
  padding: clamp(12px, 1.8vh, 16px) clamp(16px, 4vw, 22px);
  background-color: var(--bg-subtle);
  border-top: 1px solid var(--border-default);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
`;

const ClockText = styled.time`
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  font-size: clamp(13px, 3.5vw, 15px);
  font-weight: 700;
  color: var(--text-primary);
  letter-spacing: 0.5px;
`;
