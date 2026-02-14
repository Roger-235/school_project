/**
 * TrendChart - 運動表現趨勢圖表
 * Feature: 003-student-sports-data (US4)
 */

'use client';

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import type { SportRecord } from '@/types/sports';

interface TrendChartProps {
  records: SportRecord[];
  sportTypeName: string;
  unit: string;
  valueType: 'time' | 'distance' | 'count';
}

export default function TrendChart({
  records,
  sportTypeName,
  unit,
  valueType,
}: TrendChartProps) {
  if (records.length < 2) {
    return null;
  }

  // Sort by date ascending
  const sortedRecords = [...records].sort(
    (a, b) => new Date(a.test_date).getTime() - new Date(b.test_date).getTime()
  );

  // Prepare chart data
  const chartData = sortedRecords.map((record) => ({
    date: new Date(record.test_date).toLocaleDateString('zh-TW', {
      month: 'short',
      day: 'numeric',
    }),
    fullDate: record.test_date,
    value: record.value,
  }));

  // Calculate average
  const avgValue =
    sortedRecords.reduce((sum, r) => sum + r.value, 0) / sortedRecords.length;

  // Calculate min and max for Y axis
  const minValue = Math.min(...sortedRecords.map((r) => r.value));
  const maxValue = Math.max(...sortedRecords.map((r) => r.value));
  const padding = (maxValue - minValue) * 0.1 || 5;

  // For time-based metrics, lower is better (show inverted improvement)
  const isLowerBetter = valueType === 'time';

  // Calculate trend (improvement or decline)
  const firstValue = sortedRecords[0].value;
  const lastValue = sortedRecords[sortedRecords.length - 1].value;
  const change = lastValue - firstValue;
  const percentChange = ((change / firstValue) * 100).toFixed(1);
  const isImproving = isLowerBetter ? change < 0 : change > 0;

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-900">{sportTypeName}</h3>
        <div
          className={`px-3 py-1 rounded-full text-sm font-medium ${
            isImproving
              ? 'bg-green-100 text-green-800'
              : change === 0
              ? 'bg-gray-100 text-gray-800'
              : 'bg-red-100 text-red-800'
          }`}
        >
          {isImproving ? '↑ 進步' : change === 0 ? '— 持平' : '↓ 退步'}{' '}
          {Math.abs(parseFloat(percentChange))}%
        </div>
      </div>

      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={chartData}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis
              dataKey="date"
              tick={{ fill: '#6b7280', fontSize: 12 }}
              tickLine={{ stroke: '#e5e7eb' }}
            />
            <YAxis
              domain={[minValue - padding, maxValue + padding]}
              tick={{ fill: '#6b7280', fontSize: 12 }}
              tickLine={{ stroke: '#e5e7eb' }}
              tickFormatter={(value) => `${value}`}
            />
            <Tooltip
              formatter={(value: number | undefined) => [`${value || 0} ${unit}`, sportTypeName]}
              labelFormatter={(label) => `日期: ${label}`}
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '0.5rem',
              }}
            />
            <ReferenceLine
              y={avgValue}
              stroke="#9ca3af"
              strokeDasharray="5 5"
              label={{
                value: `平均: ${avgValue.toFixed(1)}`,
                fill: '#6b7280',
                fontSize: 12,
              }}
            />
            <Line
              type="monotone"
              dataKey="value"
              stroke={isImproving ? '#10b981' : '#ef4444'}
              strokeWidth={2}
              dot={{ fill: isImproving ? '#10b981' : '#ef4444', r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-4 text-center text-sm">
        <div>
          <p className="text-gray-500">首次記錄</p>
          <p className="font-semibold">
            {firstValue} {unit}
          </p>
        </div>
        <div>
          <p className="text-gray-500">最新記錄</p>
          <p className="font-semibold">
            {lastValue} {unit}
          </p>
        </div>
        <div>
          <p className="text-gray-500">變化</p>
          <p
            className={`font-semibold ${
              isImproving
                ? 'text-green-600'
                : change === 0
                ? 'text-gray-600'
                : 'text-red-600'
            }`}
          >
            {change > 0 ? '+' : ''}
            {change.toFixed(1)} {unit}
          </p>
        </div>
      </div>
    </div>
  );
}
