'use client';

import { useState, useMemo } from 'react';
import { SchoolChampion, SportTypeSchoolRanking } from '@/types/statistics';
import { useTopSchoolsBySport } from '@/hooks/useStatistics';

interface Props {
  champions: SchoolChampion[];
  onChampionClick: (champion: SchoolChampion) => void;
}

export default function ChampionsList({ champions, onChampionClick }: Props) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [expandedSportId, setExpandedSportId] = useState<number | null>(null);
  const [selectedCounties, setSelectedCounties] = useState<Set<string>>(new Set());
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showNationalRanking, setShowNationalRanking] = useState(false);

  // 提取可用的縣市和分類
  const availableCounties = useMemo(() => {
    const counties = new Set(champions.map(c => c.county_name));
    return Array.from(counties).sort();
  }, [champions]);

  const availableCategories = useMemo(() => {
    const categories = new Set(champions.map(c => c.category));
    return Array.from(categories).sort();
  }, [champions]);

  // 根據選定縣市與分類過濾冠軍
  const filteredChampionsByCounty = useMemo(() => {
    const result: Record<string, SchoolChampion[]> = {};
    
    champions.forEach(champion => {
      // 如果沒選縣市，就用全部；有選的話只用選中的
      if (selectedCounties.size === 0 || selectedCounties.has(champion.county_name)) {
        // 如果有選分類，就只顯示該分類
        if (selectedCategory && champion.category !== selectedCategory) {
          return;
        }
        
        if (!result[champion.county_name]) {
          result[champion.county_name] = [];
        }
        result[champion.county_name].push(champion);
      }
    });
    
    return result;
  }, [champions, selectedCounties, selectedCategory]);

  // 縣市多選 toggle
  const toggleCounty = (county: string) => {
    const newSelected = new Set(selectedCounties);
    if (newSelected.has(county)) {
      newSelected.delete(county);
    } else {
      newSelected.add(county);
    }
    setSelectedCounties(newSelected);
  };

  // 清除所有篩選
  const clearAllFilters = () => {
    setSelectedCounties(new Set());
    setSelectedCategory(null);
  };

  // 當有选中县市时，为展开的运动项目加载这些县市的排名
  // 如果没有选中县市，则加载全国排名
  // 如果 showNationalRanking 為 true，也加載全國排名
  const countyNamesForRanking = !showNationalRanking && selectedCounties.size > 0 
    ? Array.from(selectedCounties) 
    : undefined;
  
  // 获取展开项目的排名（按选中的县市或全国排名）
  const { data: topSchools, isLoading: loadingTopSchools } = useTopSchoolsBySport(
    expandedSportId || 0,
    10,
    countyNamesForRanking
  );

  const handleToggleExpand = (sportTypeId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedSportId(expandedSportId === sportTypeId ? null : sportTypeId);
  };

  const handleRankingClick = (ranking: SportTypeSchoolRanking, e: React.MouseEvent) => {
    e.stopPropagation();
    // 转换为 SchoolChampion 格式以复用点击逻辑
    onChampionClick({
      sport_type_id: ranking.sport_type_id,
      sport_type_name: ranking.sport_type_name,
      category: ranking.category,
      unit: ranking.unit,
      school_id: ranking.school_id,
      school_name: ranking.school_name,
      county_name: ranking.county_name,
      latitude: ranking.latitude,
      longitude: ranking.longitude,
      average_value: ranking.average_value,
      student_count: ranking.student_count,
      top_student_name: ranking.top_student_name,
      top_student_value: ranking.top_student_value,
    });
  };

  if (isCollapsed) {
    return (
      <div className="bg-white rounded-r-lg shadow-md p-2">
        <button
          onClick={() => setIsCollapsed(false)}
          className="p-2 hover:bg-gray-100 rounded transition-colors"
          title="展开排名榜"
        >
          <svg
            className="w-5 h-5 text-gray-700"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md flex h-full w-[680px]">
      {/* 主内容区 */}
      <div className="flex-1 p-4 overflow-y-auto flex flex-col">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-2xl">🏆</span>
          <h2 className="text-lg font-bold text-gray-900">各縣市項目排名</h2>
        </div>

        {/* 縣市多選面板 */}
        <div className="mb-4 pb-4 border-b border-gray-200">
          <label className="block text-sm font-semibold text-gray-700 mb-2.5">
            📍 選擇縣市查看排名（可多選）
          </label>
          
          {/* 全國選項 */}
          <div className="mb-3 pb-3 border-b border-gray-100">
            <label className="flex items-center gap-2 cursor-pointer p-2.5 rounded hover:bg-green-50 transition-colors bg-green-50 border border-green-200">
              <input
                type="checkbox"
                checked={selectedCounties.size === availableCounties.length}
                onChange={() => {
                  if (selectedCounties.size === availableCounties.length) {
                    setSelectedCounties(new Set());
                  } else {
                    setSelectedCounties(new Set(availableCounties));
                  }
                  setShowNationalRanking(true);
                }}
                className="w-4 h-4 rounded accent-green-600"
              />
              <span className="text-sm font-medium text-gray-900">🌍 全國</span>
            </label>
          </div>

          {/* 縣市列表 */}
          <div className="grid grid-cols-3 gap-2">
            {availableCounties.map(county => (
              <label 
                key={county} 
                className="flex items-center gap-2 cursor-pointer p-2 rounded hover:bg-blue-50 transition-colors"
              >
                <input
                  type="checkbox"
                  checked={selectedCounties.has(county)}
                  onChange={() => {
                    toggleCounty(county);
                    // 如果手動勾選個別縣市，自動關閉全國排名模式
                    setShowNationalRanking(false);
                  }}
                  className="w-4 h-4 rounded accent-blue-600"
                />
                <span className="text-sm text-gray-700">{county}</span>
              </label>
            ))}
          </div>
        </div>

        {/* 分類篩選 */}
        <div className="mb-4 pb-4 border-b border-gray-200">
          <label className="block text-sm font-semibold text-gray-700 mb-2.5">
            🏅 運動分類（可選）
          </label>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedCategory(null)}
              className={`text-xs font-medium px-3 py-1.5 rounded-lg transition-colors border ${
                selectedCategory === null
                  ? 'bg-gray-900 text-white border-gray-900'
                  : 'bg-white border-gray-300 text-gray-700 hover:border-gray-400 hover:bg-gray-50'
              }`}
            >
              全部分類
            </button>
            {availableCategories.map(category => (
              <button
                key={category}
                onClick={() => setSelectedCategory(selectedCategory === category ? null : category)}
                className={`text-xs font-medium px-3 py-1.5 rounded-lg transition-colors border ${
                  selectedCategory === category
                    ? 'bg-green-600 text-white border-green-600'
                    : 'bg-white border-gray-300 text-gray-700 hover:border-gray-400 hover:bg-gray-50'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* 結果統計 */}
        {(selectedCounties.size > 0 || selectedCategory) && (
          <div className="text-xs text-gray-600 mb-3 pb-3 border-b border-gray-200">
            {selectedCounties.size > 0 && `已選 ${selectedCounties.size} 個縣市`}
            {selectedCounties.size > 0 && selectedCategory && ' • '}
            {selectedCategory && `按〔${selectedCategory}〕分類`}
          </div>
        )}

        {/* 縣市分組排名列表 */}
        {Object.keys(filteredChampionsByCounty).length > 0 ? (
          <div className="space-y-5">
            {Object.entries(filteredChampionsByCounty).map(([county, championsInCounty]) => {
              // 按分類分組每個縣市的冠軍
              const championsByCategory = championsInCounty.reduce((acc, champion) => {
                if (!acc[champion.category]) {
                  acc[champion.category] = [];
                }
                acc[champion.category].push(champion);
                return acc;
              }, {} as Record<string, SchoolChampion[]>);

              return (
                <div key={county} className="border-l-4 border-blue-500 pl-3">
                  <h3 className="text-base font-bold text-gray-900 mb-2.5 flex items-center gap-2">
                    <span className="text-lg">📍</span>
                    {county}
                  </h3>
                  <div className="space-y-3 ml-2">
                    {Object.entries(championsByCategory).map(([category, items]) => (
                      <div key={`${county}-${category}`} className="bg-gray-50 rounded-lg p-2.5">
                        <h4 className="text-xs font-semibold text-gray-700 mb-1.5 flex items-center gap-1.5">
                          <span>📊</span>
                          {category}
                        </h4>
                        <div className="space-y-1">
                          {items.map((champion) => {
                            const isExpanded = expandedSportId === champion.sport_type_id;
                            return (
                              <div key={champion.sport_type_id} className="space-y-1">
                                <div className="relative">
                                  <button
                                    onClick={() => onChampionClick(champion)}
                                    className={`w-full text-left p-2.5 pr-10 rounded transition-colors border text-xs ${
                                      isExpanded
                                        ? 'bg-yellow-50 border-yellow-400'
                                        : 'bg-white border-gray-200 hover:bg-blue-50 hover:border-blue-300'
                                    }`}
                                  >
                                    <div className="flex items-start gap-2">
                                      <div className="text-sm flex-shrink-0">🥇</div>
                                      <div className="flex-1 min-w-0">
                                        <div className="font-medium text-gray-900 truncate">
                                          {champion.sport_type_name}
                                        </div>
                                        {champion.top_student_name && (
                                          <div className="text-amber-600 font-semibold mt-0.5 truncate">
                                            {champion.top_student_name}
                                          </div>
                                        )}
                                        <div className="text-gray-800 font-medium mt-0.5">
                                          {champion.top_student_value.toFixed(1)} {champion.unit}
                                        </div>
                                        <div className="text-blue-600 text-xs mt-0.5 truncate">
                                          {champion.school_name}
                                        </div>
                                      </div>
                                    </div>
                                  </button>

                                  <button
                                    onClick={(e) => handleToggleExpand(champion.sport_type_id, e)}
                                    className={`absolute right-1.5 top-1/2 -translate-y-1/2 p-1.5 rounded-full transition-all ${
                                      isExpanded
                                        ? 'bg-yellow-500 hover:bg-yellow-600 text-white'
                                        : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                                    }`}
                                    title={isExpanded ? '收起' : '展開'}
                                  >
                                    <svg
                                      className={`w-3 h-3 transition-transform ${
                                        isExpanded ? 'rotate-180' : ''
                                      }`}
                                      fill="none"
                                      stroke="currentColor"
                                      viewBox="0 0 24 24"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M19 9l-7 7-7-7"
                                      />
                                    </svg>
                                  </button>
                                </div>

                                {isExpanded && (
                                  <div className="ml-2 pl-2 border-l-2 border-yellow-400 space-y-0.5">
                                    {loadingTopSchools ? (
                                      <div className="p-1.5 text-xs text-gray-500 text-center">
                                        載入中...
                                      </div>
                                    ) : topSchools && topSchools.length > 0 ? (
                                      topSchools.map((ranking) => (
                                          <button
                                            key={ranking.rank}
                                            onClick={(e) => handleRankingClick(ranking, e)}
                                            className="w-full text-left p-1.5 rounded hover:bg-gray-200 transition-colors border border-gray-100 bg-white"
                                          >
                                            <div className="flex items-center gap-1.5 text-xs">
                                              <span className="inline-flex items-center justify-center w-4 h-4 text-xs font-bold rounded-full bg-gray-400 text-white flex-shrink-0">
                                                {ranking.rank}
                                              </span>
                                              <div className="flex-1 min-w-0">
                                                <div className="font-medium text-amber-600 truncate">
                                                  {ranking.top_student_name}
                                                </div>
                                                <div className="font-semibold text-gray-800">
                                                  {ranking.top_student_value.toFixed(1)} {ranking.unit}
                                                </div>
                                                <div className="text-gray-500 truncate">
                                                  {ranking.school_name}
                                                </div>
                                              </div>
                                              {ranking.rank === 1 && <span className="text-xs flex-shrink-0">🥇</span>}
                                              {ranking.rank === 2 && <span className="text-xs flex-shrink-0">🥈</span>}
                                              {ranking.rank === 3 && <span className="text-xs flex-shrink-0">🥉</span>}
                                            </div>
                                          </button>
                                        ))
                                    ) : (
                                      <div className="p-1.5 text-xs text-gray-500 text-center">
                                        暫無排名
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="text-4xl mb-3">🔍</div>
            <p className="text-sm text-gray-700 font-medium mb-2">
              {selectedCounties.size === 0 
                ? '請選擇縣市' 
                : '無符合條件的排名資料'}
            </p>
            {(selectedCounties.size > 0 || selectedCategory) && (
              <button
                onClick={clearAllFilters}
                className="text-sm text-blue-600 hover:text-blue-700 hover:underline font-medium mt-2"
              >
                清除篩選
              </button>
            )}
          </div>
        )}
      </div>

      {/* 折叠按钮 */}
      <div className="flex items-start p-2 border-l border-gray-200">
        <button
          onClick={() => setIsCollapsed(true)}
          className="p-2 hover:bg-gray-100 rounded transition-colors"
          title="收起排名榜"
        >
          <svg
            className="w-5 h-5 text-gray-700"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}