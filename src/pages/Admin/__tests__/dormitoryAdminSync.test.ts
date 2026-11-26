import { describe, it, expect } from "vitest";
import {
  buildDormitorySnapshotId,
  parseAdminDormitoryBatchPayload,
} from "../../../utils/dormitoryAdminParser";

const RS = String.fromCharCode(30);
const US = String.fromCharCode(31);

function buildSsvDataset(
  datasetName: string,
  columns: string[],
  rows: string[][],
  errorCode = 0,
  errorMsg = "",
): string {
  const header = [
    "SSV:utf-8",
    `ErrorCode:int=${errorCode}`,
    ...(errorMsg ? [`ErrorMsg:string=${errorMsg}`] : []),
    `Dataset:${datasetName}`,
    ["_RowType_", ...columns.map((c) => `${c}:string(32)`)].join(US),
    ...rows.map((r) => ["N", ...r].join(US)),
  ];
  return header.join(RS) + RS;
}

describe("dormitoryAdminParser - 관리자 사생/입사신청 목록 파싱 및 민감정보 배제", () => {
  it("DS_DMTY209 다건 사생 목록을 파싱하고 민감정보를 결과 객체에서 완전히 제외한다", () => {
    const mainList = buildSsvDataset(
      "DS_DMTY209",
      [
        "persNo",
        "nm",
        "genGbn",
        "deptCd",
        "hySeqGbn",
        "yy",
        "tmGbn",
        "dormGbn",
        "dormBdNm",
        "domstuNo",
        "roomNo",
        "bedNo",
        "joinCoDt",
        "dormLeavdormGbn",
        "ardScr1",
        "ardScr2",
        "handpNo",
        "email",
        // 민감정보 (파싱 결과에 포함되면 안 됨)
        "rrn",
        "bankAcntNo",
        "phtFile",
        "hindGrdGbn",
        "guardPsnHandpNo",
        "addr",
      ],
      [
        [
          "202300001",
          "김유니",
          "M",
          "0000077",
          "3",
          "2026",
          "20",
          "02",
          "A동",
          "2A301-1",
          "301",
          "1",
          "20260828",
          "01",
          "4",
          "1",
          "010-1111-2222",
          "uni1@inu.ac.kr",
          "010101-3******",
          "110-123-456789",
          "Qk0base64photo",
          "00",
          "010-9999-8888",
          "인천시 연수구 상세주소",
        ],
        [
          "202400002",
          "이도미",
          "F",
          "0000812",
          "2",
          "2026",
          "20",
          "04",
          "3동",
          "B504-B",
          "",
          "",
          "20260829",
          "02",
          "0",
          "3",
          "010-3333-4444",
          "uni2@inu.ac.kr",
          "020202-4******",
          "220-123-456789",
          "Qk0base64photo2",
          "01",
          "010-7777-6666",
          "서울시 강남구 상세주소",
        ],
      ],
    );

    const userRole = buildSsvDataset(
      "DS_USER_GB",
      ["currentLoginUser", "userGbn", "userGbnNm", "persNo"],
      [["1", "03", "교직원(생활원)", "A0001"]],
    );

    const result = parseAdminDormitoryBatchPayload(
      { mainList, userRole },
      {
        datasetType: "RESIDENT",
        year: "2026",
        term: "20",
        dormGbn: "",
        endpoint: "/aff/dmty/Dmsm0120Ctr/findDmty209List.do",
        syncedAt: "2026-11-27T01:00:00.000Z",
      },
    );

    expect(result.meta.id).toBe(buildDormitorySnapshotId("RESIDENT", "2026", "20", ""));
    expect(result.meta.totalCount).toBe(2);
    expect(result.erpSession.isStudentRole).toBe(false);
    expect(result.erpSession.userGbnNm).toBe("교직원(생활원)");

    expect(result.records).toHaveLength(2);
    expect(result.records[0]).toMatchObject({
      studentId: "202300001",
      name: "김유니",
      gender: "남",
      departmentName: "컴퓨터공학부",
      collegeName: "정보기술대학",
      dormitoryTypeName: "제2기숙사",
      roomNumber: "301",
      bedNumber: "1",
      checkInDate: "2026-08-28",
      residentStatus: "정규입사",
      meritPoints: 4,
      demeritPoints: 1,
    });

    // 두 번째 행은 roomNo가 비어 있어도 domstuNo("B504-B")에서 보조 추출
    expect(result.records[1].roomNumber).toBe("B504");
    expect(result.records[1].bedNumber).toBe("B");
    expect(result.records[1].residentStatus).toBe("정규퇴사");

    // 민감정보 키와 값이 JSON 직렬화 결과에 전혀 존재하지 않아야 함
    const serialized = JSON.stringify(result.records);
    expect(serialized).not.toContain("010101-3");
    expect(serialized).not.toContain("110-123-456789");
    expect(serialized).not.toContain("Qk0base64photo");
    expect(serialized).not.toContain("010-9999-8888");
    expect(serialized).not.toContain("상세주소");
  });

  it("DS_DMTY101 입사신청 목록과 공통코드 매핑을 정확히 파싱하고 학생 세션을 식별한다", () => {
    const mainList = buildSsvDataset(
      "DS_DMTY101",
      [
        "seq",
        "persNo",
        "nm",
        "genGbn",
        "colgCdNm",
        "deptNm",
        "yy",
        "tmGbn",
        "dormGbn",
        "dormJoinGbn",
        "dormAplyStGbn",
        "aplyDormMvinTermGbn",
        "aplyDormRoomTypeGbn",
        "aplyDt",
        "smokingYn",
        "partAplyYn",
      ],
      [
        [
          "1",
          "202500100",
          "박신청",
          "2",
          "공과대학",
          "기계공학과",
          "2026",
          "40",
          "05",
          "01",
          "05",
          "TERM01",
          "RM02",
          "20261120",
          "0",
          "1",
        ],
      ],
    );

    const commonCodes = buildSsvDataset(
      "DS_APLY_DORM_MVIN_TERM_GBN",
      ["code", "korCdNm"],
      [["TERM01", "동계방학(2개월)"]],
    );
    const groupCodes = buildSsvDataset(
      "DS_APLY_DORM_ROOM_TYPE_GBN",
      ["code", "korCdNm"],
      [["RM02", "2인실"]],
    );
    const userRole = buildSsvDataset(
      "DS_USER_GB",
      ["currentLoginUser", "userGbn", "userGbnNm", "persNo"],
      [["1", "01", "학생(컴퓨터공학부)", "202001518"]],
    );

    const result = parseAdminDormitoryBatchPayload(
      { mainList, commonCodes, groupCodes, userRole },
      {
        datasetType: "APPLICATION",
        year: "2026",
        term: "40",
        endpoint: "/aff/dmty/Dmmi0010Ctr/findDmty101List.do",
      },
    );

    expect(result.erpSession.isStudentRole).toBe(true);
    expect(result.records).toHaveLength(1);
    expect(result.records[0]).toMatchObject({
      datasetType: "APPLICATION",
      studentId: "202500100",
      name: "박신청",
      gender: "여",
      dormitoryTypeName: "제3기숙사(BTL)",
      applyType: "정규선발",
      applyStatus: "최종합격",
      stayPeriod: "동계방학(2개월)",
      preferredRoomType: "2인실",
      applyDate: "2026-11-20",
      smokingYn: "N",
      installmentYn: "Y",
    });
  });

  it("ERP ErrorCode가 0이 아니면 예외를 던지고, 0건 응답은 빈 배열로 반환한다", () => {
    const errSsv = buildSsvDataset(
      "DS_DMTY101",
      ["persNo"],
      [],
      -1,
      "권한이 없습니다.",
    );

    expect(() =>
      parseAdminDormitoryBatchPayload(
        { mainList: errSsv },
        {
          datasetType: "APPLICATION",
          year: "2026",
          term: "40",
          endpoint: "/aff/dmty/Dmmi0010Ctr/findDmty101List.do",
        },
      ),
    ).toThrow("권한이 없습니다.");

    const emptySsv = buildSsvDataset("DS_DMTY101", ["persNo", "nm"], []);
    const emptyResult = parseAdminDormitoryBatchPayload(
      { mainList: emptySsv },
      {
        datasetType: "APPLICATION",
        year: "2026",
        term: "40",
        endpoint: "/aff/dmty/Dmmi0010Ctr/findDmty101List.do",
      },
    );
    expect(emptyResult.records).toEqual([]);
    expect(emptyResult.meta.totalCount).toBe(0);
  });
});
