/**
 * Student Import Page
 * Feature: 007-excel-batch-import
 *
 * 學生名單批次匯入頁面
 */

import MainLayout from '@/components/layout/MainLayout';
import { StudentImportWizard } from '@/components/import/StudentImportWizard';
import { BreadcrumbItem } from '@/components/layout/Breadcrumb';

const breadcrumbItems: BreadcrumbItem[] = [
  { label: '首頁', href: '/dashboard' },
  { label: '學生管理', href: '/students' },
  { label: '批次匯入' },
];

export default function StudentImportPage() {
  return (
    <MainLayout
      title="批次匯入學生名單"
      breadcrumbItems={breadcrumbItems}
    >
      <StudentImportWizard />
    </MainLayout>
  );
}
