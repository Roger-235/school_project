import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { Comparison } from '@/types/statistics';

interface Props {
  comparisons: Comparison[];
}

export default function ComparisonRadarChart({ comparisons }: Props) {
  // 轉換數據格式 - 使用百分位排名 (0-100)
  const chartData = comparisons.map(c => ({
    subject: c.sport_type_name,
    個人表現: c.percentile_rank,
    全國平均: 50, // 平均永遠在 50 百分位
    fullMark: 100,
  }));

  return (
    <ResponsiveContainer width="100%" height={400}>
      <RadarChart data={chartData}>
        <PolarGrid />
        <PolarAngleAxis dataKey="subject" />
        <PolarRadiusAxis angle={90} domain={[0, 100]} />
        <Radar
          name="個人表現"
          dataKey="個人表現"
          stroke="#3b82f6"
          fill="#3b82f6"
          fillOpacity={0.6}
        />
        <Radar
          name="全國平均"
          dataKey="全國平均"
          stroke="#94a3b8"
          fill="#94a3b8"
          fillOpacity={0.3}
        />
        <Legend />
        <Tooltip />
      </RadarChart>
    </ResponsiveContainer>
  );
}