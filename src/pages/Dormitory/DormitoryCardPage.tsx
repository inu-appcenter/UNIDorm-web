import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import { useSetHeader } from "@/hooks/useSetHeader";
import {
  DormitoryStudentInfo,
  parseDormitoryStudentInfo,
} from "@/utils/ssvParser";
import { secureStorage } from "@/utils/secureStorage";
import { MobileDormitoryCard } from "@/components/portal/MobileDormitoryCard";
import { MOBILE_PAGE_GUTTER } from "@/styles/intipResponsive";
import { PATHS } from "@/constants/paths";
import { ChevronRight } from "lucide-react";
import PortalSyncOnboarding from "@/components/portal/PortalSyncOnboarding";

const STORAGE_KEY_DORMITORY_DATA = "portal_dormitory_student_info";

function toImageSrc(base64?: string): string | null {
  if (!base64 || typeof base64 !== "string") return null;
  const clean = base64.replace(/\s/g, "");
  if (!clean) return null;
  if (clean.startsWith("data:")) return clean;
  if (clean.startsWith("Qk")) return `data:image/bmp;base64,${clean}`;
  if (clean.startsWith("/9j/")) return `data:image/jpeg;base64,${clean}`;
  if (clean.startsWith("iVBOR")) return `data:image/png;base64,${clean}`;
  return `data:image/bmp;base64,${clean}`;
}

function mapDormitoryType(code?: string): string {
  if (!code) return "";
  const trimmed = code.trim();
  switch (trimmed) {
    case "01":
      return "제1기숙사";
    case "02":
      return "제2기숙사";
    case "03":
      return "제2기숙사(BTL)";
    case "04":
      return "제3기숙사";
    case "05":
      return "제3기숙사(BTL)";
    default:
      return trimmed;
  }
}

function mapGrade(val?: string): string {
  if (!val) return "";
  const trimmed = val.trim();
  if (trimmed.endsWith("학년")) return trimmed;
  if (/^\d+$/.test(trimmed)) return `${trimmed}학년`;
  return trimmed;
}

function mapInOutStatus(code?: string): string {
  if (!code) return "";
  const trimmed = code.trim();
  switch (trimmed) {
    case "01":
      return "정규입사";
    case "02":
      return "정규퇴사";
    case "03":
      return "중도퇴사";
    default:
      return trimmed;
  }
}

export default function MobileDormitoryCardPage() {
  const navigate = useNavigate();

  useSetHeader({
    title: "모바일 사생증",
  });

  const [isInitialLoading, setIsInitialLoading] = useState<boolean>(true);
  const [dormInfo, setDormInfo] = useState<DormitoryStudentInfo | null>(null);
  const [fallbackAcademic, setFallbackAcademic] = useState<any | null>(null);

  const fetchCached = useCallback(async () => {
    setIsInitialLoading(true);
    try {
      const cached = await secureStorage.getItem<unknown>(STORAGE_KEY_DORMITORY_DATA);
      const academicCached = await secureStorage.getItem<unknown>("portal_student_info");
      let academicParsed: any = null;
      if (academicCached) {
        try {
          academicParsed = parseDormitoryStudentInfo(academicCached);
        } catch (err) {
          void err;
        }
      }

      if (academicParsed) {
        setFallbackAcademic(academicParsed);
      }

      if (cached) {
        const restored = parseDormitoryStudentInfo(cached);
        const hasValidRf = Boolean(restored.rawFields && Object.keys(restored.rawFields).length > 0);
        const academicDept =
          academicParsed?.profile?.department ||
          academicParsed?.departmentName ||
          academicParsed?.department ||
          "";

        if ((!restored.studentName || !hasValidRf) && academicParsed) {
          const mergedProfile = {
            ...(academicParsed.profile || {}),
            ...(restored.profile || {}),
            department: restored.profile?.department || academicDept,
          };
          setDormInfo({
            ...academicParsed,
            ...restored,
            studentName: restored.studentName || academicParsed.studentName,
            studentId: restored.studentId || academicParsed.studentId,
            department: restored.department || academicDept,
            departmentName: restored.departmentName || academicDept,
            profile: mergedProfile,
            rawFields: hasValidRf ? restored.rawFields : academicParsed.rawFields,
          });
        } else {
          if (academicParsed && (!restored.profile?.department || !restored.department)) {
            const enrichedProfile = restored.profile
              ? {
                  ...restored.profile,
                  department: restored.profile.department || academicDept,
                }
              : restored.profile;
            setDormInfo({
              ...restored,
              profile: enrichedProfile,
              department: restored.department || academicDept,
              departmentName: restored.departmentName || academicDept,
            });
          } else {
            setDormInfo(restored);
          }
        }
      } else if (academicParsed) {
        setDormInfo(academicParsed);
      }
    } catch (e) {
      console.error("사생정보 로드 실패", e);
    } finally {
      setIsInitialLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchCached();
  }, [fetchCached]);

  const profile = dormInfo?.profile;
  const rawFields = dormInfo?.rawFields;

  const studentName =
    dormInfo?.studentName ||
    profile?.name ||
    rawFields?.korNm ||
    rawFields?.nm ||
    fallbackAcademic?.studentName ||
    fallbackAcademic?.profile?.name ||
    fallbackAcademic?.rawFields?.korNm ||
    fallbackAcademic?.rawFields?.nm ||
    "-";

  const englishName =
    profile?.englishName ||
    rawFields?.engNm ||
    fallbackAcademic?.profile?.englishName ||
    fallbackAcademic?.rawFields?.engNm ||
    "";

  const studentId =
    profile?.studentId ||
    dormInfo?.studentId ||
    rawFields?.persNo ||
    rawFields?.stuno ||
    fallbackAcademic?.studentId ||
    fallbackAcademic?.profile?.studentId ||
    fallbackAcademic?.rawFields?.persNo ||
    fallbackAcademic?.rawFields?.stuno ||
    "-";

  const department =
    dormInfo?.department ||
    dormInfo?.departmentName ||
    profile?.department ||
    rawFields?.deptNm ||
    rawFields?.deptKorNm ||
    rawFields?.hgNm ||
    fallbackAcademic?.department ||
    fallbackAcademic?.departmentName ||
    fallbackAcademic?.profile?.department ||
    fallbackAcademic?.rawFields?.deptNm ||
    fallbackAcademic?.rawFields?.deptKorNm ||
    fallbackAcademic?.rawFields?.hgNm ||
    fallbackAcademic?.rawFields?.sustNm ||
    fallbackAcademic?.rawFields?.dpmjNm ||
    "-";

  const rawGrade =
    profile?.grade ||
    rawFields?.hySeqGbn ||
    fallbackAcademic?.profile?.grade ||
    fallbackAcademic?.grade ||
    fallbackAcademic?.rawFields?.hySeqGbn ||
    "";
  const grade = mapGrade(rawGrade) || "-";

  const photoSrc = toImageSrc(
    dormInfo?.photoBase64 ||
    profile?.photoBase64 ||
    rawFields?.phtFile ||
    fallbackAcademic?.photoBase64 ||
    fallbackAcademic?.profile?.photoBase64 ||
    fallbackAcademic?.rawFields?.phtFile2 ||
    fallbackAcademic?.rawFields?.phtFile1 ||
    fallbackAcademic?.rawFields?.phtFile
  );

  const rawDormGbn = profile?.dormitoryType || rawFields?.dormGbn || dormInfo?.inOutList?.[0]?.dormitoryType || "";
  const mappedDormName = mapDormitoryType(rawDormGbn);
  const rawDormBd = profile?.dormitoryBuilding || rawFields?.dormBdNm || rawFields?.dormBdCd || dormInfo?.dormitoryBuilding || "";

  // 건물명이 "A동"이고 기숙사 구분이 비어있거나 "02"/"03"인 경우 제2기숙사 매핑 보완
  const resolvedDormType =
    mappedDormName ||
    (rawDormBd.includes("A동") || rawDormBd.includes("B동") ? "제2기숙사" : "") ||
    "-";
  const resolvedDormBuilding = rawDormBd || "";

  const studentDormNo =
    profile?.studentDormNo ||
    dormInfo?.studentDormNo ||
    dormInfo?.inOutList?.[0]?.studentDormNo ||
    rawFields?.domstuNo ||
    rawFields?.domStuNo ||
    "-";

  const year = profile?.year || dormInfo?.appliedYear || dormInfo?.inOutList?.[0]?.year || rawFields?.yy || "";
  const term = profile?.term || dormInfo?.appliedSemester || dormInfo?.inOutList?.[0]?.term || rawFields?.tmGbn || "";
  const roomNumber = dormInfo?.roomNumber || rawFields?.roomNo || rawFields?.dormRoomNo || "";
  const bedNumber = dormInfo?.bedNumber || rawFields?.bedNo || rawFields?.dormBedNo || "";
  const rawStatus = dormInfo?.status || dormInfo?.inOutList?.[0]?.status || rawFields?.dormLeavdormGbn || "";
  const status = rawStatus ? mapInOutStatus(rawStatus) : "-";

  const hasValidData = Boolean(
    (dormInfo && (dormInfo.studentId || dormInfo.studentName || dormInfo.profile?.studentId)) ||
    (fallbackAcademic && (fallbackAcademic.studentId || fallbackAcademic.studentName || fallbackAcademic.profile?.studentId))
  );

  if (!isInitialLoading && !hasValidData) {
    return (
      <PageContainer as="main" $isScrollable>
        <PortalSyncOnboarding onSuccess={fetchCached} />
      </PageContainer>
    );
  }

  return (
    <PageContainer as="main">
      <CardWrapper as="section">
        <MobileDormitoryCard
          fullscreen
          studentName={studentName}
          englishName={englishName}
          studentId={studentId}
          department={department}
          grade={grade}
          photoSrc={photoSrc}
          dormitoryType={resolvedDormType}
          dormitoryBuilding={resolvedDormBuilding}
          studentDormNo={studentDormNo}
          roomNumber={roomNumber}
          bedNumber={bedNumber}
          year={year}
          term={term}
          status={status}
        />
      </CardWrapper>

      <BottomButtonWrapper>
        <DormitoryInfoButton
          type="button"
          onClick={() => navigate(PATHS.DORMITORY_INFO)}
        >
          <span>사생정보조회(학생)</span>
          <ChevronRight size={18} color="var(--interactive-primary, #3182F6)" />
        </DormitoryInfoButton>
      </BottomButtonWrapper>
    </PageContainer>
  );
}

const PageContainer = styled.div<{ $isScrollable?: boolean }>`
  width: 100%;
  max-width: 440px;
  flex: 1;
  height: 100%;
  max-height: ${(props) =>
    props.$isScrollable
      ? "none"
      : "calc(100dvh - 70px - var(--safe-area-top, 0px) - var(--safe-area-bottom, 0px))"};
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  padding: 8px ${MOBILE_PAGE_GUTTER} calc(12px + var(--safe-area-bottom, 0px));
  box-sizing: border-box;
  overflow-y: ${(props) => (props.$isScrollable ? "auto" : "hidden")};
  overflow-x: hidden;
  min-height: 0;

  @media (min-width: 768px) {
    max-height: none;
    min-height: 600px;
    padding: 20px 0 calc(20px + var(--safe-area-bottom, 0px));
  }
`;

const CardWrapper = styled.section`
  width: 100%;
  height: 100%;
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 0;
  overflow: hidden;
`;

const BottomButtonWrapper = styled.div`
  width: 100%;
  padding-top: 10px;
  flex-shrink: 0;
`;

const DormitoryInfoButton = styled.button`
  width: 100%;
  height: 52px;
  background: #ffffff;
  border: 1px solid #e5e8eb;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 18px;
  font-size: 15px;
  font-weight: 700;
  color: #191f28;
  cursor: pointer;
  user-select: none;
  transition: background-color 0.15s ease, transform 0.15s ease;

  &:hover {
    background: #f9fafb;
  }

  &:active {
    transform: scale(0.99);
    background: #f2f4f6;
  }
`;
