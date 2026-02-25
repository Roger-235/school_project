export interface StudentComparison {
  student: {
    id: number;
    name: string;
    grade: number;
    gender: string;
    school_name: string;
  };
  comparisons: Comparison[];
  summary: {
    total_sports: number;
    above_average_count: number;
    average_count: number;
    below_average_count: number;
    overall_percentile: number;
  };
}

export interface StudentRecord {
  value: number;
  test_date: string;
}

export interface Comparison {
  sport_type_id: number;
  sport_type_name: string;
  category: string;
  unit: string;
  student_records: StudentRecord[];  // 最多2筆記錄
  student_value: number;              // 保留向後兼容：最新記錄
  student_test_date: string;          // 保留向後兼容：最新記錄日期
  national_avg: number;
  difference: number;
  difference_percent: number;
  percentile_rank: number;
  performance_level: 'below_average' | 'average' | 'above_average' | 'excellent';
  national_stats: {
    sample_count: number;
    percentile_25: number;
    percentile_50: number;
    percentile_75: number;
    percentile_90: number;
  };
}

export interface GradeComparison {
  sport_type_id: number;
  sport_type_name: string;
  category: string;
  unit: string;
  student_value: number;
  grade_avg: number;
  grade_rank: number;
  total_students: number;
  grade_best: number;
}

export interface GradeComparisonResult {
  student: {
    id: number;
    name: string;
    grade: number;
    gender: string;
    school_name: string;
  };
  comparisons: GradeComparison[];
}

export interface CountyComparison {
  sport_type_id: number;
  sport_type_name: string;
  category: string;
  unit: string;
  student_value: number;
  county_avg: number;
  county_rank: number;
  total_students: number;
  county_best: number;
  county_name: string;
}

export interface CountyComparisonResult {
  student: {
    id: number;
    name: string;
    grade: number;
    gender: string;
    school_name: string;
  };
  comparisons: CountyComparison[];
}

export interface CountySportAverage {
  sport_type_id: number;
  sport_type_name: string;
  category: string;
  unit: string;
  value_type: string;
  avg_value: number;
  school_count: number;
  student_count: number;
}

export interface NationalAverage {
  id: number;
  sport_type_id: number;
  grade: number;
  gender: string;
  avg_value: number;
  sample_count: number;
  percentile_25: number;
  percentile_50: number;
  percentile_75: number;
  percentile_90: number;
  updated_at: string;
  sport_type?: {
    id: number;
    name: string;
    category: string;
    default_unit: string;
  };
}

export interface SchoolChampion {
  sport_type_id: number;
  sport_type_name: string;
  category: string;
  unit: string;
  school_id: number;
  school_name: string;
  county_name: string;
  latitude: number;
  longitude: number;
  average_value: number;
  student_count: number;
}

export interface SportTypeSchoolRanking {
  rank: number;
  sport_type_id: number;
  sport_type_name: string;
  category: string;
  unit: string;
  school_id: number;
  school_name: string;
  county_name: string;
  latitude: number;
  longitude: number;
  average_value: number;
  student_count: number;
}