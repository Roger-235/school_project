/**
 * County Statistics Types for Taiwan Map Visualization
 * Feature: 002-map-visualization
 */

/**
 * Statistics for a single Taiwan county/city
 */
export interface CountyStatistics {
  county_name: string;       // County/city name in traditional Chinese (e.g., "臺北市")
  school_count: number;      // Number of schools in this county
  student_count: number;     // Total number of students in this county
  record_count: number;      // Total number of sport records in this county
  has_data: boolean;         // Whether this county has any registered schools
}

/**
 * Statistics for all Taiwan counties/cities
 */
export interface AllCountyStatistics {
  counties: CountyStatistics[];  // Array of county statistics
  total: number;                  // Total number of counties (always 22 for Taiwan)
}

/**
 * API response wrapper for single county statistics
 */
export interface CountyStatisticsResponse {
  data: CountyStatistics;
}

/**
 * API response wrapper for all county statistics
 */
export interface AllCountyStatisticsResponse {
  data: AllCountyStatistics;
}

/**
 * Error response from API
 */
export interface ErrorResponse {
  error: {
    code: string;
    message: string;
    status: number;
  };
}

/**
 * GeoJSON Feature properties for Taiwan counties
 */
export interface TaiwanCountyProperties {
  COUNTYNAME: string;   // County name in Chinese (matches county_name)
  COUNTYCODE: string;   // County code
  COUNTYENG: string;    // County name in English
  hasData?: boolean;    // Whether this county has data (populated at runtime)
}

/**
 * Valid Taiwan county names (22 counties/cities)
 */
export const VALID_TAIWAN_COUNTIES = [
  "臺北市",
  "新北市",
  "桃園市",
  "臺中市",
  "臺南市",
  "高雄市",
  "基隆市",
  "新竹市",
  "嘉義市",
  "新竹縣",
  "苗栗縣",
  "彰化縣",
  "南投縣",
  "雲林縣",
  "嘉義縣",
  "屏東縣",
  "宜蘭縣",
  "花蓮縣",
  "臺東縣",
  "澎湖縣",
  "金門縣",
  "連江縣",
] as const;

export type TaiwanCountyName = typeof VALID_TAIWAN_COUNTIES[number];
