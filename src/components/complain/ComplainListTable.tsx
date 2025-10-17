import React from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import { AdminComplaint, MyComplaint } from "../../types/complain.ts";

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
            <TableHeader>날짜</TableHeader>
            <TableHeader>유형</TableHeader>
            <TableHeader>제목</TableHeader>
            <TableHeader>현황</TableHeader>
            {isAdmin && (
              <>
                <TableHeader>담당자</TableHeader>
                <TableHeader>기숙사</TableHeader>
                {/* '사생번호' 헤더를 '호실 정보'로 변경 */}
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
              <TableCell>{row.date}</TableCell>
              <TableCell>{row.type}</TableCell>
              <TableCell title={row.title} className="title">
                {row.title}
              </TableCell>
              <TableCell>
                <Status status={row.status}>{row.status}</Status>
              </TableCell>
              {isAdmin && (
                <>
                  <TableCell>{"officer" in row && row.officer}</TableCell>
                  <TableCell>{"dormType" in row && row.dormType}</TableCell>
                  <TableCell>
                    {"building" in row &&
                      `${row.building} ${row.roomNumber} ${row.bedNumber}침대`}
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
  //font-family: "Arial", sans-serif;
  font-size: 14px;
  tr {
    cursor: pointer;
    .title {
      text-decoration: underline;
    }
  }
`;

const TableHeader = styled.th`
  background-color: #e6f0fa;
  color: #333;
  padding: 12px;
  border-bottom: 1px solid #ccc;
  white-space: nowrap; // 추가
`;

const TableCell = styled.td`
  padding: 12px;
  border-bottom: 1px solid #eee;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
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
          color: #FFA500; // 주황색
          background-color: #FFF3E0; // 연한 주황색
        `;
      case "담당자 배정":
        return `
          color: #4CAF50; // 초록색 (배정 완료)
          background-color: #E8F5E9; // 연한 초록색
        `;
      case "처리중":
        return `
          color: #2196F3; // 파란색
          background-color: #E3F2FD; // 연한 파란색
        `;
      case "처리완료":
        return `
          color: #4CAF50; // 진한 초록색 (완료)
          background-color: #E8F5E9; // 연한 초록색
        `;
      case "반려":
        return `
          color: #F44336; // 빨간색
          background-color: #FFEBEE; // 연한 빨간색
        `;
      case "확인":
        return `
          color: #1a73e8;
          background-color: #d6e4ff;
        `;
      default:
        return `
          color: #607D8B; // 회색 (기본값)
          background-color: #ECEFF1; // 연한 회색
        `;
    }
  }}
`;
