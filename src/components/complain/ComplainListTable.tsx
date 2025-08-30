// TableComponent.tsx
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
                <TableHeader>사생번호</TableHeader>
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
                  <TableCell>{"caseNumber" in row && row.caseNumber}</TableCell>
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
  color: ${({ status }) => (status === "확인" ? "#1a73e8" : "#888")};
  background-color: ${({ status }) =>
    status === "확인" ? "#d6e4ff" : "#f2f2f2"};
`;
