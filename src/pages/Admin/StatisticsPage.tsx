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

type SearchMode = "date" | "range";
type MethodFilter = "ALL" | "GET" | "POST" | "PUT" | "DELETE";
type SortOption = "COUNT_DESC" | "COUNT_ASC" | "TIME_DESC" | "PATH_ASC";

const PAGE_SIZE = 12;

export default function StatisticsPage() {
  const todayStr = useMemo(() => new Date().toISOString().split("T")[0], []);

  const [mode, setMode] = useState<SearchMode>("date");
  const [searchParams, setSearchParams] = useState({
    date: todayStr,
    from: "",
    to: "",
    apiPath: "",
  });

  // 오늘 날짜 기본 조회로 빈 화면 방지
  const [submittedParams, setSubmittedParams] = useState<{
    date?: string;
    from?: string;
    to?: string;
    apiPath?: string;
  }>({ date: todayStr });

  const [pathKeyword, setPathKeyword] = useState("");
  const [methodFilter, setMethodFilter] = useState<MethodFilter>("ALL");
  const [sortOption, setSortOption] = useState<SortOption>("COUNT_DESC");
  const [currentPage, setCurrentPage] = useState(1);

  useSetHeader({ title: "서비스 이용 통계" });

  const { data: rawStats = [], isLoading: statsLoading } = useStatisticsQuery(
    submittedParams,
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

  const loading = statsLoading || totalLoading;

  const statistics = useMemo(
    () =>
      [...rawStats].sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
      ),
    [rawStats],
  );

  const uniqueApiPaths = useMemo(() => {
    const paths = new Set(statistics.map((s) => s.apiPath));
    return Array.from(paths).sort();
  }, [statistics]);

  // 빠른 기간 선택 프리셋
  const handleQuickPreset = (preset: "TODAY" | "WEEK" | "MONTH") => {
    const now = new Date();
    const today = now.toISOString().split("T")[0];

    if (preset === "TODAY") {
      setMode("date");
      setSearchParams((prev) => ({ ...prev, date: today }));
      setSubmittedParams({
        date: today,
        apiPath: searchParams.apiPath || undefined,
      });
    } else if (preset === "WEEK") {
      const past = new Date();
      past.setDate(past.getDate() - 7);
      const from = past.toISOString().split("T")[0];

      setMode("range");
      setSearchParams((prev) => ({ ...prev, from, to: today }));
      setSubmittedParams({
        from,
        to: today,
        apiPath: searchParams.apiPath || undefined,
      });
    } else if (preset === "MONTH") {
      const past = new Date();
      past.setDate(past.getDate() - 30);
      const from = past.toISOString().split("T")[0];

      setMode("range");
      setSearchParams((prev) => ({ ...prev, from, to: today }));
      setSubmittedParams({
        from,
        to: today,
        apiPath: searchParams.apiPath || undefined,
      });
    }
    setCurrentPage(1);
  };

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
    setCurrentPage(1);
  }, [searchParams, mode]);

  // 차트 집계 데이터
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
  const animatedEndpointCount = useCountUp(uniqueApiPaths.length);

  // 테이블 내 필터링 및 정렬
  const filteredAndSortedStats = useMemo(() => {
    let result = [...statistics];

    if (pathKeyword.trim()) {
      const kw = pathKeyword.trim().toLowerCase();
      result = result.filter((s) => s.apiPath.toLowerCase().includes(kw));
    }

    if (methodFilter !== "ALL") {
      result = result.filter((s) => s.httpMethod.toUpperCase() === methodFilter);
    }

    result.sort((a, b) => {
      if (sortOption === "COUNT_DESC") return b.callCount - a.callCount;
      if (sortOption === "COUNT_ASC") return a.callCount - b.callCount;
      if (sortOption === "TIME_DESC") {
        return (
          new Date(b.lastCalledAt).getTime() - new Date(a.lastCalledAt).getTime()
        );
      }
      if (sortOption === "PATH_ASC") return a.apiPath.localeCompare(b.apiPath);
      return 0;
    });

    return result;
  }, [statistics, pathKeyword, methodFilter, sortOption]);

  // 슬라이딩 윈도우 페이지네이션
  const totalPages = Math.max(1, Math.ceil(filteredAndSortedStats.length / PAGE_SIZE));
  const currentSafePage = Math.min(currentPage, totalPages);

  const paginatedStats = useMemo(() => {
    const startIndex = (currentSafePage - 1) * PAGE_SIZE;
    return filteredAndSortedStats.slice(startIndex, startIndex + PAGE_SIZE);
  }, [filteredAndSortedStats, currentSafePage]);

  const visiblePages = useMemo(() => {
    const windowSize = 5;
    let start = Math.max(1, currentSafePage - Math.floor(windowSize / 2));
    let end = start + windowSize - 1;

    if (end > totalPages) {
      end = totalPages;
      start = Math.max(1, end - windowSize + 1);
    }

    const pages: number[] = [];
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  }, [currentSafePage, totalPages]);

  const getMethodBadgeStyle = (method: string) => {
    switch (method.toUpperCase()) {
      case "GET":
        return { bg: "#e8f3ff", color: "#3182f6" };
      case "POST":
        return { bg: "#e6f8ef", color: "#04b05c" };
      case "PUT":
        return { bg: "#fff3e0", color: "#f59e0b" };
      case "DELETE":
        return { bg: "#feecee", color: "#f04452" };
      default:
        return { bg: "#f2f4f6", color: "#6b7684" };
    }
  };

  return (
    <PageRoot>
      <ContentContainer>
        {/* 상단 기간 설정 및 조회 카드 */}
        <FilterCard>
          <FilterCardTop>
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

            {/* 빠른 기간 프리셋 버튼 */}
            <QuickPresetsGroup>
              <PresetButton
                type="button"
                onClick={() => handleQuickPreset("TODAY")}
              >
                오늘
              </PresetButton>
              <PresetButton
                type="button"
                onClick={() => handleQuickPreset("WEEK")}
              >
                최근 7일
              </PresetButton>
              <PresetButton
                type="button"
                onClick={() => handleQuickPreset("MONTH")}
              >
                최근 30일
              </PresetButton>
            </QuickPresetsGroup>
          </FilterCardTop>

          <FilterInputsGrid>
            {mode === "date" ? (
              <FieldWrapper>
                <FieldLabel htmlFor="stat-date">조회 일자</FieldLabel>
                <DateInput
                  id="stat-date"
                  type="date"
                  name="date"
                  value={searchParams.date}
                  onChange={handleChange}
                />
              </FieldWrapper>
            ) : (
              <DateRangeRow>
                <FieldWrapper>
                  <FieldLabel htmlFor="stat-from">시작일</FieldLabel>
                  <DateInput
                    id="stat-from"
                    type="date"
                    name="from"
                    value={searchParams.from}
                    onChange={handleChange}
                  />
                </FieldWrapper>
                <FieldWrapper>
                  <FieldLabel htmlFor="stat-to">종료일</FieldLabel>
                  <DateInput
                    id="stat-to"
                    type="date"
                    name="to"
                    value={searchParams.to}
                    onChange={handleChange}
                  />
                </FieldWrapper>
              </DateRangeRow>
            )}

            <FieldWrapper style={{ flex: 1 }}>
              <FieldLabel htmlFor="stat-api-path">API 엔드포인트 필터</FieldLabel>
              <PathInput
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
            </FieldWrapper>

            <SearchExecuteButton
              type="button"
              onClick={handleSearch}
              disabled={loading}
            >
              {loading ? "조회 중..." : "조회하기"}
            </SearchExecuteButton>
          </FilterInputsGrid>
        </FilterCard>

        {/* 핵심 통계 요약 칩 */}
        <SummaryGrid>
          <StatMiniCard>
            <StatMiniLabel>조회 기간 내 총 호출 수</StatMiniLabel>
            <StatMiniValue style={{ color: "#3182f6" }}>
              {animatedTotalCalls.toLocaleString()}회
            </StatMiniValue>
          </StatMiniCard>

          <StatMiniCard>
            <StatMiniLabel>고유 API 엔드포인트</StatMiniLabel>
            <StatMiniValue>{animatedEndpointCount}개</StatMiniValue>
          </StatMiniCard>

          {totalCountForPath !== null && searchParams.apiPath && (
            <StatMiniCard>
              <StatMiniLabel>'{searchParams.apiPath}' 경로 호출</StatMiniLabel>
              <StatMiniValue style={{ color: "#04b05c" }}>
                {animatedPathCalls.toLocaleString()}회
              </StatMiniValue>
            </StatMiniCard>
          )}
        </SummaryGrid>

        {/* 차트 영역: PC 2열, 모바일 1열 */}
        {statistics.length > 0 && (
          <ChartsGrid>
            <ChartCard>
              <ChartHeader>
                <ChartTitle>일별 호출 추이</ChartTitle>
                <ChartSubtext>날짜별 API 트래픽 변화</ChartSubtext>
              </ChartHeader>
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
                      name="호출 수"
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
              <ChartHeader>
                <ChartTitle>HTTP 메서드별 호출 분포</ChartTitle>
                <ChartSubtext>요청 규격별 점유 현황</ChartSubtext>
              </ChartHeader>
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
                      name="호출 수"
                      fill="#191f28"
                      radius={[6, 6, 0, 0]}
                      barSize={36}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </ChartCard>
          </ChartsGrid>
        )}

        {/* 상세 내역 카드 (검색/필터 툴바 + PC 테이블 / 모바일 카드 리스트) */}
        <ListCard>
          <ListCardHeader>
            <ListToolbar>
              <ListSearchInput
                type="text"
                placeholder="목록 내 경로 검색..."
                value={pathKeyword}
                onChange={(e) => {
                  setPathKeyword(e.target.value);
                  setCurrentPage(1);
                }}
              />

              <MethodFilterTabs>
                {(["ALL", "GET", "POST", "PUT", "DELETE"] as MethodFilter[]).map((m) => (
                  <MethodTabButton
                    key={m}
                    type="button"
                    $active={methodFilter === m}
                    onClick={() => {
                      setMethodFilter(m);
                      setCurrentPage(1);
                    }}
                  >
                    {m === "ALL" ? "전체 메서드" : m}
                  </MethodTabButton>
                ))}
              </MethodFilterTabs>

              <SortSelect
                value={sortOption}
                onChange={(e) => {
                  setSortOption(e.target.value as SortOption);
                  setCurrentPage(1);
                }}
              >
                <option value="COUNT_DESC">호출 횟수 많은 순</option>
                <option value="COUNT_ASC">호출 횟수 적은 순</option>
                <option value="TIME_DESC">최근 호출 순</option>
                <option value="PATH_ASC">경로명 순 (A-Z)</option>
              </SortSelect>
            </ListToolbar>
          </ListCardHeader>

          {/* 목록 데이터 본문 */}
          {loading ? (
            <LoadingContainer>
              <SkeletonRow />
              <SkeletonRow />
              <SkeletonRow />
            </LoadingContainer>
          ) : filteredAndSortedStats.length === 0 ? (
            <EmptyState>
              <EmptyTitle>조회된 통계 데이터가 없어요</EmptyTitle>
              <EmptyDescription>
                조회 기간을 넓히거나 검색 조건을 변경해 보세요.
              </EmptyDescription>
            </EmptyState>
          ) : (
            <>
              {/* PC 전용 와이드 데이터 테이블 */}
              <DesktopTableWrapper>
                <Table>
                  <thead>
                    <tr>
                      <Th style={{ width: "16%" }}>날짜</Th>
                      <Th style={{ width: "42%" }}>API 엔드포인트 경로</Th>
                      <Th style={{ width: "14%" }}>메서드</Th>
                      <Th style={{ width: "14%", textAlign: "right" }}>호출 횟수</Th>
                      <Th style={{ width: "14%", textAlign: "right" }}>최근 호출</Th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedStats.map((stat, idx) => {
                      const badgeStyle = getMethodBadgeStyle(stat.httpMethod);
                      return (
                        <tr key={`${stat.date}-${stat.apiPath}-${idx}`}>
                          <Td style={{ color: "#8b95a1", fontSize: "0.86rem" }}>
                            {stat.date}
                          </Td>
                          <Td>
                            <PathText>{stat.apiPath}</PathText>
                          </Td>
                          <Td>
                            <MethodBadge
                              style={{
                                background: badgeStyle.bg,
                                color: badgeStyle.color,
                              }}
                            >
                              {stat.httpMethod}
                            </MethodBadge>
                          </Td>
                          <Td style={{ textAlign: "right", fontWeight: 800 }}>
                            {stat.callCount.toLocaleString()}회
                          </Td>
                          <Td
                            style={{
                              textAlign: "right",
                              color: "#8b95a1",
                              fontSize: "0.82rem",
                            }}
                          >
                            {new Date(stat.lastCalledAt).toLocaleTimeString("ko-KR")}
                          </Td>
                        </tr>
                      );
                    })}
                  </tbody>
                </Table>
              </DesktopTableWrapper>

              {/* 모바일 전용 ListRow 카드 뷰 (가로 스크롤 없음) */}
              <MobileListWrapper>
                {paginatedStats.map((stat, idx) => {
                  const badgeStyle = getMethodBadgeStyle(stat.httpMethod);
                  return (
                    <MobileRow key={`${stat.date}-${stat.apiPath}-${idx}`}>
                      <MobileRowTop>
                        <MethodBadge
                          style={{
                            background: badgeStyle.bg,
                            color: badgeStyle.color,
                          }}
                        >
                          {stat.httpMethod}
                        </MethodBadge>
                        <MobileCallCount>
                          {stat.callCount.toLocaleString()}회
                        </MobileCallCount>
                      </MobileRowTop>
                      <MobilePathText>{stat.apiPath}</MobilePathText>
                      <MobileMetaRow>
                        <span>{stat.date}</span>
                        <span>·</span>
                        <span>최근 {new Date(stat.lastCalledAt).toLocaleTimeString("ko-KR")}</span>
                      </MobileMetaRow>
                    </MobileRow>
                  );
                })}
              </MobileListWrapper>

              {/* 슬라이딩 윈도우 페이지네이션 */}
              {totalPages > 1 && (
                <PaginationContainer>
                  <PageNavButton
                    type="button"
                    disabled={currentSafePage <= 1}
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    aria-label="이전 페이지"
                  >
                    이전
                  </PageNavButton>

                  <PageNumbersWrapper>
                    {visiblePages.map((pageNum) => (
                      <PageNumberButton
                        key={pageNum}
                        type="button"
                        $isActive={pageNum === currentSafePage}
                        onClick={() => setCurrentPage(pageNum)}
                      >
                        {pageNum}
                      </PageNumberButton>
                    ))}
                  </PageNumbersWrapper>

                  <PageNavButton
                    type="button"
                    disabled={currentSafePage >= totalPages}
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    aria-label="다음 페이지"
                  >
                    다음
                  </PageNavButton>
                </PaginationContainer>
              )}
            </>
          )}
        </ListCard>
      </ContentContainer>
    </PageRoot>
  );
}

/* ================= Styled Components ================= */

const PageRoot = styled.div`
  width: 100%;
  min-height: 100%;
  padding: 10px 14px calc(40px + env(safe-area-inset-bottom, 0px));
  box-sizing: border-box;
  overflow-x: hidden;

  @media (min-width: 1024px) {
    padding: 24px 32px 60px;
  }
`;

const ContentContainer = styled.div`
  width: 100%;
  max-width: 1100px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

/* 상단 필터 카드 */
const FilterCard = styled.div`
  background: #ffffff;
  border-radius: 16px;
  padding: 14px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.04);
  display: flex;
  flex-direction: column;
  gap: 16px;

  @media (min-width: 1024px) {
    border-radius: 20px;
    padding: 24px;
  }
`;

const FilterCardTop = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;

  @media (min-width: 768px) {
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
  }
`;

const ModeTabGroup = styled.div`
  display: flex;
  gap: 4px;
  padding: 4px;
  background: #f2f4f6;
  border-radius: 12px;
  align-self: flex-start;
`;

const ModeTabButton = styled.button<{ $active: boolean }>`
  height: 34px;
  padding: 0 14px;
  border-radius: 8px;
  border: none;
  background: ${({ $active }) => ($active ? "#ffffff" : "transparent")};
  color: ${({ $active }) => ($active ? "#3182f6" : "#6b7684")};
  font-size: 0.84rem;
  font-weight: 700;
  cursor: pointer;
  box-shadow: ${({ $active }) =>
    $active ? "0 1px 4px rgba(0, 0, 0, 0.08)" : "none"};
  transition: all 0.15s ease-out;

  &:active {
    transform: scale(0.98);
  }
`;

const QuickPresetsGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
`;

const PresetButton = styled.button`
  height: 32px;
  padding: 0 10px;
  border-radius: 8px;
  border: 1px solid #e5e8eb;
  background: #f9fafb;
  color: #4e5968;
  font-size: 0.78rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s ease-out;

  &:hover {
    background: #e8f3ff;
    color: #3182f6;
    border-color: #3182f6;
  }
`;

const FilterInputsGrid = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;

  @media (min-width: 768px) {
    flex-direction: row;
    align-items: flex-end;
  }
`;

const DateRangeRow = styled.div`
  display: flex;
  gap: 8px;
  flex: 1;
`;

const FieldWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const FieldLabel = styled.label`
  font-size: 0.8rem;
  font-weight: 700;
  color: #4e5968;
`;

const DateInput = styled.input`
  height: 44px;
  border-radius: 12px;
  border: 1px solid #e5e8eb;
  background: #f9fafb;
  padding: 0 12px;
  font-size: 0.88rem;
  color: #191f28;
  outline: none;
  box-sizing: border-box;

  &:focus {
    border-color: #3182f6;
    background: #ffffff;
  }
`;

const PathInput = styled.input`
  width: 100%;
  height: 44px;
  border-radius: 12px;
  border: 1px solid #e5e8eb;
  background: #f9fafb;
  padding: 0 14px;
  font-size: 0.88rem;
  color: #191f28;
  outline: none;
  box-sizing: border-box;

  &:focus {
    border-color: #3182f6;
    background: #ffffff;
  }
`;

const SearchExecuteButton = styled.button`
  height: 44px;
  padding: 0 20px;
  border-radius: 12px;
  background: #3182f6;
  color: #ffffff;
  font-size: 0.92rem;
  font-weight: 700;
  border: none;
  cursor: pointer;
  white-space: nowrap;
  transition: background 0.15s ease-out;

  &:hover {
    background: #1b64da;
  }

  &:disabled {
    opacity: 0.6;
    cursor: wait;
  }
`;

/* 통계 요약 칩 */
const SummaryGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 12px;
`;

const StatMiniCard = styled.div`
  background: #ffffff;
  border-radius: 16px;
  padding: 16px 18px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.04);
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const StatMiniLabel = styled.span`
  font-size: 0.8rem;
  font-weight: 600;
  color: #4e5968;
`;

const StatMiniValue = styled.span`
  font-size: 1.35rem;
  font-weight: 800;
  color: #191f28;
  letter-spacing: -0.02em;
`;

/* 차트 카드 */
const ChartsGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;

  @media (min-width: 1024px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
`;

const ChartCard = styled.div`
  background: #ffffff;
  border-radius: 16px;
  padding: 14px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.04);
  display: flex;
  flex-direction: column;
  gap: 12px;

  @media (min-width: 768px) {
    border-radius: 20px;
    padding: 20px;
  }
`;

const ChartHeader = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

const ChartTitle = styled.h3`
  margin: 0;
  font-size: 1.05rem;
  font-weight: 800;
  color: #191f28;
`;

const ChartSubtext = styled.span`
  font-size: 0.76rem;
  color: #8b95a1;
`;

const ChartContainer = styled.div`
  width: 100%;
  margin-top: 4px;
`;

/* 상세 목록 카드 */
const ListCard = styled.div`
  background: #ffffff;
  border-radius: 16px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.04);
  padding: 14px;
  display: flex;
  flex-direction: column;
  gap: 16px;

  @media (min-width: 1024px) {
    border-radius: 20px;
    padding: 24px;
  }
`;

const ListCardHeader = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const ListToolbar = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;

  @media (min-width: 768px) {
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
  }
`;

const ListSearchInput = styled.input`
  height: 40px;
  border-radius: 10px;
  border: 1px solid #e5e8eb;
  background: #f9fafb;
  padding: 0 12px;
  font-size: 0.88rem;
  color: #191f28;
  outline: none;
  min-width: 200px;

  &:focus {
    border-color: #3182f6;
    background: #ffffff;
  }
`;

const MethodFilterTabs = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  overflow-x: auto;
  padding-bottom: 2px;
`;

const MethodTabButton = styled.button<{ $active: boolean }>`
  height: 32px;
  padding: 0 10px;
  border-radius: 8px;
  border: none;
  background: ${({ $active }) => ($active ? "#3182f6" : "#f2f4f6")};
  color: ${({ $active }) => ($active ? "#ffffff" : "#4e5968")};
  font-size: 0.78rem;
  font-weight: 700;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.15s ease-out;

  &:active {
    transform: scale(0.98);
  }
`;

const SortSelect = styled.select`
  height: 40px;
  border-radius: 10px;
  border: 1px solid #e5e8eb;
  background: #f9fafb;
  padding: 0 10px;
  font-size: 0.84rem;
  color: #191f28;
  outline: none;
  cursor: pointer;
`;

/* PC 테이블 */
const DesktopTableWrapper = styled.div`
  display: none;

  @media (min-width: 768px) {
    display: block;
    width: 100%;
    overflow-x: auto;
  }
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  text-align: left;
`;

const Th = styled.th`
  padding: 12px 14px;
  font-size: 0.8rem;
  font-weight: 700;
  color: #8b95a1;
  border-bottom: 1px solid #e5e8eb;
`;

const Td = styled.td`
  padding: 14px;
  border-bottom: 1px solid #f2f4f6;
  font-size: 0.9rem;
  vertical-align: middle;
`;

const PathText = styled.span`
  font-weight: 700;
  color: #191f28;
  font-family: monospace;
  word-break: break-all;
`;

const MethodBadge = styled.span`
  display: inline-flex;
  align-items: center;
  padding: 3px 8px;
  border-radius: 6px;
  font-size: 0.74rem;
  font-weight: 800;
`;

/* 모바일 ListRow */
const MobileListWrapper = styled.div`
  display: flex;
  flex-direction: column;
  divide-y: 1px solid #f2f4f6;

  @media (min-width: 768px) {
    display: none;
  }
`;

const MobileRow = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 12px 2px;
  border-bottom: 1px solid #f2f4f6;

  &:last-child {
    border-bottom: none;
  }
`;

const MobileRowTop = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const MobileCallCount = styled.strong`
  font-size: 1rem;
  font-weight: 800;
  color: #191f28;
`;

const MobilePathText = styled.span`
  font-size: 0.9rem;
  font-weight: 700;
  color: #191f28;
  font-family: monospace;
  word-break: break-all;
`;

const MobileMetaRow = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.76rem;
  color: #8b95a1;
`;

/* 슬라이딩 페이지네이션 */
const PaginationContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  margin-top: 16px;
  padding-top: 12px;
  border-top: 1px solid #f2f4f6;
  overflow-x: hidden;
`;

const PageNumbersWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
`;

const PageNavButton = styled.button`
  height: 36px;
  padding: 0 12px;
  border-radius: 8px;
  border: 1px solid #e5e8eb;
  background: #ffffff;
  font-size: 0.82rem;
  font-weight: 600;
  color: #4e5968;
  cursor: pointer;

  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }

  &:hover:not(:disabled) {
    background: #f9fafb;
    color: #191f28;
  }
`;

const PageNumberButton = styled.button<{ $isActive: boolean }>`
  min-width: 36px;
  height: 36px;
  border-radius: 8px;
  border: 1px solid ${({ $isActive }) => ($isActive ? "#3182f6" : "#e5e8eb")};
  background: ${({ $isActive }) => ($isActive ? "#3182f6" : "#ffffff")};
  color: ${({ $isActive }) => ($isActive ? "#ffffff" : "#4e5968")};
  font-size: 0.88rem;
  font-weight: 700;
  cursor: pointer;

  &:hover {
    border-color: #3182f6;
    color: ${({ $isActive }) => ($isActive ? "#ffffff" : "#3182f6")};
  }
`;

/* 상태 안내 */
const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 24px 0;
`;

const SkeletonRow = styled.div`
  height: 44px;
  border-radius: 10px;
  background: linear-gradient(90deg, #f2f4f6 25%, #e5e8eb 50%, #f2f4f6 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;

  @keyframes shimmer {
    0% {
      background-position: 200% 0;
    }
    100% {
      background-position: -200% 0;
    }
  }
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 40px 16px;
  text-align: center;
`;

const EmptyTitle = styled.h4`
  font-size: 1rem;
  font-weight: 700;
  color: #191f28;
  margin: 0;
`;

const EmptyDescription = styled.p`
  font-size: 0.82rem;
  color: #8b95a1;
  margin: 0;
`;
