import { useMemo, useState } from 'react';
import { useRouter } from 'next/router';
import { useCountyComparison, useGradeComparison, useStudentComparison } from '@/hooks/useStatistics';
import MainLayout from '@/components/layout/MainLayout';
import CountyComparisonRadarChart from '@/components/statistics/CountyComparisonRadarChart';
import GradeComparisonRadarChart from '@/components/statistics/GradeComparisonRadarChart';
import ComparisonRadarChart from '@/components/statistics/ComparisonRadarChart';
import CountyComparisonTable from '@/components/statistics/CountyComparisonTable';
import GradeComparisonTable from '@/components/statistics/GradeComparisonTable';
import ComparisonTable from '@/components/statistics/ComparisonTable';
import PerformanceSummary from '@/components/statistics/PerformanceSummary';
import LoadingSpinner from '@/components/common/LoadingSpinner';

const CATEGORY_CONFIG: Record<string, { label: string; color: string }> = {
  '體適能': { label: '體適能', color: 'border-green-500' },
  '田徑':   { label: '田徑',   color: 'border-blue-500' },
  '球類':   { label: '球類',   color: 'border-orange-500' },
};

type TabType = 'national' | 'county' | 'grade';

export default function StudentComparisonPage() {
  const router = useRouter();
  const { id } = router.query;
  const studentId = Number(id);
  const [activeTab, setActiveTab] = useState<TabType>('national');

  const { data: nationalData, isLoading: nationalLoading } = useStudentComparison(studentId);
  const { data: countyData, isLoading: countyLoading } = useCountyComparison(studentId);
  const { data: gradeData, isLoading: gradeLoading } = useGradeComparison(studentId);

  // 依類別分組 (全國)
  const groupedNationalComparisons = useMemo(() => {
    const comparisons = nationalData?.comparisons ?? [];
    const groups: Record<string, typeof comparisons> = {};
    for (const c of comparisons) {
      if (!groups[c.category]) groups[c.category] = [];
      groups[c.category].push(c);
    }
    return groups;
  }, [nationalData?.comparisons]);

  // 依類別分組 (縣市內)
  const groupedCountyComparisons = useMemo(() => {
    const comparisons = countyData?.comparisons ?? [];
    const groups: Record<string, typeof comparisons> = {};
    for (const c of comparisons) {
      if (!groups[c.category]) groups[c.category] = [];
      groups[c.category].push(c);
    }
    return groups;
  }, [countyData?.comparisons]);

  // 依類別分組 (同年級)
  const groupedGradeComparisons = useMemo(() => {
    const comparisons = gradeData?.comparisons ?? [];
    const groups: Record<string, typeof comparisons> = {};
    for (const c of comparisons) {
      if (!groups[c.category]) groups[c.category] = [];
      groups[c.category].push(c);
    }
    return groups;
  }, [gradeData?.comparisons]);

  // 縣市內總覽統計
  const countySummary = useMemo(() => {
    const comparisons = countyData?.comparisons ?? [];
    if (comparisons.length === 0) return null;
    const total = comparisons.length;
    const topQuarter = comparisons.filter(c => c.county_rank / c.total_students <= 0.25).length;
    const aboveAvg = comparisons.filter(c => c.student_value > c.county_avg).length;
    const belowAvg = comparisons.filter(c => c.student_value < c.county_avg).length;
    const avgPct = Math.round(
      comparisons.reduce((sum, c) => sum + ((c.total_students - c.county_rank + 1) / c.total_students) * 100, 0) / total
    );
    return { total_sports: total, above_average_count: aboveAvg, average_count: topQuarter, below_average_count: belowAvg, overall_percentile: avgPct };
  }, [countyData?.comparisons]);

  // 同年級總覽統計
  const gradeSummary = useMemo(() => {
    const comparisons = gradeData?.comparisons ?? [];
    if (comparisons.length === 0) return null;
    const total = comparisons.length;
    const topQuarter = comparisons.filter(c => c.grade_rank / c.total_students <= 0.25).length;
    const aboveAvg = comparisons.filter(c => c.student_value > c.grade_avg).length;
    const belowAvg = comparisons.filter(c => c.student_value < c.grade_avg).length;
    const avgPct = Math.round(
      comparisons.reduce((sum, c) => sum + ((c.total_students - c.grade_rank + 1) / c.total_students) * 100, 0) / total
    );
    return { total_sports: total, above_average_count: aboveAvg, average_count: topQuarter, below_average_count: belowAvg, overall_percentile: avgPct };
  }, [gradeData?.comparisons]);

  const student = nationalData?.student ?? countyData?.student ?? gradeData?.student;

  if (nationalLoading && countyLoading && gradeLoading) {
    return (
      <MainLayout>
        <div className="flex justify-center items-center min-h-screen">
          <LoadingSpinner />
        </div>
      </MainLayout>
    );
  }

  if (!student) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
            找不到學生資料
          </div>
        </div>
      </MainLayout>
    );
  }

  const countyName = countyData?.comparisons?.[0]?.county_name ?? '';

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* 頁面標題 */}
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="text-blue-600 hover:text-blue-800 mb-4 flex items-center gap-2"
          >
            ← 返回
          </button>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {student.name} - 成績比較分析
          </h1>
          <p className="text-gray-600">
            {student.school_name} | {student.grade}年級 |
            {student.gender === 'male' ? ' 男生' : ' 女生'}
            {countyName && ` | ${countyName}`}
          </p>
        </div>

        {/* 切換按鈕 */}
        <div className="flex gap-1 bg-gray-100 rounded-lg p-1 mb-8 max-w-lg">
          <button
            onClick={() => setActiveTab('national')}
            className={`flex-1 px-4 py-2.5 rounded-md text-sm font-medium transition-all ${
              activeTab === 'national'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            全國比較
          </button>
          <button
            onClick={() => setActiveTab('county')}
            className={`flex-1 px-4 py-2.5 rounded-md text-sm font-medium transition-all ${
              activeTab === 'county'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            縣市內比較
          </button>
          <button
            onClick={() => setActiveTab('grade')}
            className={`flex-1 px-4 py-2.5 rounded-md text-sm font-medium transition-all ${
              activeTab === 'grade'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            同年級比較
          </button>
        </div>

        {/* 全國比較 */}
        {activeTab === 'national' && (
          <>
            {nationalLoading ? (
              <div className="flex justify-center py-8"><LoadingSpinner /></div>
            ) : nationalData && nationalData.comparisons && nationalData.comparisons.length > 0 ? (
              <>
                <PerformanceSummary summary={nationalData.summary} />

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                  {Object.entries(groupedNationalComparisons).map(([category, items]) => {
                    const config = CATEGORY_CONFIG[category] ?? { label: category, color: 'border-gray-500' };
                    return (
                      <div key={category} className={`bg-white rounded-lg shadow-md p-6 border-t-4 ${config.color}`}>
                        <h2 className="text-lg font-semibold mb-4 text-gray-800">{config.label}</h2>
                        <ComparisonRadarChart comparisons={items} />
                      </div>
                    );
                  })}
                </div>

                <div className="bg-white rounded-lg shadow-md p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold text-gray-800">詳細數據</h2>
                    <div className="flex items-center gap-3">
                      <span className="px-3 py-1 text-xs font-medium rounded-full border text-green-600 bg-green-50 border-green-200">優秀</span>
                      <span className="px-3 py-1 text-xs font-medium rounded-full border text-blue-600 bg-blue-50 border-blue-200">良好</span>
                      <span className="px-3 py-1 text-xs font-medium rounded-full border text-yellow-600 bg-yellow-50 border-yellow-200">普通</span>
                      <span className="px-3 py-1 text-xs font-medium rounded-full border text-red-600 bg-red-50 border-red-200">待加強</span>
                    </div>
                  </div>
                  <ComparisonTable comparisons={nationalData.comparisons ?? []} />
                </div>
              </>
            ) : (
              <p className="text-gray-500 text-center py-4">全國比較資料不足</p>
            )}
          </>
        )}

        {/* 縣市內比較 */}
        {activeTab === 'county' && (
          <>
            {countyLoading ? (
              <div className="flex justify-center py-8"><LoadingSpinner /></div>
            ) : countyData && countyData.comparisons && countyData.comparisons.length > 0 ? (
              <>
                {countySummary && (
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                    <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-6 border border-purple-200">
                      <div className="text-purple-600 text-sm font-medium mb-1">縣市平均排名百分位</div>
                      <div className="text-3xl font-bold text-purple-900">
                        前 {100 - countySummary.overall_percentile}%
                      </div>
                      <div className="text-sm text-purple-600 mt-1">在{countyName}中的綜合表現</div>
                    </div>
                    <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-6 border border-green-200">
                      <div className="text-green-600 text-sm font-medium mb-1">優於縣市平均</div>
                      <div className="text-3xl font-bold text-green-900">{countySummary.above_average_count}</div>
                      <div className="text-sm text-green-600 mt-1">/ {countySummary.total_sports} 項目</div>
                    </div>
                    <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg p-6 border border-yellow-200">
                      <div className="text-yellow-600 text-sm font-medium mb-1">前 25% 項目</div>
                      <div className="text-3xl font-bold text-yellow-900">{countySummary.average_count}</div>
                      <div className="text-sm text-yellow-600 mt-1">/ {countySummary.total_sports} 項目</div>
                    </div>
                    <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-lg p-6 border border-red-200">
                      <div className="text-red-600 text-sm font-medium mb-1">低於縣市平均</div>
                      <div className="text-3xl font-bold text-red-900">{countySummary.below_average_count}</div>
                      <div className="text-sm text-red-600 mt-1">/ {countySummary.total_sports} 項目</div>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                  {Object.entries(groupedCountyComparisons).map(([category, items]) => {
                    const config = CATEGORY_CONFIG[category] ?? { label: category, color: 'border-gray-500' };
                    return (
                      <div key={category} className={`bg-white rounded-lg shadow-md p-6 border-t-4 ${config.color}`}>
                        <h2 className="text-lg font-semibold mb-4 text-gray-800">{config.label}</h2>
                        <CountyComparisonRadarChart comparisons={items} />
                      </div>
                    );
                  })}
                </div>

                <div className="bg-white rounded-lg shadow-md p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold text-gray-800">詳細數據</h2>
                    <div className="flex items-center gap-3">
                      <span className="px-3 py-1 text-xs font-medium rounded-full border text-yellow-600 bg-yellow-50 border-yellow-200">Top 10%</span>
                      <span className="px-3 py-1 text-xs font-medium rounded-full border text-green-600 bg-green-50 border-green-200">Top 25%</span>
                      <span className="px-3 py-1 text-xs font-medium rounded-full border text-blue-600 bg-blue-50 border-blue-200">Top 50%</span>
                      <span className="px-3 py-1 text-xs font-medium rounded-full border text-gray-600 bg-gray-50 border-gray-200">50% 以下</span>
                    </div>
                  </div>
                  <CountyComparisonTable
                    comparisons={countyData.comparisons}
                    grade={student.grade}
                    gender={student.gender}
                  />
                </div>
              </>
            ) : (
              <p className="text-gray-500 text-center py-4">縣市內比較資料不足（同縣市同年級同性別至少需要 2 名學生）</p>
            )}
          </>
        )}

        {/* 同年級比較 */}
        {activeTab === 'grade' && (
          <>
            {gradeLoading ? (
              <div className="flex justify-center py-8"><LoadingSpinner /></div>
            ) : gradeData && gradeData.comparisons && gradeData.comparisons.length > 0 ? (
              <>
                {gradeSummary && (
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-6 border border-blue-200">
                      <div className="text-blue-600 text-sm font-medium mb-1">平均排名百分位</div>
                      <div className="text-3xl font-bold text-blue-900">
                        前 {100 - gradeSummary.overall_percentile}%
                      </div>
                      <div className="text-sm text-blue-600 mt-1">在同年級中的綜合表現</div>
                    </div>
                    <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-6 border border-green-200">
                      <div className="text-green-600 text-sm font-medium mb-1">優於年級平均</div>
                      <div className="text-3xl font-bold text-green-900">{gradeSummary.above_average_count}</div>
                      <div className="text-sm text-green-600 mt-1">/ {gradeSummary.total_sports} 項目</div>
                    </div>
                    <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg p-6 border border-yellow-200">
                      <div className="text-yellow-600 text-sm font-medium mb-1">前 25% 項目</div>
                      <div className="text-3xl font-bold text-yellow-900">{gradeSummary.average_count}</div>
                      <div className="text-sm text-yellow-600 mt-1">/ {gradeSummary.total_sports} 項目</div>
                    </div>
                    <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-lg p-6 border border-red-200">
                      <div className="text-red-600 text-sm font-medium mb-1">低於年級平均</div>
                      <div className="text-3xl font-bold text-red-900">{gradeSummary.below_average_count}</div>
                      <div className="text-sm text-red-600 mt-1">/ {gradeSummary.total_sports} 項目</div>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                  {Object.entries(groupedGradeComparisons).map(([category, items]) => {
                    const config = CATEGORY_CONFIG[category] ?? { label: category, color: 'border-gray-500' };
                    return (
                      <div key={category} className={`bg-white rounded-lg shadow-md p-6 border-t-4 ${config.color}`}>
                        <h2 className="text-lg font-semibold mb-4 text-gray-800">{config.label}</h2>
                        <GradeComparisonRadarChart comparisons={items} />
                      </div>
                    );
                  })}
                </div>

                <div className="bg-white rounded-lg shadow-md p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold text-gray-800">詳細數據</h2>
                    <div className="flex items-center gap-3">
                      <span className="px-3 py-1 text-xs font-medium rounded-full border text-yellow-600 bg-yellow-50 border-yellow-200">Top 10%</span>
                      <span className="px-3 py-1 text-xs font-medium rounded-full border text-green-600 bg-green-50 border-green-200">Top 25%</span>
                      <span className="px-3 py-1 text-xs font-medium rounded-full border text-blue-600 bg-blue-50 border-blue-200">Top 50%</span>
                      <span className="px-3 py-1 text-xs font-medium rounded-full border text-gray-600 bg-gray-50 border-gray-200">50% 以下</span>
                    </div>
                  </div>
                  <GradeComparisonTable
                    comparisons={gradeData.comparisons}
                    grade={student.grade}
                  />
                </div>
              </>
            ) : (
              <p className="text-gray-500 text-center py-4">同年級比較資料不足</p>
            )}
          </>
        )}
      </div>
    </MainLayout>
  );
}
