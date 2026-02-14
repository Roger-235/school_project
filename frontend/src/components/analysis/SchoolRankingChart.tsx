/**
 * SchoolRankingChart - 學校運動項目排名圖表
 * Feature: 003-student-sports-data (US4)
 * Task: T081
 */

'use client';

import Link from 'next/link';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';

interface RankingItem {
  rank: number;
  student_id: number;
  student_name: string;
  grade: number;
  class: string;
  best_value: number;
  test_date: string;
}

interface SchoolRankingData {
  school_id: number;
  school_name: string;
  sport_type_id: number;
  sport_type_name: string;
  value_type: string;
  unit: string;
  total_students: number;
  rankings: RankingItem[];
}

interface SchoolRankingChartProps {
  data: SchoolRankingData;
  highlightStudentId?: number;
}

// Medal colors for top 3
const MEDAL_COLORS = ['#FFD700', '#C0C0C0', '#CD7F32']; // Gold, Silver, Bronze
const DEFAULT_COLOR = '#3B82F6';

export default function SchoolRankingChart({
  data,
  highlightStudentId,
}: SchoolRankingChartProps) {
  if (!data || data.rankings.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6 text-center">
        <p className="text-gray-500">目前尚無排名資料</p>
      </div>
    );
  }

  // Prepare chart data
  const chartData = data.rankings.map((item) => ({
    ...item,
    name: item.student_name,
    value: item.best_value,
    displayName: `${item.student_name} (${item.grade}年${item.class ? item.class + '班' : ''})`,
  }));

  // Determine if lower is better (for time-based)
  const isLowerBetter = data.value_type === 'time';

  // Find the student's rank if highlighted
  const highlightedRank = highlightStudentId
    ? data.rankings.find((r) => r.student_id === highlightStudentId)?.rank
    : undefined;

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            {data.sport_type_name} 排名
          </h3>
          <p className="text-sm text-gray-500">
            {data.school_name} - 共 {data.total_students} 位學生
          </p>
        </div>
        {highlightedRank && (
          <div className="px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
            您的排名: 第 {highlightedRank} 名
          </div>
        )}
      </div>

      {/* Bar Chart */}
      <div className="h-64 mb-4">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            layout="vertical"
            margin={{ top: 5, right: 30, left: 80, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis
              type="number"
              tick={{ fill: '#6b7280', fontSize: 12 }}
              tickLine={{ stroke: '#e5e7eb' }}
              domain={isLowerBetter ? ['auto', 'auto'] : [0, 'auto']}
            />
            <YAxis
              type="category"
              dataKey="name"
              tick={{ fill: '#6b7280', fontSize: 12 }}
              tickLine={{ stroke: '#e5e7eb' }}
              width={70}
            />
            <Tooltip
              formatter={(value: number | undefined) => [`${value || 0} ${data.unit}`, '成績']}
              labelFormatter={(label) => `學生: ${label}`}
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '0.5rem',
              }}
            />
            <Bar dataKey="value" radius={[0, 4, 4, 0]}>
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={
                    entry.student_id === highlightStudentId
                      ? '#8B5CF6'
                      : index < 3
                      ? MEDAL_COLORS[index]
                      : DEFAULT_COLOR
                  }
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Ranking Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                排名
              </th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                學生
              </th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                年級班級
              </th>
              <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">
                最佳成績
              </th>
              <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">
                測驗日期
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data.rankings.map((item) => (
              <tr
                key={item.student_id}
                className={`${
                  item.student_id === highlightStudentId
                    ? 'bg-purple-50'
                    : 'hover:bg-gray-50'
                } transition-colors`}
              >
                <td className="px-4 py-2 whitespace-nowrap">
                  <span
                    className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${
                      item.rank === 1
                        ? 'bg-yellow-100 text-yellow-800'
                        : item.rank === 2
                        ? 'bg-gray-200 text-gray-800'
                        : item.rank === 3
                        ? 'bg-orange-100 text-orange-800'
                        : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {item.rank}
                  </span>
                </td>
                <td className="px-4 py-2 whitespace-nowrap">
                  <Link
                    href={`/students/${item.student_id}`}
                    className="text-sm font-medium text-blue-600 hover:text-blue-800"
                  >
                    {item.student_name}
                  </Link>
                </td>
                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-600">
                  {item.grade}年級{item.class && ` ${item.class}班`}
                </td>
                <td className="px-4 py-2 whitespace-nowrap text-sm text-right font-medium text-gray-900">
                  {item.best_value} {data.unit}
                </td>
                <td className="px-4 py-2 whitespace-nowrap text-sm text-right text-gray-500">
                  {item.test_date}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Legend */}
      <div className="mt-4 flex justify-center gap-4 text-xs text-gray-500">
        <span className="flex items-center">
          <span className="w-3 h-3 rounded-full bg-yellow-400 mr-1"></span>
          金牌
        </span>
        <span className="flex items-center">
          <span className="w-3 h-3 rounded-full bg-gray-300 mr-1"></span>
          銀牌
        </span>
        <span className="flex items-center">
          <span className="w-3 h-3 rounded-full bg-orange-400 mr-1"></span>
          銅牌
        </span>
      </div>
    </div>
  );
}
