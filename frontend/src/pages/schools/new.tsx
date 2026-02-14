/**
 * New School Page
 * Feature: 003-student-sports-data
 * Updated: 004-navigation-enhancement - Use MainLayout for consistent navigation
 */

import { useRouter } from 'next/router'
import MainLayout from '@/components/layout/MainLayout'
import SchoolForm from '@/components/schools/SchoolForm'
import { useCreateSchool } from '@/hooks/useSchools'
import { CreateSchoolForm } from '@/lib/validations/sports'
import type { BreadcrumbItem } from '@/components/layout/Breadcrumb'

export default function NewSchoolPage() {
  const router = useRouter()
  const createSchool = useCreateSchool()

  const handleSubmit = async (data: CreateSchoolForm) => {
    try {
      await createSchool.mutateAsync(data)
      alert('學校建立成功')
      router.push('/schools')
    } catch (error: any) {
      const message =
        error?.response?.data?.error?.message || '建立失敗，請稍後再試'
      alert(message)
    }
  }

  const breadcrumbItems: BreadcrumbItem[] = [
    { label: '首頁', href: '/dashboard' },
    { label: '學校管理', href: '/schools' },
    { label: '新增學校' },
  ]

  return (
    <MainLayout title="新增學校" breadcrumbItems={breadcrumbItems}>
      <div className="max-w-2xl mx-auto">
        <div className="bg-white shadow rounded-lg p-6">
          <SchoolForm
            onSubmit={handleSubmit}
            onCancel={() => router.push('/schools')}
            isSubmitting={createSchool.isPending}
          />
        </div>
      </div>
    </MainLayout>
  )
}
