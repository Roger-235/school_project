import { useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { StudentComparison, GradeComparisonResult, CountyComparisonResult, CountySportAverage, NationalAverage, SchoolChampion, SportTypeSchoolRanking } from '@/types/statistics';

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

// 查詢學生縣市內比較資料
export function useCountyComparison(studentId: number) {
  return useQuery({
    queryKey: ['county-comparison', studentId],
    queryFn: async () => {
      const { data } = await apiClient.get<{ data: CountyComparisonResult }>(
        `/statistics/county-comparison/${studentId}`
      );
      return data.data;
    },
    enabled: !!studentId && studentId > 0,
    staleTime: 5 * 60 * 1000,
  });
}

// 查詢縣市各運動項目平均成績
export function useCountySportAverages(countyName: string | null) {
  return useQuery({
    queryKey: ['county-sport-averages', countyName],
    queryFn: async () => {
      const { data } = await apiClient.get<{ data: { county_name: string; averages: CountySportAverage[] } }>(
        `/statistics/county-sport-averages/${encodeURIComponent(countyName!)}`
      );
      return data.data.averages;
    },
    enabled: !!countyName,
    staleTime: 10 * 60 * 1000,
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

// 查詢指定運動項目的前N名學校（支援按縣市篩選，可傳入單個或多個縣市）
export function useTopSchoolsBySport(sportTypeId: number, limit: number = 10, countyNames?: string | string[]) {
  // 將單個縣市轉換為陣列，並確保排序一致
  const counties = useMemo(() => {
    if (Array.isArray(countyNames)) {
      return countyNames.length === 0 ? [] : countyNames.sort();
    }
    return countyNames ? [countyNames] : [];
  }, [countyNames]);
  
  // 建立查詢鍵，使用排序後的縣市列表確保一致性
  const queryKey = useMemo(() => 
    counties.length === 0 
      ? ['top-schools', sportTypeId, limit]
      : ['top-schools', sportTypeId, limit, 'county', counties.join(',')],
    [sportTypeId, limit, counties]
  );

  return useQuery({
    queryKey,
    queryFn: async () => {
      // 如果沒有選定縣市，直接取全國排名
      if (counties.length === 0) {
        const { data } = await apiClient.get<{ data: { rankings: SportTypeSchoolRanking[]; count: number } }>(
          `/statistics/top-schools/${sportTypeId}?limit=${limit}`
        );
        return data.data.rankings;
      }

      // 如果只有一個縣市，直接查詢
      if (counties.length === 1) {
        const { data } = await apiClient.get<{ data: { rankings: SportTypeSchoolRanking[]; count: number } }>(
          `/statistics/top-schools/${sportTypeId}?limit=${limit}&county=${encodeURIComponent(counties[0])}`
        );
        return data.data.rankings;
      }

      // 多個縣市時，並行查詢後合併結果
      const promises = counties.map(county =>
        apiClient.get<{ data: { rankings: SportTypeSchoolRanking[]; count: number } }>(
          `/statistics/top-schools/${sportTypeId}?limit=${limit}&county=${encodeURIComponent(county)}`
        )
      );

      const responses = await Promise.all(promises);
      
      // 合併所有縣市的排名，按平均值排序
      const allRankings = responses.flatMap(res => res.data.data.rankings);
      allRankings.sort((a, b) => b.average_value - a.average_value);
      
      // 限制返回的結果數量並重新計算排名
      const limitedRankings = allRankings.slice(0, limit);
      return limitedRankings.map((ranking, index) => ({
        ...ranking,
        rank: index + 1, // 重新計算排名
      }));
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