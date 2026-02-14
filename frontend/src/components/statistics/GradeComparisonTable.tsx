import { GradeComparison } from '@/types/statistics';

interface Props {
  comparisons: GradeComparison[];
  grade: number;
}

export default function GradeComparisonTable({ comparisons, grade }: Props) {
  const getRankColor = (rank: number, total: number) => {
    const pct = rank / total;
    if (pct <= 0.1) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    if (pct <= 0.25) return 'text-green-600 bg-green-50 border-green-200';
    if (pct <= 0.5) return 'text-blue-600 bg-blue-50 border-blue-200';
    return 'text-gray-600 bg-gray-50 border-gray-200';
  };

  const getRankLabel = (rank: number, total: number) => {
    const pct = rank / total;
    if (pct <= 0.1) return 'Top 10%';
    if (pct <= 0.25) return 'Top 25%';
    if (pct <= 0.5) return 'Top 50%';
    return `Top ${Math.round(pct * 100)}%`;
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              項目
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              個人成績
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              {grade}年級平均
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              差異
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              年級最佳
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              排名
            </th>
            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
              等級
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {comparisons.map((c, index) => {
            const diff = c.student_value - c.grade_avg;
            const diffPct = c.grade_avg !== 0 ? (diff / c.grade_avg) * 100 : 0;
            return (
              <tr key={index} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      {c.sport_type_name}
                    </div>
                    <div className="text-xs text-gray-500">{c.category}</div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                  <div className="font-medium text-gray-900">
                    {c.student_value.toFixed(1)} {c.unit}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-500">
                  {c.grade_avg.toFixed(1)} {c.unit}
                </td>
                <td className={`px-6 py-4 whitespace-nowrap text-sm text-right font-medium ${
                  diff > 0 ? 'text-green-600' : diff < 0 ? 'text-red-600' : 'text-gray-500'
                }`}>
                  <div>
                    {diff > 0 ? '+' : ''}{diff.toFixed(1)} {c.unit}
                  </div>
                  <div className="text-xs">
                    ({diffPct > 0 ? '+' : ''}{diffPct.toFixed(0)}%)
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-500">
                  {c.grade_best.toFixed(1)} {c.unit}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                  <div className="text-gray-900 font-medium">
                    第 {c.grade_rank} 名
                  </div>
                  <div className="text-xs text-gray-500">
                    / {c.total_students} 人
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center">
                  <span className={`px-3 py-1 text-xs font-medium rounded-full border ${getRankColor(c.grade_rank, c.total_students)}`}>
                    {getRankLabel(c.grade_rank, c.total_students)}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
