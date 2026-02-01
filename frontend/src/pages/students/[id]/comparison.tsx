import { useRouter } from 'next/router';
import { useStudentComparison } from '@/hooks/useStatistics';
import MainLayout from '@/components/layout/MainLayout';
import ComparisonRadarChart from '@/components/statistics/ComparisonRadarChart';
import ComparisonBarChart from '@/components/statistics/ComparisonBarChart';
import PerformanceSummary from '@/components/statistics/PerformanceSummary';
import ComparisonTable from '@/components/statistics/ComparisonTable';
import LoadingSpinner from '@/components/common/LoadingSpinner';

export default function StudentComparisonPage() {
  const router = useRouter();
  const { id } = router.query;
  const studentId = Number(id);

  const { data, isLoading, error } = useStudentComparison(studentId);

  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex justify-center items-center min-h-screen">
          <LoadingSpinner />
        </div>
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
            載入失敗，請稍後再試
          </div>
        </div>
      </MainLayout>
    );
  }

  if (!data) return null;

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
            {data.student.name} - 全國平均比較
          </h1>
          <p className="text-gray-600">
            {data.student.school_name} | {data.student.grade}年級 | 
            {data.student.gender === 'male' ? ' 男生' : ' 女生'}
          </p>
        </div>

        {/* 總覽卡片 */}
        <PerformanceSummary summary={data.summary} />

        {/* 雷達圖 */}
        <div className="mb-8 bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">
            全方位能力分析
          </h2>
          <ComparisonRadarChart comparisons={data.comparisons} />
        </div>

        {/* 長條圖比較 */}
        <div className="mb-8 bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">
            項目詳細比較
          </h2>
          <ComparisonBarChart comparisons={data.comparisons} />
        </div>

        {/* 詳細數據表格 */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">
            詳細數據
          </h2>
          <ComparisonTable comparisons={data.comparisons} />
        </div>
      </div>
    </MainLayout>
  );
}