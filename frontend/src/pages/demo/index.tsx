// 檔案位置: frontend/src/pages/demo.tsx
import React from 'react';

// 這是你的新頁面組件
export default function DemoPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
      <h1 className="text-4xl font-bold text-blue-600 mb-4">
        🎉 恭喜！你成功來到新頁面了
      </h1>
      <p className="text-lg text-gray-700">
        這是你剛剛親手建立的第一個新頁面。
      </p>
    </div>
  );
}