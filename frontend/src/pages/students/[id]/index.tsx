/**
 * Student Detail Page
 * Feature: 003-student-sports-data
 * Updated: 004-navigation-enhancement - Use MainLayout for consistent navigation
 * Updated: Removed Analysis Chart (Cleanup)
 */

import { useState } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import MainLayout from '@/components/layout/MainLayout'
import { useStudent, useDeleteStudent } from '@/hooks/useStudents'
import { useSportRecords, useDeleteSportRecord } from '@/hooks/useSportRecords'
import SportRecordList from '@/components/records/SportRecordList'
import RecordHistoryModal from '@/components/records/RecordHistoryModal'
import { PerformanceAnalysis } from '@/components/analysis'
import { GENDER_LABELS } from '@/types/sports'
import type { BreadcrumbItem } from '@/components/layout/Breadcrumb'

export default function StudentDetailPage() {
  const router = useRouter()
  const { id } = router.query
  const studentId = id ? parseInt(id as string) : null

  const [recordsPage, setRecordsPage] = useState(1)
  const [historyModalRecord, setHistoryModalRecord] = useState<{
    id: number
    sportTypeName: string
    unit: string
  } | null>(null)

  const { data, isLoading } = useStudent(studentId)
  const deleteStudent = useDeleteStudent()
  const {
    data: recordsData,
    isLoading: recordsLoading,
  } = useSportRecords(studentId, recordsPage, 10)
  const deleteRecord = useDeleteSportRecord()

  const student = data?.data?.student
  const records = recordsData?.data?.records || []
  const pagination = recordsData?.data?.pagination

  const handleDelete = async () => {
    if (!studentId) return
    if (window.confirm('確定要刪除此學生嗎？')) {
      try {
        await deleteStudent.mutateAsync(studentId)
        alert('學生已成功刪除')
        router.push('/students')
      } catch (error) {
        alert('刪除失敗，請稍後再試')
      }
    }
  }

  const handleDeleteRecord = async (recordId: number) => {
    if (window.confirm('確定要刪除此運動記錄嗎？')) {
      try {
        await deleteRecord.mutateAsync(recordId)
        alert('運動記錄已成功刪除')
      } catch (error) {
        alert('刪除失敗，請稍後再試')
      }
    }
  }

  const handleViewHistory = (recordId: number) => {
    const record = records.find((r) => r.id === recordId)
    if (record) {
      setHistoryModalRecord({
        id: recordId,
        sportTypeName: record.sport_type?.name || '',
        unit: record.sport_type?.default_unit || '',
      })
    }
  }

  // Breadcrumb with dynamic student name
  const breadcrumbItems: BreadcrumbItem[] = [
    { label: '首頁', href: '/dashboard' },
    { label: '學生管理', href: '/students' },
    { label: student?.name || `學生 #${id}` },
  ]

  if (isLoading) {
    return (
      <MainLayout breadcrumbItems={breadcrumbItems}>
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </MainLayout>
    )
  }

  if (!student) {
    return (
      <MainLayout breadcrumbItems={breadcrumbItems}>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-gray-900">學生不存在</h2>
            <Link
              href="/students"
              className="mt-4 text-blue-600 hover:underline"
            >
              返回學生列表
            </Link>
          </div>
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout breadcrumbItems={breadcrumbItems}>
      {/* Student Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{student.name}</h1>
          <p className="mt-1 text-sm text-gray-500">學號：{student.student_number}</p>
        </div>
        <div className="flex space-x-3">
          <Link
            href={`/students/${student.id}/comparison`}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            <svg
              className="w-5 h-5 mr-2"
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
            全國平均比較
          </Link>
          <Link
            href={`/students/${student.id}/edit`}
            className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            編輯
          </Link>
          <button
            onClick={handleDelete}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700"
          >
            刪除
          </button>
        </div>
      </div>

      {/* Student Info */}
      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">學生資訊</h2>
        <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <dt className="text-sm font-medium text-gray-500">姓名</dt>
            <dd className="mt-1 text-sm text-gray-900">{student.name}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">學號</dt>
            <dd className="mt-1 text-sm text-gray-900">{student.student_number}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">學校</dt>
            <dd className="mt-1 text-sm text-gray-900">
              {student.school ? (
                <Link
                  href={`/schools/${student.school.id}`}
                  className="text-blue-600 hover:text-blue-800"
                >
                  {student.school.name}
                </Link>
              ) : (
                '-'
              )}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">年級</dt>
            <dd className="mt-1 text-sm text-gray-900">{student.grade} 年級</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">班級</dt>
            <dd className="mt-1 text-sm text-gray-900">{student.class || '-'}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">性別</dt>
            <dd className="mt-1 text-sm text-gray-900">
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  student.gender === 'male'
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-pink-100 text-pink-800'
                }`}
              >
                {GENDER_LABELS[student.gender]}
              </span>
            </dd>
          </div>
          {student.birth_date && (
            <div>
              <dt className="text-sm font-medium text-gray-500">出生日期</dt>
              <dd className="mt-1 text-sm text-gray-900">{student.birth_date}</dd>
            </div>
          )}
        </dl>
      </div>

      {/* Sport Records Section */}
      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900">運動記錄</h2>
          <Link
            href={`/students/${studentId}/records/new`}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
          >
            <svg
              className="w-5 h-5 mr-2"
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
            新增運動記錄
          </Link>
        </div>

        <SportRecordList
          records={records}
          studentId={studentId!}
          pagination={pagination}
          onPageChange={setRecordsPage}
          onDelete={handleDeleteRecord}
          onViewHistory={handleViewHistory}
          isLoading={recordsLoading}
          emptyMessage="尚無運動記錄，點擊「新增運動記錄」開始記錄"
        />
      </div>

      {/* Performance Analysis Section */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">運動表現分析</h2>
        <PerformanceAnalysis records={records} isLoading={recordsLoading} />
      </div>

      {/* History Modal */}
      {historyModalRecord && (
        <RecordHistoryModal
          recordId={historyModalRecord.id}
          sportTypeName={historyModalRecord.sportTypeName}
          unit={historyModalRecord.unit}
          isOpen={true}
          onClose={() => setHistoryModalRecord(null)}
        />
      )}
    </MainLayout>
  )
}