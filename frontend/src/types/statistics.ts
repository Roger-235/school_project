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

export interface Comparison {
  sport_type_id: number;
  sport_type_name: string;
  category: string;
  unit: string;
  student_value: number;
  student_test_date: string;
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