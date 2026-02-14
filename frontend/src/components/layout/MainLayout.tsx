/**
 * MainLayout - 主佈局組件
 * Feature: Navigation Enhancement
 *
 * 提供統一的頁面佈局，包含：
 * - Header 導航列
 * - Breadcrumb 麵包屑
 * - 主要內容區域
 * - Footer 頁尾（可選）
 */

'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/context/AuthContext';
import Header from './Header';
import Breadcrumb, { BreadcrumbItem } from './Breadcrumb';

interface MainLayoutProps {
  children: React.ReactNode;
  title?: string;
  breadcrumbItems?: BreadcrumbItem[];
  showBreadcrumb?: boolean;
  fullWidth?: boolean;
  className?: string;
}

export default function MainLayout({
  children,
  title,
  breadcrumbItems,
  showBreadcrumb = true,
  fullWidth = false,
  className = '',
}: MainLayoutProps) {
  const { user, loading } = useAuth();
  const router = useRouter();

  // 認證檢查
  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  // 載入中狀態
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">載入中...</p>
        </div>
      </div>
    );
  }

  // 未登入時不渲染內容
  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <Header />

      {/* Main Content */}
      <main className="flex-1">
        <div className={fullWidth ? '' : 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'}>
          {/* Breadcrumb */}
          {showBreadcrumb && (
            <div className="py-4">
              <Breadcrumb items={breadcrumbItems} />
            </div>
          )}

          {/* Page Title */}
          {title && (
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
            </div>
          )}

          {/* Content */}
          <div className={`pb-8 ${className}`}>{children}</div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-center text-sm text-gray-500">
            <p>ICACP - 學童運動能力資料庫平台</p>
            <p className="mt-2 sm:mt-0">Feature 003: Student Sports Data Management</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

/**
 * 簡化版 Layout - 用於不需要認證的頁面（如登入頁）
 */
export function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <main className="flex-1">{children}</main>
    </div>
  );
}
