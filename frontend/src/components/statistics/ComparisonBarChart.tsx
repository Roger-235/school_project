import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Comparison } from '@/types/statistics';

interface Props {
  comparisons: Comparison[];
}

export default function ComparisonBarChart({ comparisons }: Props) {
  const chartData = comparisons.map(c => {
    const data: any = {
      name: c.sport_type_name,
      全國平均: c.national_avg,
      unit: c.unit,
    };

    // 添加學生記錄（最多2筆）
    if (c.student_records && c.student_records.length > 0) {
      data['最新成績'] = c.student_records[0].value;
      data['最新日期'] = c.student_records[0].test_date;

      if (c.student_records.length > 1) {
        data['前次成績'] = c.student_records[1].value;
        data['前次日期'] = c.student_records[1].test_date;
      }
    }

    return data;
  });

  return (
    <ResponsiveContainer width="100%" height={400}>
      <BarChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip
          formatter={(value: any, name: any, props: any) => {
            const unit = props.payload.unit;
            if (name === '最新成績') {
              return [`${value} ${unit} (${props.payload['最新日期']})`, name];
            } else if (name === '前次成績') {
              return [`${value} ${unit} (${props.payload['前次日期']})`, name];
            }
            return [`${value} ${unit}`, name];
          }}
        />
        <Legend />
        <Bar dataKey="最新成績" fill="#3b82f6" />
        <Bar dataKey="前次成績" fill="#60a5fa" />
        <Bar dataKey="全國平均" fill="#94a3b8" />
      </BarChart>
    </ResponsiveContainer>
  );
}