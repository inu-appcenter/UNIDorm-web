import { AdminComplaint } from "@/types/complain";

/**
 * CSV 특수문자(쉼표, 큰따옴표, 줄바꿈)를 안전하게 이스케이프합니다.
 */
const escapeCsvField = (value: unknown): string => {
  if (value === null || value === undefined) {
    return "";
  }
  const str = String(value);
  if (str.includes(",") || str.includes('"') || str.includes("\n") || str.includes("\r")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
};

/**
 * 관리자 민원 목록 데이터를 엑셀 호환 UTF-8 BOM CSV 파일로 다운로드합니다.
 */
export const downloadComplaintsAsCsv = (
  complaints: AdminComplaint[],
  fileNamePrefix: string = "민원목록_조회결과",
): void => {
  const headers = [
    "현황",
    "접수일자",
    "유형",
    "제목",
    "담당자",
    "기숙사",
    "호실 정보",
    "학번",
  ];

  const rows = complaints.map((c) => {
    const roomInfo = [
      c.building,
      c.floor,
      c.roomNumber,
      c.bedNumber ? `${c.bedNumber}침대` : "",
    ]
      .filter(Boolean)
      .join(" ");

    return [
      escapeCsvField(c.status),
      escapeCsvField(c.date),
      escapeCsvField(c.type),
      escapeCsvField(c.title),
      escapeCsvField(c.officer),
      escapeCsvField(c.dormType),
      escapeCsvField(roomInfo),
      escapeCsvField(c.studentNumber),
    ].join(",");
  });

  const csvContent = "\uFEFF" + [headers.join(","), ...rows].join("\r\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });

  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  const timestamp = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}_${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;
  const fileName = `${fileNamePrefix}_${timestamp}.csv`;

  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  link.setAttribute("href", url);
  link.setAttribute("download", fileName);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
