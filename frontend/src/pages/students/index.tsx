/**
 * Students List/Search Page
 * Feature: 003-student-sports-data
 */

import Link from 'next/link'
import { MainLayout } from '@/components/layout'
import StudentList from '@/components/students/StudentList'
import { useStudentSearch, useDeleteStudent } from '@/hooks/useStudents'
import { useSchools } from '@/hooks/useSchools'
import { GRADES, GENDERS, GENDER_LABELS } from '@/types/sports'

export default function StudentsPage() {
  const {
    data,
    isLoading,
    error,
    searchParams,
    updateSearchParams,
    resetSearchParams,
  } = useStudentSearch({ page: 1, page_size: 20 })
  const { data: schoolsData } = useSchools(1, 100)
  const deleteStudent = useDeleteStudent()

  const students = data?.data?.students || []
  const pagination = data?.data?.pagination || {
    page: 1,
    page_size: 20,
    total: 0,
    total_pages: 0,
  }

  const handleDelete = async (id: number) => {
    if (window.confirm('確定要刪除此學生嗎？')) {
      try {
        await deleteStudent.mutateAsync(id)
        alert('學生已成功刪除')
      } catch (error) {
        alert('刪除失敗，請稍後再試')
      }
    }
  }

  return (
    <MainLayout>
      {/* Page Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">學生管理</h1>
        <Link
          href="/students/new"
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
          新增學生
        </Link>
      </div>

      {/* Search Filters */}
      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">搜尋學生</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {/* Name Search */}
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-700"
            >
              姓名
            </label>
            <input
              type="text"
              id="name"
              value={searchParams.name || ''}
              onChange={(e) => updateSearchParams({ name: e.target.value })}
              placeholder="輸入姓名..."
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>

          {/* School Filter */}
          <div>
            <label
              htmlFor="school_id"
              className="block text-sm font-medium text-gray-700"
            >
              學校
            </label>
            <select
              id="school_id"
              value={searchParams.school_id || ''}
              onChange={(e) =>
                updateSearchParams({
                  school_id: e.target.value
                    ? parseInt(e.target.value)
                    : undefined,
                })
              }
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            >
              <option value="">全部學校</option>
              {schoolsData?.data?.schools?.map((school) => (
                <option key={school.id} value={school.id}>
                  {school.name}
                </option>
              ))}
            </select>
          </div>

          {/* Grade Filter */}
          <div>
            <label
              htmlFor="grade"
              className="block text-sm font-medium text-gray-700"
            >
              年級
            </label>
            <select
              id="grade"
              value={searchParams.grade || ''}
              onChange={(e) =>
                updateSearchParams({
                  grade: e.target.value
                    ? parseInt(e.target.value)
                    : undefined,
                })
              }
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            >
              <option value="">全部年級</option>
              {GRADES.map((grade) => (
                <option key={grade} value={grade}>
                  {grade} 年級
                </option>
              ))}
            </select>
          </div>

          {/* Gender Filter */}
          <div>
            <label
              htmlFor="gender"
              className="block text-sm font-medium text-gray-700"
            >
              性別
            </label>
            <select
              id="gender"
              value={searchParams.gender || ''}
              onChange={(e) =>
                updateSearchParams({
                  gender: (e.target.value as 'male' | 'female') || undefined,
                })
              }
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            >
              <option value="">全部</option>
              {GENDERS.map((gender) => (
                <option key={gender} value={gender}>
                  {GENDER_LABELS[gender]}
                </option>
              ))}
            </select>
          </div>

          {/* Reset Button */}
          <div className="flex items-end">
            <button
              onClick={resetSearchParams}
              className="w-full px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              清除篩選
            </button>
          </div>
        </div>
      </div>

      {/* Students List */}
      {error ? (
        <div className="text-center py-12">
          <p className="text-red-600">載入失敗，請稍後再試</p>
        </div>
      ) : (
        <StudentList
          students={students}
          pagination={pagination}
          onPageChange={(page) => updateSearchParams({ page })}
          onDelete={handleDelete}
          isLoading={isLoading}
          showSchool={true}
          emptyMessage={
            searchParams.name ||
            searchParams.school_id ||
            searchParams.grade ||
            searchParams.gender
              ? '無符合條件的學生'
              : '尚無學生資料'
          }
        />
      )}
    </MainLayout>
  )
}
