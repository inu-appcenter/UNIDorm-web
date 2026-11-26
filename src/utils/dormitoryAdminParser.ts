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

function cleanField(raw?: string): string {
  const trimmed = (raw || "").trim();
  if (
    !trimmed ||
    trimmed === "." ||
    trimmed === "-" ||
    trimmed.toLowerCase() === "null" ||
    trimmed.toLowerCase() === "undefined"
  ) {
    return "";
  }
  return trimmed;
}

function formatDate(raw?: string): string {
  const clean = cleanField(raw);
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
  const clean = cleanField(raw).toUpperCase();
  if (clean === "M" || clean === "1" || clean === "남" || clean === "남성") {
    return "남";
  }
  if (clean === "F" || clean === "2" || clean === "여" || clean === "여성") {
    return "여";
  }
  return clean;
}

function mapYn(raw?: string): string {
  const clean = cleanField(raw).toUpperCase();
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
  buildingName: string;
  dormCode: string;
} {
  const clean = cleanField(studentDormNo);
  if (!clean) {
    return { roomNumber: "", bedNumber: "", buildingName: "", dormCode: "" };
  }

  // 1. 8자리 숫자 표준 사생번호 (예: 03205052 -> 03(2기숙사 BTL), 2(B동), 05층 05호(505호), 2번 침대)
  if (/^\d{8}$/.test(clean)) {
    const dormCode = clean.slice(0, 2);
    const blockCode = clean[2];
    const buildingName =
      blockCode === "1" ? "A동" : blockCode === "2" ? "B동" : blockCode === "3" ? "C동" : "";
    const last4 = clean.slice(-4);
    const roomPart = last4.slice(0, 3).replace(/^0+/, "") || last4.slice(0, 3);
    const bedPart = last4.slice(3);
    return {
      roomNumber: `${roomPart}호`,
      bedNumber: bedPart,
      buildingName,
      dormCode,
    };
  }

  // 2. 4~7자리 순수 숫자 사생번호 (뒤 4자리: 3자리 호수 + 1자리 침대)
  if (/^\d{4,7}$/.test(clean)) {
    const last4 = clean.slice(-4);
    const roomPart = last4.slice(0, 3).replace(/^0+/, "") || last4.slice(0, 3);
    const bedPart = last4.slice(3);
    return {
      roomNumber: `${roomPart}호`,
      bedNumber: bedPart,
      buildingName: "",
      dormCode: "",
    };
  }

  // 3. 하이픈 구분 형태 (예: "101-A", "B504-B", "24-2-0402-A")
  const hyphenMatch = clean.match(/([A-Za-z]?\d{3,4})\s*[-_]\s*([A-Za-z0-9]+)$/);
  if (hyphenMatch) {
    return {
      roomNumber: hyphenMatch[1],
      bedNumber: hyphenMatch[2],
      buildingName: "",
      dormCode: "",
    };
  }

  // 4. 숫자 + 알파벳 접미사 (예: "302A")
  const suffixMatch = clean.match(/([A-Za-z]?\d{3,4})([A-Za-z])$/);
  if (suffixMatch) {
    return {
      roomNumber: suffixMatch[1],
      bedNumber: suffixMatch[2],
      buildingName: "",
      dormCode: "",
    };
  }

  return { roomNumber: "", bedNumber: "", buildingName: "", dormCode: "" };
}

function getTermSortWeight(term: string): number {
  const clean = term.trim();
  if (clean === "40" || clean.includes("겨울")) return 4;
  if (clean === "20" || clean === "2" || clean.includes("2학기")) return 3;
  if (clean === "30" || clean.includes("여름")) return 2;
  if (clean === "10" || clean === "1" || clean.includes("1학기")) return 1;
  return parseInt(clean, 10) || 0;
}

export function compareDormitoryAdminRecordsDesc(
  a: DormitoryAdminRecord,
  b: DormitoryAdminRecord,
): number {
  const yearDiff = (parseInt(b.year, 10) || 0) - (parseInt(a.year, 10) || 0);
  if (yearDiff !== 0) return yearDiff;
  const termDiff = getTermSortWeight(b.term) - getTermSortWeight(a.term);
  if (termDiff !== 0) return termDiff;
  const dateA = a.checkInDate || a.applyDate || "";
  const dateB = b.checkInDate || b.applyDate || "";
  if (dateA !== dateB) return dateB.localeCompare(dateA);
  return (b.studentDormNo || "").localeCompare(a.studentDormNo || "");
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

  // 탭 3(입퇴사이력: DS_DMTY209_TAB03) 병합용 인덱스 구축
  const tab03Ssv = typeof obj.tab03InOut === "string" ? obj.tab03InOut : "";
  const tab03Datasets = parseNexacroDatasets(tab03Ssv);
  const tab03Rows = tab03Datasets["DS_DMTY209_TAB03"] || [];
  const tab03ByKey = new Map<string, Record<string, string>>();
  const tab03ByDormNo = new Map<string, Record<string, string>>();
  const tab03ByStudent = new Map<string, Record<string, string>>();

  for (const tRow of tab03Rows) {
    const sid = cleanField(tRow["persNo"] || tRow["stuno"]);
    if (!sid) continue;
    const tYy = cleanField(tRow["yy"]);
    const tTm = cleanField(tRow["tmGbn"]);
    const tDormNo = cleanField(tRow["domstuNo"] || tRow["domStuNo"]);

    if (tYy && tTm) {
      tab03ByKey.set(`${sid}_${tYy}_${tTm}`, tRow);
    }
    if (tDormNo) {
      tab03ByDormNo.set(`${sid}_${tDormNo}`, tRow);
    }
    const prev = tab03ByStudent.get(sid);
    if (!prev) {
      tab03ByStudent.set(sid, tRow);
    } else {
      const prevScore =
        (parseInt(cleanField(prev["yy"]), 10) || 0) * 10 +
        getTermSortWeight(cleanField(prev["tmGbn"]));
      const currScore =
        (parseInt(tYy, 10) || 0) * 10 + getTermSortWeight(tTm);
      if (currScore >= prevScore) {
        tab03ByStudent.set(sid, tRow);
      }
    }
  }

  const syncedAt = options.syncedAt || new Date().toISOString();
  const snapshotId = buildDormitorySnapshotId(
    options.datasetType,
    options.year,
    options.term,
    options.dormGbn || "",
  );

  const records: DormitoryAdminRecord[] = [];
  const usedUids = new Set<string>();
  const exactRowKeys = new Set<string>();

  rawRows.forEach((row, index) => {
    const studentId = cleanField(row["persNo"] || row["stuno"] || row["studNo"]);
    const name = cleanField(row["nm"] || row["korNm"] || row["studNm"]);
    if (!studentId && !name) {
      return;
    }

    const rowYear = cleanField(row["yy"]) || options.year.trim();
    const rowTerm = cleanField(row["tmGbn"]) || options.term.trim();
    const rawDormNo = cleanField(row["domstuNo"] || row["domStuNo"]);

    // 탭 3 입퇴사 이력 매칭 (학번+년도+학기 > 학번+사생번호 > 학번 최신)
    const matchedTab03 =
      (studentId && rowYear && rowTerm
        ? tab03ByKey.get(`${studentId}_${rowYear}_${rowTerm}`)
        : undefined) ||
      (studentId && rawDormNo
        ? tab03ByDormNo.get(`${studentId}_${rawDormNo}`)
        : undefined) ||
      (studentId ? tab03ByStudent.get(studentId) : undefined);

    const { departmentName, collegeName } = resolveDepartmentName(row);
    const studentDormNo =
      rawDormNo ||
      cleanField(matchedTab03?.["domstuNo"] || matchedTab03?.["domStuNo"]);
    const fallbackRoom = parseRoomAndBedFallback(studentDormNo);

    const dormCode =
      cleanField(row["dormGbn"]) ||
      cleanField(matchedTab03?.["dormGbn"]) ||
      fallbackRoom.dormCode;
    const dormName = dormTypeMap[dormCode] || dormCode;

    const roomNumber =
      cleanField(row["roomNo"] || row["dormRoomNo"]) || fallbackRoom.roomNumber;
    const bedNumber =
      cleanField(row["bedNo"] || row["dormBedNo"]) || fallbackRoom.bedNumber;

    const dormitoryBuilding =
      cleanField(row["dormBdNm"] || row["dormBdCd"] || row["dmtyNm"]) ||
      fallbackRoom.buildingName;

    const rawResStatus =
      cleanField(row["dormLeavdormGbn"]) ||
      cleanField(matchedTab03?.["dormLeavdormGbn"]);
    const residentStatus = DEFAULT_RESIDENT_STATUS_MAP[rawResStatus] || rawResStatus;

    const checkInDate = formatDate(
      cleanField(row["joinCoDt"] || row["entyDt"] || row["inDt"]) ||
        matchedTab03?.["joinCoDt"],
    );
    const checkOutDate = formatDate(
      cleanField(row["dormLeavdormDt"] || row["leavDt"] || row["outDt"]) ||
        matchedTab03?.["dormLeavdormDt"],
    );

    const rawApplyType = cleanField(row["dormJoinGbn"] || row["dormAplyGbn"]);
    const applyType = joinTypeMap[rawApplyType] || rawApplyType;

    const rawApplyStatus = cleanField(row["dormAplyStGbn"] || row["dormPassGbn"]);
    const applyStatus = applyStatusMap[rawApplyStatus] || rawApplyStatus;

    const rawStayPeriod = cleanField(row["aplyDormMvinTermGbn"]);
    const stayPeriod = stayPeriodMap[rawStayPeriod] || rawStayPeriod;

    const rawPrefRoom = cleanField(row["aplyDormRoomTypeGbn"]);
    const preferredRoomType = roomTypeMap[rawPrefRoom] || rawPrefRoom;

    const rawPriority = cleanField(row["dormPrefSltObjGbn"]);
    const priorityTarget = priorityMap[rawPriority] || rawPriority;

    const meritPoints = Number(cleanField(row["ardScr1"] || row["rwrdScore"]) || 0) || 0;
    const demeritPoints = Number(cleanField(row["ardScr2"] || row["pnshScore"]) || 0) || 0;
    const applyDate = formatDate(row["aplyDt"]);

    // ERP 내부 조인으로 완전히 동일한 행이 중복 내려올 때 1건만 유지
    const exactKey = [
      studentId,
      rowYear,
      rowTerm,
      dormCode,
      studentDormNo,
      roomNumber,
      bedNumber,
      residentStatus,
      checkInDate,
      applyStatus,
      applyDate,
    ].join("|");
    if (exactRowKeys.has(exactKey)) {
      return;
    }
    exactRowKeys.add(exactKey);

    const seq = cleanField(row["seq"]) || String(index + 1);
    let uid = `${snapshotId}_${studentId || "unknown"}_${rowYear}_${rowTerm}_${seq}`;
    if (usedUids.has(uid)) {
      uid = `${uid}_${index}`;
    }
    usedUids.add(uid);

    records.push({
      uid,
      snapshotId,
      datasetType: options.datasetType,

      studentId,
      name,
      englishName: cleanField(row["engNm"]),
      gender: mapGender(row["genGbn"]),
      nationality: cleanField(row["natGbn"]),
      collegeName,
      departmentName,
      majorName: cleanField(row["mjCdNm"] || row["mjNm"]),
      grade: cleanField(row["dormHySeqGbn"] || row["hySeqGbn"]),
      year: rowYear,
      term: rowTerm,
      dormitoryType: dormCode,
      dormitoryTypeName: dormName,
      phoneNumber: cleanField(row["handpNo"] || row["hpNo"]),
      email: cleanField(row["email"]),

      dormitoryBuilding,
      studentDormNo,
      roomNumber,
      bedNumber,
      roomType: cleanField(row["roomTypeNm"] || row["roomType"]),
      mealType: cleanField(row["mealTypeNm"] || row["mealType"]),
      checkInDate,
      checkOutDate,
      residentStatus,
      meritPoints,
      demeritPoints,

      seq,
      applyType,
      applyStatus,
      stayPeriod,
      preferredRoomType,
      applyDate,
      smokingYn: mapYn(row["smokingYn"]),
      installmentYn: mapYn(row["partAplyYn"]),
      priorityTarget,
      areaScore: cleanField(row["resiAreaScr"]),
      remark: cleanField(row["remark"]),
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
