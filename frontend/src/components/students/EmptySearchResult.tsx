/**
 * EmptySearchResult Component
 * Feature: 003-student-sports-data
 * Task: T069
 */

import Link from 'next/link'

interface EmptySearchResultProps {
  searchQuery?: string
  message?: string
  showAddButton?: boolean
}

export default function EmptySearchResult({
  searchQuery,
  message,
  showAddButton = true,
}: EmptySearchResultProps) {
  const hasSearchQuery = searchQuery && searchQuery.trim().length > 0

  return (
    <div className="bg-white shadow rounded-lg p-12 text-center">
      {/* Empty State Icon */}
      <div className="mx-auto w-24 h-24 flex items-center justify-center rounded-full bg-gray-100 mb-6">
        {hasSearchQuery ? (
          <svg
            className="w-12 h-12 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        ) : (
          <svg
            className="w-12 h-12 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
            />
          </svg>
        )}
      </div>

      {/* Message */}
      <h3 className="text-lg font-medium text-gray-900 mb-2">
        {message || (hasSearchQuery ? '找不到符合條件的學生' : '尚無學生資料')}
      </h3>

      {hasSearchQuery ? (
        <div className="space-y-4">
          <p className="text-sm text-gray-500">
            搜尋「<span className="font-medium text-gray-700">{searchQuery}</span>」沒有找到任何結果
          </p>
          <div className="text-sm text-gray-500">
            <p className="mb-2">建議：</p>
            <ul className="list-disc list-inside space-y-1 text-left max-w-xs mx-auto">
              <li>檢查輸入的文字是否正確</li>
              <li>嘗試使用較少的篩選條件</li>
              <li>使用不同的關鍵字搜尋</li>
            </ul>
          </div>
        </div>
      ) : (
        <p className="text-sm text-gray-500 mb-6">
          目前系統中尚未有任何學生資料，請先新增學生。
        </p>
      )}

      {/* Action Buttons */}
      {showAddButton && !hasSearchQuery && (
        <div className="mt-6">
          <Link
            href="/students/new"
            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <svg
              className="w-5 h-5 mr-2 -ml-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            新增第一位學生
          </Link>
        </div>
      )}

      {/* Quick Links */}
      <div className="mt-8 pt-6 border-t border-gray-200">
        <p className="text-xs text-gray-400 mb-3">快速連結</p>
        <div className="flex justify-center space-x-4">
          <Link
            href="/schools"
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            查看學校列表
          </Link>
          <span className="text-gray-300">|</span>
          <Link
            href="/"
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            返回首頁
          </Link>
        </div>
      </div>
    </div>
  )
}
