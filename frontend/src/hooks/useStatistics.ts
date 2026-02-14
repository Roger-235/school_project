import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { StudentComparison, GradeComparisonResult, NationalAverage, SchoolChampion, SportTypeSchoolRanking } from '@/types/statistics';

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || '/api/v1',
});

// 查詢學生比較資料
export function useStudentComparison(studentId: number) {
  return useQuery({
    queryKey: ['student-comparison', studentId],
    queryFn: async () => {
      const { data } = await apiClient.get<{ data: StudentComparison }>(
        `/statistics/student-comparison/${studentId}`
      );
      return data.data;
    },
    enabled: !!studentId && studentId > 0,
    staleTime: 5 * 60 * 1000, // 5 分鐘
  });
}

// 查詢學生同年級比較資料
export function useGradeComparison(studentId: number) {
  return useQuery({
    queryKey: ['grade-comparison', studentId],
    queryFn: async () => {
      const { data } = await apiClient.get<{ data: GradeComparisonResult }>(
        `/statistics/grade-comparison/${studentId}`
      );
      return data.data;
    },
    enabled: !!studentId && studentId > 0,
    staleTime: 5 * 60 * 1000,
  });
}

// 查詢全國平均值
export function useNationalAverages(
  sportTypeId?: number,
  grade?: number,
  gender?: string
) {
  return useQuery({
    queryKey: ['national-averages', sportTypeId, grade, gender],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (sportTypeId) params.append('sport_type_id', sportTypeId.toString());
      if (grade) params.append('grade', grade.toString());
      if (gender) params.append('gender', gender);

      const { data } = await apiClient.get<{ data: { averages: NationalAverage[] } }>(
        `/statistics/national-averages?${params.toString()}`
      );
      return data.data.averages;
    },
    staleTime: 10 * 60 * 1000, // 10 分鐘
  });
}

// 計算全國平均值 (Mutation)
export function useCalculateNationalAverages() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const { data } = await apiClient.post('/statistics/national-averages/calculate');
      return data;
    },
    onSuccess: () => {
      // 清除所有相關快取
      queryClient.invalidateQueries({ queryKey: ['student-comparison'] });
      queryClient.invalidateQueries({ queryKey: ['national-averages'] });
    },
  });
}

// 查詢各運動項目的冠軍學校
export function useSchoolChampions() {
  return useQuery({
    queryKey: ['school-champions'],
    queryFn: async () => {
      const { data } = await apiClient.get<{ data: { champions: SchoolChampion[] } }>(
        '/statistics/school-champions'
      );
      return data.data.champions;
    },
    staleTime: 10 * 60 * 1000, // 10 分鐘
  });
}

// 查詢指定運動項目的前N名學校
export function useTopSchoolsBySport(sportTypeId: number, limit: number = 10) {
  return useQuery({
    queryKey: ['top-schools', sportTypeId, limit],
    queryFn: async () => {
      const { data } = await apiClient.get<{ data: { rankings: SportTypeSchoolRanking[]; count: number } }>(
        `/statistics/top-schools/${sportTypeId}?limit=${limit}`
      );
      return data.data.rankings;
    },
    enabled: !!sportTypeId && sportTypeId > 0,
    staleTime: 10 * 60 * 1000, // 10 分鐘
  });
}

// 查詢所有運動項目的前N名學校
export function useAllTopSchools(limit: number = 10) {
  return useQuery({
    queryKey: ['all-top-schools', limit],
    queryFn: async () => {
      const { data } = await apiClient.get<{ data: { rankings: Record<number, SportTypeSchoolRanking[]> } }>(
        `/statistics/top-schools?limit=${limit}`
      );
      return data.data.rankings;
    },
    staleTime: 10 * 60 * 1000, // 10 分鐘
  });
}