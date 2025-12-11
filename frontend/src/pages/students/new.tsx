/**
 * New Student Page
 * Feature: 003-student-sports-data
 * Updated: 004-navigation-enhancement - Use MainLayout for consistent navigation
 */

import { useRouter } from 'next/router'
import MainLayout from '@/components/layout/MainLayout'
import StudentForm from '@/components/students/StudentForm'
import { useSchool, useSchools } from '@/hooks/useSchools'
import { useCreateStudent } from '@/hooks/useStudents'
import { CreateStudentForm } from '@/lib/validations/sports'
import type { BreadcrumbItem } from '@/components/layout/Breadcrumb'

export default function NewStudentPage() {
  const router = useRouter()
  const { school_id } = router.query
  const preselectedSchoolId = school_id ? parseInt(school_id as string) : null

  const { data: schoolData } = useSchool(preselectedSchoolId)
  const { data: schoolsData, isLoading: schoolsLoading } = useSchools(1, 100)
  const createStudent = useCreateStudent()

  const preselectedSchool = schoolData?.data?.school
  const schools = schoolsData?.data?.schools || []

  const handleSubmit = async (data: CreateStudentForm) => {
    try {
      const response = await createStudent.mutateAsync(data)
      alert('學生建立成功')

      // Redirect based on context
      if (preselectedSchoolId) {
        router.push(`/schools/${preselectedSchoolId}`)
      } else {
        router.push(`/students/${response.data.student.id}`)
      }
    } catch (error: any) {
      const message =
        error?.response?.data?.error?.message || '建立失敗，請稍後再試'
      alert(message)
    }
  }

  const handleCancel = () => {
    if (preselectedSchoolId) {
      router.push(`/schools/${preselectedSchoolId}`)
    } else {
      router.push('/students')
    }
  }

  // Build breadcrumb items - different paths depending on whether coming from school
  const breadcrumbItems: BreadcrumbItem[] = preselectedSchoolId
    ? [
        { label: '首頁', href: '/dashboard' },
        { label: '學校管理', href: '/schools' },
        { label: preselectedSchool?.name || `學校 #${preselectedSchoolId}`, href: `/schools/${preselectedSchoolId}` },
        { label: '新增學生' },
      ]
    : [
        { label: '首頁', href: '/dashboard' },
        { label: '學生管理', href: '/students' },
        { label: '新增學生' },
      ]

  return (
    <MainLayout title="新增學生" breadcrumbItems={breadcrumbItems}>
      <div className="max-w-2xl mx-auto">
        <div className="bg-white shadow rounded-lg p-6">
          {schoolsLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <StudentForm
              school={preselectedSchool}
              schools={schools}
              onSubmit={handleSubmit}
              onCancel={handleCancel}
              isSubmitting={createStudent.isPending}
            />
          )}
        </div>
      </div>
    </MainLayout>
  )
}
