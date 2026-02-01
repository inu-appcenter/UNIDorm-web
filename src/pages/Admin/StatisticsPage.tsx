import React, { useState, useCallback, useMemo } from "react";
import styled, { createGlobalStyle, css } from "styled-components";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";
import {
  getStatistics,
  getStatisticsTotal,
  StatisticResponse,
} from "@/apis/admin/statistics";
import { useSetHeader } from "@/hooks/useSetHeader";

// --- Global Styles & Constants ---
const GlobalStyle = createGlobalStyle`
  * {
    box-sizing: border-box;
  }
  body {
    margin: 0;
    font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, system-ui, Roboto, sans-serif;
    background-color: #f4f7f6;
    color: #333;
    overflow-y: scroll; /* 세로 스크롤은 항상 허용 */
  }
`;

const colors = {
  primary: "#3498db",
  secondary: "#2c3e50",
  success: "#27ae60",
  warning: "#f39c12",
  danger: "#e74c3c",
  grayBg: "#ecf0f1",
  borderColor: "#e0e0e0",
  white: "#ffffff",
  textSub: "#7f8c8d",
  activeBg: "#e8f6fd",
};

// --- Styled Components ---

const PageContainer = styled.div`
  max-width: 1200px;
  width: 100%;
  margin: 0 auto;
  padding: 0 16px;
  /* 화면 밖으로 내용이 넘치는 것을 방지 */
  overflow-x: hidden;
`;

const Card = styled.div`
  background: ${colors.white};
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
  padding: 24px;
  margin-bottom: 24px;
  border: 1px solid ${colors.borderColor};
  width: 100%;
`;

const ChartTitle = styled.h3`
  font-size: 18px;
  font-weight: 600;
  color: ${colors.secondary};
  margin-bottom: 20px;
  margin-top: 0;
`;

// --- Filter & Search Styles ---

const FilterWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

// 날짜 모드 탭
const ModeTabs = styled.div`
  display: flex;
  gap: 10px;
  margin-bottom: 10px;
`;

const ModeTab = styled.button<{ $active: boolean }>`
  padding: 8px 16px;
  border-radius: 20px;
  border: 1px solid
    ${(props) => (props.$active ? colors.primary : colors.borderColor)};
  background-color: ${(props) =>
    props.$active ? colors.activeBg : colors.white};
  color: ${(props) => (props.$active ? colors.primary : colors.textSub)};
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    border-color: ${colors.primary};
  }
`;

const FilterContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)) auto;
  gap: 20px;
  align-items: end;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    button {
      width: 100%;
    }
  }
`;

const InputGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const Label = styled.label`
  font-size: 14px;
  font-weight: 600;
  color: ${colors.secondary};
`;

const Input = styled.input`
  padding: 10px 12px;
  border-radius: 6px;
  border: 1px solid #ccc;
  font-size: 14px;
  outline: none;
  transition: border-color 0.2s;
  width: 100%;

  &:focus {
    border-color: ${colors.primary};
  }
`;

const SearchButton = styled.button`
  padding: 10px 24px;
  background-color: ${colors.primary};
  color: white;
  border: none;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  height: 42px;
  transition: background-color 0.2s;
  white-space: nowrap;

  &:hover {
    background-color: #2980b9;
  }

  &:disabled {
    background-color: #95a5a6;
    cursor: not-allowed;
  }
`;

// --- Summary & Charts ---

const SummaryGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 24px;
`;

const SummaryCard = styled(Card)<{ $borderColor?: string }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin-bottom: 0;
  border-left: 5px solid ${(props) => props.$borderColor || colors.primary};
  padding: 30px;
`;

const SummaryLabel = styled.span`
  font-size: 14px;
  color: ${colors.textSub};
  margin-bottom: 10px;
  font-weight: 500;
`;

const SummaryValue = styled.span<{ $color?: string }>`
  font-size: 32px;
  font-weight: 800;
  color: ${(props) => props.$color || colors.primary};
`;

const ChartGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(500px, 1fr));
  gap: 24px;
  margin-bottom: 24px;

  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
  }
`;

// --- Table Styles (가로 스크롤 개선) ---

const TableCard = styled(Card)`
  padding: 0; /* 카드 내부 패딩 제거하여 테이블 꽉 채우기 */
  overflow: hidden; /* 모서리 둥글게 유지 */
`;

const TableTitleWrapper = styled.div`
  padding: 24px 24px 10px 24px;
`;

const TableContainer = styled.div`
  width: 100%;
  overflow-x: auto; /* 내용이 넘칠 때만 가로 스크롤 생성 */

  /* 스크롤바 스타일링 (선택 사항) */
  &::-webkit-scrollbar {
    height: 8px;
  }
  &::-webkit-scrollbar-thumb {
    background-color: #ccc;
    border-radius: 4px;
  }
  &::-webkit-scrollbar-track {
    background-color: #f1f1f1;
  }
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
  /* 테이블 레이아웃을 고정하지 않고 내용물에 따라 늘어나게 함 */
  white-space: nowrap;
`;

const Th = styled.th`
  text-align: left;
  padding: 16px 24px;
  background-color: #f8f9fa;
  color: ${colors.secondary};
  font-weight: 600;
  border-bottom: 2px solid ${colors.borderColor};
  position: sticky;
  top: 0;
`;

const Td = styled.td<{ $alignRight?: boolean }>`
  padding: 16px 24px;
  border-bottom: 1px solid ${colors.grayBg};
  color: #555;
  text-align: ${(props) => (props.$alignRight ? "right" : "left")};
`;

const MethodBadge = styled.span<{ method: string }>`
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 11px;
  font-weight: 700;
  color: white;
  text-transform: uppercase;
  letter-spacing: 0.5px;

  ${(props) => {
    switch (props.method.toUpperCase()) {
      case "GET":
        return css`
          background-color: ${colors.primary};
        `;
      case "POST":
        return css`
          background-color: ${colors.success};
        `;
      case "PUT":
        return css`
          background-color: ${colors.warning};
        `;
      case "DELETE":
        return css`
          background-color: ${colors.danger};
        `;
      default:
        return css`
          background-color: ${colors.textSub};
        `;
    }
  }}
`;

const NoDataMessage = styled.div`
  padding: 40px;
  text-align: center;
  color: ${colors.textSub};
  font-style: italic;
`;

// --- Type Definition ---
type SearchMode = "date" | "range";

// --- Main Component ---

const StatisticsPage: React.FC = () => {
  // 상태 관리
  const [mode, setMode] = useState<SearchMode>("date"); // 'date' | 'range'
  const [searchParams, setSearchParams] = useState({
    date: new Date().toISOString().split("T")[0], // 오늘 날짜 기본
    from: "",
    to: "",
    apiPath: "",
  });

  const [statistics, setStatistics] = useState<StatisticResponse[]>([]);
  const [totalCountForPath, setTotalCountForPath] = useState<number | null>(
    null,
  );
  const [loading, setLoading] = useState<boolean>(false);

  // 현재 로드된 통계 데이터에서 고유한 API 경로 추출 (Select Box용)
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

  const handleSearch = useCallback(async () => {
    setLoading(true);
    try {
      const { date, from, to, apiPath } = searchParams;

      // 모드에 따라 파라미터 분기 처리
      let requestDate: string | undefined = undefined;
      let requestFrom: string | undefined = undefined;
      let requestTo: string | undefined = undefined;

      if (mode === "date") {
        requestDate = date;
      } else {
        requestFrom = from;
        requestTo = to;
      }

      // 1. 목록 조회
      const listResponse = await getStatistics(
        requestDate,
        requestFrom,
        requestTo,
        apiPath,
      );

      const sortedData = listResponse.data.sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
      );
      setStatistics(sortedData);

      // 2. API 경로 지정 시 총계 조회
      if (apiPath) {
        const totalResponse = await getStatisticsTotal(
          apiPath,
          requestFrom,
          requestTo,
        ); // Note: total API might need 'date' param support if strictly following single day, usually range works for single day if from=to=date
        setTotalCountForPath(totalResponse.data);
      } else {
        setTotalCountForPath(null);
      }
    } catch (error) {
      console.error(error);
      alert("데이터 조회 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  }, [searchParams, mode]);

  // 차트용 데이터 가공
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

  useSetHeader({ title: "서비스 이용 통계" });

  return (
    <>
      <GlobalStyle />
      <PageContainer>
        {/* 필터 카드 */}
        <Card>
          <FilterWrapper>
            <ModeTabs>
              <ModeTab
                $active={mode === "date"}
                onClick={() => setMode("date")}
              >
                특정 날짜 조회
              </ModeTab>
              <ModeTab
                $active={mode === "range"}
                onClick={() => setMode("range")}
              >
                기간 조회
              </ModeTab>
            </ModeTabs>

            <FilterContainer>
              {/* 날짜 입력 (모드에 따라 조건부 렌더링) */}
              {mode === "date" ? (
                <InputGroup>
                  <Label>조회 날짜</Label>
                  <Input
                    type="date"
                    name="date"
                    value={searchParams.date}
                    onChange={handleChange}
                  />
                </InputGroup>
              ) : (
                <>
                  <InputGroup>
                    <Label>시작일 (From)</Label>
                    <Input
                      type="date"
                      name="from"
                      value={searchParams.from}
                      onChange={handleChange}
                    />
                  </InputGroup>
                  <InputGroup>
                    <Label>종료일 (To)</Label>
                    <Input
                      type="date"
                      name="to"
                      value={searchParams.to}
                      onChange={handleChange}
                    />
                  </InputGroup>
                </>
              )}

              {/* API 경로 선택 (DataList 활용) */}
              <InputGroup>
                <Label>API 경로 (선택)</Label>
                <Input
                  list="api-paths"
                  name="apiPath"
                  placeholder="직접 입력하거나 목록에서 선택"
                  value={searchParams.apiPath}
                  onChange={handleChange}
                />
                <datalist id="api-paths">
                  {uniqueApiPaths.map((path) => (
                    <option key={path} value={path} />
                  ))}
                </datalist>
              </InputGroup>

              <SearchButton onClick={handleSearch} disabled={loading}>
                {loading ? "분석 중..." : "조회하기"}
              </SearchButton>
            </FilterContainer>
          </FilterWrapper>
        </Card>

        {/* 요약 정보 */}
        <SummaryGrid>
          <SummaryCard>
            <SummaryLabel>기간 내 총 호출 수</SummaryLabel>
            <SummaryValue>{grandTotalCalls.toLocaleString()} 회</SummaryValue>
          </SummaryCard>
          {totalCountForPath !== null && (
            <SummaryCard $borderColor={colors.success}>
              <SummaryLabel>'{searchParams.apiPath}' 경로 총 호출</SummaryLabel>
              <SummaryValue $color={colors.success}>
                {totalCountForPath.toLocaleString()} 회
              </SummaryValue>
            </SummaryCard>
          )}
        </SummaryGrid>

        {/* 차트 영역 */}
        {statistics.length > 0 && (
          <ChartGrid>
            <Card>
              <ChartTitle>일별 호출 추이</ChartTitle>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart
                  data={dailyTrendData}
                  margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                >
                  <CartesianGrid stroke="#eee" strokeDasharray="5 5" />
                  <XAxis dataKey="date" tick={{ fontSize: 12, fill: "#666" }} />
                  <YAxis tick={{ fontSize: 12, fill: "#666" }} />
                  <Tooltip
                    contentStyle={{
                      borderRadius: "8px",
                      border: "none",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                    }}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="count"
                    name="호출 횟수"
                    stroke={colors.primary}
                    strokeWidth={3}
                    dot={{ r: 4 }}
                    activeDot={{ r: 8 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </Card>

            <Card>
              <ChartTitle>HTTP 메서드별 분포</ChartTitle>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={methodDistributionData}
                  margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                >
                  <CartesianGrid
                    stroke="#eee"
                    strokeDasharray="3 3"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="method"
                    tick={{ fontSize: 12, fill: "#666" }}
                  />
                  <YAxis tick={{ fontSize: 12, fill: "#666" }} />
                  <Tooltip
                    cursor={{ fill: "#f4f7f6" }}
                    contentStyle={{
                      borderRadius: "8px",
                      border: "none",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                    }}
                  />
                  <Bar
                    dataKey="count"
                    name="호출 횟수"
                    fill={colors.secondary}
                    radius={[6, 6, 0, 0]}
                    barSize={50}
                  />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </ChartGrid>
        )}

        {/* 테이블 카드 */}
        <TableCard>
          <TableTitleWrapper>
            <ChartTitle style={{ marginBottom: 0 }}>상세 호출 내역</ChartTitle>
          </TableTitleWrapper>
          <TableContainer>
            <Table>
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
                      <Td>{stat.date}</Td>
                      <Td style={{ fontWeight: 600 }}>{stat.apiPath}</Td>
                      <Td>
                        <MethodBadge method={stat.httpMethod}>
                          {stat.httpMethod}
                        </MethodBadge>
                      </Td>
                      <Td $alignRight style={{ fontWeight: 700 }}>
                        {stat.callCount.toLocaleString()}
                      </Td>
                      <Td style={{ color: colors.textSub, fontSize: "13px" }}>
                        {new Date(stat.lastCalledAt).toLocaleString()}
                      </Td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5}>
                      <NoDataMessage>
                        {loading
                          ? "데이터를 불러오는 중입니다..."
                          : "데이터가 없습니다. 조건을 선택하고 조회해주세요."}
                      </NoDataMessage>
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>
          </TableContainer>
        </TableCard>
      </PageContainer>
    </>
  );
};

export default StatisticsPage;
