'use client';

import { useState } from 'react';
import { SchoolChampion, SportTypeSchoolRanking } from '@/types/statistics';
import { useTopSchoolsBySport } from '@/hooks/useStatistics';

interface Props {
  champions: SchoolChampion[];
  onChampionClick: (champion: SchoolChampion) => void;
}

export default function ChampionsList({ champions, onChampionClick }: Props) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [expandedSportId, setExpandedSportId] = useState<number | null>(null);

  // 按分類分組
  const championsByCategory = champions.reduce((acc, champion) => {
    if (!acc[champion.category]) {
      acc[champion.category] = [];
    }
    acc[champion.category].push(champion);
    return acc;
  }, {} as Record<string, SchoolChampion[]>);

  // 获取展开项目的前十名
  const { data: topSchools, isLoading: loadingTopSchools } = useTopSchoolsBySport(
    expandedSportId || 0,
    10
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
    <div className="bg-white rounded-lg shadow-md flex h-full w-72">
      {/* 主内容区 */}
      <div className="flex-1 p-3 overflow-y-auto">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xl">🏆</span>
          <h2 className="text-lg font-bold text-gray-900">各項目冠軍</h2>
        </div>

        {Object.entries(championsByCategory).map(([category, items]) => (
          <div key={category} className="mb-4">
            <h3 className="text-xs font-semibold text-gray-700 mb-1.5 border-b pb-0.5">
              {category}
            </h3>
            <div className="space-y-1">
              {items.map((champion) => {
                const isExpanded = expandedSportId === champion.sport_type_id;

                return (
                  <div key={champion.sport_type_id} className="space-y-1">
                    {/* 冠军卡片 - 更紧凑 */}
                    <div className="relative">
                      <button
                        onClick={() => onChampionClick(champion)}
                        className={`w-full text-left p-2 pr-10 rounded-lg transition-colors border ${
                          isExpanded
                            ? 'bg-yellow-50 border-yellow-400'
                            : 'bg-white border-gray-200 hover:bg-yellow-50 hover:border-yellow-300'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5">
                              <div className="text-xl flex-shrink-0">🥇</div>
                              <div className="font-medium text-sm text-gray-900 truncate">
                                {champion.sport_type_name}
                              </div>
                            </div>
                            <div className="text-xs text-blue-600 font-medium mt-0.5 ml-7 truncate">
                              {champion.school_name}
                            </div>
                            <div className="text-xs text-gray-500 mt-0.5 ml-7 truncate">
                              {champion.average_value.toFixed(1)} {champion.unit}
                            </div>
                          </div>
                        </div>
                      </button>

                      {/* 展开按钮 - 更明显的样式 */}
                      <button
                        onClick={(e) => handleToggleExpand(champion.sport_type_id, e)}
                        className={`absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full transition-all ${
                          isExpanded
                            ? 'bg-yellow-400 hover:bg-yellow-500 text-white'
                            : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                        }`}
                        title={isExpanded ? '收起排名' : '查看前十名'}
                      >
                        <svg
                          className={`w-5 h-5 transition-transform ${
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

                    {/* 展开的前十名列表 - 更紧凑 */}
                    {isExpanded && (
                      <div className="ml-3 pl-2 border-l-2 border-yellow-300 space-y-0.5">
                        {loadingTopSchools ? (
                          <div className="p-2 text-xs text-gray-500 text-center">
                            載入中...
                          </div>
                        ) : topSchools && topSchools.length > 0 ? (
                          topSchools.map((ranking) => (
                            <button
                              key={ranking.rank}
                              onClick={(e) => handleRankingClick(ranking, e)}
                              className="w-full text-left p-1.5 rounded hover:bg-gray-50 transition-colors border border-gray-100"
                            >
                              <div className="flex items-center justify-between gap-1">
                                <div className="flex gap-1.5 flex-1 min-w-0">
                                  <span className="text-xs font-bold text-gray-500 flex-shrink-0">
                                    #{ranking.rank}
                                  </span>
                                  <div className="flex-1 min-w-0">
                                    <div className="text-xs font-medium text-gray-800 truncate">
                                      {ranking.school_name}
                                    </div>
                                    <div className="text-xs text-gray-500 truncate">
                                      {ranking.average_value.toFixed(1)} {ranking.unit}
                                    </div>
                                  </div>
                                </div>
                                {ranking.rank === 1 && <span className="text-sm flex-shrink-0">🥇</span>}
                                {ranking.rank === 2 && <span className="text-sm flex-shrink-0">🥈</span>}
                                {ranking.rank === 3 && <span className="text-sm flex-shrink-0">🥉</span>}
                              </div>
                            </button>
                          ))
                        ) : (
                          <div className="p-2 text-xs text-gray-500 text-center">
                            暫無排名資料
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