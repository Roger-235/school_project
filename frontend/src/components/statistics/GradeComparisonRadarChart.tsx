import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { GradeComparison } from '@/types/statistics';

interface Props {
  comparisons: GradeComparison[];
  height?: number;
}

export default function GradeComparisonRadarChart({ comparisons, height = 350 }: Props) {
  // 將排名轉換為百分位 (排名越前面，百分位越高)
  const chartData = comparisons.map(c => ({
    subject: c.sport_type_name,
    個人表現: Math.round(((c.total_students - c.grade_rank + 1) / c.total_students) * 100),
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
          stroke="#3b82f6"
          fill="#3b82f6"
          fillOpacity={0.6}
        />
        <Tooltip />
      </RadarChart>
    </ResponsiveContainer>
  );
}
