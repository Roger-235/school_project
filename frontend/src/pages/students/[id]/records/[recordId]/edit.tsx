/**
 * Edit Sport Record Page
 * Feature: 003-student-sports-data
 * Updated: 004-navigation-enhancement - Use MainLayout for consistent navigation
 */

import { useRouter } from 'next/router'
import Link from 'next/link'
import MainLayout from '@/components/layout/MainLayout'
import SportRecordForm from '@/components/records/SportRecordForm'
import { useStudent } from '@/hooks/useStudents'
import { useSportRecord, useUpdateSportRecord } from '@/hooks/useSportRecords'
import type { BreadcrumbItem } from '@/components/layout/Breadcrumb'

export default function EditSportRecordPage() {
  const router = useRouter()
  const { id, recordId } = router.query
  const studentId = id ? parseInt(id as string) : null
  const sportRecordId = recordId ? parseInt(recordId as string) : null

  const { data: studentData, isLoading: studentLoading } = useStudent(studentId)
  const { data: recordData, isLoading: recordLoading } = useSportRecord(sportRecordId)
  const updateRecord = useUpdateSportRecord()

  const student = studentData?.data?.student
  const record = recordData?.data?.record

  const handleSubmit = async (formData: any) => {
    if (!sportRecordId) return
    try {
      await updateRecord.mutateAsync({
        id: sportRecordId,
        data: {
          value: formData.value,
          test_date: formData.test_date,
          notes: formData.notes || undefined,
          reason: formData.reason || undefined,
        },
      })
      alert('運動記錄更新成功')
      router.push(`/students/${studentId}`)
    } catch (error: any) {
      const message =
        error?.response?.data?.error?.message || '更新失敗，請稍後再試'
      alert(message)
    }
  }

  // Breadcrumb with dynamic student name and record info
  const breadcrumbItems: BreadcrumbItem[] = [
    { label: '首頁', href: '/dashboard' },
    { label: '學生管理', href: '/students' },
    { label: student?.name || `學生 #${id}`, href: `/students/${id}` },
    { label: '運動記錄', href: `/students/${id}` },
    { label: '編輯' },
  ]

  if (studentLoading || recordLoading) {
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

  if (!record) {
    return (
      <MainLayout breadcrumbItems={breadcrumbItems}>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-gray-900">運動記錄不存在</h2>
            <Link
              href={`/students/${studentId}`}
              className="mt-4 text-blue-600 hover:underline"
            >
              返回學生頁面
            </Link>
          </div>
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout title="編輯運動記錄" breadcrumbItems={breadcrumbItems}>
      <div className="max-w-2xl mx-auto">
        <div className="mb-4 text-sm text-gray-600">
          學生：{student.name} | 項目：{record.sport_type?.name}
        </div>
        <div className="bg-white shadow rounded-lg p-6">
          <SportRecordForm
            studentId={studentId!}
            initialData={record}
            onSubmit={handleSubmit}
            onCancel={() => router.push(`/students/${studentId}`)}
            isSubmitting={updateRecord.isPending}
            isUpdate
          />
        </div>
      </div>
    </MainLayout>
  )
}
