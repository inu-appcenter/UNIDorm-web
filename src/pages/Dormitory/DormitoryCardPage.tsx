import { useState, useEffect } from "react";
import styled from "styled-components";
import { useSetHeader } from "@/hooks/useSetHeader";
import {
  DormitoryStudentInfo,
  parseDormitoryStudentInfo,
} from "@/utils/ssvParser";
import { secureStorage } from "@/utils/secureStorage";
import { MobileDormitoryCard } from "@/components/portal/MobileDormitoryCard";
import { MOBILE_PAGE_GUTTER } from "@/styles/intipResponsive";

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
      return "입사";
    case "02":
      return "퇴사";
    case "03":
      return "중도퇴사";
    default:
      return trimmed;
  }
}

export default function MobileDormitoryCardPage() {
  useSetHeader({
    title: "모바일 사생증",
  });

  const [dormInfo, setDormInfo] = useState<DormitoryStudentInfo | null>(null);
  const [fallbackAcademic, setFallbackAcademic] = useState<any | null>(null);

  useEffect(() => {
    let isMounted = true;
    const fetchCached = async () => {
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

        if (!isMounted) return;

        if (academicParsed) {
          setFallbackAcademic(academicParsed);
        }

        if (cached) {
          const restored = parseDormitoryStudentInfo(cached);
          const hasValidRf = restored.rawFields && Object.keys(restored.rawFields).length > 0;
          if ((!restored.studentName || !hasValidRf) && academicParsed) {
            setDormInfo({
              ...academicParsed,
              ...restored,
              studentName: restored.studentName || academicParsed.studentName,
              studentId: restored.studentId || academicParsed.studentId,
              profile: restored.profile || academicParsed.profile,
              rawFields: hasValidRf ? restored.rawFields : academicParsed.rawFields,
            });
          } else {
            setDormInfo(restored);
          }
        } else if (academicParsed) {
          setDormInfo(academicParsed);
        }
      } catch (e) {
        console.error("사생정보 로드 실패", e);
      }
    };

    void fetchCached();
    return () => {
      isMounted = false;
    };
  }, []);

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
    profile?.department ||
    rawFields?.deptNm ||
    rawFields?.hgNm ||
    fallbackAcademic?.profile?.department ||
    fallbackAcademic?.departmentName ||
    fallbackAcademic?.rawFields?.deptNm ||
    fallbackAcademic?.rawFields?.hgNm ||
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
    rawFields?.phtFile ||
    fallbackAcademic?.photoBase64 ||
    fallbackAcademic?.profile?.photoBase64 ||
    fallbackAcademic?.rawFields?.phtFile2 ||
    fallbackAcademic?.rawFields?.phtFile1 ||
    fallbackAcademic?.rawFields?.phtFile
  );

  const rawDormGbn = rawFields?.dormGbn || profile?.dormitoryType || "";
  const mappedDormName = mapDormitoryType(rawDormGbn);
  const dormitoryType = mappedDormName || profile?.dormitoryBuilding || rawFields?.dormBdNm || "-";
  const dormitoryBuilding = profile?.dormitoryBuilding || rawFields?.dormBdNm || rawFields?.dormBdCd || mappedDormName || "-";
  const studentDormNo = profile?.studentDormNo || rawFields?.domstuNo || rawFields?.domStuNo || "-";

  const year = profile?.year || dormInfo?.appliedYear || rawFields?.yy || "";
  const term = profile?.term || dormInfo?.appliedSemester || rawFields?.tmGbn || "";
  const rawStatus = dormInfo?.inOutList?.[0]?.status || rawFields?.dormLeavdormGbn || "";
  const status = rawStatus ? mapInOutStatus(rawStatus) : "-";

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
          dormitoryType={dormitoryType}
          dormitoryBuilding={dormitoryBuilding || mappedDormName}
          studentDormNo={studentDormNo}
          year={year}
          term={term}
          status={status}
        />
      </CardWrapper>
    </PageContainer>
  );
}

const PageContainer = styled.div`
  width: 100%;
  max-width: 440px;
  flex: 1;
  height: 100%;
  max-height: calc(100dvh - 70px - var(--safe-area-top, 0px) - var(--safe-area-bottom, 0px));
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  padding: 8px ${MOBILE_PAGE_GUTTER} calc(12px + var(--safe-area-bottom, 0px));
  box-sizing: border-box;
  overflow: hidden;
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
