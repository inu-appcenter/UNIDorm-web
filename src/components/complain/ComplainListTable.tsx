import React from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import { AdminComplaint, MyComplaint } from "@/types/complain";

interface TableProps {
  data: AdminComplaint[] | MyComplaint[];
  isAdmin?: boolean;
}

const ComplainListTable: React.FC<TableProps> = ({
  data,
  isAdmin,
}: TableProps) => {
  const navigate = useNavigate();
  return (
    <TableWrapper>
      <StyledTable>
        <thead>
          <tr>
            {/* 현황 열을 첫 번째로 이동 */}
            <TableHeader>현황</TableHeader>
            <TableHeader>날짜</TableHeader>
            <TableHeader>유형</TableHeader>
            <TableHeader>제목</TableHeader>
            {isAdmin && (
              <>
                <TableHeader>담당자</TableHeader>
                <TableHeader>기숙사</TableHeader>
                <TableHeader>호실 정보</TableHeader>
                <TableHeader>학번</TableHeader>
              </>
            )}
          </tr>
        </thead>
        <tbody>
          {data.map((row, idx) => (
            <tr
              key={idx}
              onClick={() => {
                navigate(`/complain/${row.id}`);
              }}
            >
              {/* 현황 데이터 셀 */}
              <TableCell>
                <Status status={row.status}>{row.status}</Status>
              </TableCell>
              <TableCell>{row.date}</TableCell>
              <TableCell>{row.type}</TableCell>
              {/* 제목 셀: 말줄임표 적용 대상 */}
              <TableCell title={row.title} className="title">
                {row.title}
              </TableCell>
              {isAdmin && (
                <>
                  <TableCell>{"officer" in row && row.officer}</TableCell>
                  <TableCell>{"dormType" in row && row.dormType}</TableCell>
                  <TableCell>
                    {"building" in row &&
                      `${row.building} ${row.floor} ${row.roomNumber} / ${row.bedNumber}침대`}
                  </TableCell>
                  <TableCell>
                    {"studentNumber" in row && row.studentNumber}
                  </TableCell>
                </>
              )}
            </tr>
          ))}
        </tbody>
      </StyledTable>
    </TableWrapper>
  );
};

export default ComplainListTable;

const TableWrapper = styled.div`
  width: 100%;
  overflow-x: auto;
  border-radius: 8px;
  text-align: center;
`;

const StyledTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
  tr {
    cursor: pointer;
  }
`;

const TableHeader = styled.th`
  background-color: #e6f0fa;
  color: #333;
  padding: 12px;
  border-bottom: 1px solid #ccc;
  white-space: nowrap;
`;

const TableCell = styled.td`
  padding: 12px;
  border-bottom: 1px solid #eee;
  white-space: nowrap;

  /* 제목 열 전용 스타일 */
  &.title {
    text-align: left;
    text-decoration: underline;
    max-width: 250px; /* 말줄임표 기준 너비 */
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
`;

const Status = styled.span<{ status: string }>`
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 0.9em;
  font-weight: 500;
  white-space: nowrap;

  ${({ status }) => {
    switch (status) {
      case "대기중":
        return `
          color: #FFA500;
          background-color: #FFF3E0;
        `;
      case "담당자 배정":
        return `
          color: #4CAF50;
          background-color: #E8F5E9;
        `;
      case "처리중":
        return `
          color: #2196F3;
          background-color: #E3F2FD;
        `;
      case "처리완료":
        return `
          color: #4CAF50;
          background-color: #E8F5E9;
        `;
      case "반려":
        return `
          color: #F44336;
          background-color: #FFEBEE;
        `;
      case "확인":
        return `
          color: #1a73e8;
          background-color: #d6e4ff;
        `;
      default:
        return `
          color: #607D8B;
          background-color: #ECEFF1;
        `;
    }
  }}
`;
