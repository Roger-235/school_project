import { Comparison } from '@/types/statistics';

interface Props {
  comparisons: Comparison[];
}

export default function ComparisonTable({ comparisons }: Props) {
  const getPerformanceColor = (level: string) => {
    switch (level) {
      case 'excellent': return 'text-green-600 bg-green-50 border-green-200';
      case 'above_average': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'average': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'below_average': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getPerformanceText = (level: string) => {
    switch (level) {
      case 'excellent': return '優秀';
      case 'above_average': return '良好';
      case 'average': return '普通';
      case 'below_average': return '待加強';
      default: return '-';
    }
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
              全國平均
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              差異
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              百分位
            </th>
            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
              評等
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {comparisons.map((c, index) => (
            <tr key={index} className="hover:bg-gray-50 transition-colors">
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      {c.sport_type_name}
                    </div>
                    <div className="text-xs text-gray-500">{c.category}</div>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                {c.student_records && c.student_records.length > 0 ? (
                  <div>
                    <div className="font-medium text-gray-900">
                      {c.student_records[0].value.toFixed(1)} {c.unit}
                    </div>
                    <div className="text-xs text-gray-500">
                      {c.student_records[0].test_date}
                    </div>
                    {c.student_records.length > 1 && (
                      <div className="mt-1 pt-1 border-t border-gray-200">
                        <div className="font-medium text-blue-600">
                          {c.student_records[1].value.toFixed(1)} {c.unit}
                        </div>
                        <div className="text-xs text-gray-500">
                          {c.student_records[1].test_date} (前次)
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div>
                    <div className="font-medium text-gray-900">
                      {c.student_value.toFixed(1)} {c.unit}
                    </div>
                    <div className="text-xs text-gray-500">
                      {c.student_test_date}
                    </div>
                  </div>
                )}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-500">
                {c.national_avg.toFixed(1)} {c.unit}
              </td>
              <td className={`px-6 py-4 whitespace-nowrap text-sm text-right font-medium ${
                c.difference > 0 ? 'text-green-600' : c.difference < 0 ? 'text-red-600' : 'text-gray-500'
              }`}>
                <div>
                  {c.difference > 0 ? '+' : ''}{c.difference.toFixed(1)} {c.unit}
                </div>
                <div className="text-xs">
                  ({c.difference_percent > 0 ? '+' : ''}{c.difference_percent.toFixed(1)}%)
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                <div className="text-gray-900 font-medium">
                  第 {c.percentile_rank} 百分位
                </div>
                <div className="text-xs text-gray-500">
                  前 {100 - c.percentile_rank}%
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-center">
                <span className={`px-3 py-1 text-xs font-medium rounded-full border ${getPerformanceColor(c.performance_level)}`}>
                  {getPerformanceText(c.performance_level)}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}