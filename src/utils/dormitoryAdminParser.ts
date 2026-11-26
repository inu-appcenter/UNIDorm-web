import { INU_DEPARTMENT_MAP, parseNexacroDatasets } from "./ssvParser";

export type DormitoryAdminDatasetType = "RESIDENT" | "APPLICATION";

export interface DormitoryAdminErpSession {
  userGbn: string;
  userGbnNm: string;
  persNo: string;
  isStudentRole: boolean;
}

export interface DormitoryAdminSnapshotMeta {
  id: string;
  datasetType: DormitoryAdminDatasetType;
  year: string;
  term: string;
  dormGbn: string;
  syncedAt: string;
  totalCount: number;
  erpUserGbn: string;
  erpRoleName: string;
  endpoint: string;
}

/**
 * 로컬 IndexedDB에 저장되는 정제된 기숙사 사생/입사신청 레코드.
 * 민감정보(주민번호, 계좌번호, 증명사진 원본, 장애등급, 보호자 연락처, 본가 상세주소)는
 * 파싱 단계에서 제외하며 저장하지 않습니다.
 */
export interface DormitoryAdminRecord {
  uid: string;
  snapshotId: string;
  datasetType: DormitoryAdminDatasetType;

  // 공통 학생·학적 정보
  studentId: string;
  name: string;
  englishName: string;
  gender: string;
  nationality: string;
  collegeName: string;
  departmentName: string;
  majorName: string;
  grade: string;
  year: string;
  term: string;
  dormitoryType: string;
  dormitoryTypeName: string;
  phoneNumber: string;
  email: string;

  // 사생정보조회(DS_DMTY209) 전용 필드
  dormitoryBuilding: string;
  studentDormNo: string;
  roomNumber: string;
  bedNumber: string;
  roomType: string;
  mealType: string;
  checkInDate: string;
  checkOutDate: string;
  residentStatus: string;
  meritPoints: number;
  demeritPoints: number;

  // 입사신청(DS_DMTY101) 전용 필드
  seq: string;
  applyType: string;
  applyStatus: string;
  stayPeriod: string;
  preferredRoomType: string;
  applyDate: string;
  smokingYn: string;
  installmentYn: string;
  priorityTarget: string;
  areaScore: string;
  remark: string;
}

export interface ParsedAdminDormitoryResult {
  meta: DormitoryAdminSnapshotMeta;
  records: DormitoryAdminRecord[];
  erpSession: DormitoryAdminErpSession;
}

export interface ParseAdminDormitoryOptions {
  datasetType: DormitoryAdminDatasetType;
  year: string;
  term: string;
  dormGbn?: string;
  endpoint: string;
  syncedAt?: string;
}

const DEFAULT_DORM_TYPE_MAP: Record<string, string> = {
  "01": "제1기숙사",
  "02": "제2기숙사",
  "03": "제2기숙사(BTL)",
  "04": "제3기숙사",
  "05": "제3기숙사(BTL)",
};

const DEFAULT_RESIDENT_STATUS_MAP: Record<string, string> = {
  "01": "정규입사",
  "02": "정규퇴사",
  "03": "중도퇴사",
};

const DEFAULT_APPLY_TYPE_MAP: Record<string, string> = {
  "01": "정규선발",
  "02": "추가선발",
  "03": "방학/계절학기",
  "04": "잔류신청",
};

const DEFAULT_APPLY_STATUS_MAP: Record<string, string> = {
  "01": "접수완료",
  "02": "1차합격",
  "03": "불합격",
  "04": "예비후보",
  "05": "최종합격",
  "06": "입사포기",
};

export function buildDormitorySnapshotId(
  datasetType: DormitoryAdminDatasetType,
  year: string,
  term: string,
  dormGbn = "",
): string {
  const normalizedDorm = dormGbn.trim() || "ALL";
  return `${datasetType}_${year.trim()}_${term.trim()}_${normalizedDorm}`;
}

export function formatDormTermLabel(term?: string): string {
  const clean = (term || "").trim();
  switch (clean) {
    case "10":
      return "1학기";
    case "20":
      return "2학기";
    case "30":
      return "여름계절";
    case "40":
      return "겨울계절";
    default:
      return clean || "-";
  }
}

function formatDate(raw?: string): string {
  const clean = (raw || "").trim();
  if (!clean) return "";
  if (/^\d{8}$/.test(clean)) {
    return `${clean.slice(0, 4)}-${clean.slice(4, 6)}-${clean.slice(6, 8)}`;
  }
  if (/^\d{14}$/.test(clean)) {
    return `${clean.slice(0, 4)}-${clean.slice(4, 6)}-${clean.slice(6, 8)}`;
  }
  return clean;
}

function mapGender(raw?: string): string {
  const clean = (raw || "").trim().toUpperCase();
  if (clean === "M" || clean === "1" || clean === "남" || clean === "남성") {
    return "남";
  }
  if (clean === "F" || clean === "2" || clean === "여" || clean === "여성") {
    return "여";
  }
  return clean;
}

function mapYn(raw?: string): string {
  const clean = (raw || "").trim().toUpperCase();
  if (clean === "1" || clean === "Y") return "Y";
  if (clean === "0" || clean === "N") return "N";
  return clean;
}

function extractErrorFromSsv(ssv?: string): string | null {
  if (!ssv || typeof ssv !== "string") return null;
  const records = ssv.split(String.fromCharCode(30));
  const codeRec = records.find((rec) => rec.startsWith("ErrorCode:int="));
  if (!codeRec) return null;
  const code = Number(codeRec.slice("ErrorCode:int=".length));
  if (!Number.isNaN(code) && code !== 0) {
    const msgRec = records.find((rec) => rec.startsWith("ErrorMsg:string="));
    const msg = msgRec ? msgRec.slice("ErrorMsg:string=".length).trim() : "";
    return msg || `ERP 조회 오류 (ErrorCode=${code})`;
  }
  return null;
}

function buildCodeLookup(
  datasets: Record<string, Record<string, string>[]>,
  datasetName: string,
): Record<string, string> {
  const rows = datasets[datasetName] || [];
  const map: Record<string, string> = {};
  for (const row of rows) {
    const code = (row["code"] || "").trim();
    const label = (row["korCdNm"] || row["fullNm"] || row["korAbbNm"] || "").trim();
    if (code && label) {
      map[code] = label;
    }
  }
  return map;
}

function parseRoomAndBedFallback(studentDormNo: string): {
  roomNumber: string;
  bedNumber: string;
} {
  const clean = studentDormNo.trim();
  if (!clean) return { roomNumber: "", bedNumber: "" };
  // 예: "101-A", "B304-2", "302A" 형태에서 보조 추출
  const hyphenMatch = clean.match(/([A-Za-z]?\d{3,4})\s*[-_]\s*([A-Za-z0-9]+)$/);
  if (hyphenMatch) {
    return { roomNumber: hyphenMatch[1], bedNumber: hyphenMatch[2] };
  }
  const suffixMatch = clean.match(/([A-Za-z]?\d{3,4})([A-Za-z])$/);
  if (suffixMatch) {
    return { roomNumber: suffixMatch[1], bedNumber: suffixMatch[2] };
  }
  return { roomNumber: "", bedNumber: "" };
}

function resolveDepartmentName(row: Record<string, string>): {
  departmentName: string;
  collegeName: string;
} {
  const deptCode = (
    row["deptCd"] ||
    row["hgCd"] ||
    row["dptCd"] ||
    row["sustCd"] ||
    row["dpmjCd"] ||
    ""
  ).trim();
  const mapped = deptCode ? INU_DEPARTMENT_MAP[deptCode] : undefined;
  const departmentName = (
    row["deptNm"] ||
    row["deptKorNm"] ||
    row["hgNm"] ||
    row["sustNm"] ||
    row["dpmjNm"] ||
    mapped?.departmentName ||
    ""
  ).trim();
  const collegeName = (
    row["colgCdNm"] ||
    row["colgNm"] ||
    mapped?.collegeName ||
    ""
  ).trim();

  return { departmentName, collegeName };
}

function pickPrimaryRows(
  datasets: Record<string, Record<string, string>[]>,
  datasetType: DormitoryAdminDatasetType,
): Record<string, string>[] {
  const preferredNames =
    datasetType === "APPLICATION"
      ? ["DS_DMTY101", "DS_DMTY_APLY", "DS_LIST", "DS_MAIN"]
      : ["DS_DMTY209", "DS_DMTY_LIST", "DS_DMSD_INFO", "DS_DORM_INFO", "DS_MAIN"];

  for (const name of preferredNames) {
    if (Array.isArray(datasets[name])) {
      return datasets[name];
    }
  }

  for (const [name, rows] of Object.entries(datasets)) {
    if (name === "DS_USER_GB" || name.startsWith("DS_CODE")) continue;
    if (rows.length > 0) {
      const sample = rows[0];
      if (sample["persNo"] || sample["stuno"] || sample["nm"] || sample["korNm"]) {
        return rows;
      }
    }
  }

  return [];
}

/**
 * 크롬 익스텐션 batchRequests 응답을 정제된 관리자 사생/입사신청 목록과 스냅샷 메타데이터로 파싱합니다.
 */
export function parseAdminDormitoryBatchPayload(
  payload: unknown,
  options: ParseAdminDormitoryOptions,
): ParsedAdminDormitoryResult {
  let obj: Record<string, unknown> = {};
  if (typeof payload === "string") {
    const trimmed = payload.trim();
    if (trimmed.startsWith("{")) {
      try {
        obj = JSON.parse(trimmed) as Record<string, unknown>;
      } catch {
        obj = { mainList: payload };
      }
    } else {
      obj = { mainList: payload };
    }
  } else if (payload && typeof payload === "object") {
    obj = payload as Record<string, unknown>;
  }

  const mainSsv =
    (typeof obj.mainList === "string" && obj.mainList) ||
    (typeof obj.mainInfo === "string" && obj.mainInfo) ||
    (typeof obj.ssv === "string" && obj.ssv) ||
    "";

  const mainErr = extractErrorFromSsv(mainSsv);
  if (mainErr) {
    throw new Error(mainErr);
  }

  // ERP 세션 권한 파싱
  const userRoleSsv = typeof obj.userRole === "string" ? obj.userRole : "";
  const userRoleDatasets = parseNexacroDatasets(userRoleSsv);
  const userGbRows = userRoleDatasets["DS_USER_GB"] || [];
  const activeRoleRow =
    userGbRows.find((r) => (r["currentLoginUser"] || "").trim() === "1") ||
    userGbRows[0] ||
    {};
  const erpUserGbn = (activeRoleRow["userGbn"] || "").trim();
  const erpRoleName = (activeRoleRow["userGbnNm"] || "").trim();
  const erpPersNo = (activeRoleRow["persNo"] || "").trim();

  const erpSession: DormitoryAdminErpSession = {
    userGbn: erpUserGbn,
    userGbnNm: erpRoleName,
    persNo: erpPersNo,
    isStudentRole: erpUserGbn === "01" || erpRoleName.startsWith("학생"),
  };

  // 공통코드 파싱
  const commonCodeSsv = typeof obj.commonCodes === "string" ? obj.commonCodes : "";
  const groupCodeSsv = typeof obj.groupCodes === "string" ? obj.groupCodes : "";
  const codeDatasets = {
    ...parseNexacroDatasets(commonCodeSsv),
    ...parseNexacroDatasets(groupCodeSsv),
  };

  const dormTypeMap = {
    ...DEFAULT_DORM_TYPE_MAP,
    ...buildCodeLookup(codeDatasets, "DS_DORM_GBN"),
  };
  const applyStatusMap = {
    ...DEFAULT_APPLY_STATUS_MAP,
    ...buildCodeLookup(codeDatasets, "DS_DORM_APLY_ST_GBN"),
  };
  const stayPeriodMap = buildCodeLookup(codeDatasets, "DS_APLY_DORM_MVIN_TERM_GBN");
  const roomTypeMap = buildCodeLookup(codeDatasets, "DS_APLY_DORM_ROOM_TYPE_GBN");
  const joinTypeMap = {
    ...DEFAULT_APPLY_TYPE_MAP,
    ...buildCodeLookup(codeDatasets, "DS_DORM_JOIN_GBN"),
  };
  const priorityMap = buildCodeLookup(codeDatasets, "DS_DORM_PREF_SLT_OBJ_GBN");

  const mainDatasets = parseNexacroDatasets(mainSsv);
  const rawRows = pickPrimaryRows(mainDatasets, options.datasetType);

  const syncedAt = options.syncedAt || new Date().toISOString();
  const snapshotId = buildDormitorySnapshotId(
    options.datasetType,
    options.year,
    options.term,
    options.dormGbn || "",
  );

  const records: DormitoryAdminRecord[] = [];
  const usedUids = new Set<string>();

  rawRows.forEach((row, index) => {
    const studentId = (
      row["persNo"] ||
      row["stuno"] ||
      row["studNo"] ||
      ""
    ).trim();
    const name = (row["nm"] || row["korNm"] || row["studNm"] || "").trim();
    if (!studentId && !name) {
      return;
    }

    const seq = (row["seq"] || String(index + 1)).trim();
    let uid = `${snapshotId}_${studentId || "unknown"}_${seq}`;
    if (usedUids.has(uid)) {
      uid = `${uid}_${index}`;
    }
    usedUids.add(uid);

    const { departmentName, collegeName } = resolveDepartmentName(row);
    const dormCode = (row["dormGbn"] || "").trim();
    const dormName = dormTypeMap[dormCode] || dormCode;
    const studentDormNo = (row["domstuNo"] || row["domStuNo"] || "").trim();
    const fallbackRoom = parseRoomAndBedFallback(studentDormNo);
    const roomNumber = (
      row["roomNo"] ||
      row["dormRoomNo"] ||
      fallbackRoom.roomNumber ||
      ""
    ).trim();
    const bedNumber = (
      row["bedNo"] ||
      row["dormBedNo"] ||
      fallbackRoom.bedNumber ||
      ""
    ).trim();

    const rawResStatus = (row["dormLeavdormGbn"] || "").trim();
    const residentStatus = DEFAULT_RESIDENT_STATUS_MAP[rawResStatus] || rawResStatus;

    const rawApplyType = (row["dormJoinGbn"] || row["dormAplyGbn"] || "").trim();
    const applyType = joinTypeMap[rawApplyType] || rawApplyType;

    const rawApplyStatus = (row["dormAplyStGbn"] || row["dormPassGbn"] || "").trim();
    const applyStatus = applyStatusMap[rawApplyStatus] || rawApplyStatus;

    const rawStayPeriod = (row["aplyDormMvinTermGbn"] || "").trim();
    const stayPeriod = stayPeriodMap[rawStayPeriod] || rawStayPeriod;

    const rawPrefRoom = (row["aplyDormRoomTypeGbn"] || "").trim();
    const preferredRoomType = roomTypeMap[rawPrefRoom] || rawPrefRoom;

    const rawPriority = (row["dormPrefSltObjGbn"] || "").trim();
    const priorityTarget = priorityMap[rawPriority] || rawPriority;

    const meritPoints = Number(row["ardScr1"] || row["rwrdScore"] || 0) || 0;
    const demeritPoints = Number(row["ardScr2"] || row["pnshScore"] || 0) || 0;

    records.push({
      uid,
      snapshotId,
      datasetType: options.datasetType,

      studentId,
      name,
      englishName: (row["engNm"] || "").trim(),
      gender: mapGender(row["genGbn"]),
      nationality: (row["natGbn"] || "").trim(),
      collegeName,
      departmentName,
      majorName: (row["mjCdNm"] || row["mjNm"] || "").trim(),
      grade: (row["dormHySeqGbn"] || row["hySeqGbn"] || "").trim(),
      year: (row["yy"] || options.year || "").trim(),
      term: (row["tmGbn"] || options.term || "").trim(),
      dormitoryType: dormCode,
      dormitoryTypeName: dormName,
      phoneNumber: (row["handpNo"] || row["hpNo"] || "").trim(),
      email: (row["email"] || "").trim(),

      dormitoryBuilding: (
        row["dormBdNm"] ||
        row["dormBdCd"] ||
        row["dmtyNm"] ||
        ""
      ).trim(),
      studentDormNo,
      roomNumber,
      bedNumber,
      roomType: (row["roomTypeNm"] || row["roomType"] || "").trim(),
      mealType: (row["mealTypeNm"] || row["mealType"] || "").trim(),
      checkInDate: formatDate(row["joinCoDt"] || row["entyDt"] || row["inDt"]),
      checkOutDate: formatDate(row["dormLeavdormDt"] || row["leavDt"] || row["outDt"]),
      residentStatus,
      meritPoints,
      demeritPoints,

      seq,
      applyType,
      applyStatus,
      stayPeriod,
      preferredRoomType,
      applyDate: formatDate(row["aplyDt"]),
      smokingYn: mapYn(row["smokingYn"]),
      installmentYn: mapYn(row["partAplyYn"]),
      priorityTarget,
      areaScore: (row["resiAreaScr"] || "").trim(),
      remark: (row["remark"] || "").trim(),
    });
  });

  const meta: DormitoryAdminSnapshotMeta = {
    id: snapshotId,
    datasetType: options.datasetType,
    year: options.year.trim(),
    term: options.term.trim(),
    dormGbn: (options.dormGbn || "").trim(),
    syncedAt,
    totalCount: records.length,
    erpUserGbn: erpSession.userGbn,
    erpRoleName: erpSession.userGbnNm,
    endpoint: options.endpoint,
  };

  return { meta, records, erpSession };
}
