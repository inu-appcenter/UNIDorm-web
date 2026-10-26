import React, { useState, useCallback, useMemo } from "react";
import styled from "styled-components";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";
import { useStatisticsQuery, useStatisticsTotalQuery } from "@/queries/admin";
import { useSetHeader } from "@/hooks/useSetHeader";
import { useCountUp } from "@/hooks/useCountUp";
import {
  AdminBadge,
  AdminButton,
  AdminCard,
  AdminCardDescription,
  AdminCardHeader,
  AdminCardTitle,
  AdminCardTitleGroup,
  AdminField,
  AdminInput,
  AdminLabel,
  AdminMiniStat,
  AdminMiniStatLabel,
  AdminMiniStatValue,
  AdminPage,
  AdminShell,
} from "@/pages/Admin/adminPageStyles";

type SearchMode = "date" | "range";

const StatisticsPage: React.FC = () => {
  const [mode, setMode] = useState<SearchMode>("date");
  const [searchParams, setSearchParams] = useState({
    date: new Date().toISOString().split("T")[0],
    from: "",
    to: "",
    apiPath: "",
  });

  const [submittedParams, setSubmittedParams] = useState<{
    date?: string;
    from?: string;
    to?: string;
    apiPath?: string;
  } | null>(null);

  const { data: rawStats = [], isLoading: statsLoading } = useStatisticsQuery(
    submittedParams ?? {},
    { enabled: Boolean(submittedParams) },
  );

  const { data: totalCountForPath = null, isLoading: totalLoading } =
    useStatisticsTotalQuery(
      {
        apiPath: submittedParams?.apiPath,
        from: submittedParams?.from,
        to: submittedParams?.to,
      },
      { enabled: Boolean(submittedParams?.apiPath) },
    );

  const statistics = useMemo(
    () =>
      [...rawStats].sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
      ),
    [rawStats],
  );

  const loading = statsLoading || totalLoading;

  const uniqueApiPaths = useMemo(() => {
    const paths = new Set(statistics.map((s) => s.apiPath));
    return Array.from(paths).sort();
  }, [statistics]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setSearchParams((prev) => ({ ...prev, [name]: value }));
  };

  const handleSearch = useCallback(() => {
    const { date, from, to, apiPath } = searchParams;
    setSubmittedParams({
      date: mode === "date" ? date : undefined,
      from: mode === "range" ? from : undefined,
      to: mode === "range" ? to : undefined,
      apiPath: apiPath || undefined,
    });
  }, [searchParams, mode]);

  const dailyTrendData = useMemo(() => {
    const map = new Map<string, number>();
    statistics.forEach((stat) => {
      const dateKey = stat.date.split("T")[0];
      map.set(dateKey, (map.get(dateKey) || 0) + stat.callCount);
    });
    return Array.from(map.entries()).map(([date, count]) => ({ date, count }));
  }, [statistics]);

  const methodDistributionData = useMemo(() => {
    const map = new Map<string, number>();
    statistics.forEach((stat) => {
      map.set(
        stat.httpMethod,
        (map.get(stat.httpMethod) || 0) + stat.callCount,
      );
    });
    return Array.from(map.entries()).map(([method, count]) => ({
      method,
      count,
    }));
  }, [statistics]);

  const grandTotalCalls = useMemo(() => {
    return statistics.reduce((sum, stat) => sum + stat.callCount, 0);
  }, [statistics]);

  const animatedTotalCalls = useCountUp(grandTotalCalls);
  const animatedPathCalls = useCountUp(totalCountForPath ?? 0);

  useSetHeader({ title: "서비스 이용 통계" });

  const getMethodBadgeTone = (method: string): "blue" | "green" | "amber" | "red" | "slate" => {
    switch (method.toUpperCase()) {
      case "GET":
        return "blue";
      case "POST":
        return "green";
      case "PUT":
        return "amber";
      case "DELETE":
        return "red";
      default:
        return "slate";
    }
  };

  return (
    <AdminShell>
      <AdminPage>
        {/* 필터 카드 */}
        <AdminCard>
          <AdminCardHeader>
            <AdminCardTitleGroup>
              <AdminCardTitle>서비스 이용 통계 조회</AdminCardTitle>
              <AdminCardDescription>
                원하는 날짜 또는 기간을 선택하여 API 호출 현황을 분석합니다.
              </AdminCardDescription>
            </AdminCardTitleGroup>

            {/* 날짜 모드 탭 세그먼트 */}
            <ModeTabGroup>
              <ModeTabButton
                type="button"
                $active={mode === "date"}
                onClick={() => setMode("date")}
              >
                특정 날짜
              </ModeTabButton>
              <ModeTabButton
                type="button"
                $active={mode === "range"}
                onClick={() => setMode("range")}
              >
                기간 조회
              </ModeTabButton>
            </ModeTabGroup>
          </AdminCardHeader>

          <FilterInputsGrid>
            {mode === "date" ? (
              <AdminField>
                <AdminLabel htmlFor="stat-date">조회 날짜</AdminLabel>
                <AdminInput
                  id="stat-date"
                  type="date"
                  name="date"
                  value={searchParams.date}
                  onChange={handleChange}
                />
              </AdminField>
            ) : (
              <>
                <AdminField>
                  <AdminLabel htmlFor="stat-from">시작일</AdminLabel>
                  <AdminInput
                    id="stat-from"
                    type="date"
                    name="from"
                    value={searchParams.from}
                    onChange={handleChange}
                  />
                </AdminField>
                <AdminField>
                  <AdminLabel htmlFor="stat-to">종료일</AdminLabel>
                  <AdminInput
                    id="stat-to"
                    type="date"
                    name="to"
                    value={searchParams.to}
                    onChange={handleChange}
                  />
                </AdminField>
              </>
            )}

            <AdminField>
              <AdminLabel htmlFor="stat-api-path">API 경로 필터 (선택)</AdminLabel>
              <AdminInput
                id="stat-api-path"
                list="api-paths"
                name="apiPath"
                placeholder="전체 경로 또는 직접 입력"
                value={searchParams.apiPath}
                onChange={handleChange}
              />
              <datalist id="api-paths">
                {uniqueApiPaths.map((path) => (
                  <option key={path} value={path} />
                ))}
              </datalist>
            </AdminField>

            <SearchButton
              type="button"
              onClick={handleSearch}
              disabled={loading}
            >
              {loading ? "데이터를 분석하고 있어요..." : "조회하기"}
            </SearchButton>
          </FilterInputsGrid>
        </AdminCard>

        {/* 상단 통계 수치 (CountUp) */}
        <SummaryGrid>
          <AdminMiniStat>
            <AdminMiniStatLabel>기간 내 총 API 호출 수</AdminMiniStatLabel>
            <AdminMiniStatValue style={{ color: "#3182f6" }}>
              {animatedTotalCalls.toLocaleString()}회
            </AdminMiniStatValue>
          </AdminMiniStat>

          {totalCountForPath !== null && searchParams.apiPath && (
            <AdminMiniStat>
              <AdminMiniStatLabel>'{searchParams.apiPath}' 경로 호출</AdminMiniStatLabel>
              <AdminMiniStatValue style={{ color: "#04b05c" }}>
                {animatedPathCalls.toLocaleString()}회
              </AdminMiniStatValue>
            </AdminMiniStat>
          )}
        </SummaryGrid>

        {/* 차트 영역: PC 2열, 모바일 1열 */}
        {statistics.length > 0 && (
          <ChartsGrid>
            <ChartCard>
              <ChartTitle>일별 호출 추이</ChartTitle>
              <ChartContainer>
                <ResponsiveContainer width="100%" height={260}>
                  <LineChart
                    data={dailyTrendData}
                    margin={{ top: 10, right: 20, left: -20, bottom: 0 }}
                  >
                    <CartesianGrid stroke="#f2f4f6" vertical={false} />
                    <XAxis
                      dataKey="date"
                      tick={{ fontSize: 11, fill: "#8b95a1" }}
                      axisLine={{ stroke: "#e5e8eb" }}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fontSize: 11, fill: "#8b95a1" }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip
                      contentStyle={{
                        borderRadius: "12px",
                        border: "1px solid #e5e8eb",
                        boxShadow: "0 4px 16px rgba(0,0,0,0.06)",
                        fontSize: "12px",
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="count"
                      name="호출 횟수"
                      stroke="#3182f6"
                      strokeWidth={3}
                      dot={{ r: 3, fill: "#3182f6" }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </ChartContainer>
            </ChartCard>

            <ChartCard>
              <ChartTitle>HTTP 메서드별 호출 분포</ChartTitle>
              <ChartContainer>
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart
                    data={methodDistributionData}
                    margin={{ top: 10, right: 20, left: -20, bottom: 0 }}
                  >
                    <CartesianGrid stroke="#f2f4f6" vertical={false} />
                    <XAxis
                      dataKey="method"
                      tick={{ fontSize: 11, fill: "#8b95a1" }}
                      axisLine={{ stroke: "#e5e8eb" }}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fontSize: 11, fill: "#8b95a1" }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip
                      cursor={{ fill: "#f9fafb" }}
                      contentStyle={{
                        borderRadius: "12px",
                        border: "1px solid #e5e8eb",
                        boxShadow: "0 4px 16px rgba(0,0,0,0.06)",
                        fontSize: "12px",
                      }}
                    />
                    <Bar
                      dataKey="count"
                      name="호출 횟수"
                      fill="#191f28"
                      radius={[6, 6, 0, 0]}
                      barSize={40}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </ChartCard>
          </ChartsGrid>
        )}

        {/* 상세 호출 내역 (PC 테이블 vs 모바일 카드 리스트) */}
        <AdminCard style={{ padding: 0, overflow: "hidden" }}>
          <TableTitleWrap>
            <AdminCardTitle>상세 호출 내역</AdminCardTitle>
            <AdminCardDescription>
              호출된 API 엔드포인트별 일시 및 통계 기록입니다.
            </AdminCardDescription>
          </TableTitleWrap>

          {/* PC 데스크톱 테이블 */}
          <DesktopTableWrapper>
            <DataTable>
              <thead>
                <tr>
                  <Th>날짜</Th>
                  <Th>API 경로</Th>
                  <Th>메서드</Th>
                  <Th style={{ textAlign: "right" }}>호출 횟수</Th>
                  <Th>최근 호출 시간</Th>
                </tr>
              </thead>
              <tbody>
                {statistics.length > 0 ? (
                  statistics.map((stat, index) => (
                    <tr key={`${stat.date}-${stat.apiPath}-${index}`}>
                      <Td className="font-mono text-xs">{stat.date}</Td>
                      <Td style={{ fontWeight: 700, color: "#191f28" }}>
                        {stat.apiPath}
                      </Td>
                      <Td>
                        <AdminBadge $tone={getMethodBadgeTone(stat.httpMethod)}>
                          {stat.httpMethod}
                        </AdminBadge>
                      </Td>
                      <Td style={{ textAlign: "right", fontWeight: 800 }}>
                        {stat.callCount.toLocaleString()}
                      </Td>
                      <Td style={{ color: "#8b95a1", fontSize: "0.82rem" }}>
                        {new Date(stat.lastCalledAt).toLocaleTimeString("ko-KR")}
                      </Td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5}>
                      <EmptyMessage>
                        {loading
                          ? "데이터를 분석하고 있어요..."
                          : "조회된 통계 데이터가 없습니다. 상단에서 조건을 설정하고 조회해 주세요."}
                      </EmptyMessage>
                    </td>
                  </tr>
                )}
              </tbody>
            </DataTable>
          </DesktopTableWrapper>

          {/* 모바일 전용 ListRow 카드 뷰 (가로 스크롤 없음) */}
          <MobileListWrapper>
            {statistics.length > 0 ? (
              statistics.map((stat, index) => (
                <MobileStatItem key={`${stat.date}-${stat.apiPath}-${index}`}>
                  <MobileStatTop>
                    <AdminBadge $tone={getMethodBadgeTone(stat.httpMethod)}>
                      {stat.httpMethod}
                    </AdminBadge>
                    <MobileCallCount>
                      {stat.callCount.toLocaleString()}회
                    </MobileCallCount>
                  </MobileStatTop>
                  <MobilePathText>{stat.apiPath}</MobilePathText>
                  <MobileMetaText>
                    {stat.date} · 최근 {new Date(stat.lastCalledAt).toLocaleTimeString("ko-KR")}
                  </MobileMetaText>
                </MobileStatItem>
              ))
            ) : (
              <EmptyMessage>
                {loading
                  ? "데이터를 분석하고 있어요..."
                  : "조회된 통계 데이터가 없습니다."}
              </EmptyMessage>
            )}
          </MobileListWrapper>
        </AdminCard>
      </AdminPage>
    </AdminShell>
  );
};

export default StatisticsPage;

const ModeTabGroup = styled.div`
  display: flex;
  gap: 6px;
  padding: 4px;
  background: #f2f4f6;
  border-radius: 14px;
`;

const ModeTabButton = styled.button<{ $active: boolean }>`
  height: 36px;
  padding: 0 14px;
  border-radius: 10px;
  border: none;
  background: ${({ $active }) => ($active ? "#ffffff" : "transparent")};
  color: ${({ $active }) => ($active ? "#3182f6" : "#6b7684")};
  font-size: 0.85rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.15s ease-out;
  box-shadow: ${({ $active }) =>
    $active ? "0 1px 4px rgba(0, 0, 0, 0.08)" : "none"};

  &:active {
    transform: scale(0.98);
  }
`;

const FilterInputsGrid = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 14px;
  align-items: end;

  @media (min-width: 768px) {
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)) auto;
    gap: 16px;
  }
`;

const SearchButton = styled(AdminButton)`
  height: 48px;
  white-space: nowrap;
`;

const SummaryGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 14px;
`;

const ChartsGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 20px;

  @media (min-width: 1024px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
`;

const ChartCard = styled(AdminCard)`
  padding: 22px;
`;

const ChartTitle = styled.h3`
  margin: 0;
  font-size: 1.05rem;
  font-weight: 800;
  color: #191f28;
`;

const ChartContainer = styled.div`
  width: 100%;
  margin-top: 8px;
`;

const TableTitleWrap = styled.div`
  padding: 24px 24px 16px;
  border-bottom: 1px solid #e5e8eb;
`;

const DesktopTableWrapper = styled.div`
  display: none;

  @media (min-width: 768px) {
    display: block;
    width: 100%;
    overflow-x: auto;
  }
`;

const DataTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 0.9rem;
`;

const Th = styled.th`
  padding: 14px 24px;
  background: #f9fafb;
  color: #6b7684;
  font-size: 0.78rem;
  font-weight: 700;
  text-align: left;
  border-bottom: 1px solid #e5e8eb;
`;

const Td = styled.td`
  padding: 16px 24px;
  border-bottom: 1px solid #f2f4f6;
  color: #333d4b;
`;

const EmptyMessage = styled.div`
  padding: 48px 16px;
  text-align: center;
  color: #8b95a1;
  font-size: 0.92rem;
`;

const MobileListWrapper = styled.div`
  display: flex;
  flex-direction: column;
  divide-y: 1px solid #f2f4f6;

  @media (min-width: 768px) {
    display: none;
  }
`;

const MobileStatItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 18px 20px;
  border-bottom: 1px solid #f2f4f6;

  &:last-child {
    border-bottom: none;
  }
`;

const MobileStatTop = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const MobileCallCount = styled.strong`
  font-size: 1.05rem;
  font-weight: 800;
  color: #191f28;
  font-variant-numeric: tabular-nums;
`;

const MobilePathText = styled.span`
  font-size: 0.92rem;
  font-weight: 700;
  color: #191f28;
  word-break: break-all;
`;

const MobileMetaText = styled.span`
  font-size: 0.78rem;
  color: #8b95a1;
`;
