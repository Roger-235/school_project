/**
 * Edit School Page
 * Feature: 003-student-sports-data
 * Updated: 004-navigation-enhancement - Use MainLayout for consistent navigation
 */

import { useRouter } from 'next/router'
import Link from 'next/link'
import MainLayout from '@/components/layout/MainLayout'
import SchoolForm from '@/components/schools/SchoolForm'
import { useSchool, useUpdateSchool } from '@/hooks/useSchools'
import { UpdateSchoolForm } from '@/lib/validations/sports'
import type { BreadcrumbItem } from '@/components/layout/Breadcrumb'

export default function EditSchoolPage() {
  const router = useRouter()
  const { id } = router.query
  const schoolId = id ? parseInt(id as string) : null

  const { data, isLoading } = useSchool(schoolId)
  const updateSchool = useUpdateSchool()

  const school = data?.data?.school

  const handleSubmit = async (formData: UpdateSchoolForm) => {
    if (!schoolId) return
    try {
      await updateSchool.mutateAsync({ id: schoolId, data: formData })
      alert('學校更新成功')
      router.push(`/schools/${schoolId}`)
    } catch (error: any) {
      const message =
        error?.response?.data?.error?.message || '更新失敗，請稍後再試'
      alert(message)
    }
  }

  // Breadcrumb with dynamic school name
  const breadcrumbItems: BreadcrumbItem[] = [
    { label: '首頁', href: '/dashboard' },
    { label: '學校管理', href: '/schools' },
    { label: school?.name || `學校 #${id}`, href: `/schools/${id}` },
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

  if (!school) {
    return (
      <MainLayout breadcrumbItems={breadcrumbItems}>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-gray-900">學校不存在</h2>
            <Link href="/schools" className="mt-4 text-blue-600 hover:underline">
              返回學校列表
            </Link>
          </div>
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout title="編輯學校" breadcrumbItems={breadcrumbItems}>
      <div className="max-w-2xl mx-auto">
        <div className="bg-white shadow rounded-lg p-6">
          <SchoolForm
            initialData={school}
            onSubmit={handleSubmit}
            onCancel={() => router.push(`/schools/${schoolId}`)}
            isSubmitting={updateSchool.isPending}
          />
        </div>
      </div>
    </MainLayout>
  )
}
