/**
 * Edit Student Page
 * Feature: 003-student-sports-data
 * Updated: 004-navigation-enhancement - Use MainLayout for consistent navigation
 */

import { useRouter } from 'next/router'
import Link from 'next/link'
import MainLayout from '@/components/layout/MainLayout'
import StudentForm from '@/components/students/StudentForm'
import { useStudent, useUpdateStudent } from '@/hooks/useStudents'
import { UpdateStudentForm } from '@/lib/validations/sports'
import type { BreadcrumbItem } from '@/components/layout/Breadcrumb'

export default function EditStudentPage() {
  const router = useRouter()
  const { id } = router.query
  const studentId = id ? parseInt(id as string) : null

  const { data, isLoading } = useStudent(studentId)
  const updateStudent = useUpdateStudent()

  const student = data?.data?.student

  const handleSubmit = async (formData: UpdateStudentForm) => {
    if (!studentId) return
    try {
      await updateStudent.mutateAsync({ id: studentId, data: formData })
      alert('學生更新成功')
      router.push(`/students/${studentId}`)
    } catch (error: any) {
      const message =
        error?.response?.data?.error?.message || '更新失敗，請稍後再試'
      alert(message)
    }
  }

  // Breadcrumb with dynamic student name
  const breadcrumbItems: BreadcrumbItem[] = [
    { label: '首頁', href: '/dashboard' },
    { label: '學生管理', href: '/students' },
    { label: student?.name || `學生 #${id}`, href: `/students/${id}` },
    { label: '編輯' },
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
    <MainLayout title="編輯學生" breadcrumbItems={breadcrumbItems}>
      <div className="max-w-2xl mx-auto">
        <div className="bg-white shadow rounded-lg p-6">
          <StudentForm
            initialData={student}
            onSubmit={handleSubmit}
            onCancel={() => router.push(`/students/${studentId}`)}
            isSubmitting={updateStudent.isPending}
            isUpdate
          />
        </div>
      </div>
    </MainLayout>
  )
}
