/**
 * Breadcrumb - 麵包屑導航組件
 * Feature: Navigation Enhancement
 */

'use client';

import Link from 'next/link';
import { useRouter } from 'next/router';

// 路由名稱映射
const routeNameMap: Record<string, string> = {
  dashboard: '首頁',
  schools: '學校管理',
  students: '學生管理',
  map: '地圖視覺化',
  new: '新增',
  edit: '編輯',
  records: '運動記錄',
};

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items?: BreadcrumbItem[];
  className?: string;
}

export default function Breadcrumb({ items, className = '' }: BreadcrumbProps) {
  const router = useRouter();

  // 如果沒有傳入 items，則根據路由自動生成
  const breadcrumbItems: BreadcrumbItem[] = items || generateBreadcrumbs(router.pathname, router.query);

  if (breadcrumbItems.length <= 1) {
    return null; // 只有首頁時不顯示麵包屑
  }

  return (
    <nav className={`flex items-center text-sm ${className}`} aria-label="Breadcrumb">
      <ol className="flex items-center space-x-2">
        {breadcrumbItems.map((item, index) => (
          <li key={index} className="flex items-center">
            {index > 0 && (
              <svg
                className="w-4 h-4 text-gray-400 mx-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            )}
            {item.href && index < breadcrumbItems.length - 1 ? (
              <Link
                href={item.href}
                className="text-gray-500 hover:text-blue-600 transition-colors"
              >
                {index === 0 && (
                  <svg
                    className="w-4 h-4 inline-block mr-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                    />
                  </svg>
                )}
                {item.label}
              </Link>
            ) : (
              <span className="text-gray-900 font-medium">{item.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

function generateBreadcrumbs(pathname: string, query: Record<string, string | string[] | undefined>): BreadcrumbItem[] {
  const items: BreadcrumbItem[] = [{ label: '首頁', href: '/dashboard' }];

  if (pathname === '/dashboard' || pathname === '/') {
    return items;
  }

  const segments = pathname.split('/').filter(Boolean);
  let currentPath = '';

  segments.forEach((segment, index) => {
    currentPath += `/${segment}`;

    // 檢查是否為動態路由參數
    if (segment.startsWith('[') && segment.endsWith(']')) {
      // 動態路由，使用 query 中的實際值
      const paramName = segment.slice(1, -1);
      const paramValue = query[paramName];
      if (paramValue) {
        items.push({
          label: Array.isArray(paramValue) ? paramValue[0] : paramValue,
          href: index < segments.length - 1 ? currentPath.replace(segment, String(paramValue)) : undefined,
        });
      }
    } else if (routeNameMap[segment]) {
      // 有對應的中文名稱
      items.push({
        label: routeNameMap[segment],
        href: index < segments.length - 1 ? currentPath : undefined,
      });
    } else if (/^\d+$/.test(segment)) {
      // 數字 ID，顯示為 # 加數字
      items.push({
        label: `#${segment}`,
        href: index < segments.length - 1 ? currentPath : undefined,
      });
    } else {
      // 其他情況直接顯示
      items.push({
        label: segment,
        href: index < segments.length - 1 ? currentPath : undefined,
      });
    }
  });

  return items;
}

/**
 * 自定義麵包屑的 Hook
 * 用於在頁面中動態設置麵包屑內容
 */
export function useBreadcrumb() {
  // 可以在這裡加入更多的邏輯，如 context 或 state 管理
  return {
    generateBreadcrumbs,
    routeNameMap,
  };
}
