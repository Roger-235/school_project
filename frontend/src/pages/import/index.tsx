/**
 * Import Index Page
 * Feature: 007-excel-batch-import
 *
 * 批次匯入功能首頁 - 選擇匯入類型
 */

import Link from 'next/link';
import MainLayout from '@/components/layout/MainLayout';
import { BreadcrumbItem } from '@/components/layout/Breadcrumb';

const breadcrumbItems: BreadcrumbItem[] = [
  { label: '首頁', href: '/dashboard' },
  { label: '批次匯入' },
];

export default function ImportIndexPage() {
  return (
    <MainLayout
      title="批次匯入"
      breadcrumbItems={breadcrumbItems}
    >
      <div className="max-w-4xl mx-auto">
        <p className="text-gray-600 mb-8">
          透過 Excel 檔案批次匯入學生名單或運動記錄，大幅減少手動輸入的負擔。
        </p>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Student Import Card */}
          <Link href="/import/students" className="block">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:border-blue-300 hover:shadow-md transition-all">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
                <h2 className="text-xl font-semibold text-gray-900 ml-4">學生名單匯入</h2>
              </div>
              <p className="text-gray-600 mb-4">
                批次建立學生基本資料，包含座號、姓名、性別、年級、班級、生日等欄位。
              </p>
              <ul className="text-sm text-gray-500 space-y-1 mb-4">
                <li className="flex items-center gap-2">
                  <span className="text-green-500">✓</span>
                  提供標準化 Excel 模板
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-500">✓</span>
                  自動檢查重複座號
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-500">✓</span>
                  預覽驗證後再匯入
                </li>
              </ul>
              <div className="flex items-center text-blue-600 font-medium">
                開始匯入
                <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </Link>

          {/* Records Import Card */}
          <Link href="/import/records" className="block">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:border-blue-300 hover:shadow-md transition-all">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h2 className="text-xl font-semibold text-gray-900 ml-4">運動記錄匯入</h2>
              </div>
              <p className="text-gray-600 mb-4">
                批次登錄體適能測驗成績，包含身高、體重、坐姿體前彎、立定跳遠、仰臥起坐、心肺耐力。
              </p>
              <ul className="text-sm text-gray-500 space-y-1 mb-4">
                <li className="flex items-center gap-2">
                  <span className="text-green-500">✓</span>
                  自動匹配學生（座號+姓名）
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-500">✓</span>
                  支援部分欄位填寫
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-500">✓</span>
                  成績範圍自動檢查
                </li>
              </ul>
              <div className="flex items-center text-blue-600 font-medium">
                開始匯入
                <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </Link>
        </div>

        {/* Usage Tips */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-medium text-blue-900 mb-3">使用提示</h3>
          <ul className="text-blue-800 space-y-2">
            <li className="flex items-start gap-2">
              <span className="text-blue-500 mt-1">•</span>
              <span>學期初可使用「學生名單匯入」快速建立整班學生資料</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-500 mt-1">•</span>
              <span>體適能測驗後可使用「運動記錄匯入」批次登錄成績</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-500 mt-1">•</span>
              <span>請先下載模板，依照欄位說明填寫後再上傳</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-500 mt-1">•</span>
              <span>系統會在匯入前顯示預覽，確認無誤後再執行匯入</span>
            </li>
          </ul>
        </div>
      </div>
    </MainLayout>
  );
}
