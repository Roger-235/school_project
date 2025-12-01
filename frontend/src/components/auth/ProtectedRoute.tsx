/**
 * ProtectedRoute - 受保護的路由包裝器
 * TODO: 從 001-user-auth feature 整合完整的認證邏輯
 * Feature: 002-map-visualization (暫時版本)
 */

'use client';

import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // TODO: 從 001-user-auth 整合實際的認證檢查
    // 🔧 開發模式：暫時跳過認證檢查，直接允許訪問
    const checkAuth = async () => {
      try {
        // 開發環境直接通過認證
        if (process.env.NODE_ENV === 'development') {
          console.log('🔧 開發模式：跳過認證檢查');
          setIsAuthenticated(true);
          setIsLoading(false);
          return;
        }

        // 生產環境：檢查 localStorage 或 cookie 中的 token
        const token = localStorage.getItem('auth_token');

        if (!token) {
          // 未登入，重導向到登入頁
          router.push('/login?redirect=' + encodeURIComponent(router.asPath));
          return;
        }

        // TODO: 驗證 token 有效性（呼叫 /api/v1/auth/verify）
        setIsAuthenticated(true);
      } catch (error) {
        console.error('認證檢查失敗:', error);
        router.push('/login');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">驗證中...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // 重導向中
  }

  return <>{children}</>;
}
