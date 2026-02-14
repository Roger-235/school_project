import { useQuery } from '@tanstack/react-query'
import axios from 'axios' 

// 定義跟後端一樣的格式
export interface GradeComparisonDTO {
  sport_name: string;
  unit: string;
  grade_avg: number;
  student_score: number;
  full_mark: number;
}

// 注意：這裡多加了一個 studentId 參數
export const useGradeComparison = (schoolId?: number, grade?: number, gender?: string, studentId?: number) => {
  return useQuery({
    // 當這些參數改變時，重新抓資料
    queryKey: ['grade-comparison', schoolId, grade, gender, studentId],
    
    queryFn: async () => {
      // 發送請求給剛剛寫好的 Go API
      const { data } = await axios.get<{ data: GradeComparisonDTO[] }>('http://localhost:8080/api/v1/analysis/grade-comparison', {
        params: { 
          school_id: schoolId,
          grade: grade,
          gender: gender,
          student_id: studentId
        }
      })
      return data.data
    },
    // 只有當所有參數都有值的時候，才發送請求
    enabled: !!schoolId && !!grade && !!gender && !!studentId,
  })
}