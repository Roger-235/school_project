interface Props {
  summary: {
    total_sports: number;
    above_average_count: number;
    average_count: number;
    below_average_count: number;
    overall_percentile: number;
  };
}

export default function PerformanceSummary({ summary }: Props) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
      {/* 總體排名 */}
      <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-6 border border-blue-200">
        <div className="text-blue-600 text-sm font-medium mb-1">總體排名</div>
        <div className="text-3xl font-bold text-blue-900">
          前 {100 - summary.overall_percentile}%
        </div>
        <div className="text-sm text-blue-600 mt-1">
          第 {summary.overall_percentile} 百分位
        </div>
      </div>

      {/* 優於平均 */}
      <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-6 border border-green-200">
        <div className="text-green-600 text-sm font-medium mb-1">優於平均</div>
        <div className="text-3xl font-bold text-green-900">
          {summary.above_average_count}
        </div>
        <div className="text-sm text-green-600 mt-1">
          / {summary.total_sports} 項目
        </div>
      </div>

      {/* 持平 */}
      <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg p-6 border border-yellow-200">
        <div className="text-yellow-600 text-sm font-medium mb-1">持平</div>
        <div className="text-3xl font-bold text-yellow-900">
          {summary.average_count}
        </div>
        <div className="text-sm text-yellow-600 mt-1">
          / {summary.total_sports} 項目
        </div>
      </div>

      {/* 待加強 */}
      <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-lg p-6 border border-red-200">
        <div className="text-red-600 text-sm font-medium mb-1">待加強</div>
        <div className="text-3xl font-bold text-red-900">
          {summary.below_average_count}
        </div>
        <div className="text-sm text-red-600 mt-1">
          / {summary.total_sports} 項目
        </div>
      </div>
    </div>
  );
}