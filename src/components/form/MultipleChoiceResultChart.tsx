import styled from "styled-components";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { OptionResult } from "../../types/formTypes.ts";

// --- 차트 색상 (요청하신 색상 포함 및 계열 색상 추가) ---
export const COLORS = [
  "#1F78B4", // 요청
  "#A6CEE3", // 요청
  "#B2DF8A", // 요청
  "#33A02C", // 진한 녹색
  "#FB9A99", // 연한 빨강
  "#E31A1C", // 진한 빨강
  "#FDBF6F", // 연한 주황
  "#FF7F00", // 진한 주황
  "#CAB2D6", // 연한 보라
  "#6A3D9A", // 진한 보라
];

// --- 객관식 결과 차트 컴포넌트 ---
interface ChartProps {
  data: OptionResult[];
}

const MultipleChoiceResultChart: React.FC<ChartProps> = ({ data }) => {
  // 데이터가 비어있거나 모든 카운트가 0인 경우 차트 대신 메시지 표시
  const hasData = data.some((item) => item.count > 0);

  if (!hasData) {
    return <EmptyChartMessage>응답 기록이 없습니다.</EmptyChartMessage>;
  }

  // [수정 1] TS2322 해결: recharts가 인식할 수 있도록 데이터를 새 배열로 매핑
  const chartData = data.map((item) => ({
    ...item,
  }));

  return (
    <ChartWrapper>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={chartData} // [수정 2] data 대신 chartData 사용
            cx="50%"
            cy="50%"
            labelLine={false}
            outerRadius={100}
            fill="#8884d8"
            dataKey="count"
            nameKey="optionText"
          >
            {/* [수정 3] chartData로 매핑하고, TS6133 해결 (entry -> _) */}
            {chartData.map((_, index) => (
              <Cell
                key={`cell-${index}`}
                fill={COLORS[index % COLORS.length]}
              />
            ))}
          </Pie>
          <Tooltip
            formatter={(value: number, name: string) => {
              // 툴팁 로직은 원본 data를 사용해도 문제없습니다.
              const item = data.find((d) => d.optionText === name);
              return `${value}명 (${item?.percentage.toFixed(1)}%)`;
            }}
          />
        </PieChart>
      </ResponsiveContainer>
    </ChartWrapper>
  );
};

export default MultipleChoiceResultChart;

// --- Styled Components ---

const ChartWrapper = styled.div`
  width: 100%;
  height: 300px; // 차트 높이 고정
  margin-top: 16px;
`;

const EmptyChartMessage = styled.div`
  width: 100%;
  padding: 48px 16px;
  text-align: center;
  font-size: 14px;
  color: #999;
  box-sizing: border-box;
`;
