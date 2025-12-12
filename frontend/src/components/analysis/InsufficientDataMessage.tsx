/**
 * InsufficientDataMessage - 資料不足提示訊息
 * Feature: 003-student-sports-data (US4)
 */

interface InsufficientDataMessageProps {
  requiredCount?: number;
  currentCount: number;
  sportTypeName?: string;
}

export default function InsufficientDataMessage({
  requiredCount = 2,
  currentCount,
  sportTypeName,
}: InsufficientDataMessageProps) {
  const remaining = requiredCount - currentCount;

  return (
    <div className="bg-amber-50 border border-amber-200 rounded-lg p-6 text-center">
      <div className="mx-auto w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mb-4">
        <svg
          className="w-6 h-6 text-amber-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
          />
        </svg>
      </div>
      <h3 className="text-lg font-semibold text-amber-800 mb-2">
        資料不足，無法進行趨勢分析
      </h3>
      <p className="text-amber-700 mb-4">
        {sportTypeName ? (
          <>
            「{sportTypeName}」目前有 {currentCount} 筆記錄，
            <br />
            需要至少 {requiredCount} 筆記錄才能顯示趨勢圖表。
          </>
        ) : (
          <>
            目前有 {currentCount} 筆記錄，
            <br />
            需要至少 {requiredCount} 筆記錄才能顯示趨勢圖表。
          </>
        )}
      </p>
      <p className="text-sm text-amber-600">
        請再新增 {remaining} 筆{sportTypeName ? `「${sportTypeName}」` : ''}
        記錄以啟用趨勢分析功能。
      </p>
    </div>
  );
}
