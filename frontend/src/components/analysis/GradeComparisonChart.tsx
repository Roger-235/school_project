import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts'
import { GradeComparisonDTO } from '@/hooks/useAnalysis'

interface Props {
  data?: GradeComparisonDTO[]
  isLoading: boolean
}

export default function GradeComparisonChart({ data, isLoading }: Props) {
  if (isLoading) {
    return (
      <div className="h-[300px] flex items-center justify-center bg-gray-50 rounded-lg">
        <span className="text-gray-500">載入分析中...</span>
      </div>
    )
  }

  // 確保有資料，即使是空的也沒關係，Recharts 會畫出座標軸
  const chartData = data || [];

  return (
    <div className="w-full h-[350px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          margin={{
            top: 20,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          {/* 格線：只顯示橫向格線，比較乾淨 */}
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          
          {/* X軸：顯示運動項目名稱 */}
          <XAxis dataKey="sport_name" />
          
          {/* Y軸：設定範圍 0-100 */}
          <YAxis />
          
          {/* 滑鼠移上去的提示框 */}
          <Tooltip 
            cursor={{ fill: '#f3f4f6' }}
            formatter={(value: number) => [value, '分數']} 
          />
          
          {/* 圖例 */}
          <Legend />

          {/* 第一條長條：我的表現 (藍色) */}
          <Bar 
            name="我的表現" 
            dataKey="student_score" 
            fill="#2563eb" 
            radius={[4, 4, 0, 0]} // 圓角設計
            barSize={30} // 設定寬度
          />

          {/* 第二條長條：年級平均 (灰色) */}
          <Bar 
            name="年級平均" 
            dataKey="grade_avg" 
            fill="#9ca3af" 
            radius={[4, 4, 0, 0]} 
            barSize={30}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}