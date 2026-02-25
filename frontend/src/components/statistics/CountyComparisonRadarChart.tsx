import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { CountyComparison } from '@/types/statistics';

interface Props {
  comparisons: CountyComparison[];
  height?: number;
}

export default function CountyComparisonRadarChart({ comparisons, height = 350 }: Props) {
  // 將排名轉換為百分位 (排名越前面，百分位越高)
  const chartData = comparisons.map(c => ({
    subject: c.sport_type_name,
    個人表現: Math.round(((c.total_students - c.county_rank + 1) / c.total_students) * 100),
    fullMark: 100,
  }));

  return (
    <ResponsiveContainer width="100%" height={height}>
      <RadarChart data={chartData}>
        <PolarGrid />
        <PolarAngleAxis dataKey="subject" tick={{ fontSize: 12 }} />
        <PolarRadiusAxis angle={90} domain={[0, 100]} />
        <Radar
          name="個人表現"
          dataKey="個人表現"
          stroke="#8b5cf6"
          fill="#8b5cf6"
          fillOpacity={0.6}
        />
        <Tooltip />
      </RadarChart>
    </ResponsiveContainer>
  );
}
