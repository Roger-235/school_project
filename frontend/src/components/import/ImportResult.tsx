import React from 'react';
import { ImportResult as ImportResultType, ImportedError } from '@/types/import';

interface ImportResultProps {
  result: ImportResultType;
  type: 'students' | 'records';
  onClose: () => void;
  onNewImport: () => void;
}

export function ImportResult({ result, type, onClose, onNewImport }: ImportResultProps) {
  const typeLabel = type === 'students' ? '學生' : '運動記錄';
  const hasErrors = result.errors.length > 0;
  const isFullSuccess = result.success_count > 0 && result.skip_count === 0;

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Result Icon */}
      <div className="text-center mb-6">
        {isFullSuccess ? (
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100">
            <svg className="w-10 h-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        ) : result.success_count > 0 ? (
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-yellow-100">
            <svg className="w-10 h-10 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
        ) : (
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100">
            <svg className="w-10 h-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
        )}
      </div>

      {/* Title */}
      <h2 className="text-2xl font-bold text-center text-gray-900 mb-2">
        {isFullSuccess
          ? '匯入完成'
          : result.success_count > 0
          ? '部分匯入完成'
          : '匯入失敗'}
      </h2>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-green-50 rounded-lg p-4 text-center">
          <p className="text-3xl font-bold text-green-600">{result.success_count}</p>
          <p className="text-sm text-green-700">成功匯入</p>
        </div>
        <div className="bg-gray-50 rounded-lg p-4 text-center">
          <p className="text-3xl font-bold text-gray-600">{result.skip_count}</p>
          <p className="text-sm text-gray-700">跳過/失敗</p>
        </div>
      </div>

      {/* Success message */}
      {result.success_count > 0 && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
          <p className="text-green-800">
            已成功匯入 <strong>{result.success_count}</strong> 筆{typeLabel}資料
          </p>
        </div>
      )}

      {/* Error List */}
      {hasErrors && (
        <div className="mb-6">
          <h3 className="text-lg font-medium text-gray-900 mb-3">
            跳過的資料 ({result.errors.length} 筆)
          </h3>
          <div className="bg-red-50 border border-red-200 rounded-lg overflow-hidden">
            <div className="max-h-60 overflow-y-auto">
              <table className="min-w-full divide-y divide-red-200">
                <thead className="bg-red-100">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-red-800">列號</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-red-800">錯誤原因</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-red-100">
                  {result.errors.map((error: ImportedError, idx: number) => (
                    <tr key={idx}>
                      <td className="px-4 py-2 text-sm text-red-900 whitespace-nowrap">
                        第 {error.row_number} 列
                      </td>
                      <td className="px-4 py-2 text-sm text-red-700">
                        {error.field && <span className="font-medium">[{error.field}] </span>}
                        {error.message}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-4 justify-center">
        <button
          type="button"
          onClick={onClose}
          className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
        >
          關閉
        </button>
        <button
          type="button"
          onClick={onNewImport}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          繼續匯入
        </button>
      </div>
    </div>
  );
}

export default ImportResult;
