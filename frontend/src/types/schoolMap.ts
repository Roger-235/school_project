/**
 * TypeScript types for School Map feature
 * Feature: 006-school-map-markers
 */

// School data for map display (lightweight)
export interface SchoolMapData {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  student_count: number;
  county_name: string;
}

// API response for schools map endpoint
export interface SchoolMapResponse {
  data: {
    schools: SchoolMapData[];
    total: number;
  };
}

// Props for SchoolMarkerLayer component
export interface SchoolMarkerLayerProps {
  map: L.Map;
  schools: SchoolMapData[];
  onSchoolClick: (school: SchoolMapData) => void;
}

// Props for SchoolDetailPanel component
export interface SchoolDetailPanelProps {
  schoolId: number | null;
  isOpen: boolean;
  onClose: () => void;
}

// Student info displayed in school detail panel
export interface StudentListItem {
  id: number;
  name: string;
  grade: number;
  class: string;
  gender: string;
}

// Full school data with students for detail panel
export interface SchoolWithStudents {
  id: number;
  name: string;
  county_name: string;
  address: string;
  phone: string;
  latitude: number | null;
  longitude: number | null;
  student_count: number;
  students: StudentListItem[];
}
