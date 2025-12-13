import React, { useMemo } from 'react';
import { ImportRow, RowStatus, StudentRowData, RecordRowData } from '@/types/import';

interface PreviewTableProps {
  rows: ImportRow[];
  type: 'students' | 'records';
  onRowClick?: (row: ImportRow) => void;
}

const STATUS_CONFIG: Record<RowStatus, { icon: string; bgClass: string; textClass: string; label: string }> = {
  valid: {
    icon: '✓',
    bgClass: 'bg-green-50',
    textClass: 'text-green-600',
    label: '正確',
  },
  warning: {
    icon: '⚠',
    bgClass: 'bg-yellow-50',
    textClass: 'text-yellow-600',
    label: '警告',
  },
  error: {
    icon: '✕',
    bgClass: 'bg-red-50',
    textClass: 'text-red-600',
    label: '錯誤',
  },
};

export function PreviewTable({ rows, type, onRowClick }: PreviewTableProps) {
  // Calculate summary
  const summary = useMemo(() => {
    return rows.reduce(
      (acc, row) => {
        acc[row.status]++;
        acc.total++;
        return acc;
      },
      { valid: 0, warning: 0, error: 0, total: 0 }
    );
  }, [rows]);

  // Headers based on type
  const headers = type === 'students'
    ? ['列號', '狀態', '座號', '姓名', '性別', '年級', '班級', '生日', '錯誤/警告']
    : ['列號', '狀態', '座號', '姓名', '身高', '體重', '坐姿體前彎', '立定跳遠', '仰臥起坐', '心肺耐力', '測驗日期', '錯誤/警告'];

  const renderStudentRow = (data: StudentRowData) => (
    <>
      <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">{data.student_number}</td>
      <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">{data.name}</td>
      <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">{data.gender}</td>
      <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">{data.grade}</td>
      <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">{data.class_name || '-'}</td>
      <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">{data.birth_date || '-'}</td>
    </>
  );

  const renderRecordRow = (data: RecordRowData) => (
    <>
      <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">{data.student_number}</td>
      <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">{data.student_name}</td>
      <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">{data.height ?? '-'}</td>
      <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">{data.weight ?? '-'}</td>
      <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">{data.sit_and_reach ?? '-'}</td>
      <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">{data.standing_jump ?? '-'}</td>
      <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">{data.situps ?? '-'}</td>
      <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">{data.cardio ?? '-'}</td>
      <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">{data.test_date}</td>
    </>
  );

  return (
    <div className="w-full">
      {/* Summary */}
      <div className="mb-4 flex flex-wrap gap-4">
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">共</span>
          <span className="font-medium text-gray-900">{summary.total}</span>
          <span className="text-sm text-gray-500">筆資料</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-green-500" />
          <span className="text-sm text-gray-600">正確 {summary.valid}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-yellow-500" />
          <span className="text-sm text-gray-600">警告 {summary.warning}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-red-500" />
          <span className="text-sm text-gray-600">錯誤 {summary.error}</span>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto border border-gray-200 rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {headers.map((header) => (
                <th
                  key={header}
                  className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {rows.map((row) => {
              const statusConfig = STATUS_CONFIG[row.status];
              return (
                <tr
                  key={row.row_number}
                  className={`${statusConfig.bgClass} ${onRowClick ? 'cursor-pointer hover:opacity-80' : ''}`}
                  onClick={() => onRowClick?.(row)}
                >
                  {/* Row number */}
                  <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">
                    {row.row_number}
                  </td>

                  {/* Status */}
                  <td className="px-3 py-2 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${statusConfig.textClass} ${statusConfig.bgClass} border border-current`}>
                      <span className="mr-1">{statusConfig.icon}</span>
                      {statusConfig.label}
                    </span>
                  </td>

                  {/* Data columns */}
                  {type === 'students'
                    ? renderStudentRow(row.data as StudentRowData)
                    : renderRecordRow(row.data as RecordRowData)}

                  {/* Errors/Warnings */}
                  <td className="px-3 py-2 text-sm">
                    {row.errors.length > 0 ? (
                      <ul className="list-disc list-inside">
                        {row.errors.map((err, idx) => (
                          <li key={idx} className={err.level === 'error' ? 'text-red-600' : 'text-yellow-600'}>
                            {err.field && <span className="font-medium">[{err.field}]</span>} {err.message}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {rows.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          沒有資料
        </div>
      )}
    </div>
  );
}

export default PreviewTable;
