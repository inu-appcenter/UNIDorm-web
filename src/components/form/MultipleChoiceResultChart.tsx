import styled from "styled-components";
import { Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { OptionResult } from "@/types/formTypes";

// --- 차트 색상 ---
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
  // 데이터 유무 확인
  const hasData = data.some((item) => item.count > 0);

  if (!hasData) {
    return <EmptyChartMessage>응답 기록이 없습니다.</EmptyChartMessage>;
  }

  // 데이터 가공 및 색상 주입
  const chartData = data.map((item, index) => ({
    ...item,
    fill: COLORS[index % COLORS.length],
  }));

  return (
    <ChartWrapper>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            labelLine={false}
            outerRadius={100}
            dataKey="count"
            nameKey="optionText"
          />
          <Tooltip
            // TS2322 해결: 인자 타입에 undefined 허용 및 안전한 형변환 적용
            formatter={(
              value: number | string | undefined,
              name: string | number | undefined,
            ) => {
              const safeValue = Number(value) || 0;
              const safeName = String(name || "");

              const item = data.find((d) => d.optionText === safeName);
              const percentage = item ? item.percentage.toFixed(1) : "0.0";

              return `${safeValue}명 (${percentage}%)`;
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
  height: 300px;
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
