/**
 * Records Import Page
 * Feature: 007-excel-batch-import
 *
 * 運動記錄批次匯入頁面
 */

import MainLayout from '@/components/layout/MainLayout';
import { RecordsImportWizard } from '@/components/import/RecordsImportWizard';
import { BreadcrumbItem } from '@/components/layout/Breadcrumb';

const breadcrumbItems: BreadcrumbItem[] = [
  { label: '首頁', href: '/dashboard' },
  { label: '批次匯入', href: '/import' },
  { label: '運動記錄匯入' },
];

export default function RecordsImportPage() {
  return (
    <MainLayout
      title="批次匯入運動記錄"
      breadcrumbItems={breadcrumbItems}
    >
      <RecordsImportWizard />
    </MainLayout>
  );
}
