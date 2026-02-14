/**
 * RecordHistoryModal - 運動記錄變更歷史 Modal
 * Feature: 003-student-sports-data
 */

'use client'

import { useSportRecordHistory } from '@/hooks/useSportRecords'
import { SportRecordAudit } from '@/types/sports'

interface RecordHistoryModalProps {
  recordId: number
  sportTypeName: string
  unit: string
  isOpen: boolean
  onClose: () => void
}

export default function RecordHistoryModal({
  recordId,
  sportTypeName,
  unit,
  isOpen,
  onClose,
}: RecordHistoryModalProps) {
  const { data, isLoading } = useSportRecordHistory(isOpen ? recordId : null)
  const audits = data?.data?.audits || []

  if (!isOpen) return null

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleString('zh-TW', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const formatValue = (value: number | undefined) => {
    if (value === undefined || value === null) return '-'
    return `${value} ${unit}`
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
        <div className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg">
          {/* Header */}
          <div className="bg-gray-50 px-4 py-4 sm:px-6 border-b">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">
                變更歷史 - {sportTypeName}
              </h3>
              <button
                onClick={onClose}
                className="rounded-md text-gray-400 hover:text-gray-500 focus:outline-none"
              >
                <span className="sr-only">關閉</span>
                <svg
                  className="h-6 w-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="px-4 py-5 sm:px-6 max-h-96 overflow-y-auto">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : audits.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <svg
                  className="mx-auto h-12 w-12 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <p className="mt-4">此記錄尚無變更歷史</p>
              </div>
            ) : (
              <div className="space-y-4">
                {audits.map((audit, index) => (
                  <div
                    key={audit.id}
                    className="relative pl-6 pb-4 border-l-2 border-gray-200 last:pb-0"
                  >
                    {/* Timeline dot */}
                    <div className="absolute -left-2 top-0 w-4 h-4 bg-blue-500 rounded-full" />

                    {/* Content */}
                    <div className="bg-gray-50 rounded-lg p-3">
                      <div className="text-sm text-gray-500">
                        {formatDate(audit.changed_at)}
                      </div>
                      <div className="mt-1 flex items-center space-x-2">
                        <span className="text-gray-600">
                          {formatValue(audit.old_value)}
                        </span>
                        <svg
                          className="w-4 h-4 text-gray-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M17 8l4 4m0 0l-4 4m4-4H3"
                          />
                        </svg>
                        <span className="font-medium text-gray-900">
                          {formatValue(audit.new_value)}
                        </span>
                      </div>
                      {audit.reason && (
                        <p className="mt-2 text-sm text-gray-600">
                          原因：{audit.reason}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="bg-gray-50 px-4 py-3 sm:px-6 border-t">
            <button
              type="button"
              onClick={onClose}
              className="w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:w-auto sm:text-sm"
            >
              關閉
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
