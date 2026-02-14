/**
 * Add Sport Record Page
 * Feature: 003-student-sports-data
 * Updated: 004-navigation-enhancement - Use MainLayout for consistent navigation
 */

import { useRouter } from 'next/router'
import Link from 'next/link'
import MainLayout from '@/components/layout/MainLayout'
import SportRecordForm from '@/components/records/SportRecordForm'
import { useStudent } from '@/hooks/useStudents'
import { useCreateSportRecord } from '@/hooks/useSportRecords'
import type { BreadcrumbItem } from '@/components/layout/Breadcrumb'

export default function NewSportRecordPage() {
  const router = useRouter()
  const { id } = router.query
  const studentId = id ? parseInt(id as string) : null

  const { data: studentData, isLoading: studentLoading } = useStudent(studentId)
  const createRecord = useCreateSportRecord()

  const student = studentData?.data?.student

  const handleSubmit = async (formData: any) => {
    if (!studentId) return
    try {
      await createRecord.mutateAsync({
        student_id: studentId,
        sport_type_id: formData.sport_type_id,
        value: formData.value,
        test_date: formData.test_date,
        notes: formData.notes || undefined,
      })
      alert('運動記錄建立成功')
      router.push(`/students/${studentId}`)
    } catch (error: any) {
      const message =
        error?.response?.data?.error?.message || '建立失敗，請稍後再試'
      alert(message)
    }
  }

  // Breadcrumb with dynamic student name
  const breadcrumbItems: BreadcrumbItem[] = [
    { label: '首頁', href: '/dashboard' },
    { label: '學生管理', href: '/students' },
    { label: student?.name || `學生 #${id}`, href: `/students/${id}` },
    { label: '新增運動記錄' },
  ]

  if (studentLoading) {
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
    <MainLayout title="新增運動記錄" breadcrumbItems={breadcrumbItems}>
      <div className="max-w-2xl mx-auto">
        <div className="mb-4 text-sm text-gray-600">
          學生：{student.name} ({student.student_number})
        </div>
        <div className="bg-white shadow rounded-lg p-6">
          <SportRecordForm
            studentId={studentId!}
            onSubmit={handleSubmit}
            onCancel={() => router.push(`/students/${studentId}`)}
            isSubmitting={createRecord.isPending}
          />
        </div>
      </div>
    </MainLayout>
  )
}
