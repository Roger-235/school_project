import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Comparison } from '@/types/statistics';

interface Props {
  comparisons: Comparison[];
}

export default function ComparisonBarChart({ comparisons }: Props) {
  const chartData = comparisons.map(c => ({
    name: c.sport_type_name,
    個人成績: c.student_value,
    全國平均: c.national_avg,
    unit: c.unit,
  }));

  return (
    <ResponsiveContainer width="100%" height={400}>
      <BarChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip 
          formatter={(value: any, name: any, props: any) => [
            `${value} ${props.payload.unit}`,
            name
          ]}
        />
        <Legend />
        <Bar dataKey="個人成績" fill="#3b82f6" />
        <Bar dataKey="全國平均" fill="#94a3b8" />
      </BarChart>
    </ResponsiveContainer>
  );
}