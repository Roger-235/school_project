'use client';

import { useCountySportAverages } from '@/hooks/useStatistics';
import { CountySportAverage } from '@/types/statistics';

interface Props {
  county1: string;
  county2: string;
  onClose: () => void;
}

const CATEGORY_ORDER = ['體適能', '田徑', '球類'];

export default function CountyComparisonPanel({ county1, county2, onClose }: Props) {
  const { data: data1, isLoading: loading1 } = useCountySportAverages(county1);
  const { data: data2, isLoading: loading2 } = useCountySportAverages(county2);

  const isLoading = loading1 || loading2;

  // Build a merged map: sport_type_id → { c1avg, c2avg, ... }
  type MergedRow = {
    sport_type_id: number;
    sport_type_name: string;
    category: string;
    unit: string;
    value_type: string;
    avg1: number | null;
    avg2: number | null;
  };

  const mergedRows: MergedRow[] = (() => {
    if (!data1 && !data2) return [];
    const map = new Map<number, MergedRow>();

    (data1 ?? []).forEach((a: CountySportAverage) => {
      map.set(a.sport_type_id, {
        sport_type_id: a.sport_type_id,
        sport_type_name: a.sport_type_name,
        category: a.category,
        unit: a.unit,
        value_type: a.value_type,
        avg1: a.avg_value,
        avg2: null,
      });
    });

    (data2 ?? []).forEach((a: CountySportAverage) => {
      if (map.has(a.sport_type_id)) {
        map.get(a.sport_type_id)!.avg2 = a.avg_value;
      } else {
        map.set(a.sport_type_id, {
          sport_type_id: a.sport_type_id,
          sport_type_name: a.sport_type_name,
          category: a.category,
          unit: a.unit,
          value_type: a.value_type,
          avg1: null,
          avg2: a.avg_value,
        });
      }
    });

    return Array.from(map.values()).sort((a, b) => {
      const ci = CATEGORY_ORDER.indexOf(a.category) - CATEGORY_ORDER.indexOf(b.category);
      if (ci !== 0) return ci;
      return a.sport_type_name.localeCompare(b.sport_type_name);
    });
  })();

  // Count wins
  const wins1 = mergedRows.filter(r => {
    if (r.avg1 === null || r.avg2 === null) return false;
    return r.value_type === 'time' ? r.avg1 < r.avg2 : r.avg1 > r.avg2;
  }).length;
  const wins2 = mergedRows.filter(r => {
    if (r.avg1 === null || r.avg2 === null) return false;
    return r.value_type === 'time' ? r.avg2 < r.avg1 : r.avg2 > r.avg1;
  }).length;

  const getWinner = (row: MergedRow): 1 | 2 | 0 => {
    if (row.avg1 === null || row.avg2 === null) return 0;
    if (row.avg1 === row.avg2) return 0;
    return (row.value_type === 'time' ? row.avg1 < row.avg2 : row.avg1 > row.avg2) ? 1 : 2;
  };

  // Group rows by category
  const grouped = CATEGORY_ORDER.reduce((acc, cat) => {
    acc[cat] = mergedRows.filter(r => r.category === cat);
    return acc;
  }, {} as Record<string, MergedRow[]>);

  return (
    <div className="absolute right-0 top-0 h-full w-[480px] bg-white shadow-2xl z-[1001] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
        <div className="flex-1">
          <h2 className="text-lg font-bold text-gray-900">縣市學校成績比較</h2>
          <p className="text-sm text-gray-500 mt-0.5">（各運動項目學生平均成績）</p>
        </div>
        <button
          onClick={onClose}
          className="ml-4 p-2 rounded-full hover:bg-gray-200 transition-colors"
          aria-label="關閉"
        >
          ✕
        </button>
      </div>

      {/* County headers */}
      <div className="grid grid-cols-3 gap-2 p-4 border-b border-gray-200">
        <div className={`col-span-1 rounded-lg p-3 text-center ${wins1 >= wins2 ? 'bg-blue-50 border-2 border-blue-400' : 'bg-gray-50 border border-gray-200'}`}>
          <div className="text-xs text-gray-500 mb-1">縣市 A</div>
          <div className="font-bold text-gray-900 text-sm">{county1}</div>
          <div className={`text-lg font-bold mt-1 ${wins1 > wins2 ? 'text-blue-600' : 'text-gray-600'}`}>
            {wins1} 勝
          </div>
        </div>
        <div className="col-span-1 flex items-center justify-center">
          <div className="text-2xl font-bold text-gray-400">VS</div>
        </div>
        <div className={`col-span-1 rounded-lg p-3 text-center ${wins2 > wins1 ? 'bg-orange-50 border-2 border-orange-400' : 'bg-gray-50 border border-gray-200'}`}>
          <div className="text-xs text-gray-500 mb-1">縣市 B</div>
          <div className="font-bold text-gray-900 text-sm">{county2}</div>
          <div className={`text-lg font-bold mt-1 ${wins2 > wins1 ? 'text-orange-600' : 'text-gray-600'}`}>
            {wins2} 勝
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="flex items-center justify-center h-40">
            <div className="text-gray-500">載入中...</div>
          </div>
        ) : mergedRows.length === 0 ? (
          <div className="flex items-center justify-center h-40">
            <div className="text-gray-500">暫無資料</div>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {CATEGORY_ORDER.map(category => {
              const rows = grouped[category];
              if (!rows || rows.length === 0) return null;
              return (
                <div key={category}>
                  <div className="px-4 py-2 bg-gray-50 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    {category}
                  </div>
                  {rows.map(row => {
                    const winner = getWinner(row);
                    return (
                      <div key={row.sport_type_id} className="px-4 py-3 grid grid-cols-3 gap-2 items-center hover:bg-gray-50">
                        {/* County 1 value */}
                        <div className={`text-right ${winner === 1 ? 'text-blue-600 font-bold' : 'text-gray-700'}`}>
                          {row.avg1 !== null ? (
                            <span>
                              {row.avg1.toFixed(1)}
                              {winner === 1 && <span className="ml-1 text-xs">▲</span>}
                            </span>
                          ) : <span className="text-gray-400 text-xs">無資料</span>}
                        </div>

                        {/* Sport name (center) */}
                        <div className="text-center">
                          <div className="text-xs font-medium text-gray-800">{row.sport_type_name}</div>
                          <div className="text-xs text-gray-400">{row.unit}</div>
                        </div>

                        {/* County 2 value */}
                        <div className={`text-left ${winner === 2 ? 'text-orange-600 font-bold' : 'text-gray-700'}`}>
                          {row.avg2 !== null ? (
                            <span>
                              {winner === 2 && <span className="mr-1 text-xs">▲</span>}
                              {row.avg2.toFixed(1)}
                            </span>
                          ) : <span className="text-gray-400 text-xs">無資料</span>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer hint */}
      <div className="p-3 border-t border-gray-100 bg-gray-50">
        <p className="text-xs text-gray-400 text-center">
          ▲ 表示該縣市在此項目表現較佳（時間類越短越好，其他越大越好）
        </p>
      </div>
    </div>
  );
}
